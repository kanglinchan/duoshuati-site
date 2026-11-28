# C++ 的四种类型转换：把 C 风格强转拆成四把刀

![四种类型转换：const_cast 去常量、static_cast 编译期关联转换、reinterpret_cast 蛮力、dynamic_cast 运行期 RTTI 识别](/assets/images/cpp-core/cpp-core-33-four-casts.png)

C 风格强转 `(int*)p` 一把刀切所有场景——指针指哪儿都行，类型有没有关系都敢转。方便是真方便，危险也是真危险：编译器对转换的正确性**零检查**，`(double*)int_ptr` 转完解引用读 8 字节，内存里只有 4 字节有效——越界读，编译器连眉毛都不皱一下。

C++ 把这把大刀拆成四把小刀：**const_cast、static_cast、reinterpret_cast、dynamic_cast**。四把刀各管一摊，用错场景编译器直接拦——这不是语法糖，是把"类型转换的风险"重新分了级。这篇逐把讲清各管的摊子，最后一刀 dynamic_cast 还带运行时检查，是虚函数体系的收尾之作。

边界：`dynamic_cast` 转引用失败时抛 `std::bad_cast` 异常（指针版返回空指针），一句话带过；文中布局以 32 位为例。

## 1. const_cast：只干一件事——去常量

场景：拿到一个 `const int*`，某个老旧接口只收 `int*`，需要"脱掉" const 外衣：

```cpp
const int a = 10;
int* p = const_cast<int*>(&a);     // 去 const，类型必须严格匹配
```

三条规则。**尖括号里必须是指针或引用类型**：`const_cast<int>(&a)` 直接报错——const 修饰的是"通过这个名字访问"的承诺，只有指针/引用才承载这个承诺，常量值本身没有"脱衣"一说。**去掉 const 后类型必须匹配**：`const_cast<char*>(&a)` 报错——`const int*` 脱掉 const 只能是 `int*`，转 `char*` 属于"夹带私货"，const_cast 不受理（想私货转，那是 reinterpret_cast 的事）。**底层指令与 C 风格强转一模一样**：断点进反汇编，两者生成的指令完全相同——const_cast 没有做任何额外动作，它全部的价值在**编译期的意图声明与检查**：代码里出现 const_cast，读者立刻知道"这里有去常量的操作"，而 C 风格强转读者得猜。

## 2. static_cast：有关联才放行

使用频率最高的一把刀（日常转换八成以上是它）。规则一句话：**只转换"有关联"的类型**——内置类型间的常规转换（int ↔ double ↔ char），以及继承结构里的上下转换（`Base*` ↔ `Derived*`）。

```cpp
double d = static_cast<double>(10) / 3;        // int → double：有关联，放行
Base* pb = static_cast<Base*>(pd);             // 下转上：继承关系，放行
Derived* pd2 = static_cast<Derived*>(pb);      // 上转下：继承关系，也放行！

int* pi = nullptr;
double* pd3 = static_cast<double*>(pi);        // 编译错误：int* 与 double* 无关联
```

注意第三行——**static_cast 对继承结构的下转照样放行**。它能保证的只有"这两个类型有关系"，保证不了"这次转换是安全的"：`pb` 若实际指向 Base 对象，强转成 `Derived*` 后调派生类方法就是第 28 篇讲过的非法访问。**static_cast 的安全性 = 编译器筛掉无关类型 + 开发者自己保证方向正确**。相比之下，`int* → double*` 这种毫无关系的转换在 C 风格下畅通无阻，static_cast 直接否决——越界读内存的事故在源头被拦。

## 3. reinterpret_cast：最后的蛮力

static_cast 拒绝的那些"无关转换"，若真有必要做（操作硬件地址、字节级解析二进制数据），用 reinterpret_cast：

```cpp
double* pd4 = reinterpret_cast<double*>(pi);   // 任何指针互转，照单全收
```

语义上它就是 C 风格强转的替身：无检查、无安全、纯位模式的重新解释。生成的指令同样与 C 强转一致。它是四把刀里的"我知道我在干什么"声明——出现即标记高危区域，审代码时重点看它。

