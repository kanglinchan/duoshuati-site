# function 的实现原理：给所有函数一个统一的类型

![function 底层：部分特例化持有函数指针 + operator() 转发；可变参模板一次覆盖所有函数类型](/assets/images/cpp-advanced/cpp-advanced-10-function-internals.png)

上一篇的绑定器有个尴尬：`bind(greater<int>(), 48)` 返回的绑定器**出了语句类型就留不下来**——它的类型是编译器内部生成的复杂东西，用户没法写。想让绑定器被保存、复用、当参数传递，需要一个能"装下它"的统一类型。

`std::function` 就是这个统一收容器：**任何"返回值 R、参数 A..."形状的可调用物**，都能装进 `function<R(A...)>`。这篇拆它的底层实现——你会发现它就是"部分特例化 + 函数指针成员 + operator() 转发"三件套，最后用可变参模板把"写不完的特例化"一次终结。

边界：前置知识是模板的部分特例化（第 17 篇特例化的延伸——"给某一族类型特例化"）；可变参数模板只用到最基础的形式；function 存成员方法指针的场景同原理，正文以普通函数为主线。

## 1. 问题：函数类型无穷多，容器怎么装

目标很朴素：写一个 `MyFunction` 类，装下"返回 void、收一个 string"的函数：

```cpp
void hello(string str) { cout << str; }

MyFunction f1 = hello;
f1("hello world");            // 像函数一样调用
```

第一版实现思路直接：成员是一个**函数指针**，operator() 转发调用。

## 2. 部分特例化：给"函数类型"这一族定制

函数指针的类型长得都一样：`返回值(参数列表)`。用模板参数抽象它，再对"函数类型"这一族做**部分特例化**：

```cpp
template<typename T>
class MyFunction;                        // ① 主模板：只有声明

template<typename R, typename A1>        // ② 部分特例化：T 是"函数类型"
class MyFunction<R(A1)>
{
public:
    using PFUNC = R(*)(A1);              // 函数指针类型：R(*)(A1)
    MyFunction(PFUNC pfunc) : pfunc(pfunc) {}

    R operator()(A1 arg) { return pfunc(arg); }   // 转发调用

private:
    PFUNC pfunc;                         // 成员：一根函数指针
};

MyFunction<void(string)> f1 = hello;     // T = void(string)，命中特例化
f1("hello world");                       // operator() → hello("hello world")
```

三处设计各有讲究。**主模板只有声明没有定义**——逼着所有使用都落到特例化版本上，写错函数形状直接编译错。**特例化目标是 `R(A1)` 这个"函数类型"**——它描述的是"返回 R、收一个 A1"这一整族函数，`void(string)`、`int(int,int)` 都属于各自的族。**operator() 的形参表与包装的函数严格对齐**——被包装函数要几个参数，operator() 就帮用户收几个再转发。

调用链路调试可见：`f1("hello world")` → `MyFunction::operator()(string)` → `pfunc(string)` → `hello`。function 没有魔法，**就是一层带类型收容的转发壳**。

## 3. 写不完的特例化 → 可变参模板终结

一个参数的写完了，两个参数的呢？再加一个特例化版本（`R(A1, A2)`、operator() 收两个参数）——三参、四参、五参……**函数类型无穷无尽，特例化写不完**。

观察规律：每个版本唯一的差别是**形参个数**。C++11 的可变参数模板一招终结：

```cpp
template<typename R, typename... A>       // A 是"一组类型"
class MyFunction<R(A...)>
{
public:
    using PFUNC = R(*)(A...);
    MyFunction(PFUNC pfunc) : pfunc(pfunc) {}
    R operator()(A... args) { return pfunc(args...); }   // 一组参数原样转发
private:
    PFUNC pfunc;
};
```

`typename... A` 声明的是**一包类型**（零个到任意多个），`A...` 在使用处把这一包逐个展开。于是：

- `MyFunction<void(string)>` → A 包 = {string} → `operator()(string)`；
- `MyFunction<int(int,int)>` → A 包 = {int,int} → `operator()(int,int)`；
- 零参、十参——**同一个模板定义覆盖所有函数类型**，特例化从此只写一个。

这就是标准库 `std::function<R(A...)>` 签名里 `A...` 的来历。它的成员实现其实比我们的函数指针版更复杂（要同时兼容函数指针、函数对象、lambda、成员方法指针——多种可调用物统一收容，靠类型擦除），但**对外的形状与转发语义与我们手写的完全一致**：`function` 就是一个"知道怎么调用所装之物"的通用外壳。

## 4. function 与绑定器的合流

回望上一篇的遗留问题：bind 返回的绑定器类型留不下来。现在有了 function，链路闭合：

```cpp
function<bool(int)> pred = bind1st(greater<int>(), 48);
// 绑定器装进 function，类型统一、可保存、可复用、可当参数传

auto it = find_if(v.begin(), v.end(), pred);
```

function 能装下绑定器、lambda（第 11 篇）、函数指针、函数对象——**一切 operator() 可调用的东西**。这份"统一类型"是三个重量级场景的地基：回调注册（线程池/网络库把任务函数装进 function 存起来）、延迟执行（任务队列）、以及 12 篇的线程池实战。


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-advanced/cpp-advanced-10-function-internals-flow.gif)

## 小结

- MyFunction 实现 = 主模板只声明 + 对函数类型 `R(A1)` 部分特例化 + 函数指针成员 + operator() 转发
- 特例化目标是"函数类型"这一族：`R(A1)` 描述形状，`void(string)`、`int(int,int)` 各属各族
- 每个版本唯一差别是形参个数 → 可变参数模板 `typename... A` 一包类型 + `A...` 展开，一个定义覆盖所有函数类型
- `std::function<R(A...)>` 签名里 `A...` 的来历即此；内部类型擦除更复杂（兼容多种可调用物），对外形状与转发语义一致
- function 是统一收容器：绑定器、lambda、函数指针、函数对象都能装——回调注册、任务队列、线程池的地基
- 上一篇遗留闭合：bind 返回的绑定器装进 function，类型留存、可复用可传参

函数对象还剩最后一个"必须定义类型"的痛点——lambda 一招解决。下一篇拆 lambda 的底层：编译器替你生成的函数对象类。

<QuizBlock src="/quiz/2026-12-cpp-advanced/10.json" title="本章自测" />
