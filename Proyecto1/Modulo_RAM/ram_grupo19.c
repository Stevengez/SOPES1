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

static void show_val_kb(struct seq_file *m, const char *s, unsigned long num)
 {
 	seq_put_decimal_ull_width(m, s, num << (PAGE_SHIFT - 10), 8);
 	seq_write(m, " kB\n", 4);
 }

static int escribir_proc(struct seq_file *m, void *v){
    struct sysinfo i;
	si_meminfo(&i);
    show_val_kb(m, "Total", i.totalram);
    seq_printf(m,"{\n\t\"total\" : %lu,\n\t\"libre\" : %lu,\n\t\"available\" : 000\n}", i.totalram, i.freeram);

    
    
    return 0;
}

static int __init memoryinfo_init(void) {
    proc_create_single("ram_grupo19", 0, NULL, escribir_proc);
    printk(KERN_INFO "Módulo RAM del Grupo 19 Cargado\n");
    return 0;
}
 
static void __exit memoryinfo_exit(void){
    remove_proc_entry("ram_grupo19", NULL);    
    printk(KERN_INFO "Módulo RAM del Grupo 19 Desmontado\n");
}

module_init(memoryinfo_init);
module_exit(memoryinfo_exit); 