## 4. dynamic_cast：运行期识别，虚函数体系的收官

前三把刀都在编译期干活。第四把不一样——**dynamic_cast 是运行期转换**，它带真实检查。

场景来自上一篇的动物园：`showFunc(Base* p)` 统一处理所有派生对象。需求变更：**当 p 指向 Derive2 时**，要调用 Derive2 新增的专属方法 `derive2Func()`（基类里没有、其他派生类也没有）。这就要求程序在运行时识别"`*p` 到底是不是 Derive2"。

```cpp
void showFunc(Base* p)
{
    p->func();     // 通用逻辑：动态绑定，各派生类调各自的版本

    Derived2* pd = dynamic_cast<Derived2*>(p);
    if (pd != nullptr)
        pd->derive2Func();     // 只有真是 Derive2 才走到这
}
```

`dynamic_cast<Derived2*>(p)` 的检查链路正是虚函数体系的收官应用：顺着 `p` 所指对象的**头部 vfptr** 找到实际类型的**虚函数表**，取表里的 **RTTI** 信息（第 29 篇埋的三处伏笔在此会师），比对"它是不是 Derived2"。是——返回 Derived2 地址；不是——**返回 nullptr**。调用方用空指针判断就能安全分流。

把这个场景换用 static_cast 会怎样？Base 与 Derived2 有继承关系，static_cast **永远转换成功**——p 指向 Derive1 时它也照转不误，随后 `pd->derive2Func()` 在 Derive1 对象上调 Derive2 专属方法，非法访问。**static_cast 是编译期的"类型有关联"，dynamic_cast 是运行期的"对象真的就是这个类型"**——这句话就是两把刀的分界线。

两个前提与细节：基类**必须有虚函数**（RTTI 存在虚函数表里，没虚表就没得查）；转换引用失败时抛 `std::bad_cast` 异常（引用没有"空"可返回）。顺带对照第 28 篇的下转守则——"下转必须有运行时依据"，dynamic_cast 就是那个带检查的正规通道。

## 5. 四把刀的选择表

| 转换 | 管什么 | 检查时机 | 典型场景 |
|---|---|---|---|
| const_cast | 去 const（指针/引用） | 编译期（类型匹配） | 适配只收非 const 的旧接口 |
| static_cast | 有关联类型 | 编译期（关联性） | 内置转换、继承上下转 |
| reinterpret_cast | 任意位模式重解释 | 无 | 硬件地址、二进制解析 |
| dynamic_cast | 继承结构下转 + RTTI | **运行期** | 识别基类指针的实际派生类型 |

选择逻辑压成一段话：去 const 找 const_cast；正常转换（编译器认得的关系）找 static_cast；蛮力重解释用 reinterpret_cast 并写下注释说明为什么；要在运行期问"这个基类指针到底指着谁"用 dynamic_cast。**C 风格强转在 C++ 代码里应该绝迹**——它把四把刀的风险混在一把刀里，编译器无从把关，读者无从判断意图。


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-core/cpp-core-33-four-casts-flow.gif)

## 小结

- const_cast：只去指针/引用的 const；脱掉后类型必须严格匹配；指令与 C 强转相同，价值全在编译期意图声明
- static_cast：只放行"有关联"的类型（内置转换、继承上下转）；继承下转也放行但安全由开发者保证；日常八成转换是它
- reinterpret_cast：C 风格替身，任意重解释，无安全——出现即高危标记
- dynamic_cast：运行期沿 vfptr 查虚函数表 RTTI，识别基类指针的实际派生类型；指针版失败返回 nullptr，引用版抛 bad_cast；前提是基类有虚函数
- static_cast 问"类型有关联吗"（编译期），dynamic_cast 问"对象真是这个类型吗"（运行期）——需求变更场景下两者结局完全不同
- 四把刀 = 风险分级 + 意图声明；C 风格强转在 C++ 代码里应当绝迹

继承与多态的整章收官。下一篇切换赛道进入 STL：六大组件的全景图——容器、算法、迭代器、适配器、函数对象、配置器如何拼成标准模板库。

<QuizBlock src="/quiz/2026-11-cpp-core/33.json" title="本章自测" />
