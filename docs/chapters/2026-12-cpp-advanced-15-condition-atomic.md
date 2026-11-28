# 条件变量与 atomic：互斥之外，线程还要"打招呼"

![生产者消费者：condition_variable wait/notify 配 mutex；atomic CAS 无锁——mutex 是重炮，加减用原子](/assets/images/cpp-advanced/cpp-advanced-15-condition-atomic.png)

mutex 解决的是"别打架"（互斥）；但线程间还有一类更精细的需求——**"你先做完，我再动手"**（同步通信）：生产者没把数据放进队列前，消费者取也无从取；消费者没腾出空间前，生产者塞也无从塞。这种"等通知、发通知"的协作，mutex 无能为力——条件变量（condition_variable）登场。

另一头，卖票案例里那个 `count--` 的竞争，用 mutex 修好是能用，但**三行加减配一把重锁，大炮打蚊子**——CAS 原子操作（atomic 类型）是更轻的选择。

边界：条件变量的虚假唤醒与 wait 的谓词形式会讲到"怎么防"；CAS 的硬件原理点到"锁在指令层"为止；线程池完整版（互斥 + 条件变量 + 任务队列）留作 12 篇案例的进阶。

## 1. 互斥与同步：两个不同的问题

多线程编程的两大问题先分清：

- **互斥**：存在竞争条件的临界区，每次只许一个线程进入（上一篇的主题）——保证"不打架"；
- **同步通信**：线程 A 的某步操作依赖线程 B 先完成另一部分——B 做完要**通知** A "你可以继续了"——保证"按约定顺序协作"。

不通信的线程完全随 CPU 调度漂移，没有任何执行顺序可言——这也是多线程 bug 难复现的根源（谁也不知道出问题时线程是怎么交错的）。同步通信就是给漂移的线程装上"约定的接力点"。

## 2. 生产者消费者：为什么要打招呼

经典模型：生产者线程往**共享队列**放数据，消费者线程从同一队列取数据。两条铁律由数据状态决定：

- **队列为空**：消费者不能取（没东西），必须**等**生产者放好并通知；
- **队列已满**：生产者不能放（没地方），必须**等**消费者取走并通知。

"等"与"通知"就是条件变量的全部工作。直接用 mutex 轮询状态（`while (queue.empty()) ;` 空转）能跑，但空转烧 CPU——条件变量的价值是**让等待的线程睡眠，被通知时才醒**，零空转。

## 3. condition_variable：wait 与 notify

标准用法长这样（生产者两个、消费者两个的完整骨架）：

```cpp
list<int> q;                          // 共享队列（生产者消费者共同操作）
mutex mtx;                            // 保护队列的互斥锁
condition_variable cv;                // 条件变量：等通知/发通知
const int MAX_SIZE = 10;              // 队列容量上限

// 生产者线程
void producer()
{
    for (int i = 1; i > 0; ++i)
    {
        unique_lock<mutex> lock(mtx);            // 操作队列前先拿锁
        while (q.size() == MAX_SIZE)             // 队列满：等消费者通知
            cv.wait(lock);                       // 睡眠 + 释放锁，醒后重新拿锁
        q.push_back(i);
        cv.notify_all();                         // 通知：有新数据了
    }
}

// 消费者线程
void consumer()
{
    while (true)
    {
        unique_lock<mutex> lock(mtx);
        while (q.empty())                        // 队列空：等生产者通知
            cv.wait(lock);
        int data = q.front();
        q.pop_front();
        cv.notify_all();                         // 通知：腾出位置了
        // 处理 data
    }
}
```

三个细节各有讲究。**wait 必须持有锁**：`cv.wait(lock)` 在阻塞时**自动释放锁**（让生产者能进临界区放数据），被唤醒时**重新拿锁**再返回——整个等待-唤醒过程与互斥无缝衔接，这也是等待线程必须用 unique_lock（需要中途 unlock）而不是 lock_guard 的原因。**wait 外用 while 不用 if**：被唤醒后条件可能又被别人改掉了（**虚假唤醒**——OS 允许无通知的意外唤醒），while 让醒来后重新检查条件，不满足继续等——这与第 14 篇卖票的双重检查是同一个思想：**判断与操作之间总有缝隙，醒来要复核**。**notify 的时机**：改变共享状态（push 或 pop）之后调用 `notify_all`（唤醒所有等待者）或 `notify_one`（只唤醒一个）——通知发在状态变化之后，等待者醒来才能看到新状态。

## 4. atomic：三行加减不值得上重炮

回头看卖票的 `count--`。用 mutex 修好它能用，但账算下来不对等：**mutex 是重炮**——加锁解锁本身有开销，临界区代码越复杂越耗时间，这把炮越值得；而 `count--` 只有三条指令，为它动用互斥锁是大炮打蚊子。

这类"极短临界区"的正规武器是 **CAS 原子操作**。名字叫"无锁操作"，其实并非不加锁——只是锁不在软件层，而是**硬件层：CPU 指令级的锁**（比较并交换，Compare And Swap，由 CPU 保证读-改-写三步不可分割）。C++11 的 `<atomic>` 头文件提供了一族原子类型：

```cpp
atomic<bool> ready(false);
atomic<int> count(0);

++count;              // 原子读-改-写：CAS 保证三步不可分割
count--;              // 不需要任何 mutex——两线程各减一次必减 2
```

对 `atomic<int>` 的加减读写全部由 CAS 保证原子性——第 07 篇 shared_ptr 的引用计数正是 `atomic<int>`（多线程拷贝析构互不干扰的根基）。选择口径也顺势明确：**临界区复杂 → mutex（能扛重活）；简单加减/标志位 → atomic（轻量无锁）**。

顺带一个线程小工具：`this_thread::yield()`——主动**出让当前时间片**，等下一轮调度。典型用法是自旋等待（`while (!ready) yield();`）：条件没到就礼貌让出 CPU，而不是空转硬烧。


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-advanced/cpp-advanced-15-condition-atomic-flow.gif)

## 小结

- 多线程两大问题：互斥（临界区不打架，mutex）与同步通信（按约定顺序协作，condition_variable）——mutex 管不了"等通知"
- 生产者消费者两条铁律：空了不能取、满了不能放——"等 + 通知"由条件变量承担
- `cv.wait(lock)` 阻塞时自动释放锁、唤醒时重新拿锁——等待线程必须用 unique_lock（需要中途 unlock）
- wait 外层用 while 不用 if：防虚假唤醒——醒来复核条件，与双重检查同一思想
- atomic = CAS 无锁操作：锁在 CPU 指令层；简单加减/标志位用它，mutex 留给复杂临界区；shared_ptr 计数即 `atomic<int>`
- `this_thread::yield()` 主动出让时间片——自旋等待的礼貌姿势

C++11 汇总章与多线程三篇收官。下一篇进入设计模式章：单例模式的三种写法与线程安全——那里会与双重检查再次重逢。

<QuizBlock src="/quiz/2026-12-cpp-advanced/15.json" title="本章自测" />
