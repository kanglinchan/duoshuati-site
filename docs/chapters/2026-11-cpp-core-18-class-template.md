# 类模板：一套代码，任意类型的栈

![类模板 SeqStack&lt;T&gt;：调用点选择性实例化出模板类；非类型参数必须是常量表达式](/assets/images/cpp-core/cpp-core-18-class-template.png)

第 11 篇和第 16 篇两次手写顺序栈，它有个先天缺陷：只能存 `int`。想存 `double` 抄一遍，想存 `string` 再抄一遍——第 17 篇的函数模板刚解决完"逻辑相同、类型不同"，这次轮到类：把**成员的类型**参数化，一套栈存万物。

这篇补上函数模板遗留的最后一块拼图（非类型参数），然后用模板版 SeqStack 把类模板的关键语法一次走完：类外实现的写法、深拷贝里 `T` 的陷阱，以及一个有趣的事实——**类模板实例化时只生成被调用到的方法**。STL 的 `vector`、`list` 全是类模板，这篇就是读它们源码的钥匙。

边界：本文的 SeqStack 依旧按二倍扩容的朴素实现；迭代器与空间配置器是接下来两篇的主题，STL 容器体系在第 34 篇展开。

## 1. 先补课：模板的非类型参数

模板参数列表里不全是类型。它还能接收**值**——非类型参数：

```cpp
template<typename T, int SIZE>          // T 收类型，SIZE 收一个整数
void sortArray(T arr[])
{
    for (int i = 0; i < SIZE - 1; ++i)
        for (int j = 0; j < SIZE - 1 - i; ++j)
            if (arr[j] > arr[j + 1])
                swap(arr[j], arr[j + 1]);
}
```

数组名传参就退化成指针（第 01 篇），元素个数本来要另传一个形参；用非类型参数 `SIZE`，个数直接编进函数里。使用时：

```cpp
const int size = 7;                 // 必须是编译期可确定的常量
sortArray<int, 7>(arr);             // 7 也可以直接写字面量
```

三条硬规矩：非类型参数必须是**常量表达式**（编译期就要算出值），传运行期变量直接报错；类型限于**整型**（`int`、`char`、`short`、`long`，指针和引用因本质是地址也算整系）；实际工程里整型最常用。C++11 之后 `vector<int, 7>` 这类写法的合法化也依赖它——先认识，见到不慌。

## 2. 类模板：把成员类型参数化

函数模板参数化形参的类型，类模板参数化**成员**的类型：

```cpp
template<typename T>
class SeqStack
{
public:
    SeqStack(int sz = 10) : pstack(new T[sz]), top(0), size(sz) {}
    ~SeqStack() { delete[] pstack; pstack = nullptr; }
    void push(const T& val);
    void pop();
    T topVal() const;               // 只读接口 → const 方法（第 13 篇守则）

private:
    void expand(int len);           // 扩容只给内部用 → 私有

private:
    T* pstack;                      // 元素是 T 类型
    int top;                        // 下标与元素类型无关，还是 int
    int size;
};
```

成员变量怎么定？`pstack` 指向的数组元素是 `T`，所以它是 `T*`；而 `top`、`size` 描述的是下标和容量，不管存什么类型，**下标永远是整数**——保持 `int`。这个区分是类模板设计的常见考点：随元素类型变的用 `T`，跟元素类型无关的用 `int`。

名词口径与第 17 篇对齐：`SeqStack` 单独出现是**模板名称**；`SeqStack<T>`（模板名 + 类型实参）才构成**类名**。

## 3. 类外实现：作用域要带 `<T>`，参数表要重新声明

类内只声明、类外实现 `push`，语法有两处容易错：

```cpp
template<typename T>                        // ① 参数列表要重新写
void SeqStack<T>::push(const T& val)        // ② 作用域带 <T>，不能只写 SeqStack::
{
    if (full()) expand(size * 2);
    pstack[top++] = val;
}
```

②的原因：`SeqStack::` 只是模板名称，不是类名，作用域必须落到具体实例 `SeqStack<T>::` 上。①的原因更隐蔽：**模板参数列表 `typename T` 的作用域只到类体的右花括号**，出了类体 `T` 就不存在了，类外实现必须重新 `template<typename T>` 声明一次（叫 `T` 还是 `U` 都行，只是个名字）。

一条书写习惯由此而来：**构造函数和析构函数的名字后面不用加 `<T>`**（`SeqStack(){} `而不是 `SeqStack<T>(){}`——在类体内编译器知道语境）；除此之外，**任何把模板当类型用的地方都带上 `<T>`**，比如返回值 `SeqStack<T>&`、参数 `const SeqStack<T>&`。这个习惯让代码在类内外读起来口径一致。

