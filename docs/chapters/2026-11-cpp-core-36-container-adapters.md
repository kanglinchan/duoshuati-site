# 容器适配器：stack、queue、priority_queue

![容器适配器：stack/queue/priority_queue 无自有数据结构、不提供迭代器；底层依赖 deque 与 vector 的原因](/assets/images/cpp-core/cpp-core-36-container-adapters.png)

打开 stack 的源码你会愣一下：这个"容器"总共就五个一行的方法，`push` 转发 `push_back`、`pop` 转发 `pop_back`、`top` 转发 `back`……**它自己一行数据结构代码都没有**。

这就是**容器适配器**（container adapter）——不造新轮子，只换新接口。stack、queue、priority_queue 三件套全靠这套思路活着。这篇讲清适配器的两个特征、三件套的方法表，以及面试里最有味道的两个"为什么"：为什么 stack/queue 底层依赖 deque，而 priority_queue 依赖 vector。

边界：堆（大根堆）的完整实现属于数据结构课程，本文只讲"为什么必须用数组"；priority_queue 的自定义比较器在泛型算法篇结合函数对象讲。

## 1. 适配器的两个特征

从源码归纳，容器适配器只有两条铁律：

**其一：没有自己的数据结构。**它是对另一个容器对象的封装——成员变量就是一个底层容器（`stack<T, Container=deque<T>>` 里那个 `Container c`）。栈的逻辑"一头进出、后进先出"，deque 全都提供了：尾部插入模拟入栈、尾部删除模拟出栈、取尾部元素模拟看栈顶。stack 做的全部工作是**给底层容器的方法换名字**。

这本质上是个代理结构：stack 代理 deque，`push` 代理 `push_back`，`pop` 代理 `pop_back`，`top` 代理 `back`。设计模式里的适配器模式讲"接口转换"，这里更接近代理——不过面试里说"适配器模式的思想"通常也认。

**其二：不提供迭代器。**stack、queue、priority_queue 都不能 `begin()` 遍历。为什么？看语义：栈只允许你看见栈顶，队列只允许你看见队头——**如果给你迭代器，你就绕过了栈顶直接摸到栈底，栈的语义就崩了**。适配器卖的就是"受限访问"这个约束，迭代器与这个约束天然矛盾。

所以遍历 stack 的标准姿势是"看顶、弹、再看顶"的循环：`while (!s.empty()) { cout << s.top(); s.pop(); }`——用弹空的方式"遍历"。

## 2. 三件套方法速览

三个适配器的方法名刻意统一（push / pop / empty / size，查看端点用 top 或 front），减少记忆负担：

| | stack（后进先出） | queue（先进先出） | priority_queue（优先级出队） |
|---|---|---|---|
| 入 | push | push（队尾） | push |
| 出 | pop（栈顶） | pop（队头） | pop（**优先级最大者**） |
| 查看 | top | front / back | top |
| 判空/数量 | empty / size | empty / size | empty / size |
| 默认底层容器 | **deque** | **deque** | **vector** |

出队顺序是三者的全部差异：stack 后进先出，queue 先进先出，priority_queue **谁优先级大谁先出**——默认实现是大根堆，连续 `pop` 得到从大到小的序列。它们同样没有迭代器，遍历都是"边弹边看"。

应用场景顺带一句：栈用于递归转非递归、迷宫路径搜索；优先级队列最出名的战场是**海量数据 Top K**——十亿个数找最大的 100 个，维护一个 100 个元素的小根堆扫一遍，内存和时间都省到极致。

## 3. 为什么 stack/queue 依赖 deque？

源码里第二个模板参数 `Container` 默认是 `deque`。换成 vector 行不行？功能上行，选择 deque 有三条硬理由——面试被问"为什么不依赖 vector"时，按这三层答：

**其一，初始内存效率。**vector 默认构造零空间，push_back 时代价 0→1→2→4→8 一路扩容搬家；deque 的第二维一开就是 4096/sizeof(T) 个元素（int 即 1024 个），**一次分配管很久**，扩容次数骤减。适配器封装的是高频增删场景，频繁搬家不可接受。

**其二，queue 需要两头都快。**queue 的操作模式是"队尾入 + 队头出"——deque 尾插、头删**都是 O(1)**；vector 尾插 O(1)，但**头删要挪动全部元素 O(n)**。queue 若建在 vector 上，每次 pop 都是全量搬家，性能灾难。（stack 只用尾部，deque 在这点上与 vector 打平——但前一条已经分出胜负。）

**其三，内存布局。**vector 要求一整块连续内存，海量数据时分配难度大；deque 分段连续（第 35 篇），只要有合适大小的空闲内存块就能放，大量数据下内存利用率更高。

一句话收拢：**deque 的"两头 O(1) + 分段内存 + 一次开一段"，恰好覆盖 stack/queue 的全部需求，而 vector 在这三点上各有短板。**

## 4. 为什么 priority_queue 依赖 vector？

这个问题更妙，答案直指数据结构本质：priority_queue 底层默认组织成**大根堆**，而堆的存储依赖**数组下标运算**——下标 i 的节点，左孩子是 `2i+1`，右孩子是 `2i+2`，父节点是 `(i-1)/2`。

这套下标公式成立的前提是**所有元素在一段绝对连续的内存里**：算出"左孩子在 2i+1 号位"，得真的能一步跳到那个位置。vector 是数组，公式成立；deque 分段连续——第 0 段的下标从 0 算起，第 1 段的下标也从 0 算起，**跨段的下标运算毫无意义**。在分段内存上建堆，父子定位的每一步都要先换算段号再换算段内偏移，实现复杂且慢。

所以 priority_queue 选 vector 不是偏爱，是**必须**：堆的下标运算与数组的绝对连续性互为前提。三个适配器两种底层选择，背后各有一条铁的逻辑——这才是面试官想听的"为什么"，而不是"人家源码就这么写的"。


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-core/cpp-core-36-container-adapters-flow.gif)

## 小结

- 适配器两特征：无自有数据结构（封装底层容器，方法全部转发）；不提供迭代器（受限访问是语义的一部分，遍历 = 边弹边看）
- stack 五方法（push/pop/top/empty/size）后进先出；queue 先进先出（push 队尾、pop 队头、front/back）；priority_queue 大根堆，优先级最大者先出
- stack/queue 依赖 deque 三理由：初始内存效率（一开 1024 个）、两头 O(1)（queue 的头删需求）、分段内存利用率
- priority_queue 依赖 vector 的理由：堆靠下标公式（左 2i+1 右 2i+2）定位父子，公式要求绝对连续内存——deque 分段连续，下标运算跨段无意义
- 面试开放题的答法：不背"标准答案"，给有依据的解释——底层结构、复杂度、内存布局逐条论证

适配器"换接口"的玩法看完了。下一篇进入关联容器：红黑树家族——set、map 为什么能做到有序遍历 + O(log n) 增删查。

<QuizBlock src="/quiz/2026-11-cpp-core/36.json" title="本章自测" />
