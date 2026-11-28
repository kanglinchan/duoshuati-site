# new 与 delete 的一生：从 operator new 到构造函数

![new 的两步与 delete 的两步；数组 new 多开的 4 字节 cookie 与指针偏移](/assets/images/cpp-core/cpp-core-21-new-delete.png)

"new 和 delete 能混用吗？"——面经高频题，八成的人答"不能，要配对"。再追问"内置类型为什么能混？""有析构函数的类为什么不能混？错在哪个字节上？"——能答全的凤毛麟角。

答案藏在 `new` 的完整一生里。`new` 不是魔法，它是一次**运算符重载函数的调用**：先 `operator new` 开内存，再调构造函数。`delete` 反过来：先析构，再 `operator delete`。而对**数组**，中间还藏着一个 4 字节的秘密记账——搞懂这 4 字节，所有混用问题全变成了指针运算题。

边界：基于这套机制做内存池（第 22 篇）是它的工程应用；`malloc` 底层如何向系统要内存不展开。

## 1. new 是函数，先看它的源码

在 `int* p = new int;` 上打断点转反汇编，你会看到 `call operator new`——`new` 这个"运算符"，本质是标准库提供的**运算符重载函数**。自己实现一个，逻辑一目了然：

```cpp
void* operator new(size_t size)
{
    void* p = malloc(size);          // 底层就是 malloc
    if (p == nullptr)
        throw std::bad_alloc();      // 失败不返回空，抛异常
    return p;
}

void operator delete(void* p)
{
    free(p);                         // 底层就是 free
}
```

从内存管理的角度看，`new`/`delete` 与 `malloc`/`free` 没有多大区别——`new` 的开内存那一步就是 `malloc`。真正的分野在三条规则上，面试逐条背：

**失败时的行为不同。**`malloc` 开不出来返回 `NULL`，`new` 抛 `bad_alloc` 异常。所以判断 new 失败**不能**写 `if (p == NULL)`：

```cpp
try {
    int* p = new int[1000000000000ull];
} catch (const std::bad_alloc& e) {
    cout << e.what() << endl;        // "bad allocation"
}
```

`e.what()` 返回的字符串就是 `bad_alloc` 构造时传进去的默认错误信息。

**类型信息不同。**`malloc` 按字节开，参数是字节数，返回 `void*` 要强转；`new` 指定类型，返回类型化的指针，不用强转。单个元素 `new int(5)`，数组 `new int[10]`——数组版会把每个元素都初始化成 0（对 `int` 相当于每个元素调了 `int()`）。

**职责不同。**`malloc` 只开内存；`new` 除了开内存**还负责初始化**——对类类型，初始化就是调用构造函数。`free` 只释放；`delete` 除了释放**还负责析构**——对内置类型（无析构可言）`delete p` 与 `free p` 没有任何区别。

## 2. new 的两步，delete 的两步

把上面的拆解正式化。对 `Test* p = new Test(10);`，编译器生成两步：

```text
第一步：operator new(sizeof(Test))   ← 只开内存，此时内存上是垃圾
第二步：Test::Test(10)               ← 在刚开的内存上调构造函数
```

对 `delete p;`：

```text
第一步：~Test()                      ← 调 p 指向对象的析构函数（还外部资源）
第二步：operator delete(p)           ← 只释放内存（free）
```

这两组"两步"是本文所有问题的分析框架。第 11 篇说"`delete` = 析构 + free"、第 19 篇说"`new` = 开内存 + 构造"，说的就是它们；allocator 的四大职责正是把这四步彻底拆散（`construct` 接管第二步，`destroy` 接管析构第一步）。

数组版有对应的 `operator new[]` / `operator delete[]`，专门处理数组内存的开辟释放——它们与单个版本是四个不同的函数，重载时各写各的。

## 3. 数组 new 的 4 字节秘密

重点来了。看一个最小复现：

```cpp
class Test
{
public:
    int ma;                          // Test 占 4 字节
    Test(int data = 10) { ma = data; }
    ~Test() { }                      // 有析构函数！
};

Test* p = new Test[5];
```

你以为开了 5 × 4 = 20 字节。实际上**编译器偷偷多开了 4 字节**，一共 24 字节，多出的头 4 字节存着一个整数：**对象的个数 5**。

为什么非记不可？`delete[] p` 执行时要从 `p` 出发逐个析构对象，可"这有几个对象"在运行时从代码里看不见——没人告诉它 5。编译器把个数记在内存头部，`delete[]` 时从那里取。

这 4 字节还引起第二个变化：**返回给你的指针偏移了**。假设底层真实起始地址是 `0x100`（cookie 在这），`new Test[5]` 返回给用户的是 `0x104`——跳过 cookie，直指第一个对象。用户拿到的指针语义很干净（指向数组首元素），cookie 位置不需要用户知道。

