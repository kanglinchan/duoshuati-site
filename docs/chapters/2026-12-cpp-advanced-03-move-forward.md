# move 与 forward：右值引用变量自己是左值怎么办

![move 强转左值为右值引用；forward 识别左右值完美转发；引用折叠合并两个 push_back](/assets/images/cpp-advanced/cpp-advanced-03-move-forward.png)

上一篇的 CMyString 配上了移动构造，vector 也想沾光——给手写 vector 的 `push_back` 加一个右值引用版本。一上手就撞墙：**右值引用形参 `val` 在函数体里用的时候，匹配到的仍是左值版本的拷贝构造**。

"右值引用变量本身是左值"（上一篇埋的话）在这一刻显出威力。这篇讲两个专为解决它而生的函数：`std::move`（强行把左值转成右值引用）与 `std::forward`（识别原值本来的左右值属性并原样转发），顺带把库作者的两版 `push_back` 合并成一个函数模板——引用折叠。

边界：`forward` 底层靠模板的部分特例化实现，原理可查源码但不在本篇展开；本篇目标是用会它——"掌握功能"优先于"复刻实现"。

## 1. 问题现场：val 是个"披着右值外衣的左值"

手写 vector（第 20 篇）的 `push_back` 升级成双版本：

```cpp
void push_back(const T& val)              // 左值版
{ _allocator.construct(_last, val); ++_last; }

void push_back(T&& val)                   // 右值版（新增）
{ _allocator.construct(_last, val); ++_last; }
```

`construct` 也有两版（`construct(T* p, const T& val)` 与 `construct(T* p, T&& val)`，后者内部 `new(p) T(val)` 会匹配到 T 的**移动构造**）。链条看似通畅：传临时对象 → 匹配右值版 push_back → 匹配右值版 construct → 移动构造。

实际打印却显示走了左值版。原因：`T&& val` 这个形参**有内存、有名字**——它是右值引用变量，本身是左值（上一篇的第三句话）。于是 `construct(_last, val)` 里的 `val` 是左值，匹配左值版 construct，最终调到普通拷贝构造。右值进了 push_back 门口就"落地成左值"，移动语义断在半路。

## 2. std::move：把左值强转成右值引用

修复手段第一式——`std::move`：

```cpp
void push_back(T&& val)
{ _allocator.construct(_last, std::move(val)); ++_last; }
```

`move` 的实现朴素到一行：**把传入的值强转成对应类型的右值引用**。`val` 本来是左值，`std::move(val)` 之后类型变成 `T&&`，于是 construct 匹配右值版 → 最终调到 CMyString 的移动构造——链条接通。

两个要点。**move 不移动任何东西**：它只是类型强转（名字有误导性，实际是个 cast），真正的资源接管发生在被匹配到的移动构造里。**move 用在"确定不再使用"的值上**：`std::move(val)` 把 val 的资源交出去，此后 val 处于有效但未定义状态（02 篇守则二）——push_back 函数体里 `val` 后面没人用了，交出去正好。

右值版 push_back 里的 `val` 需要 move（它本来是右值，落地成左值后要变回去）；左值版 push_back 的 `val` 本来就是"调用方还想继续用"的左值，**不能** move——所以两个版本各写各的，代码几乎一样却必须写两遍。

## 3. 引用折叠：一个模板顶两版

库作者的洁癖不允许"几乎一样的代码写两遍"。合并方案是**成员方法模板**：

```cpp
template<typename Ty>
void push_back(Ty&& val)                  // 万能引用（universal reference）
{ _allocator.construct(_last, std::forward<Ty>(val)); ++_last; }
```

`Ty&&` 不是普通的右值引用——当 `Ty` 本身还带引用时，C++ 有一条**引用折叠**规则：

> 左值引用 + 右值引用 = 左值引用（`T& &&` → `T&`）
> 右值引用 + 右值引用 = 右值引用（`T&& &&` → `T&&`）

口诀只有一句：**有左值引用参与，折叠结果就是左值引用；全是右值引用，结果才是右值引用。**配合模板实参推演：

