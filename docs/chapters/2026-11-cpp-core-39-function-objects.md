# 函数对象：让算法的"策略"变成参数

![函数对象 vs C 函数指针：可内联、可携带状态；less/greater 反转 priority_queue 与 set 的排序方向](/assets/images/cpp-core/cpp-core-39-function-objects.png)

`sort(v.begin(), v.end())` 默认升序。想让容器从大到小排、想让优先级队列变小根堆、想让 set 反着排——不写新算法、不改库源码，**换个参数**就行。这个参数就是函数对象（函数对象，functor）。

它的本质朴素到一句话：**重载了 `operator()` 的类的对象**。但它解决的问题是 C++ 对 C 函数指针的一次系统性升级——为什么 STL 到处用函数对象而不是函数指针？答案是两个字：**内联**。这篇把这条主线讲透，再看它在 priority_queue 和 set 里的实战。

边界：lambda 表达式（C++11）在语法上是函数对象的糖，本篇先打地基，语法细节在 C++11 汇总篇；`bind`/`function` 属于中级课程范围。

## 1. 定义：重载 operator() 的对象

对照着看两个"加法器"，调用形式一模一样：

```cpp
int sum(int a, int b) { return a + b; }          // C 的写法

class Sum                                        // C++ 的写法
{
public:
    int operator()(int a, int b) { return a + b; }
};

sum(10, 20);        // 函数调用：sum 是函数名
Sum s;
s(10, 20);          // "函数式"调用：s 是对象，这行是 s.operator()(10, 20)
```

`s(10, 20)` 编译器眼里的真相是：**s 调用自己的 `operator()` 重载函数，10 和 20 当实参传入**。拥有小括号运算符重载函数的对象，就叫**函数对象**（也叫仿函数）。用法上它与函数无缝互换——这正是它的设计目标：**让"一段行为"可以像数据一样被传递**。

按 `operator()` 的参数个数分类：两个参数的是**二元函数对象**（比较、加法这类），一个参数的是**一元函数对象**（打印、判断这类）。

## 2. 为什么不用 C 函数指针：内联是生死线

函数指针当然也能把"行为"当参数传。看一个真实需求：泛型 `compare<T>` 要同时支持大于和小于比较，但不能把比较方式写死——库函数更不可能让用户改源码。

C 函数指针方案：

```cpp
template<typename T>
bool compare(T a, T b, bool (*cmp)(T, T))     // 第三个参数：比较函数的指针
{
    return cmp(a, b);
}

bool myGreater(int a, int b) { return a > b; }
bool myLess(int a, int b) { return a < b; }

compare(10, 20, myGreater);     // 传函数地址，间接调用
compare(10, 20, myLess);
```

功能正确，性能上有硬伤：**通过函数指针的调用无法内联**。原因想一层就通：内联发生在编译期——编译器必须知道"这里实际调用的是哪个函数"才能把函数体抄进调用点。函数指针在编译期只是一个地址变量，编译器不知道它运行时会指向 `myGreater` 还是 `myLess`，只能生成标准的 `call [寄存器]`——函数调用开销一次不少。你给 `myGreater` 加 `inline` 也没用：内联的机会不在被调方，在**调用点的可知性**。

函数对象方案只改一个地方——把函数指针换成对象：

```cpp
template<typename T, typename Compare>        // Compare 是"类型"参数
bool compare(T a, T b, Compare cmp)
{
    return cmp(a, b);                         // 调用 cmp 的 operator()
}

compare(10, 20, MyGreater());     // 传对象
compare(10, 20, MyLess());
```

`Compare` 现在是**模板类型参数**：传 `MyGreater()` 进来，编译器实例化出 `compare<int, MyGreater>` 的专属版本——这版代码里 `cmp(a, b)` 就是 `MyGreater::operator()(a, b)`，**编译期完全可知**，内联畅通无阻，调用开销归零。

这就是函数对象的**第一点优势**：调用在编译期定型，可被内联，效率与手写比较代码相同。函数指针则永远带着一次间接调用的开销。

