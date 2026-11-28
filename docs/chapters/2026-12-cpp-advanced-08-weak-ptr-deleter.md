# weak_ptr 与自定义删除器：循环引用的解药与资源释放的定制

![循环引用：A/B 互持 shared_ptr 计数卡在 2；弱引用观察不计数；多线程 lock 提升检测存活；自定义删除器](/assets/images/cpp-advanced/cpp-advanced-08-weak-ptr-deleter.png)

shared_ptr 的引用计数有一个著名的死角：**A 持有指向 B 的 shared_ptr，B 持有指向 A 的 shared_ptr**——两个计数互相撑着，永远降不到 0，两个对象双双泄漏。这是智能指针面试的头号题："循环引用是什么？怎么解决？"

解药是本篇的第一主角 **weak_ptr**——一个"观察但不持有"的弱引用。第二主角是**自定义删除器**：智能指针默认用 delete 释放，可数组要 `delete[]`、文件要 `fclose`——释放方式不对等时，得让智能指针听你的。

边界：本篇三件事一脉相承——循环引用（问题）→ weak_ptr（解药 + 多线程存活检测）→ 自定义删除器（释放方式定制）；手写版引用计数沿用 07 篇。

## 1. 循环引用：计数互相撑住的死锁

复现现场只要三步。两个类互持对方的 shared_ptr 成员：

```cpp
class B;
class A { public: shared_ptr<B> ptrb; ~A() { cout << "~A"; } };
class B { public: shared_ptr<A> ptra; ~B() { cout << "~B"; } };

void f()
{
    shared_ptr<A> pa(new A);       // A 的计数 = 1
    shared_ptr<B> pb(new B);       // B 的计数 = 1
    pa->ptrb = pb;                 // B 的计数 = 2（A 的成员也指着它）
    pb->ptra = pa;                 // A 的计数 = 2（B 的成员也指着它）
}                                  // 出作用域……
```

出作用域时逐帧分析：栈上的 `pa`、`pb` 先析构——但它们**只是减数人**，各减一次：A 的计数 2→1、B 的计数 2→1。剩下的 1 是谁撑的？**对方对象里的那个成员**——A 对象还活着（计数 1），它内部的 `ptrb` 指着 B；B 对象也活着，它内部的 `ptra` 指着 A。两个计数互相撑住，谁也到不了 0，`~A`、`~B` 一次都不打印，两块堆内存（及其中所有资源）永久泄漏。

死锁的本质与线程死锁同构：**A 的释放等 B 先释放，B 的释放等 A 先释放**——互相等待，永不发生。

## 2. weak_ptr：观察但不改变计数

weak_ptr（弱智能指针）与 shared_ptr（强智能指针）的分野一句话：**强指针改变引用计数，弱指针只观察不改变**。

解法是把"引用"的位置换成弱指针：

```cpp
class A { public: weak_ptr<B> ptrb; ... };    // 定义对象的地方 → 强指针
class B { public: weak_ptr<A> ptra; ... };    // 引用对象的地方 → 弱指针
```

选型口诀由此而来：**定义对象的地方用强指针（你 new 出来、你主责），引用对象的地方用弱指针（你只是指过去看看）**。改完重跑：`pa->ptrb = pb` 赋的是 weak_ptr——**计数纹丝不动**，出作用域前 A、B 的计数都是 1。出作用域：pb 析构 → B 计数 1→0 → `~B` 执行 → B 内部的弱指针跟着消亡；pa 析构 → A 计数 1→0 → `~A` 执行。链环从计数上解开，双双正常释放。

weak_ptr 为什么敢"白看"？它不持有资源的所有权，只回答一个问题——**"资源还活着吗？"**（计数是否 >0）。这个"存活侦测"能力在多线程场景是刚需，第 4 节展开。

## 3. lock：从观察者升级为使用者

弱指针有个让人意外的限制：**它没有 `operator*` 和 `operator->`**——根本不能解引用。观察者不能用资源，天经地义（它连计数都不改，自然也无权访问）。那持有弱指针想调方法怎么办？先**提升**：

