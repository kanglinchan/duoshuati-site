# shared_ptr 与引用计数：最后一个使用者负责释放

![引用计数智能指针：计数对象托管资源，拷贝 +1、析构 -1、归零者释放；atomic 保证线程安全](/assets/images/cpp-advanced/cpp-advanced-07-shared-ptr-refcount.png)

unique_ptr 的铁律"一个资源一个管理者"在现实里经常破功：一个对象被多个模块持有、被多个线程访问、被容器和回调同时引用——**共享是刚需**。

带引用计数的智能指针为此而生：**给每个资源配一个计数，引用时 +1，弃用时 -1，减到 0 的那个（最后一个使用者）负责释放**。这个机制同时根治了浅拷贝的双重释放——释放权不再属于"任何一个持有者"，而属于"最后一个放下它的人"。

本篇手写一个简化版 shared_ptr 把机制拆开，再对照标准库补上线程安全这最后一块拼图。

边界：计数与资源分两个对象（计数器托管指针 + 计数值）是实现细节之一；weak_ptr 的观察者角色与循环引用是下一篇；手写版省略 atomic，末节对照补齐。

## 1. 计数器：资源与人数分开记账

引用计数方案的关键结构决定：**计数不记在智能指针对象里，而是独立成一个堆上的计数器对象**——因为计数属于"资源"而非"某一个持有者"，所有指向同一资源的智能指针必须共享同一份计数：

```cpp
template<typename T>
class RefCnt          // 引用计数器：托管资源指针 + 计数
{
public:
    RefCnt(T* ptr = nullptr) : mptr(ptr), mcount(mptr ? 1 : 0) {}
    void addCount()     { ++mcount; }                    // 引用 +1
    int delCount()      { return --mcount; }             // 弃用 -1，返回剩余数
private:
    T* mptr;            // 资源地址
    int mcount;         // 引用计数，从 1 起算
};
```

智能指针持有两根指针：一根指向资源，一根指向计数器：

```cpp
template<typename T>
class CSmartPtr
{
public:
    CSmartPtr(T* ptr = nullptr)
        : mptr(ptr), mpRefCnt(new RefCnt<T>(ptr)) {}     // 首个持有者：计数 = 1

    CSmartPtr(const CSmartPtr<T>& src)                   // 拷贝构造：共享，不新开资源
        : mptr(src.mptr), mpRefCnt(src.mpRefCnt)
    {
        if (mptr != nullptr)
            mpRefCnt->addCount();                        // 计数 +1
    }

    CSmartPtr<T>& operator=(const CSmartPtr<T>& src)
    {
        if (this == &src) return *this;
        mpRefCnt->delCount();                            // 弃用自己原来的资源（-1）
        if (mpRefCnt->delCount 的返回值 == 0)
            /* 自己原来的计数归零 → 释放自己原来的资源 */;
        mptr = src.mptr;                                 // 指向新资源
        mpRefCnt = src.mpRefCnt;                         // 共享新资源的计数器
        if (mptr != nullptr) mpRefCnt->addCount();       // 新资源计数 +1
        return *this;
    }

    ~CSmartPtr()
    {
        if (mpRefCnt->delCount() == 0)                   // 我是最后一个使用者
            delete mptr;                                 // → 我来释放资源
        // 计数 >0：还有别人在用，静默离开
    }

private:
    T* mptr;
    RefCnt<T>* mpRefCnt;
};
```

三处行为各有一条铁律。**拷贝构造只共享**：指针与计数器一起抄过来、计数 +1，不碰资源本身——浅拷贝的"共享意图"在这里成了正确语义。**析构先减后判**：计数 -1 后**等于 0 才 delete**——"最后一个使用者负责释放"，其余人静默离开；浅拷贝的双重释放由此根治。**赋值先弃后取**：自己原来指向的资源也要走一遍"减 1、判 0、归零释放"——换了东家，旧账照还（第 14 篇 operator= 三步走的计数版）。

验证：p1 → p2 → p3 依次拷贝，计数 1→2→3；依次离开作用域，3→2→1→0，最后一个析构的 p1 执行 delete——`*p1 = 20` 与 `*p3 = 20` 打印一致（共享同一资源），资源只释放一次。

## 2. 标准库对照：shared_ptr 的同源结构

手写版就是 `std::shared_ptr` 的机制骨架，差距在工程细节：

- **计数类型**：手写版 `int` 在多线程下 `++/--` 不是原子操作（读-改-写三步可被打断），两个线程同时 +1 可能只加了一次 → 计数错乱 → 提前释放或泄漏。标准库用 **`std::atomic<int>`**（底层 CAS 保证原子性）——shared_ptr/weak_ptr 的计数线程安全，可直接用于多线程环境；
- **计数与资源的内存布局**：标准库把控制块（计数 + 弱计数 + 删除器）与资源一次分配，比手写版两块内存更省；
- **`use_count()`**：查看当前引用数的接口，调试循环引用时的第一工具（下一篇主角）。

顺便修一个常见误读：**shared_ptr 的线程安全指的是"计数"线程安全**——多个线程各自持有 shared_ptr 副本、拷贝析构互不干扰；但多个线程**同时读写同一个被托管对象**的数据依然需要自己同步——智能指针管的是"资源何时释放"，不管"资源内容怎么访问"。

## 3. 计数方案的适用判据

引用计数派与所有权派（unique_ptr）的分水岭一句话：**资源是否需要多个持有者**。需要 → shared_ptr；不需要 → unique_ptr（零计数开销、释放时机更确定）。

一个成本提醒：计数器是堆对象，每次拷贝/析构都有一次原子加减——高频场景下这笔账可见。所以现代 C++ 的默认姿势是"先 unique_ptr，证明需要共享再升级 shared_ptr"，与"先 const 后 non-const"同一个思路：**从约束最严的选项开始**。


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-advanced/cpp-advanced-07-shared-ptr-refcount-flow.gif)

## 小结

- 计数器独立成堆对象（资源指针 + 计数），所有指向同资源的智能指针共享同一份计数——计数属于资源，不属于持有者
- 拷贝构造只共享：抄两根指针、计数 +1；析构先减后判：**归零者释放**——双重释放根治
- 赋值先弃后取：旧资源走"减 1、判 0、释放"，再指向新资源并 +1——operator= 三步走的计数版
- 手写版 = shared_ptr 的机制骨架；差距：atomic 计数（线程安全）、控制块一次分配、use_count() 接口
- shared_ptr 线程安全的准确含义：计数安全 ≠ 托管对象的数据访问安全——后者仍需调用方同步
- 判据：多持有者 → shared_ptr；独占 → unique_ptr；默认从约束最严的开始

计数方案还有个著名的暗礁：两个对象互相持有对方的 shared_ptr，计数永远降不到 0——循环引用。下一篇 weak_ptr 观察者登场，顺带讲自定义删除器。

<QuizBlock src="/quiz/2026-12-cpp-advanced/07.json" title="本章自测" />
