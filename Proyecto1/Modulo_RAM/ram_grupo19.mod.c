#include <linux/module.h>
#define INCLUDE_VERMAGIC
#include <linux/build-salt.h>
#include <linux/vermagic.h>
#include <linux/compiler.h>

BUILD_SALT;

MODULE_INFO(vermagic, VERMAGIC_STRING);
MODULE_INFO(name, KBUILD_MODNAME);

__visible struct module __this_module
__section(".gnu.linkonce.this_module") = {
	.name = KBUILD_MODNAME,
	.init = init_module,
#ifdef CONFIG_MODULE_UNLOAD
	.exit = cleanup_module,
#endif
	.arch = MODULE_ARCH_INIT,
};

#ifdef CONFIG_RETPOLINE
MODULE_INFO(retpoline, "Y");
#endif

static const struct modversion_info ____versions[]
__used __section("__versions") = {
	{ 0x4e79ba4a, "module_layout" },
	{ 0xe72d1ecd, "remove_proc_entry" },
	{ 0xc5850110, "printk" },
	{ 0x69583438, "proc_create_single_data" },
	{ 0xc959d152, "__stack_chk_fail" },
	{ 0xa681aaa8, "seq_printf" },
	{ 0x785a93b4, "si_mem_available" },
	{ 0xf8c482ed, "vm_node_stat" },
	{ 0x26520970, "vm_memory_committed" },
	{ 0x40c7247c, "si_meminfo" },
	{ 0xbdfb6dbb, "__fentry__" },
};

MODULE_INFO(depends, "");


MODULE_INFO(srcversion, "0760DBCA6065CFED5FC537F");
