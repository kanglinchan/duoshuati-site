# 运算符重载：从复数类 CComplex 开始

![CComplex 运算符重载全景：成员/全局两个战场，operator+/++/+=/&lt;&lt; 的实现与选择规则](/assets/images/cpp-core/cpp-core-25-complex.png)

第 17 篇写过一个模板函数 `T sum(T a, T b) { return a + b; }`。`T` 是 `int` 时天下太平；`T` 换成自定义类类型，编译器当场卡住——两个对象怎么相加？它不知道，除非你告诉它。

告诉它的方式就是**运算符重载**（operator overloading）：给类定义运算符的行为。这篇用复数类 CComplex 把最常用的一批运算符全部过一遍：`+`、`++`、`+=`、`<<`。每个运算符都会撞到同一组选择题——写成成员方法还是全局函数？返回值给不给、给什么？——把这些选择题的判定规则拿下，剩下的运算符全靠自己举一反三。

边界：`operator=` 已在第 16 篇专门讲过（深拷贝三步），不重复；类型转换运算符（`operator int()` 这类）不在本文范围；"对象优化"（减少临时对象构造的返回值写法）点到为止，进阶篇展开。

## 1. 编译器怎么理解 a + b

例. 先看编译器的视角：

```cpp
Complex comp3 = comp1 + comp2;
```

解. 没有 `operator+` 时，这行直接编译报错"未定义该运算符"。有了之后，编译器把 `comp1 + comp2` 解释成：

```cpp
comp1.operator+(comp2);      // 左操作数调用自己的成员方法，右操作数当实参
```

**看似对象在运算，背后是一次成员方法调用。**运算符函数的名字有固定规则：`operator` 关键字拼上运算符本身——`operator+`、`operator++`、`operator<<`。你写的是运算符语法，编译器做的是函数调用。

第一条守则随之而来：**不要改变运算符本身的含义。**`1 + 2` 得 3 且 1、2 原封不动，所以 `operator+` 也必须"产出和而不改加数"——实现成修改自己就是语义污染，读代码的人按直觉理解必然翻车。

## 2. operator+：产出和，不改加数

复数类骨架与加法：

```cpp
class Complex
{
    int mreal;      // 实部
    int mimage;     // 虚部
public:
    Complex(int r = 0, int i = 0) : mreal(r), mimage(i) {}
                    // 带默认值 → 一函数三用：全默认 / 只给实部 / 都给（第 08 篇）

    Complex operator+(const Complex& rhs) const
    {
        return Complex(mreal + rhs.mreal, mimage + rhs.mimage);
    }
};

Complex comp3 = comp1 + comp2;    // comp3 是 (30, 30)，comp1/comp2 纹丝不动
```

三个设计决定，各有一条理由。**参数 `const Complex&`**：按引用避免拷贝对象，`const` 承诺"不动加数"——第 13 篇的守则原样适用。**返回 `Complex` 而非引用**：和是个新对象，函数内的局部对象出函数就没了（第 16 篇：局部对象的地址/引用不能带出去），只能按值返回。**`const` 后缀**：加法不改左操作数，`this` 应该是 `const Complex*`——常对象也能做加法。

返回值那行直接构造临时对象返回，比"先定义局部 `comp` 再返回"少一次构造+析构——这就是所谓对象优化的皮毛，深究在进阶篇。

## 3. 对象 + 整数，整数 + 对象：两个战场的分界

```cpp
Complex comp4 = comp1 + 20;    // 能编译
Complex comp5 = 30 + comp1;    // 编译报错！
```

两行长得很像，命运不同，原因在"谁能调成员方法"。

`comp1 + 20`：左边是对象，`comp1.operator+(20)` 成立。但形参要 `const Complex&`，实参是 `int`——引用不了不同类型，编译器先做转换：它去类里找**带 int 参数的构造函数**，找到那个默认值构造，生成临时对象 `Complex(20, 0)` 再绑定引用。加法照做，结果 `(30, 10)`。

`30 + comp1`：左边是 `int`，**整数没有成员方法可调**，编译器也没有理由"看见整数就转成 Complex"（那样 `10 + 20` 都要转，天下大乱）。它转而去**全局作用域**找合适的运算符重载函数——类里只写了成员版，全局没有，报错。

补上全局版：

```cpp
Complex operator+(const Complex& lhs, const Complex& rhs)
{
    return Complex(lhs.mreal + rhs.mreal, lhs.mimage + rhs.mimage);
}
```

全局函数没有调用者对象，**两个操作数都当实参传入**。但它访问了私有成员 `mreal`——解法是友元：

