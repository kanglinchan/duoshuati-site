# thread 与 mutex：三窗口卖票的竞争条件现场

![多线程卖票：竞争条件（寄存器交错）、临界区、互斥锁、双重检查、lock_guard RAII](/assets/images/cpp-advanced/cpp-advanced-14-thread-mutex.png)

三个窗口同时卖 100 张票——这个比"Hello Thread"丰富十倍的经典案例，把多线程编程的第一课全部装下：**竞争条件长什么样、临界区为什么必须保护、互斥锁的正确加法，以及手写 unlock 的死锁隐患**。

本篇先用 thread 起线程，再让它"自然出错"，把出错机制拆到指令级，最后用 mutex + lock_guard 修复——修完还会遇到一个隐藏 bug（卖第 0 张票），双重检查登场。

边界：thread 的 detach、条件变量、atomic 在本篇只点名；生产者消费者模型是下一篇。

## 1. thread：语言级线程的最小用法

```cpp
void sellTicket(int index)
{
    while (ticketCount > 0)
    {
        cout << "窗口" << index << "卖出第" << ticketCount << "张票" << endl;
        ticketCount--;                       // 共享变量，隐患在此
        this_thread::sleep_for(milliseconds(100));
    }
}

int main()
{
    vector<thread> tlist;
    for (int i = 1; i <= 3; ++i)
        tlist.push_back(thread(sellTicket, i));   // 定义线程对象即启动
    for (auto& t : tlist)
        t.join();                                 // 主线程等全部子线程
}
```

三条铁律先立。**其一**：定义 thread 对象并传入线程函数，新线程立即开始——线程间没有先后约定，全凭 CPU 调度，分析问题永远不能假设谁先执行。**其二**：主线程必须等所有子线程结束（`join`）——否则进程异常终止；不等待的写法是 `detach`（分离线程，主线程结束全部结束，输出都看不到，类似守护线程）。**其三**：`this_thread` 名字空间装线程自身的小工具（`get_id`、`sleep_for`、`yield`），时间单位来自 chrono 名字空间。

## 2. 竞争条件：减减不是一步

跑起来看打印：同一张票被卖了两次、三次——**一张票不可能卖多次**。这就是**竞争条件**（race condition）的现场：程序结果随 CPU 对线程的调度顺序不同而不同。

罪魁是 `ticketCount--`。它在汇编层是三条指令，不是一步：

```asm
mov eax, [ticketCount]    ; ① 从内存读到寄存器
sub eax, 1                ; ② 寄存器里减 1
mov [ticketCount], eax    ; ③ 写回内存
```

单线程下三步连着走没问题。多线程下，**每条指令之间都可能被 CPU 切走时间片**。交错现场回放：线程 A 执行完 ①②（寄存器里是 99，内存还是 100）被切走；线程 B 完整执行三步（内存 100→99）；线程 A 恢复，执行 ③ 把 99 写回——**两个线程各减一次，内存只少了一次**（应 98 实 99）。票就这样被"卖了两次"。

判定标准也由此而来：如果程序的输出会随线程调度顺序变化，就存在竞争条件。而"多线程下细微问题难复现"（跑一百次才现形一次）正是它的可恶之处——**错误依赖交错时机，不依赖输入**。

## 3. mutex：锁住临界区

竞争的根源是 `ticketCount--` 这段**临界区代码**（多个线程共同执行就会出问题的段）。互斥锁（mutex）保证**每次只有一个线程**进入临界区：

```cpp
mutex mtx;                        // 全局一把锁

void sellTicket(int index)
{
    while (ticketCount > 0)
    {
        mtx.lock();               // 加锁：其他线程在此阻塞
        if (ticketCount > 0)      // 双重检查！见下文
        {
            cout << "窗口" << index << "卖出第" << ticketCount << "张票" << endl;
            ticketCount--;
        }
        mtx.unlock();             // 解锁
        this_thread::sleep_for(milliseconds(100));
    }
}
```

三个工程细节，每个都是踩坑点。**锁粒度**：锁必须套住临界区本身——初版把 lock/unlock 写在 while 外面，结果一个窗口拿住锁就卖完全部票（其他窗口全程阻塞），锁的粒度错了，正确性对了并发性全无。**双重检查**：修完竞争条件还有个隐藏 bug——票剩 1 张时，线程 A 进了 while 判断（1 > 0）拿到锁但还没减；线程 B 也过了 while 判断、阻塞在 lock 上；A 卖完第 1 张释放锁，B 拿到锁**接着把第 0 张卖成 -1**。原因：while 的判断在锁外，判断与操作之间有缝隙——所以锁内还要再判断一次（这就是"双重检查"，以后在单例模式里还会重逢它）。**锁与打印**：加锁后 cout 也不再交叉——临界区内的输出天然串行。

## 4. lock_guard：给锁也来一套 RAII

手写 lock/unlock 有个死锁隐患：临界区中间一句 `return` 或抛异常，unlock 执行不到——**锁永远不释放，其他线程全部阻塞，进程死锁**。这个场景眼熟吗？第 05 篇裸指针的"三种漏法"原样重演——解法也原样：**RAII**。

标准库的 lock_guard 就是锁的智能指针：构造时 lock，析构时 unlock，栈对象出作用域必然析构：

```cpp
{
    lock_guard<mutex> lock(mtx);      // 构造：自动加锁
    if (ticketCount > 0) { /* 卖票 */ }
}                                     // 出作用域：自动解锁（return/异常也覆盖）
```

它与智能指针的对照表直接平移：lock_guard 删除拷贝构造与赋值（锁的所有权不许复制，正如 scoped_ptr）；unique_lock 提供 move 通道并支持手动 lock/unlock（正如 unique_ptr 之于 scoped_ptr）——需要跨作用域移交锁或中途解锁时才用它，默认 lock_guard。


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-advanced/cpp-advanced-14-thread-mutex-flow.gif)

## 小结

- thread 最小用法：定义即启动、join 等待（主线程必须等全部子线程，否则进程异常终止）、detach 分离（不再等待，输出不可见）
- 竞争条件 = 结果随调度顺序变化；根源是 `count--` 的三条汇编指令（读-改-写）可被时间片切分——两减一损的交错现场
- 临界区 = 多线程共同执行会出问题的代码段；mutex 保证每次只有一个线程进入
- 锁粒度套住临界区本身：锁在 while 外=一个窗口卖光全场；双重检查：判断在锁外时，判断与操作间有缝隙（第 0 张票事故）
- 手写 unlock 的死锁隐患（return/异常跳过）→ lock_guard RAII：构造加锁析构解锁，三种漏法一次根治
- lock_guard/unique_lock 之于 mutex = scoped_ptr/unique_ptr 之于裸指针——同一套 RAII 思想换了管的东西

互斥解决了"别打架"。但线程间还有"你生产我消费"的协作需求——一个线程等另一个线程把数据备好。下一篇：条件变量与生产者消费者模型。

<QuizBlock src="/quiz/2026-12-cpp-advanced/14.json" title="本章自测" />
