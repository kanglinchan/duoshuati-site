# 循环：让代码重复执行

上一课学会了 if-else 的分支判断。但现实中的程序需要反复执行同一段逻辑——遍历数组、等待输入、处理数据流……这就是循环。

这一课只讲一件事：把 C 语言的循环翻译成 ARM 汇编。用的全是前两课的老朋友——CMP + 条件分支 + 无条件跳转，只是排列方式变了。我们从翻译最直观的 do-while 切入。

### 目标：一个最简单的循环

    int i = 0;
    do {
        i++;
    } while (i < 5);

计数器从 0 开始，每次加 1，到 5 停止。循环体执行 5 次，结束时 i=5。朴素到不能再朴素，但包含了循环的全部骨架。

为什么从 do-while 切入？因为它的 ARM 翻译最直观：先执行循环体，执行完再判断要不要再来一轮。

### 逐行对照：C → ARM

![C 的 do-while 循环与 ARM 汇编逐行对照](/assets/images/2026-08-arm-assembly/fig-loop-map.png)

        mov r0, #0       @ int i = 0
loop:
        add r0, #1       @ i++（循环体，先执行）
        cmp r0, #5       @ } while (i < 5) —— 反向：i ≥ 5 就退出
        bge end          @ 如果 r0 ≥ 5，跳到 end
        b loop           @ 否则跳回 loop 标签
end:
        mov r1, #2       @ 循环结束后继续

七行汇编，五个角色各司其职：mov 初始化计数器、loop: 给起点起名、add 是循环体（先执行）、cmp+bge 守卫出口、b loop 回头跳。

> **关键观察：先干活再判断。** add 在 cmp+bge 之前——第一次进入 loop 先把循环体跑一遍，执行完才 cmp 判断要不要退出。这正是 do-while 的标志：循环体至少执行 1 次。

### 流程图：转一圈

![循环流程图：do-while 先循环体后判断](/assets/images/2026-08-arm-assembly/fig-loop-flow.png)

从 loop 进入，先执行循环体（add），再走到 CMP 菱形分岔——r0 ≥ 5 走红色出口（bge end）离开，否则走绿色路径（b loop）回到循环体。先执行后判断，周而复始。

### 单步轨迹：r0 从 0 累加到 5

![单步轨迹：r0 从 0 累加到 5](/assets/images/2026-08-arm-assembly/fig-loop-trace.png)

- 第 1 轮：进入 loop，先 add → r0=1；cmp 1,5 → 1<5 不退出；b loop
- 第 2~4 轮：r0 依次变成 2、3、4，每次 add 后 cmp 都不退出，b loop 跳回
- 第 5 轮：add → r0=5；cmp 5,5 → 5≥5，bge 成立 → 跳出

循环体（add）恰好执行 5 次，最终 r0=5。每轮都是"先 add 后 cmp"——判断永远跟在循环体之后，这正是 do-while 与 while 的核心区别。

### 骨架与退出条件三选一

![循环骨架与退出条件三选一](/assets/images/2026-08-arm-assembly/fig-loop-patterns.png)

上面用的是 `bge end`（≥则退出），对应 `while (i < 5)`。退出条件可灵活替换：

- `beq end`：相等才退出——对应 `while (i != target)`（找不到目标就一直转）
- 不写退出条件：死循环，永远在 loop 和 add 之间打转

> **易错点：** 忘写 `b loop` 是新手第二常见的循环 bug。没有回头跳，程序只会穿过循环体一次——循环名存实亡。

### 对比：怎么改成「可能 0 次」的严格 while

正文这套写法是 do-while——循环体至少跑 1 次，哪怕 r0 初值已经 ≥5 也会先 add 一次再判。要严格 while 语义（条件不满足就一次都不跑），把 CMP 判断挪到循环体之前即可：

        mov r0, #10      @ 初始值已经 >= 5
loop:
        cmp r0, #5       @ 先判断！
        bge end          @ 10 >= 5，直接退出，循环体 0 次执行
        add r0, #1       @ 循环体挪到判断之后
        b loop
end:

r0 初始为 10 时循环体一次都不跑——这才是严格的 while 语义。区别只在边界情况：do-while 至少 1 次，while 可能 0 次。

### 小结

- 循环 = 初始化 + loop 标签 + 循环体 + CMP 退出判断 + b loop 回头跳
- 正文写法是 do-while（先干后判，至少 1 次）；要严格 while（可能 0 次）需把 CMP 挪到循环体之前
- 退出条件可换：bge（≥退出）、beq（==退出，对应 while(i != target)）、不写（死循环）
- 两大致命伤：忘写 b loop（只跑一次）、忘写退出条件（死循环）