```cpp
// B 对象持有 weak_ptr<A> ptra，想调 A 的方法：
shared_ptr<A> ps = ptra.lock();        // 提升为强指针
if (ps != nullptr)                     // 提升成功：资源还活着
    ps->func();                        // 计数 +1，对象被"拽住"，无人能释放
else
    /* 资源已释放，放弃访问 */;
```

`lock()` 尝试把弱指针提升成强指针：成功意味着资源还活着（计数 +1，像一根铁链把对象拽住，其他线程休想释放它），失败意味着资源已经没了。**提升 + 判空**是弱指针的标准使用姿势。

这正是多线程访问共享对象的安全姿势（muduo 网络库的看家手法）：主线程 `shared_ptr<A> pa(new A)`，子线程只拿 `weak_ptr<A>` 观察；子线程用之前先 `lock()`——**用引用计数检测对象存活**，活着就用，死了就跳过。裸指针传给子线程，两秒后对象析构了还去调方法，就是典型的悬空访问事故。

## 4. 自定义删除器：释放方式不对等时

智能指针析构时默认调 `delete ptr`。但不是所有资源都用裸 delete 释放：数组要 `delete[]`、文件要 `fclose`、malloc 的要用 free——**分配与释放方式必须配对**（第 21 篇），否则未定义行为。

智能指针的析构函数里实际执行的是一个**删除器函数对象的调用**——默认删除器就是"`operator()` 里写 delete ptr"的函数对象。给 unique_ptr 换删除器，用函数对象版要先定义类再塞模板参数，啰嗦：

```cpp
struct MyDeleter { void operator()(int* p) { delete[] p; } };
unique_ptr<int, MyDeleter> p(new int[10]);       // 数组正确释放
```

C++11 的 lambda + function 把它压成一行——lambda 本身就是函数对象（第 39 篇），function 负责收容它的类型：

```cpp
unique_ptr<int, function<void(int*)>> p(
    new int[10],
    [](int* p) { delete[] p; });                 // 数组删除器，就地书写

unique_ptr<FILE, function<void(FILE*)>> f(
    fopen("data.txt", "r"),
    [](FILE* p) { fclose(p); });                 // 文件删除器
```

`function<void(int*)>` 声明"删除器是接收 int* 返回 void 的可调用物"，lambda 就地填空。不用再为每种资源定义一个 Deleter 类——lambda 的局部性优势（第 40 篇）在删除器场景再次兑现。shared_ptr 同理（第二个构造参数传删除器）。

> **边界：** 数组其实有更省的写法——C++14 起 `unique_ptr<int[]>`（`p(new int[10])` 自动走 `delete[]`）；function 版删除器的价值在"任意资源类型"的通用性上。


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-advanced/cpp-advanced-08-weak-ptr-deleter-flow.gif)

## 小结

- 循环引用：A、B 互持 shared_ptr，计数互相撑住永远到不了 0——双双泄漏，本质是释放路径的互相等待
- 解法口诀：**定义对象的地方用强指针，引用对象的地方用弱指针**——weak_ptr 赋值不改变计数，链环从计数上解开
- weak_ptr 无 `operator*`/`->`（观察者不能用资源）；`lock()` 提升为强指针：成功（资源活着，计数 +1 拽住）失败（已释放）——提升 + 判空是标准姿势
- 多线程共享对象的安全访问：子线程拿 weak_ptr 观察，用前 lock 检测存活——muduo 库的看家手法
- 删除器：析构里实际执行函数对象调用；`unique_ptr<T, function<void(T*)>>` 配 lambda 就地定制——数组 `delete[]`、文件 `fclose` 一行搞定
- 记忆钩子：强弱分工（定义 vs 引用）、观察检测（lock + 判空）、释放配对（分配方式决定删除器）

智能指针四篇收齐。下一篇进 C++11 的另一半版图：bind 绑定器与 function 函数对象包装器——把"可调用物"从函数、函数对象、lambda 统一收纳。

<QuizBlock src="/quiz/2026-12-cpp-advanced/08.json" title="本章自测" />
