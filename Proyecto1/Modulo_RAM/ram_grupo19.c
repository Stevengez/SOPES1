#include <linux/fs.h>
#include <linux/init.h>
#include <linux/kernel.h>
#include <linux/mm.h>
#include <linux/hugetlb.h>
#include <linux/mman.h>
#include <linux/mmzone.h>
#include <linux/proc_fs.h>
#include <linux/percpu.h>
#include <linux/vmstat.h>
#include <linux/atomic.h>
#include <linux/vmalloc.h>
#ifdef CONFIG_CMA
#include <linux/cma.h>
#endif
#include <asm/page.h>

#include <linux/seq_file.h>
#include <linux/swap.h>
#include <linux/mman.h>
#include <linux/cma.h>
#include <linux/hugetlb.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Steven Jocol");
MODULE_DESCRIPTION("Modulo que muestra la memoria libre en MB");
MODULE_VERSION("1.0");

static const u16 decpair[100] = {
#define _(x) (__force u16) cpu_to_le16(((x % 10) | ((x / 10) << 8)) + 0x3030)
	_( 0), _( 1), _( 2), _( 3), _( 4), _( 5), _( 6), _( 7), _( 8), _( 9),
	_(10), _(11), _(12), _(13), _(14), _(15), _(16), _(17), _(18), _(19),
	_(20), _(21), _(22), _(23), _(24), _(25), _(26), _(27), _(28), _(29),
	_(30), _(31), _(32), _(33), _(34), _(35), _(36), _(37), _(38), _(39),
	_(40), _(41), _(42), _(43), _(44), _(45), _(46), _(47), _(48), _(49),
	_(50), _(51), _(52), _(53), _(54), _(55), _(56), _(57), _(58), _(59),
	_(60), _(61), _(62), _(63), _(64), _(65), _(66), _(67), _(68), _(69),
	_(70), _(71), _(72), _(73), _(74), _(75), _(76), _(77), _(78), _(79),
	_(80), _(81), _(82), _(83), _(84), _(85), _(86), _(87), _(88), _(89),
	_(90), _(91), _(92), _(93), _(94), _(95), _(96), _(97), _(98), _(99),
#undef _
};

static void put_dec_full4(char *buf, unsigned r);
static noinline_for_stack unsigned put_dec_helper4(char *buf, unsigned x);
static noinline_for_stack char *put_dec_trunc8(char *buf, unsigned r);

static void put_dec_full4(char *buf, unsigned r)
{
	unsigned q;

	/* 0 <= r < 10^4 */
	q = (r * 0x147b) >> 19;
	*((u16 *)buf) = decpair[r - 100*q];
	buf += 2;
	/* 0 <= q < 100 */
	*((u16 *)buf) = decpair[q];
}

static noinline_for_stack
unsigned put_dec_helper4(char *buf, unsigned x)
{
        uint32_t q = (x * (uint64_t)0x346DC5D7) >> 43;

        put_dec_full4(buf, x - q * 10000);
        return q;
}

static noinline_for_stack
char *put_dec_trunc8(char *buf, unsigned r)
{
	unsigned q;

	/* 1 <= r < 10^8 */
	if (r < 100)
		goto out_r;

	/* 100 <= r < 10^8 */
	q = (r * (u64)0x28f5c29) >> 32;
	*((u16 *)buf) = decpair[r - 100*q];
	buf += 2;

	/* 1 <= q < 10^6 */
	if (q < 100)
		goto out_q;

	/*  100 <= q < 10^6 */
	r = (q * (u64)0x28f5c29) >> 32;
	*((u16 *)buf) = decpair[q - 100*r];
	buf += 2;

	/* 1 <= r < 10^4 */
	if (r < 100)
		goto out_r;

	/* 100 <= r < 10^4 */
	q = (r * 0x147b) >> 19;
	*((u16 *)buf) = decpair[r - 100*q];
	buf += 2;
out_q:
	/* 1 <= q < 100 */
	r = q;
out_r:
	/* 1 <= r < 100 */
	*((u16 *)buf) = decpair[r];
	buf += r < 10 ? 1 : 2;
	return buf;
}