```cpp
friend Complex operator+(const Complex& lhs, const Complex& rhs);
```

`friend` 声明写在类里，意思是"这个全局函数是我类的朋友"——朋友可以碰我的私有成员。

于是运算符重载的选址规则成形：**优先匹配成员方法，成员方法没有合适的，再去匹配全局的重载**。左操作数必须是本类对象时用成员方法；左操作数不保证是本类对象（整数打头、或者第 5 节的 `cout` 打头）时，只能全局。

## 4. ++ 与 +=：单目运算符的区分技巧

`++` 对复数类做"实部虚部各加一"。它是单目运算符，可它有前置、后置两种形式，函数签名一样怎么区分？C++ 的规则是给后置版**加一个不使用的 int 形参**，纯粹为构成重载：

```cpp
Complex& operator++()            // 前置：++comp1，先加再用
{
    mreal += 1;
    mimage += 1;
    return *this;                // 返回加完的自己，引用安全（对象还在）
}

Complex operator++(int)          // 后置：comp1++，先用再加
{
    Complex old = *this;         // 记住旧值
    mreal += 1;
    mimage += 1;
    return old;                  // 返回旧值——局部对象，只能按值返回
}
```

返回值的设计直接来自语义：`++comp1` 的值是加完的 `comp1`，返回 `*this` 的引用零开销；`comp1++` 的值是**加之前的** `comp1`，旧值是局部副本，只能按值返回（所以后置 `++` 天生比前置贵一次拷贝——遍历代码一律写前置 `++` 的原因，第 23 篇已埋）。`int` 形参不出现在调用处，只存在于声明里。

`+=` 是复合赋值，语义是"改自己"，成员方法顺手：

```cpp
void operator+=(const Complex& rhs)     // comp1 += comp2：改 comp1，返回值没人用
{
    mreal += rhs.mreal;
    mimage += rhs.mimage;
}
```

`-=`、`*=`、`/=` 同理。注意 `+=` 返回 `void` 是因为示例里没人连用 `a += b += c`；要支持链式就返回 `Complex&`——返回值类型永远跟着使用场景走。

## 5. << 与 >>：只能全局的重载

模板代码里想 `cout << comp` 直接打印复数——`cout` 在左边，`Complex` 的成员方法永远轮不上（左操作数不是 Complex）。所以**输出运算符只能重载成全局函数**：

```cpp
ostream& operator<<(ostream& out, const Complex& rhs)
{
    out << rhs.mreal << " " << rhs.mimage;
    return out;                       // 返回流本身，支撑连续输出
}
// 类里声明：friend ostream& operator<<(ostream& out, const Complex& rhs);
```

三个要点。**返回 `ostream&`**：`cout << comp1 << endl` 从左向右算，`cout << comp1` 的返回值要接着接 `<< endl`——返回 `void` 链条就断。返回的是流引用，流对象在函数外长存，引用安全。**流参数不能加 `const`**：流是不断被写入、状态不断变化的对象，`const` 一加没法输出了。**friend 照旧**：全局函数碰私有成员的老规矩。`cin >> comp` 的输入版同理，只是流换成 `istream`、rhs 不能是 `const`（要往里写数据）——留作练习。

到这里，`+ - * /`、`++ --`、`+= -=`、`<< >>` 的模板全部铺完。运算符重载没有新语法，只有两个战场（成员/全局）和一套选址规则——把这张判断表带在身上，任何运算符都能落码。


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-core/cpp-core-25-complex-flow.gif)

## 小结

- 运算符重载 = 给类定义运算符行为；编译器把 `a + b` 解释成 `a.operator+(b)`——语法是运算符，背后是函数调用
- `operator+` 产出新对象不改加数：参数 `const T&`、返回按值（局部对象不能返回引用）、方法带 `const` 后缀
- 成员方法要求左操作数是本类对象；`30 + comp1` 左边是整数，必须提供**全局版**（双参数），碰私有成员用 `friend`
- 选址规则：优先成员方法，没有合适的再去全局找
- 后置 `++` 靠"一个不使用的 int 形参"与前置区分；前置返回 `*this` 引用，后置返回旧值（按值，天生多一次拷贝）；`+=` 改自己返回 void 或引用看是否链式
- `<<`/`>>` 只能全局：返回 `ostream&` 支持连续输出，流参数不能 const，friend 访问私有；一切重载不得改变运算符固有含义

单类的运算符重载收官。下一篇视野抬高一层：两个类之间——基类与派生类。继承到底"继承"了什么？为什么说继承的本质是"复用"？

<QuizBlock src="/quiz/2026-11-cpp-core/25.json" title="本章自测" />
