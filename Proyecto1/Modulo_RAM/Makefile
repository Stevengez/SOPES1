obj-m += ram_grupo19.o
all:
	make -C /lib/modules/$(shell uname -r)/build M=$(shell pwd)
clean:
	make -C /lib/modules/$(shell uname -r)/build M=$(shell pwd) clean
run:
	sudo insmod ./ram_grupo19.ko