# 智能指针基础：用对象的生命周期管住资源

![RAII：栈对象出作用域自动析构 → 析构里 delete 托管资源；* 与 -> 运算符重载；智能指针不能放堆上](/assets/images/cpp-advanced/cpp-advanced-05-smart-pointer-raii.png)

裸指针是 C/C++ 里最锋利也最危险的工具——new 出来的资源必须记得 delete，忘写、提前 return 绕过、中途抛异常，三种姿势都能让堆内存悄悄漏掉。"程序任何一条执行路径都能保证资源释放"这个需求，靠人肉检查每条分支是防不住的。

**智能指针**给出的答案是借力打力：利用第 11 篇讲过的"栈对象出作用域自动析构"——**把资源挂在一个栈对象身上，对象析构时自动 delete**。无论函数正常返回、中途 return 还是抛异常，只要离开作用域，析构必然发生（第 11 篇：栈对象析构不受退出方式影响），资源必然释放。这个套路有个正式名字：**RAII**（Resource Acquisition Is Initialization，资源获取即初始化）。

边界：本篇手写一个极简智能指针打地基；引用计数、所有权转移等进阶话题是后续三篇的内容；线程库只作工具使用，多线程专题在中级课后半段。

## 1. 裸指针的三种漏法

例. 三个都"写了 delete"却依然泄漏的场景：

```cpp
void f()
{
    int* p = new int(10);
    if (cond1)
        return;            // 漏法一：忘了写（惯性）
    if (cond2)
        throw std::exception();   // 漏法二：异常路径跳过 delete
    // 漏法三：逻辑分支绕过——写了 delete，但这条路径没执行到
    delete p;
}
```

解. 泄漏的本质是：**delete 是一条普通语句，任何提前离开函数的路径都会跳过它**。而正常路径能保证的事情只有一件——栈对象的析构。所以治法不是"更小心地写 delete"，而是**把释放动作搬进析构函数里**，让语言机制替我们执行。

## 2. 手写一个极简智能指针

```cpp
template<typename T>
class CSmartPtr
{
public:
    CSmartPtr(T* ptr = nullptr) : mptr(ptr) {}
    ~CSmartPtr() { delete mptr; }              // 释放动作住在析构里

    T& operator*()  { return *mptr; }          // 解引用：读/写托管资源
    T* operator->() { return mptr; }           // 箭头：调成员方法

private:
    T* mptr;                                   // 只是一根裸指针的封装
};
```

结构平凡到不可思议：**智能指针就是一个包着一根裸指针的栈对象**。构造时接住资源地址，析构时 delete——RAII 全部秘密就这两行。

用起来却脱胎换骨：

```cpp
void f()
{
    CSmartPtr<int> sp(new int(10));
    *sp = 20;                    // 通过 operator* 读写
    // 无论如何退出 f——正常返回、中途 return、抛异常——
    // sp 析构必然执行，delete 必然发生
}
```

两个运算符重载让智能指针的"手感"逼近裸指针。`operator*` 返回 `T&`（引用——可读可写，第 25 篇的返回值设计规则）；`operator->` 返回 `T*`，编译器对 `->` 的解析规则是"调用 operator-> 的返回值再对后面的成员访问"——所以 `sp->test()` 等价于 `(sp.operator->())->test()`，链式直达托管对象的方法。

## 3. 面试陷阱：智能指针能定义在堆上吗

```cpp
CSmartPtr<int>* p = new CSmartPtr<int>(new int(10));
```

语法完全合法，但这行代码自毁根基。`p` 前面有 `*`——**它本身是一根裸指针**，指向堆上的智能指针对象。堆对象的析构只有 delete 触发（第 11 篇），于是：

- 智能指针对象的析构（连带资源释放）需要你手动 `delete p`；
- 你又回到了"必须记得 delete"的原始问题——只是对象套了一层壳。

所以结论是：**智能指针必须住在栈上**（或作为其他栈对象的成员），它的全部价值建立在"栈对象出作用域自动析构"之上，放堆上等于自废武功。这也是面试题"智能指针的原理"的收尾点：RAII + 栈对象析构保证，缺一不可。

## 4. RAII 的推广：不止管内存

析构函数里能做的远不止 delete。同一套模板改一行析构，就能托管任何"需要成对释放"的资源：

```cpp
~CFilePtr() { fclose(mptr); }        // 托管 FILE*：fopen/fclose 配对
~CLockGuard() { mutex.unlock(); }    // 托管锁：lock/unlock 配对
```

内存、文件句柄、互斥锁、socket——所有"获取/释放配对"的资源都能套进 RAII。这也是"资源获取即初始化"这个名字的含义：**资源的生命周期绑定到对象的生命周期**，获取资源 = 构造对象，释放资源 = 析构对象，语言机制保证成对。

标准库早就内置了这套思想的成品：`unique_ptr`/`shared_ptr` 管内存（后续两篇主角），`lock_guard`/`unique_lock` 管锁，`fstream` 管文件。学会手写极简版，等于拿到了读它们源码的钥匙。

## 5. 这个地基还差什么

极简版有两个致命缺陷，也是后续篇章的路线图：

**缺陷一：浅拷贝双重释放。**`CSmartPtr<int> p2(p1);` 走默认拷贝构造（第 14 篇），两个对象析构时对同一资源 delete 两次——崩溃。怎么解决？"每个资源只许一个指针管"是一派（auto_ptr/scoped_ptr/unique_ptr，所有权转移或禁拷贝），"引用计数让最后一个使用者释放"是另一派（shared_ptr）——下一篇起分头讲。

**缺陷二：没有线程安全。**多线程下引用计数的加减需要原子操作。标准库的实现用 `atomic<int>`（CAS 保证），本系列的手写版先不管，07 篇对照补齐。

带着这两个问题往下走——下一篇先解决"一个资源到底该归谁管"。


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-advanced/cpp-advanced-05-smart-pointer-raii-flow.gif)

## 小结

- 裸指针三种漏法：忘 delete、异常路径跳过、逻辑分支绕过——delete 是普通语句，任何提前退出都跳过它
- RAII：把释放动作搬进析构函数，栈对象出作用域必然析构 → 资源必然释放，三种漏法一次根治
- 智能指针 = 包着裸指针的栈对象：构造接住地址、析构 delete；`operator*` 返回 T&、`operator->` 返回 T*（编译器链式解析到托管对象）
- 智能指针必须住栈上：`new CSmartPtr<...>` 得到的又是指针，回到手动 delete 的原点——放堆上自废武功
- RAII 推广到一切"获取/释放配对"的资源：文件 fclose、锁 unlock；标准库的 unique_ptr/shared_ptr/lock_guard 都是成品
- 极简版两大缺陷（浅拷贝双重释放、无线程安全）是后续篇章的主线：所有权派 vs 引用计数派

一个资源可以有两个智能指针管吗？三种流派给出三种答案——转移所有权（auto_ptr）、禁止拷贝（scoped_ptr）、显式移动（unique_ptr）。下一篇：不带引用计数的智能指针。

<QuizBlock src="/quiz/2026-12-cpp-advanced/05.json" title="本章自测" />
