# while 循环：让代码重复执行

![while 循环封面](/assets/images/2026-08-arm-assembly/fig-loop-map.png)

<CopyArticle html="/wechat/2026-08-arm-assembly-09-while-loops.html" md="/wechat/2026-08-arm-assembly-09-while-loops.md" />

上一课我们学会了 if-else 的分支判断。但现实中的程序不只是做一次选择就结束——它需要反复执行同一段逻辑：遍历数组、等待输入、处理数据流……这就是循环。

这一课只讲一件事：把 C 语言的 `while` 循环翻译成 ARM 汇编。你会发现它用的全是前两课的老朋友——CMP + 条件分支 + 无条件跳转，只是排列方式变了。

### 1. 目标：一个最简单的 while 循环

先看 C 代码：

```c
int i = 0;
while (i < 5) {
    i++;
}
```

计数器从 0 开始，每次加 1，到 5 停止。循环体执行 5 次（i=0,1,2,3,4 各一次），结束时 i=5。这段代码朴素到不能再朴素，但它包含了循环的全部骨架。

### 2. 逐行对照：C → ARM

![图 1 · C 的 while 循环与 ARM 汇编逐行对照：初始化→循环标签→CMP 判断→条件退出→循环体→无条件跳回](/assets/images/2026-08-arm-assembly/fig-loop-map.png)
<p align="center"><sub>图 1 · C 的 while 循环 vs ARM 汇编：逐行对照</sub></p>

```asm
        mov r0, #0       @ int i = 0
loop:
        cmp r0, #5       @ while (i < 5) —— 反向思考：i ≥ 5 就退出
        bge end          @ 如果 r0 ≥ 5，跳到 end
        add r0, #1       @ i++（循环体）
        b loop           @ 无条件跳回 loop 标签
end:
        mov r1, #2       @ 循环结束后继续
```

七行汇编，四个角色各司其职：

| 角色 | 指令 | 职责 |
|------|------|------|
| 初始化 | `mov r0, #0` | 计数器归零 |
| 入口标签 | `loop:` | 给循环起点起个名字 |
| 退出判断 | `cmp r0, #5` / `bge end` | 不满足条件就跳出 |
| 循环体 | `add r0, #1` | 真正要重复做的事 |
| 回头跳 | `b loop` | 无条件回到入口 |

> **关键观察：先干活再判断。** 注意顺序——add 在 cmp+bge **之前**。第一次进入时 r0=0，cmp 发现不满足退出条件，于是执行 add 变成 1，b loop 跳回……这其实是 do-while 形态（至少执行一次）。C 的 while 是"可能 0 次"，这个写法是"至少 1 次"。两者在 i=0 时行为一致，但如果初始值已经 ≥5 就有微妙差别——后面会展开。

### 3. 流程图：转一圈的四个动作

![图 2 · 循环流程图：loop 标签 → CMP 判断菱形 → 满足则 bge end 退出，否则 add 循环体 → b loop 跳回入口](/assets/images/2026-08-arm-assembly/fig-loop-flow.png)
<p align="center"><sub>图 2 · 循环流程图：转一圈的四个动作</sub></p>

流程图的形状像一个圈：从 loop 进入，经过 CMP 菱形分岔——满足条件的走红色出口（bge end），不满足的走绿色路径（add → b loop）回到入口。周而复始，直到某次 CMP 判断成立为止。

### 4. 单步轨迹：r0 从 0 累加到 5

用调试器单步跟踪，看每一步发生了什么：

![图 3 · 单步轨迹：r0=0 时进入循环，每次 add+1 再跳回；r0=5 时 cmp 触发 Z=1，bge 生效跳出](/assets/images/2026-08-arm-assembly/fig-loop-trace.png)
<p align="center"><sub>图 3 · 单步轨迹：r0 从 0 累加到 5</sub></p>

- 第 1 轮：r0=0，cmp 0,5 → N=1（负数，0<5），bge 不跳 → add → r0=1
- 第 2~5 轮：同理，r0 依次变成 2、3、4、5
- 第 6 轮：r0=5，cmp 5,5 → Z=1（相等），bge 成立 → 跳出循环

循环体恰好执行了 5 次，最终 r0=5。如果 end 处还有 `mov r1, #2`，那 R1=2 也被写入——循环外的代码照常运行。

### 5. 骨架与退出条件三选一

![图 4 · 循环骨架：do-while 形态的标准写法 + 退出条件三种选择（bGE/bNE/死循环）](/assets/images/2026-08-arm-assembly/fig-loop-patterns.png)
<p align="center"><sub>图 4 · 循环骨架与退出条件三选一</sub></p>

上面用的是 `bge end`（大于等于则退出），对应 C 的 `while (i < 5)`。但退出条件可以灵活替换：

- `bne end`：不相等就继续，相等才退出——对应 `while (i != target)`
- 不写退出条件：**死循环**，永远在 loop 和 add 之间打转——嵌入式里很常见（主循环就是死循环，靠中断或特殊指令跳出）

> **易错点：** 忘写 `b loop` 是新手第二常见的循环 bug（第一常见是上节课的防穿透）。没有回头跳，程序只会穿过循环体一次——循环名存实亡，变成了一个普通的 if 分支。

### 6. while vs do-while：判断位置的区别

刚才的写法本质上是 do-while（先执行循环体再判断）。如果要让循环体"可能 0 次不执行"（真正的 while 语义），需要把 CMP 挪到循环体之前：

```asm
        mov r0, #10      @ 初始值已经 >= 5
loop:
        cmp r0, #5       @ 先判断！
        bge end          @ 10 >= 5，直接退出，循环体 0 次执行
        add r0, #1
        b loop
end:
```

这种写法下，r0 初始为 10 时循环体一次都不跑——这才是严格的 while 语义。两种写法都能工作，区别只在边界情况。

### 小结

- while 循环的 ARM 实现 = 初始化 + loop 标签 + CMP + 条件退出 + 循环体 + b loop 回头跳
- 四个角色：mov（初始化）、cmp+bge（退出守卫）、add（循环体）、b loop（回头）
- 本质是 do-while 形态（先干后判）；要真正的 while 语义需把 CMP 挪到循环顶部
- 退出条件可换：bge（≥退出）、bne（≠退出）、不写（死循环）
- 两大致命伤：忘写 b loop（循环只跑一次）、忘写退出条件（死循环）
- 下集预告：for 循环 = 初始化 + 条件 + 增量的语法糖，骨架和 while 完全一样

到这里，程序三大控制流——顺序、分支、循环——全部到位。CPU 能搬数据、能算术、能比较、能判断、能重复——图灵完备性拼图最后一块也落位了。下一课见。

<QuizBlock src="/quiz/2026-08-arm-assembly/09.json" title="本章自测" />
