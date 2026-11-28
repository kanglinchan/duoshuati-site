# 对象池：给一个类做专属内存管家

![对象池：静态链表串起空闲节点，operator new 取节点、operator delete 头插归还，全程无 malloc](/assets/images/cpp-core/cpp-core-22-object-pool.png)

链式队列压测：`push` 一百万次再 `pop` 一百万次——两百万次 `malloc/free`。每个节点就那么几十字节，`push` 时 malloc 一次，`pop` 时 free 一次，下一次 `push` 又要一块一模一样大的内存。节点里变的只是数据，节点本身从来不变，这笔开销纯属浪费。

解法是**对象池**（object pool）：提前开一大块内存切成节点串成链，`new` 时从链头摘一个（无 malloc），`delete` 时把节点挂回链头（无 free）。实现它的工具上一章刚备好——类作用域的 `operator new`/`operator delete` 重载。

边界：本篇的池是单线程简化版，线程安全的原子操作与内存池分级复用属于进阶话题；池自身的最终释放用裸指针示范，智能指针（进阶篇）可以把它自动化。

## 1. 重载的位置决定截获范围

运算符重载可以写成全局函数，也可以写成类的成员方法——`new`/`delete` 同理，且截获范围随位置走：

```cpp
void* operator new(size_t size);                  // 全局：整个项目所有 new 被截获
                                                  // —— 内存泄漏检测器要的就是这个范围

template<typename T>
class Queue
{
    void* operator new(size_t size);              // 类作用域：只有 new Queue<T>::QueueAtom 被截获
    void operator delete(void* p);
};
```

内存池的诉求恰恰是"**只**改变某些对象的内存管理方式"——别的类型照常用库的 `malloc/free`，只有我自己的节点走我的池。所以对象池用类作用域重载，泄漏检测用全局重载，两种场景两种位置。

## 2. 池的思想：不变的形状，重复的生命

内存池、进程池、线程池、连接池、对象池——名字五花八门，思想同一句话：**把昂贵的获取/释放动作提前批量做一次，之后每轮"获取/归还"只是指针拨动**。

对象池成立的条件，链式队列节点完美满足：

- **大小恒定**：每个 `QueueAtom` 节点 `sizeof` 一样（数据域 + next 域）；
- **生命周期短且频繁**：`push` 生、`pop` 死，一秒几万次；
- **死而复用**：free 掉的内存马上又要一块同样大的——那何必真的还回去再要？

对这种对象，`malloc/free` 每轮都走系统调用，而池方案把系统调用次数从 N 次压到 1 次。

## 3. 实现：一条静态链表管所有空闲节点

池的数据结构是一条**静态链表**：一次 `new char[]` 开出 10 万个节点的连续内存，把它们的 next 域串起来，池入口指针 `atomPool` 指向第一个空闲节点。取节点 = 摘链头，还节点 = 头插。

```cpp
template<typename T>
class Queue
{
    struct QueueAtom                  // 节点：嵌套类型（第 15 篇的语境）
    {
        T data;
        QueueAtom* next;
        QueueAtom(T data = T()) : data(data), next(nullptr) {}
    };

    QueueAtom* front;                 // 带头节点的队头
    QueueAtom* rear;

    static const int POOL_SIZE = 100000;          // 池容量（C++11 起类内可初始化）
    static QueueAtom* atomPool;                   // 池入口：指向第一个空闲节点

public:
    void* operator new(size_t size)
    {
        if (atomPool == nullptr)                  // 池空：首次开池
        {
            // 注意：开池用 new char[]，不能 new QueueAtom[...]——见第 4 节
            atomPool = (QueueAtom*)new char[sizeof(QueueAtom) * POOL_SIZE];
            for (QueueAtom* p = atomPool; p != atomPool + POOL_SIZE - 1; ++p)
                p->next = p + 1;                  // 串成静态链表
            (atomPool + POOL_SIZE - 1)->next = nullptr;   // 尾节点收口
        }
        QueueAtom* p = atomPool;                  // 摘链头：无 malloc
        atomPool = atomPool->next;
        return p;
    }

    void operator delete(void* ptr)
    {
        QueueAtom* p = (QueueAtom*)ptr;
        p->next = atomPool;                       // 头插归还：无 free
        atomPool = p;
    }
};

template<typename T>
typename Queue<T>::QueueAtom* Queue<T>::atomPool = nullptr;   // 静态成员类外定义
```

