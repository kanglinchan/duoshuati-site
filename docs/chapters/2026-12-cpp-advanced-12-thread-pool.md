# bind + function 实战：线程池里成员方法充当线程函数

![C++11 bind：任意参数绑定+占位符；function 留存类型；线程池：bind 绑 this 让成员方法充当线程函数](/assets/images/cpp-advanced/cpp-advanced-12-thread-pool.png)

bind1st/bind2nd 只能绑二元（第 09 篇的天花板）。C++11 从 boost 收编的 `std::bind` 把这条限制整个掀掉：**任意参数、任意位置绑定，未绑的用占位符顶位**。配合 function 留存类型，两者联手解决了库开发里一个经典难题——**std::thread 需要的线程函数是 C 函数指针，成员方法塞不进去**。

本篇以一个迷你线程池（muduo 网络库 ThreadPool 的简化版）为战场，把 bind、function、lambda 三篇的成果一次用尽。

边界：C++11 的 thread 只当工具用（线程库深水区不在本系列）；线程池的互斥同步（条件变量、任务队列）是线程池完整版的课题，本版聚焦"bind 如何让成员方法上岗"这一根主线。

## 1. std::bind：三招升级

对照 bind1st 的三大升级，各有示例：

**升级一：任意函数、任意个数的参数绑定**——不再限于二元：

```cpp
int sum(int a, int b) { return a + b; }

auto f = bind(sum, 10, 20);      // 两个参数全绑死
f();                             // 30——调用时零参
```

绑定器返回的仍是一个函数对象（第 09 篇的"保存 + 转发"内核未变），参数绑满了，调用时就不用再传。

**升级二：占位符**——留出参数位置，调用时再填：

```cpp
using namespace std::placeholders;        // _1, _2, ...

auto g = bind(sum, _1, 100);     // 第一参留给调用者，第二参绑死
g(30);                           // 130：_1 被 30 顶替

auto h = bind(hello, placeholders::_1);   // hello(string) 绑死一个占位
g2("China");                              // 调用时传入
```

`_1` 表示"未来调用时的第 1 个实参填到这里"——绑死与占位混用，参数顺序还能重排（`bind(sum, _2, _1)` 交换两个实参的次序）。bind 最多绑 20 个参数，上限绰绰有余。

**升级三：成员方法也能绑**——成员方法比 C 函数多一个隐含 `this`（第 10 篇），bind 的解法朴素：**把 this 当第一个参数绑进去**：

```cpp
class Test
{
public:
    int sum(int a, int b) { return a + b; }
};

Test t;
auto m = bind(&Test::sum, &t, 20, 30);   // 成员方法指针要取地址
m();                                     // 50——this 已绑，两个参数已绑
```

注意成员方法指针的取地址是强制的（`&Test::sum`），C 函数可取可不取。绑完 this，成员方法与普通函数在使用上再无差别——这一招就是线程池的理论基础。

## 2. function 留存绑定器类型

bind 返回的绑定器类型依旧写不出来（第 09 篇遗留）。function 收容：

```cpp
function<void(int)> func = bind(hello, placeholders::_1);
func("hello China");       // 类型留存，可反复调用、可当参数传、可存容器
```

占位符版本装进 `function<void(int)>`——"接收一个 int 的函数对象"。绑定器从一次性语句变成了**可复用的可调用物**。这个"bind 造、function 存"的组合是回调注册的标准形态：网络库把"收到数据后调谁"装成 bind + function 挂在连接上。

## 3. 线程池实战：成员方法上岗记

难题开场：`std::thread` 的构造收的是**C 函数指针**——成员方法不能直接当线程函数（它需要 this，函数指针里装不下对象）。手写线程池的两个类：

```cpp
class Thread
{
public:
    Thread(function<void()> func) : _func(func) {}    // 收容任务函数
    void start() { _th = thread(_func); }             // 线程库执行 function
    void join()  { _th.join(); }
private:
    function<void()> _func;      // 要执行的任务（参数已绑满）
    thread _th;
};

class ThreadPool
{
public:
    void startPool(int size)
    {
        for (int i = 0; i < size; ++i)
        {
            // 成员方法充当线程函数的魔法行：
            _pool.push_back(new Thread(
                bind(&ThreadPool::runInThread, this, i)));
        }
        for (auto& t : _pool) t->start();
        for (auto& t : _pool) t->join();      // 主线程等全部子线程
    }
private:
    void runInThread(int id)                   // 本不能当线程函数的成员方法
    { cout << "线程 " << id << endl; }

    vector<Thread*> _pool;
};
```

魔法行逐层拆解。`&ThreadPool::runInThread` 是成员方法指针，`thread` 构造直接收它会编译失败——bind 上场：**绑 this + 绑编号 i**，runInThread 需要的所有参数（隐含 this + 显含 id）全部绑死。bind 返回的绑定器是一个"零参可调用物"，正好装进 `function<void()>`——Thread 类的构造形参。线程启动时执行 `function` 的 operator()，底层转调 `runInThread(this, i)`。

整条链的数据流：**bind 打包（this + id）→ function 收容 → thread 执行 → runInThread 上岗**。成员方法"不能当线程函数"的限制被 bind 的参数打包瓦解——因为线程函数缺的不是成员方法本身，是"对象上下文"，而上下文恰好可以绑。

两个变体顺手认识。占位符版：`bind(&ThreadPool::runInThread, this, placeholders::_1)`，编号留给启动时再传（`function<void(int)>` 收容，Thread 多存一个 int）；lambda 版：`[this, i]() { runInThread(i); }` 直接捕获——语义与 bind 版完全等价，写法更直观，现代代码里更常见。

## 4. 收束：可调用物的完整版图

三章（09–12）拼出 C++ 可调用物的完整地图：

| 可调用物 | 谁调用它 | 统一收容器 |
|---|---|---|
| 普通函数 / 函数指针 | 直接调 / function | `function<R(A...)>` |
| 函数对象（operator()） | 泛型算法 / function | 同上 |
| lambda | 就地书写 / function | 同上（lambda 本身就是函数对象） |
| 绑定器（bind 返回值） | function 收容后调用 | 同上 |
| 成员方法 | **bind 绑 this 后**经 function 调用 | 同上 |

所有形态最终汇入 `function<R(A...)>`——这正是第 10 篇可变参模板那一个类定义的全部意义。线程池、回调注册、任务队列、观察者通知，库开发里一切"把动作当数据传递"的场景，底层都是这张图。


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-advanced/cpp-advanced-12-thread-pool-flow.gif)

## 小结

- std::bind 三升级：任意参数绑定、`placeholders::_1/_2` 占位符（调用时填参、可重排顺序）、成员方法绑 this（`&Test::sum` 强制取地址）
- bind 造、function 存：绑定器装进 `function<void(int)>` 类型留存、可复用可传参——回调注册的标准形态
- 线程池主线：thread 要 C 函数指针，成员方法缺对象上下文 → **bind(this, i) 打包 → `function<void()>` 收容 → thread 执行**——上下文可绑，限制瓦解
- lambda 变体 `[this, i](){ runInThread(i); }` 语义等价，现代代码更常见
- 可调用物版图：五种形态全部汇入 function——『把动作当数据传递』的库场景（线程池/回调/任务队列）皆以此图为底
- bind 最多绑 20 个参数；muduo 网络库的 ThreadPool 是本篇案例的完整版（多了互斥同步与任务队列）

bind/function/lambda 三件套收齐。下一篇进入 C++11 知识点汇总章：右值引用之外的另一半新世界。

<QuizBlock src="/quiz/2026-12-cpp-advanced/12.json" title="本章自测" />