`delete[] p` 于是做了三件事：从 `p`（`0x104`）开始按 `sizeof(Test)` 步进，析构 5 个对象（个数从 `p - 4` 的 cookie 读出）；释放内存时把指针**减回 4**，从真实的 `0x100` 开始 `free`。在调试器里能看到实锤：`new` 打印底层地址 `0x0028`，返回的 `p` 是 `0x002C`，恰好差 4。

> **边界：** 只有"有析构函数（非平凡析构）的类类型"的数组才多这 4 字节——没析构可调就不需要个数记录。`new int[5]` 就是干净的 20 字节，返回的也是真实起始地址。

## 4. 混用四象限：错在哪个字节

有了 cookie 模型，四种组合逐一推演：

**内置类型：怎么混都行。**`int` 无构造无析构，`new`/`delete` 退化成 `malloc`/`free`，也没有 cookie——`new int[5]` 配 `delete p` 结果完全正确。这是"能混"的一半真相。

**无析构的自定义类型：也能混。**没有析构就没有 cookie，`new Test[5]` 与 `new int[5]` 内存布局相同，`free(p)` 释放的地址是对的（只是省略了逐对象析构——恰好也没什么可析构的）。

**有析构的类，`new[]` 配 `delete`：析构漏 + 地址错位，双重错。**`delete p` 把 `p` 当单个对象：只析构第一个元素（其余 4 个对象的析构永远不执行，若它们持有外部资源就是泄漏）；然后 `free(p)` 从 `0x104` 释放——可这块内存真实起点是 `0x100`。堆管理器拿到一个"从没作为分配起点"的地址，堆结构损坏，崩溃。

**有析构的类，`new` 单个配 `delete[]`：从垃圾里读个数，更糟。**`new Test` 只开 4 字节，没有 cookie。`delete[] p` 却认定"这是一数组"，跑到 `p - 4` 读对象个数——那里是别的数据的 4 个字节，读出一个随机数 N，然后按 N 步进取析构 N 个"对象"，最后 `p - 4` 释放一个错误地址。析构错对象 + free 错地址，程序当场崩。

所以面试题的标准答案有了层次：

> 内置类型可以混用（退化为 malloc/free）；**有析构函数的类类型绝对不能混**——混用的错误不在"少析构"这种表面，而在 **4 字节 cookie 导致的指针错位**：free 的地址不是 malloc 的地址。

编码守则简单到没有例外：`new` 配 `delete`，`new[]` 配 `delete[]`。即使你知道某个场景能混，统一配对让代码不需要读者做内存布局推理。

## 5. 什么时候重载这四个函数

既然 `new` 就是函数，就能全局重载接管整个应用的内存管理。两个经典应用方向：

**内存池。**实时性要求高、小块内存频繁分配释放的应用（服务器、游戏引擎），`malloc/free` 的系统级开销扛不住——全局重载 `operator new`/`operator delete`，让所有内存先走自己的内存池。适用判据很硬气：**除非你自己的内存管理方案确定比 `malloc` 好，否则规规矩矩用库的**。下一章就实践这个。

**内存泄漏检测器。**面试设计题："如何检测 C++ 程序的内存泄漏？"思路直接落在重载上：全局重载这四个函数，`operator new` 里把新分配的地址（乃至调用点的文件/行号，借助编译器预定义宏）记进映射表；`operator delete` 里删掉对应记录。程序结束时表里还有剩下的地址——`new` 了没 `delete`，泄漏，还能精确报出"哪个文件哪一行 new 的没还"。


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-core/cpp-core-21-new-delete-flow.gif)

## 小结

- `new` = `operator new`（底层 malloc，失败抛 `bad_alloc`）+ 构造函数；`delete` = 析构 + `operator delete`（free）；判断 new 失败用 try-catch，不能与 NULL 比较
- 三条区别：malloc 按字节返回 `void*`，new 按类型化指针；malloc 只开内存，new 还初始化；malloc 失败返 NULL，new 抛异常
- 有析构的类类型开数组时，编译器多开 4 字节存对象个数（cookie），返回的指针偏移 +4；`delete[]` 从 cookie 读个数、释放时指针 -4
- 混用四象限：内置类型和无析构类型可混；**有析构的类型不能混**——错误本质是 cookie 引起的指针错位（free 地址 ≠ malloc 地址），不只是漏析构
- 重载这四个函数的两大应用：内存池（自管方案比 malloc 好才做）、内存泄漏检测器（映射表记录 new/delete 配对）

机制齐了，下一篇把它变成生产力：重载 `new`/`delete` 给一个类做专属内存池——对象池，一次 malloc 服务成千上万次 new。

<QuizBlock src="/quiz/2026-11-cpp-core/21.json" title="本章自测" />
