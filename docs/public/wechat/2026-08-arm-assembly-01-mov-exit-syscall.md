# MOV 指令与 exit 系统调用

学一门编程语言，传统上从 Hello World 开始。但汇编不一样——它比你想的更底层，所以我们的第一课只做最简单的一件事：写一个程序，让它退出，并观察它返回的退出码。

听起来无聊？别急。这三行代码里藏着汇编的全部骨架：寄存器、指令、系统调用、用户态与内核态的边界。走完一遍，你就摸到了底层世界的门把手。

本系列使用的是 ARMv7（ARM 的 32 位版本）。本课不涉及 Hello World，因为汇编的输出比退出要复杂得多——先把「退出」这条链路走通，是理解一切后续指令的基石。

### 1. 为什么是 ARM

无论你是想榨干硬件性能的底层开发者，还是需要读懂二进制的逆向工程师，最快上手的方式都是亲手写汇编。只有动手，你才能真正理解指令集架构（ISA）和每条指令的脾气。

ARM 是个温柔的开始：指令定长、寄存器规整、语义直白。

### 2. 三种搭建实验环境的方式

即使你的主机是 x86，也完全可以学 ARM。三条路任选其一：

1. Azure ARM64 虚拟机（教程原版）：开一台 ARM64 的 Ubuntu 虚拟机，向下兼容 32 位 ARM。按运行时间计费，关机不收钱。
2. CPUlator（在线免费模拟器）：地址 https://cpulator.01xz.net/ ，选 ARM + ARMv7。能设断点、单步、看寄存器。唯一的坑是它不识别 swi 指令，所以系统调用部分跑不完全，但看懂其余指令绰绰有余。
3. QEMU 本地模拟（本文采用）：在 x86 的 WSL 里装一个 ARM 交叉编译器，再用 qemu-arm 运行 ARM 程序。全程在你本机，无需云、无需浏览器。

![图 1 · 三种实验环境对比：Azure ARM64 / CPUlator / QEMU](/assets/images/2026-08-arm-assembly/fig-envs.png)
<p align="center"><sub>图 1 · 三种实验环境对比：Azure ARM64 / CPUlator / QEMU</sub></p>

> **注：** 本文走第三条路。下面所有命令都在 WSL（Ubuntu）里实测通过。

### 3. 准备工具链

一行命令装好 ARM 交叉编译的 GCC 和 QEMU 用户态模拟器：

```bash
sudo apt-get install -y gcc-arm-linux-gnueabi qemu-user
```

装完你就有了两个关键工具：arm-linux-gnueabi-as（汇编器）和 qemu-arm（在 x86 上运行 ARM 程序）。

### 4. 先认识寄存器

寄存器（Register）是紧贴 CPU 的极小存储，访问速度远快于内存。ARMv7 的每个寄存器存 32 位（8 个十六进制位）——这正是「32 位架构」的字面含义。

![图 2 · ARMv7 寄存器（节选）：本课真正用到的只有 R0 和 R7](/assets/images/2026-08-arm-assembly/fig-registers.png)
<p align="center"><sub>图 2 · ARMv7 寄存器（节选）：本课真正用到的只有 R0 和 R7</sub></p>

记住两个就够了：R0 是通用寄存器，本课用来装退出码；R7 是特殊寄存器，执行系统调用时装系统调用号，告诉内核「我要调哪个」。

另外两个背景知识：SP（栈指针）和 PC（程序计数器）。PC 指向当前指令，每执行一条自动 +4（ARMv7 每条指令 4 字节）。

### 5. 写程序：三条指令，退出码 42

用任意编辑器创建 hello.s，内容只有三行真正的指令：

```asm
.global _start
.section .text

_start:
    mov r0, #42      @ 把 42 放进 R0（退出码）
    mov r7, #1       @ 把 1 放进 R7（exit 的系统调用号）
    swi #0           @ 软件中断：交给内核处理
```

#### 5.1 MOV 立即数

mov 是 move 的缩写，但它其实是复制（copy）：把一个常量（立即数，immediate）送进目标寄存器。立即数前面加 #，默认十进制（#0x2A 则是十六进制）。