static char *put_dec(char *buf, unsigned long long n)
{
	uint32_t d3, d2, d1, q, h;

	if (n < 100*1000*1000)
		return put_dec_trunc8(buf, n);

	d1  = ((uint32_t)n >> 16); /* implicit "& 0xffff" */
	h   = (n >> 32);
	d2  = (h      ) & 0xffff;
	d3  = (h >> 16); /* implicit "& 0xffff" */

	/* n = 2^48 d3 + 2^32 d2 + 2^16 d1 + d0
	     = 281_4749_7671_0656 d3 + 42_9496_7296 d2 + 6_5536 d1 + d0 */
	q   = 656 * d3 + 7296 * d2 + 5536 * d1 + ((uint32_t)n & 0xffff);
	q = put_dec_helper4(buf, q);

	q += 7671 * d3 + 9496 * d2 + 6 * d1;
	q = put_dec_helper4(buf+4, q);

	q += 4749 * d3 + 42 * d2;
	q = put_dec_helper4(buf+8, q);

	q += 281 * d3;
	buf += 12;
	if (q)
		buf = put_dec_trunc8(buf, q);
	else while (buf[-1] == '0')
		--buf;

	return buf;
}

int num_to_str(char *buf, int size, unsigned long long num, unsigned int width)
{
	/* put_dec requires 2-byte alignment of the buffer. */
	char tmp[sizeof(num) * 3] __aligned(2);
	int idx, len;

	/* put_dec() may work incorrectly for num = 0 (generate "", not "0") */
	if (num <= 9) {
		tmp[0] = '0' + num;
		len = 1;
	} else {
		len = put_dec(tmp, num) - tmp;
	}

	if (len > size || width > size)
		return 0;

	if (width > len) {
		width = width - len;
		for (idx = 0; idx < width; idx++)
			buf[idx] = ' ';
	} else {
		width = 0;
	}

	for (idx = 0; idx < len; ++idx)
		buf[idx + width] = tmp[len - idx - 1];

	return len + width;
}

static void seq_set_overflow(struct seq_file *m)
{
	m->count = m->size;
}

void seq_put_decimal_ull_width(struct seq_file *m, const char *delimiter,
			 unsigned long long num, unsigned int width)
{
	int len;
    
	if (m->count + 2 >= m->size) /* we'll write 2 bytes at least */
        goto overflow;

	if (delimiter && delimiter[0]) {
		if (delimiter[1] == 0)
			seq_putc(m, delimiter[0]);
		else
			seq_puts(m, delimiter);
	}

	if (!width)
		width = 1;

	if (m->count + width >= m->size)
		goto overflow;

	len = num_to_str(m->buf + m->count, m->size - m->count, num, width);
	if (!len)
		goto overflow;

	m->count += len;
	return;

overflow:
	seq_set_overflow(m);
}

static void show_val_kb(struct seq_file *m, const char *s, unsigned long num, bool putcomma)
 {
 	seq_put_decimal_ull_width(m, s, num << (PAGE_SHIFT - 10), 8);
     if(putcomma){
         seq_printf(m,",");
     }else{
         seq_printf(m,"\n");
     }
 }

static int escribir_proc(struct seq_file *m, void *v){
    struct sysinfo i;
	si_meminfo(&i);

    unsigned long total_en_mb       = (i.totalram/1024);
    unsigned long usada_en_mb       = (i.totalram-i.freeram)/1024;
    unsigned long porcentaje_en_uso = (i.totalram-i.freeram)*100/i.totalram;
    unsigned long libre_en_mb       = (i.freeram/1024);

    seq_printf(m,"{\n");
    show_val_kb(m, "\t\"total\" : ", total_en_mb, true);
    show_val_kb(m, "\n\t\"usada\" : ", usada_en_mb, true);
    seq_printf(m, "\n\t\"porcentaje\" : %li,\n", porcentaje_en_uso);
    show_val_kb(m, "\t\"libre\" : ", libre_en_mb, false);
    seq_printf(m,"}\n");
    return 0;
}

static int __init memoryinfo_init(void) {
    proc_create_single("ram_grupo19", 0, NULL, escribir_proc);
    printk(KERN_INFO "M??dulo RAM del Grupo 19 Cargado\n");
    return 0;
}
 
static void __exit memoryinfo_exit(void){
    remove_proc_entry("ram_grupo19", NULL);    
    printk(KERN_INFO "M??dulo RAM del Grupo 19 Desmontado\n");
}

module_init(memoryinfo_init);
module_exit(memoryinfo_exit); 
