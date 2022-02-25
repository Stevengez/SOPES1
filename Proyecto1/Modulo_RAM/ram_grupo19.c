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


static int escribir_proc(struct seq_file *m, void *v){

    struct sysinfo i;
	unsigned long committed;
	long cached;
	long available;
	unsigned long pages[NR_LRU_LISTS];
	unsigned long sreclaimable, sunreclaim;
	int lru;

	si_meminfo(&i);
	si_swapinfo(&i);
	committed = vm_memory_committed();

	cached = global_node_page_state(NR_FILE_PAGES) -
			total_swapcache_pages() - i.bufferram;
	if (cached < 0)
		cached = 0;

	for (lru = LRU_BASE; lru < NR_LRU_LISTS; lru++)
		pages[lru] = global_node_page_state(NR_LRU_BASE + lru);

	available = si_mem_available();
	sreclaimable = global_node_page_state_pages(NR_SLAB_RECLAIMABLE_B);
	sunreclaim = global_node_page_state_pages(NR_SLAB_UNRECLAIMABLE_B);

    seq_printf(m,"{\n\t\"total\":%lu,\n\tlibre: %lu}", i.totalram, i.freeram);
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