![图 3 · MOV 立即数：常量 #42 流向 R0，#1 流向 R7](/assets/images/2026-08-arm-assembly/fig-mov.png)
<p align="center"><sub>图 3 · MOV 立即数：常量 #42 流向 R0，#1 流向 R7</sub></p>

42 不是随便选的——它是《银河系漫游指南》里「生命、宇宙以及一切的终极答案」。

#### 5.2 SWI 软件中断

swi（Software Interrupt，软件中断）是这套把戏的关键。它一执行，CPU 就陷入内核（kernel），由内核接管。按 ARM 官方文档，swi 后面那个立即数其实会被忽略，但习惯上仍写 #0。

那么内核拿到控制权后，怎么知道我们想干什么？靠的是约定好的寄存器。

#### 5.3 系统调用号：查表

内核靠 R7 判断系统调用类型。查 Chromium OS 的系统调用文档（按架构分类）可知：32 位 ARM 下，exit 的编号是 1，它的第一个参数放在 R0，就是退出码。

于是逻辑闭环了：R7 = 1 表示「我要退出」，R0 = 42 表示「退出码用这个」。

![图 4 · 系统调用号查表：R7=1 命中 exit，R0=42 作为退出码参数](/assets/images/2026-08-arm-assembly/fig-syscall-table.png)
<p align="center"><sub>图 4 · 系统调用号查表：R7=1 命中 exit，R0=42 作为退出码参数</sub></p>

至于程序骨架那两行：.global _start 让 _start 对链接器可见，它是程序入口；.section .text 声明代码段（.data 则是数据段）。_start 是个标签，本质是「这块内存的地址」。

> **注：** Vim 操作：i 进入插入模式开写，写完 Esc，再 :wq 保存退出。别的编辑器只要产出同样的 hello.s 即可。

### 6. 系统调用的完整旅程

把上面三步串起来看，一个系统调用其实跨越了用户态和内核态两个世界。

![图 5 · SWI 软件中断：用户态的程序把控制权陷落交给内核](/assets/images/2026-08-arm-assembly/fig-syscall.png)
<p align="center"><sub>图 5 · SWI 软件中断：用户态的程序把控制权陷落交给内核</sub></p>

程序在用户态老老实实跑，直到 swi 一脚把控制权踢给内核；内核读完 R7 知道是 exit，读完 R0 拿到 42，于是结束进程。那条红色虚线，就是用户态与内核态的边界。

### 7. 从源码到可执行：两步走

源代码写好，分两步生成可执行文件：先汇编成目标文件，再链接成可执行文件。

![图 6 · 构建流水线：源码 → 汇编 → 目标文件 → 链接 → ELF 可执行文件](/assets/images/2026-08-arm-assembly/fig-build.png)
<p align="center"><sub>图 6 · 构建流水线：源码 → 汇编 → 目标文件 → 链接 → ELF 可执行文件</sub></p>

对应命令：

```bash
# 1. 汇编：源码 → 目标文件（还不能执行）
arm-linux-gnueabi-as hello.s -o hello.o

# 2. 链接：目标文件 → 可执行文件
arm-linux-gnueabi-gcc hello.o -o hello -nostdlib
```

-nostdlib 不能少——我们写的是裸汇编，不链接标准库；少了它，链接器会因找不到默认入口而报错。

用 file hello 查看产物，会看到一行 ELF 32-bit LSB executable, ARM。ELF（Executable and Linkable Format）是 Linux 可执行文件的标准格式。

> **注意：** 千万不要把 .o 目标文件当成可直接运行的可执行文件——它只含汇编后的机器码，还缺链接这一步。

### 8. 运行，并见证退出码

因为是 ARM 程序、主机是 x86，直接 ./hello 跑不起来，要用 QEMU 模拟：

```bash
qemu-arm ./hello
echo $?        # 打印上一条命令的退出码
```

屏幕上看似什么都没发生——但 echo $? 会吐出一个数字：42。这正是我们塞进 R0 的那个立即数，绕过用户态、穿过内核，最终回到 shell。一个数字，一次完整的系统调用往返。

### 9. 在 CPUlator 里单步看

把同样三行粘进 CPUlator，点 Compile & Load，然后单步（Step），你会眼睁睁看着：R0 变成 0x0000002A；R7 变成 0x00000001；PC 从 0 开始，每步 +4。

最后那步 swi CPUlator 跑不动，但前三步足以把寄存器变化看得清清楚楚。

![图 7 · 单步执行：三条指令执行后 R0、R7、PC 的变化（黄底=该步被改写）](/assets/images/2026-08-arm-assembly/fig-execution.png)
<p align="center"><sub>图 7 · 单步执行：三条指令执行后 R0、R7、PC 的变化（黄底=该步被改写）</sub></p>

### 小结

这一课，我们用三行汇编把整条链路走通了：

- 三种实验环境（Azure ARM64、CPUlator、QEMU）
- 寄存器，尤其是装退出码的 R0 和装系统调用号的 R7
- MOV 立即数，把常量送进寄存器
- SWI 软件中断，跨越用户态/内核态请求系统调用
- 完整的编写 → 汇编 → 链接 → 运行流程，拿到退出码 42

没有 Hello World，但我们拿到了一把能打开底层世界的钥匙。下一课见。

<QuizBlock src="/quiz/2026-08-arm-assembly/01.json" title="本章自测" />