- 传左值 `str`：推演得 `Ty = CMyString&`，代入 `Ty&&` 折叠成 `CMyString& &&` → `CMyString&`——形参是左值引用；
- 传临时对象：推演得 `Ty = CMyString`，`Ty&&` 就是 `CMyString&&`——形参是右值引用。

一个 `Ty&&` 形参，左值来了变左值引用、右值来了变右值引用——**两个 push_back 被一个函数模板完全替代**。这种"推演出引用则保留左右值属性"的形参叫**万能引用**（universal reference），它是库代码里 `T&&` 与普通 `T&&` 的本质区别（模板推演语境 vs 确定类型）。

## 4. std::forward：识别原值并原样转发

合并后的新问题：不管左右值，进函数后 `val` 又落地成左值了——construct 永远匹配左值版。move 不能用（会把左值也强转成右值，左值调用方的资源被误搬）。于是第二式登场——`std::forward<Ty>(val)`，**类型完美转发**：

```cpp
template<typename Ty>
void push_back(Ty&& val)
{ _allocator.construct(_last, std::forward<Ty>(val)); ++_last; }
```

forward 的行为用一句话讲：**按推演出来的 Ty 原样恢复 val 的左右值属性**——左值进来返回左值类型（匹配左值版 construct），右值进来返回右值类型（匹配右值版 construct）。它不像 move 一刀切强转，而是"记住你来时是什么样，送出去时还原"。

move 与 forward 的分工由此清晰：

| | 输入 | 输出 | 用途 |
|---|---|---|---|
| `std::move(v)` | 任何左值 | 一律右值引用 | 确定不再使用的值，强行移交资源 |
| `std::forward<Ty>(v)` | 左值→左值 / 右值→右值 | 原样还原 | 万能引用形参的接力，不丢失左右值属性 |

最后一里路同理打通：construct 本身也可以合并成 `template<typename Ty> void construct(T* p, Ty&& val)`，内部 `new(p) T(std::forward<Ty>(val))`——**整条链（push_back → construct → T 的构造函数）从库到用户类型全部单版本化**，左右值的分发靠 forward 一路保真传递。

## 5. 全链验证与工程意义

双 push_back 案例合并后重跑：传普通对象——`push_back<Ty=CMyString&>` → forward 返回左值 → construct 左值版 → **拷贝构造**；传临时对象——`push_back<Ty=CMyString>` → forward 返回右值 → construct 右值版 → **移动构造**。打印与两版本分开写时逐条一致。

这就是标准库 `std::vector::push_back` 的真实结构（重载双版是老式接口，C++11 内部实现同样走万能引用 + 转发的思路；`emplace_back` 更是纯万能引用，第 10 章专题）。对库作者，move/forward 让"左值右值各写一遍"成为历史；对使用者，理解这两把函数的意义在于看懂报错——**该 move 没 move，深拷贝悄悄发生；乱 move，资源被提前掏空**。调试移动语义问题时，先问一句：这个变量，是不是右值引用变量落地成左值了？


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-advanced/cpp-advanced-03-move-forward-flow.gif)

## 小结

- 右值引用形参在函数体内是左值——移动语义断链的根源
- `std::move` = 强转成右值引用，本身不移动资源；只用于确定不再使用的值
- 引用折叠：`T& &&` → `T&`，`T&& &&` → `T&&`——有左值引用参与结果必为左值引用；`Ty&&` + 推演 = 万能引用，一个模板顶左右值两版
- `std::forward<Ty>` 按推演结果原样恢复左右值属性：左值→左值、右值→右值——万能引用形参的专用接力棒
- move 与 forward 分工：强转移交 vs 保真转发；construct 也能合并，整条链单版本化
- 调试口诀：该 move 没 move → 深拷贝悄悄发生；乱 move → 资源被提前掏空

对象优化的写法层收尾还差最后一篇：三条规则——按引用传参、返回临时对象、初始化接收。它们不动类定义，只改调用方代码，就能把 11 次调用压到 4 次。

<QuizBlock src="/quiz/2026-12-cpp-advanced/03.json" title="本章自测" />