`operator new` 里的行为读一遍：第一次调用时池是空的，于是开一大块内存、`p->next = p + 1` 把 10 万个节点串好（内存连续，"下一个节点"就是地址加一——这就是"静态"链表的含义）；之后每次调用只是摘下 `atomPool` 当前指向的节点、池指针后移，**没有一次 malloc**。`operator delete` 更短：把归还节点的 next 指向现有链头，`atomPool` 回指它——**没有一次 free**。

对使用者完全透明：`new QueueAtom(5)` 的调用代码一个字都不用改，底下已经从系统调用变成了指针拨动。

## 4. 三个藏在代码里的语法点

**这俩函数天生就是静态的。**`operator new` 被调用时对象还没构造，`operator delete` 被调用时对象已经析构完——两个时刻都没有对象，自然用不到 `this`。不加 `static` 关键字，编译器也按静态成员函数处理。

**`typename` 的第二重身份。**类外定义池指针那行，`typename Queue<T>::QueueAtom*` 里的 `typename` 不是在声明模板参数，而是在**消歧义**：编译器编译到此处时还没有任何 Queue 被实例化，它无法确定 `Queue<T>::QueueAtom` 是个类型还是个静态成员（是类型这是指针声明，是变量这就成乘法了）。`typename` 的作用就是告诉编译器："后面这个嵌套从属名是类型，放心用。"这个用法在读 STL 源码时到处都是。

**开池必须用 `new char[]`。**为什么不能顺手写 `new QueueAtom[POOL_SIZE]`？因为 QueueAtom 的 `new` 已经被我们重载了——开池时的 `new QueueAtom[N]` 会**再次调进我们自己的 operator new**，逻辑绕死还可能无限递归。`new char[]` 走的是 char 类型的 new（没被重载），拿到裸内存后再自己串链——池的初始化必须绕开池自己。

顺带一提 `static const int POOL_SIZE = 100000;`：整型静态常量 C++11 起允许类内直接初始化；老标准得类外定义一次。这也是"静态常量整型"这个特殊待遇的常见亮相场合。

## 5. 效果与收尾

压测一百万次 push/pop：第一轮 `push` 触发一次开池（一次 `new char[]`），此后两百万次增删全是链表头摘/头插，对比两百万次 `malloc/free`，短时间高频场景的性能提升立竿见影。节点归还只是挂链，也顺带回答了一个隐忧：**不会泄漏**——所有节点永远在池链上，一个都跑不掉。

两件收尾的事。池那块 `new char[]` 的内存在程序结束前要整体释放（节点本身没有"释放"概念，释放的只有池本身）；用裸指针管理这段生命周期容易忘，智能指针的 RAII 能把它自动化——进阶篇的内容。另一件是适用判据，和第 21 篇的内存池判据一脉相承：**对象大小固定、生灭频繁、单线程访问**，三个条件都满足才值得上池；偶尔 new 一个大对象走池纯属脱裤子放屁。


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-core/cpp-core-22-object-pool-flow.gif)

## 小结

- 重载位置决定截获范围：全局重载接管一切 new/delete（泄漏检测），类作用域重载只管自己类型（对象池）
- 对象池 = 静态链表：开池一次 `new char[]` 串好 10 万节点；`operator new` 摘链头（无 malloc），`operator delete` 头插归还（无 free）
- 两个重载函数天生静态：调用时刻（构造前/析构后）没有对象，不需要 `this`
- `typename Queue<T>::QueueAtom` 的 typename 是消歧义：告诉编译器嵌套从属名是类型；开池必须 `new char[]`，防止递归调进自己的重载
- 适用判据：大小固定、生灭频繁、单线程；节点永不泄漏——它们永远在池链上

内存管理的三部曲（机制 → 全局重载 → 类池）到此收官。下一篇回到容器主线：给 vector 和 string 装上迭代器——一套 `begin/end/++/*` 通吃所有容器。

<QuizBlock src="/quiz/2026-11-cpp-core/22.json" title="本章自测" />
