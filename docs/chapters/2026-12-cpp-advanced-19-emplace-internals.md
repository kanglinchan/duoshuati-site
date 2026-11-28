# emplace 的原理剖析：不传对象，传构造参数

![emplace_back：传构造参数在容器底层就地构造，零临时对象；push_back 对比；万能引用+forward 实现](/assets/images/cpp-advanced/cpp-advanced-19-emplace-internals.png)

C++11 给 STL 所有容器加了 `emplace` 系方法：`push_back` 对应 `emplace_back`，`insert` 对应 `emplace`。用起来感觉一样——都是添加元素，面试却爱问"**emplace_back 为什么比 push_back 快**"。

答案一句话：**push_back 收的是"对象"，emplace_back 收的是"构造参数"**——前者必须先有对象再拷进容器，后者直接在容器底层就地构造，零临时对象。这篇用四件套带打印的 Test 类做实验对照，再给手写 vector 补上 emplace_back，把"快"落到指令级。

边界：以 vector 为准展开（其他容器的 emplace 表现一致）；实验沿用第 19 篇 allocator 版手写 vector；可变参模板与 forward 是第 10、03 篇的地基。

## 1. 实验铺垫：带打印的 Test 类

```cpp
class Test
{
public:
    Test(int a)              { cout << "构造(int)"; }
    Test(int a, int b)       { cout << "构造(int,int)"; }
    Test(const Test& t)      { cout << "拷贝构造"; }      // 左值版
    Test(Test&& t)           { cout << "移动构造"; }      // 右值版
    ~Test()                  { cout << "析构"; }
};
```

vector 先 `reserve(100)` 预留空间（排除扩容搬家的打印干扰）。对照实验开始。

## 2. 传对象：两个方法毫无区别

**传已有对象**（左值）：

```cpp
Test t1(10);
vec.push_back(t1);        // 构造(int) → 拷贝构造
vec.emplace_back(t1);     // 构造(int) → 拷贝构造
```

完全一致——vector 底层是数组，它必须自己存一份对象；参数是左值对象，底层只能拷贝构造。**传临时对象**（右值）：

```cpp
vec.push_back(Test(20));      // 构造(int) → 移动构造 → 析构
vec.emplace_back(Test(20));   // 构造(int) → 移动构造 → 析构
```

依然一致：临时对象先构造，底层新对象对它**移动构造**（资源转移，第 02 篇），语句结束临时对象析构——三个函数调用，一个都省不掉。

结论第一半：**只要你传的是对象（左值或临时），push_back 与 emplace_back 没有任何区别**。移动语义已经把"拷贝"优化成"转移"，emplace 再插手也省不掉"构造临时对象 + 析构临时对象"这两笔。

## 3. 传构造参数：emplace 的独门绝技

emplace 系方法的真正能力：**不传对象，传对象构造所需要的参数**：

```cpp
vec.emplace_back(10);          // 构造(int) —— 就这一个打印！
vec.emplace_back(30, 40);      // 构造(int,int) —— 同样一个打印
```

对比 push_back 的同意图写法（`vec.push_back(Test(10));` 的"构造→移动→析构"三连），emplace_back 只有**一次构造**：参数被直接转发到容器底层的内存上，Test 的构造函数**就地执行**——中间对象不存在，移动构造不存在，析构不存在。效率提升的本质是**消灭中间人**。

这个能力的前提是 Test 恰好有多参构造——emplace_back 收到的参数个数、类型随你传，构造函数匹配哪个就调哪个（第 18 篇类模板的 `SeqStack` 一函数三用在这里重现）。

map 的例子更直观：

```cpp
map<int, string> m;
m.insert(make_pair(10, "张三"));     // 构造临时 pair → 底层移动构造 pair → 析构临时 pair
m.emplace(10, "张三");               // 底层直接构造 pair —— 一条构造，完事
```

`make_pair` 造的临时 pair 在 map 底层移动构造出正式 pair 后即析构——emplace 直接把键值参数转发到底层 pair 的构造函数，三连变一单。

## 4. 手写 emplace_back：万能引用 + forward

给第 20 篇的手写 vector 补上这个方法——**可变参数模板收任意构造参数，forward 原样转发给 construct**：

```cpp
template<typename... Ty>                     // 一包构造参数类型（第 10 篇）
void emplace_back(Ty&&... val)               // 万能引用（第 03 篇）
{
    _allocator.construct(_last, std::forward<Ty>(val)...);   // 保真转发
    ++_last;
}
```

与第 03 篇 push_back 的合并版本同构，差别只在参数是"一包"而非一个：`Ty&&...` 是一包万能引用，`std::forward<Ty>(val)...` 把整包参数按原左右值属性转发。construct（第 19 篇）内部是定位 new——`new(p) T(std::forward<Ty>(val)...)`——参数直达 T 的构造函数，**在容器底层的内存上就地构造**。

forward 的保真性在这里是命门：若参数在转发途中落地成左值，"传临时对象参数"的场景就会从移动构造退化成拷贝构造——性能红利悄悄漏光。这也是"emplace 内部必然是 forward"的原因：**参数是什么属性，就要以什么属性抵达构造函数**。

## 5. 使用口径

三条守则收束本系列中级篇：

- **传已有对象**：push_back/emplace_back 等价，用 push_back（意图直白）；
- **传临时对象**：两者都走移动构造，差别只是中间临时对象——emplace_back 略优；
- **能传构造参数就传构造参数**：`emplace_back(args...)` 零中间对象，效率最高——这也是新代码里 emplace 系逐渐取代 push 系的原因。

emplace 的"快"不是黑魔法，是**省掉了本不该存在的中间对象**——而"中间对象该不该存在"这个判断，从第 19 篇（三条规则）到本篇贯穿始终：**让对象在最终的位置上一步诞生**。


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-advanced/cpp-advanced-19-emplace-internals-flow.gif)

## 小结

- 传对象（左值/临时）时两方法无区别：底层总要存一份，左值拷贝、临时移动——移动语义已把账做到极限
- emplace 独门：传**构造参数**，底层定位 new 就地构造——中间对象、移动构造、析构全部消失，三连变一单
- map 的 `insert(make_pair(...))` vs `emplace(k, v)` 是同一个故事：临时 pair 三连 vs 直构一单
- 手写实现：`template<typename... Ty> emplace_back(Ty&&... val)` + `construct(_last, forward<Ty>(val)...)`——万能引用包 + 保真转发，参数直达构造函数
- forward 保真是命门：转发途中落地左值则移动退化为拷贝，性能红利漏光
- 使用口径：传对象用 push_back，能传参数就 emplace——对象在最终位置一步诞生

中级课收官。这条系列把 C++ 从"会用"推进到"懂底层"：对象背后 11 次调用的账本、移动语义的接力、智能指针的 RAII、容器三指针的骨架、多态查表的三条指令、可调用物的统一收容、并发两大问题的分工——每一篇都在回答"为什么"，而不是"怎么背"。

<QuizBlock src="/quiz/2026-12-cpp-advanced/19.json" title="本章自测" />