## 4. 深拷贝里的 T 陷阱

模板版栈同样有指针成员指向堆数组——第 14 篇的判据原样适用，拷贝构造和 `operator=` 必须自定义。但这里的拷贝循环藏着模板特有的坑：

```cpp
// 千万不要这样：
memcpy(pstack, src.pstack, sizeof(T) * size);    // ✗

// 要这样：
SeqStack(const SeqStack<T>& src)
    : top(src.top), size(src.size), pstack(new T[src.size])
{
    for (int i = 0; i < top; ++i)        // top 从 0 起算 = 元素个数，所以 i < top
        pstack[i] = src.pstack[i];       // 调用 T 的 operator=
}
```

`memcpy` 的问题第 14 篇已经说过——浅拷贝；在模板里它升级成必然风险：`T` 是未知类型，可能是带指针成员的类，浅拷贝必错。`for` 循环逐元素赋值，每个元素走它自己类里的 `operator=`（第 16 篇写的那些深拷贝），类型正确性由 `T` 自己保证——**模板代码不替元素类型做内存级假设**，这条原则贯穿整个 STL。

两处细节顺带钉死。`new T[src.size]` 而不是 `malloc`：`T` 若是类类型，对象需要调用构造函数，`malloc` 只开内存不初始化（第 11 篇 `delete = 析构 + free` 的镜像结论：**`new = 开内存 + 调构造`**）；扩容 `expand` 同理用 `new T[len]` + 循环搬运 + `delete[]` 旧内存，`size` 翻倍，`top` 不动。

另一个是 `top` 的口径：第 11 篇的栈 `top` 从 -1 起算（先加再放），这里从 0 起算记录**元素个数**（先放再加），于是取栈顶是 `pstack[top - 1]`，拷贝循环条件是 `i < top`——两种口径都对，但全类必须统一。栈空时 `top()` 取元素无意义，直接 `throw std::string("Stack is Empty")`：抛异常本身就是函数执行流的一种结束方式，不需要与返回类型 `T` 保持一致。

## 5. 选择性实例化：用到哪个方法生成哪个

用 `SeqStack<int> s;` 实例化时，编译器并不是把整个类翻译一遍。它只生成你**调用到**的东西：

```cpp
SeqStack<int> s;            // 只实例化出：构造函数、析构函数
s.push(20); s.pop();        // 这之后才追加生成：push、pop……
s.topVal();                 // 从没调用过 → 永远不生成
```

这叫**选择性实例化**：没被调用的成员函数不参与实例化。好处是省编译，坏处也在此——**成员函数里的错误，只有被调用到时才暴露**。一个从未被实例化的方法藏着语法错误，编译器不吭声；STL 报错行号深、信息吓人，根源也在这里。

名词收拢一遍，与函数模板完全平行：**类模板**（图纸）→ **实例化**（调用点用具体类型生成）→ **模板类**（产物，真正的类型）。类模板还多送一个函数模板没有的便利——**默认类型参数**：

```cpp
template<typename T = int>
class SeqStack { ... };

SeqStack<> s1;              // 省略尖括号内容，T = int
SeqStack<double> s2;        // 指定也行
```

`vector<int>` 之所以能简写成某种"默认容器"，靠的就是这类机制——下一篇就从"容器内存从哪来"继续往 STL 的地基挖。


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-core/cpp-core-18-class-template-flow.gif)

## 小结

- 非类型参数接收**编译期常量**：限于整型（含指针/引用），传运行期变量报错；常见于"数组大小"这类编译期确定的值
- 类模板参数化成员类型：随元素变的用 `T`（`T* pstack`），与元素无关的保持 `int`（`top`、`size`）
- 类外实现两件套：作用域带 `<T>`（`SeqStack<T>::push`），参数列表重新声明（`T` 的作用域只到类体右花括号）；习惯是构造析构名不带 `<T>`、其余用到处都带
- 模板拷贝禁用 `memcpy`（T 未知，浅拷贝必错），一律 for 循环走元素自己的 `operator=`；开内存用 `new T[]`（会调构造），不用 `malloc`
- 选择性实例化：只生成被调用的成员——省编译，也意味着未实例化方法的错误藏得住
- 类模板（图纸）→ 实例化 → 模板类（类型）；类模板独有默认类型参数，`SeqStack<>` 可省实参

栈的内存是 `new T[]` 直接向堆要的。可 STL 容器成百上千万次地分配释放小内存，直接 `new/delete` 撑得住吗？下一篇：空间配置器 allocator，容器的内存管家。

<QuizBlock src="/quiz/2026-11-cpp-core/18.json" title="本章自测" />
