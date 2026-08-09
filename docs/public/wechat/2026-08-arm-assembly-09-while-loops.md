# while 循环：让代码重复执行

上一课学会了 if-else 的分支判断。但现实中的程序需要反复执行同一段逻辑——遍历数组、等待输入、处理数据流……这就是循环。

这一课只讲一件事：把 C 语言的 `while` 循环翻译成 ARM 汇编。用的全是前两课的老朋友——CMP + 条件分支 + 无条件跳转，只是排列方式变了。

### 目标：一个最简单的 while 循环

    int i = 0;
    while (i < 5) {
        i++;
    }

计数器从 0 开始，每次加 1，到 5 停止。循环体执行 5 次，结束时 i=5。朴素到不能再朴素，但包含了循环的全部骨架。

### 逐行对照：C → ARM

![C 的 while 循环与 ARM 汇编逐行对照](/assets/images/2026-08-arm-assembly/fig-loop-map.png)

        mov r0, #0       @ int i = 0
loop:
        cmp r0, #5       @ while (i < 5) —— 反向思考：i ≥ 5 就退出
        bge end          @ 如果 r0 ≥ 5，跳到 end
        add r0, #1       @ i++（循环体）
        b loop           @ 无条件跳回 loop 标签
end:
        mov r1, #2       @ 循环结束后继续

七行汇编，四个角色各司其职：mov 初始化计数器、loop: 给起点起名、cmp+bge 守卫出口、add 是循环体、b loop 回头跳。

> **关键观察：先干活再判断。** add 在 cmp+bge 之前——本质是 do-while 形态（至少执行一次）。

### 流程图：转一圈的四个动作

![循环流程图](/assets/images/2026-08-arm-assembly/fig-loop-flow.png)

从 loop 进入，经过 CMP 菱形分岔——满足条件的走红色出口（bge end），不满足的走绿色路径（add → b loop）回到入口。周而复始，直到某次 CMP 判断成立为止。

### 单步轨迹：r0 从 0 累加到 5

![单步轨迹](/assets/images/2026-08-arm-assembly/fig-loop-trace.png)

- 第 1 轮：r0=0，cmp 发现 0<5，bge 不跳 → add → r0=1
- 第 2~5 轮：r0 依次变成 2、3、4、5
- 第 6 轮：r0=5，cmp 触发 Z=1，bge 成立 → 跳出

循环体恰好执行 5 次，最终 r0=5。

### 骨架与退出条件三选一

![循环骨架与退出条件](/assets/images/2026-08-arm-assembly/fig-loop-patterns.png)

上面用的是 `bge end`（≥则退出），对应 `while (i < 5)`。退出条件可灵活替换：

- `bne end`：不相等就继续，相等才退出——对应 `while (i != target)`
- 不写退出条件：**死循环**，永远在 loop 和 add 之间打转

> **易错点：** 忘写 `b loop` 是新手第二常见的循环 bug。没有回头跳，程序只会穿过循环体一次——循环名存实亡。

### while vs do-while

刚才的写法是 do-while（先执行再判断）。要真正的 while 语义（可能 0 次不执行），把 CMP 挪到循环顶部即可——初始值已不满足条件时直接跳过循环体。

### 小结

- while = 初始化 + loop 标签 + CMP + 条件退出 + 循环体 + b loop 回头跳
- 本质 do-while；要严格 while 语义需把 CMP 挪到顶部
- 两大致命伤：忘写 b loop（只跑一次）、忘写退出条件（死循环）
- 下集预告：for 循环 = 初始化 + 条件 + 增量的语法糖，骨架和 while 完全一样
