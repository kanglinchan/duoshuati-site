# 循环：让代码重复执行

![循环封面：C 的 do-while 循环与 ARM 汇编逐行对照](/assets/images/2026-08-arm-assembly/fig-loop-map.png)

<CopyArticle html="/wechat/2026-08-arm-assembly-09-while-loops.html" md="/wechat/2026-08-arm-assembly-09-while-loops.md" />

上一课我们学会了 if-else 的分支判断。但现实中的程序不只是做一次选择就结束——它需要反复执行同一段逻辑：遍历数组、等待输入、处理数据流……这就是循环。

这一课只讲一件事：把 C 语言的循环翻译成 ARM 汇编。你会发现它用的全是前两课的老朋友——CMP + 条件分支 + 无条件跳转，只是排列方式变了。我们从翻译最直观的 do-while 切入，再对比 while。

### 1. 目标：一个最简单的循环

先看 C 代码（do-while 写法）：

```c
int i = 0;
do {
    i++;
} while (i < 5);
```

计数器从 0 开始，每次加 1，到 5 停止。循环体执行 5 次（i 从 0 加到 5），结束时 i=5。这段代码朴素到不能再朴素，但它包含了循环的全部骨架。

为什么从 do-while 切入？因为它的 ARM 翻译最直观：先执行循环体，执行完再判断要不要再来一轮——和汇编"顺序执行 + 跳转"的天然节奏完全吻合。

### 2. 逐行对照：C → ARM

![图 1 · C 的 do-while 循环与 ARM 汇编逐行对照：初始化→循环标签→循环体（先执行）→CMP 判断→条件退出→无条件跳回](/assets/images/2026-08-arm-assembly/fig-loop-map.png)
<p align="center"><sub>图 1 · C 的 do-while 循环 vs ARM 汇编：逐行对照</sub></p>

```asm
        mov r0, #0       @ int i = 0
loop:
        add r0, #1       @ i++（循环体，先执行）
        cmp r0, #5       @ } while (i < 5) —— 反向思考：i ≥ 5 就退出
        bge end          @ 如果 r0 ≥ 5，跳到 end
        b loop           @ 否则跳回 loop 标签
end:
        mov r1, #2       @ 循环结束后继续
```

七行汇编，五个角色各司其职：

| 角色 | 指令 | 职责 |
|------|------|------|
| 初始化 | `mov r0, #0` | 计数器归零 |
| 入口标签 | `loop:` | 给循环起点起个名字 |
| 循环体 | `add r0, #1` | 真正要重复做的事（先执行） |
| 退出判断 | `cmp r0, #5` / `bge end` | 执行完看要不要退出 |
| 回头跳 | `b loop` | 没退出就无条件回到入口 |

> **关键观察：先干活再判断。** 注意顺序——add 在 cmp+bge **之前**。第一次进入 loop，先把循环体跑一遍（add），执行完才 cmp 判断要不要退出。这正是 do-while 的标志：循环体至少执行 1 次。

### 3. 流程图：转一圈

![图 2 · 循环流程图：loop 标签 → 循环体 add（先执行）→ CMP 判断菱形 → r0≥5 则 bge end 退出，否则 b loop 回到循环体](/assets/images/2026-08-arm-assembly/fig-loop-flow.png)
<p align="center"><sub>图 2 · 循环流程图：do-while 转一圈</sub></p>

流程图是一个圈：从 loop 进入，先执行循环体（add），再走到 CMP 菱形分岔——r0 ≥ 5 走红色出口（bge end）离开，否则走绿色路径（b loop）回到循环体。先执行后判断，周而复始。

### 4. 单步轨迹：r0 从 0 累加到 5

用调试器单步跟踪，看每一步发生了什么：

![图 3 · 单步轨迹：r0=0 进入循环先 add，每次 add+1 再 cmp 判断；r0=5 时 cmp 触发 bge 跳出](/assets/images/2026-08-arm-assembly/fig-loop-trace.png)
<p align="center"><sub>图 3 · 单步轨迹：r0 从 0 累加到 5</sub></p>

- 第 1 轮：进入 loop，先 add → r0=1；cmp 1,5 → 1&lt;5 不退出；b loop
- 第 2~4 轮：r0 依次变成 2、3、4，每次 add 后 cmp 都不退出，b loop 跳回
- 第 5 轮：add → r0=5；cmp 5,5 → 5≥5，bge 成立 → 跳出循环

循环体（add）恰好执行了 5 次，最终 r0=5。如果 end 处还有 `mov r1, #2`，那 R1=2 也被写入——循环外的代码照常运行。

注意每轮都是"先 add 后 cmp"——判断永远跟在循环体之后，这正是 do-while 与 while 的核心区别。

### 5. 骨架与退出条件三选一

![图 4 · 循环骨架：do-while 形态的标准写法 + 退出条件三种选择（bGE/bEQ/死循环）](/assets/images/2026-08-arm-assembly/fig-loop-patterns.png)
<p align="center"><sub>图 4 · 循环骨架与退出条件三选一</sub></p>

上面用的是 `bge end`（大于等于则退出），对应 C 的 `while (i < 5)`。但退出条件可以灵活替换：

- `beq end`：相等才退出——对应 `while (i != target)`（找不到目标就一直转）
- 不写退出条件：死循环，永远在 loop 和 add 之间打转——嵌入式里很常见（主循环就是死循环，靠中断或特殊指令跳出）

> **易错点：** 忘写 `b loop` 是新手第二常见的循环 bug（第一常见是上节课的防穿透）。没有回头跳，程序只会穿过循环体一次——循环名存实亡，变成普通的顺序执行。

### 6. 对比：怎么改成「可能 0 次」的严格 while

正文这套写法是 do-while——循环体至少跑 1 次，哪怕 r0 初值已经 ≥5 也会先 add 一次再判。但有时候你要的是严格 while 语义：条件不满足就一次都不跑（比如遍历可能为空的集合）。

做法很简单：把 CMP 判断挪到循环体之前：

```asm
        mov r0, #10      @ 初始值已经 >= 5
loop:
        cmp r0, #5       @ 先判断！
        bge end          @ 10 >= 5，直接退出，循环体 0 次执行
        add r0, #1       @ 循环体挪到判断之后
        b loop
end:
```

这种写法下，r0 初始为 10 时循环体一次都不跑——这才是严格的 while 语义。两种写法都能工作，区别只在初始值不满足条件时的边界情况：do-while 至少 1 次，while 可能 0 次。

### 小结

- 循环的 ARM 实现 = 初始化 + loop 标签 + 循环体 + CMP 退出判断 + b loop 回头跳
- 五个角色：mov（初始化）、loop:（入口）、add（循环体）、cmp+bge（退出守卫）、b loop（回头）
- 正文写法是 do-while（先干后判，至少 1 次）；要严格 while（可能 0 次）需把 CMP 挪到循环体之前
- 退出条件可换：bge（≥退出）、beq（==退出，对应 while(i != target)）、不写（死循环）
- 两大致命伤：忘写 b loop（循环只跑一次）、忘写退出条件（死循环）

到这里，程序三大控制流——顺序、分支、循环——全部到位。CPU 能搬数据、能算术、能比较、能判断、能重复——图灵完备性拼图最后一块也落位了。下一课见。

<QuizBlock src="/quiz/2026-08-arm-assembly/09.json" title="本章自测" />