**第二点优势**：对象可以带状态。函数指针只是个地址，什么都记不住；函数对象是类的实例，想加成员就加：

```cpp
class MyGreater
{
public:
    bool operator()(int a, int b) { ++count; return a > b; }
    int count = 0;                // 记录被调用了多少次
};
```

每次比较自动计数——调试、统计、闭包式的上下文携带，全靠这个能力。C 函数指针要做到同样的事，得靠全局变量，污染得不成样子。

## 3. 库里现成的：less 与 greater

常用比较不用自己写，标准库直接提供（`<functional>`）：`less<T>`（小于）、`greater<T>`（大于）、`less_equal`、`greater_equal`。它们就是两个模板类，`operator()` 里各写一个比较符。

这些小类存在的唯一理由，就是**被当成模板类型参数塞进容器和算法**——下一节看它们大显身手。

## 4. 实战一：priority_queue 的大根堆变小根堆

第 36 篇说过 priority_queue 默认是大根堆。它的完整模板签名是三个参数：

```cpp
template<typename T, typename Container = vector<T>,
         typename Compare = less<T>>
class priority_queue;
```

第三个参数就是比较策略，默认 `less`——"孩子比父小"构成大根堆。想反过来，把 `less` 换成 `greater`：

```cpp
priority_queue<int> q1;                        // 大根堆：出队从大到小
priority_queue<int, vector<int>, greater<int>> q2;   // 小根堆：出队从小到大
```

注意换第三个参数时**前两个必须显式写出**（默认参数只能从右往左省略，第 08 篇的规矩）。也可以用 `using` 给这个类型起个短名：`using MinHeap = priority_queue<int, vector<int>, greater<int>>;`——C++11 的 using 类型别名，比 typedef 读起来清爽。

海量数据 TopK（第 36 篇埋的题）在这里收尾：十亿个数找最大的 100 个，维护一个 **100 个元素的小根堆**（`greater`），新元素比堆顶大就替换——内存恒定 100 份，一遍扫描完成。

## 5. 实战二：set 的反向排序

set 的红黑树也要比较键，第三个模板参数同样是函数对象（第二个是配置器）：

```cpp
set<int> s1;                                       // 默认 less：升序输出
set<int, greater<int>> s2;                         // 反转：降序输出

s2.insert(30); s2.insert(10); s2.insert(20);
// 遍历输出 30 20 10 —— 中序遍历没变，树按新策略组织
```

改的只是"键怎么比大小"，红黑树的中序遍历机制原封不动——**策略参数化了，算法结构不动**。这正是 STL"算法与策略解耦"设计的缩影：sort 的排序骨架、priority_queue 的堆骨架、set 的树骨架全是通用的，千变万化的是塞进去的那个函数对象。


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-core/cpp-core-39-function-objects-flow.gif)

## 小结

- 函数对象 = 重载了 `operator()` 的类的对象；`s(10,20)` 实为 `s.operator()(10,20)`；按参数个数分一元/二元
- 函数指针无法内联：编译期不知道指针指向哪个函数，只能生成间接调用——内联的机会在调用点的可知性，不在被调函数的 inline 标记
- 函数对象两大优势：①Compare 作为模板类型参数，实例化出的版本调用编译期定型，可完全内联；②对象可携带成员状态（计数、上下文），函数指针做不到
- 标准库现成的二元函数对象：less、greater、less_equal、greater_equal（`<functional>`）
- `priority_queue<int, vector<int>, greater<int>>` 小根堆——TopK 的标准姿势；`set<int, greater<int>>` 降序集合——策略换了，树的机制不动
- lambda（C++11）是函数对象的语法糖，本篇的地基在那里直接复用

策略可以参数化了，下一篇把它推到底：泛型算法——七八十个现成算法怎么配合迭代器和函数对象，把"手撕代码"变成"一行调用"。

<QuizBlock src="/quiz/2026-11-cpp-core/39.json" title="本章自测" />
