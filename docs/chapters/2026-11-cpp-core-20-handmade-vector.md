# 手写 vector：三根指针撑起一个容器

![vector 三指针结构：first 指数组起始、last 指有效元素后继、end 指空间后继；二倍扩容搬移](/assets/images/cpp-core/cpp-core-20-handmade-vector.png)

前面两篇把零件备齐了：类模板让容器能存任意类型（第 18 篇），空间配置器让"开内存"和"造对象"各管各的（第 19 篇）。这篇把零件组装起来，完整实现一个 `vector`——STL 里最常用的顺序容器，底层是可扩容的连续数组。

写完你会发现 vector 的全部秘密浓缩在**三根指针**上：`first`、`last`、`end`。`size` 是两根指针相减，`empty` 是两根指针相等，`push_back` 是往 `last` 上放再 `++`。理解了这三种指针的位置语义，`back()` 为什么要减一、扩容搬什么不搬什么，全是顺推。

边界：本篇的 vector 不含迭代器（迭代器是第 23 篇的主角，届时遍历用下标和 `size()`）；`insert`/`erase` 等中间操作在第 24 篇迭代器失效时再补。

## 1. 什么是容器：先统一口径

容器好理解——杯子装水，果篮装水果。C++ 里之前手写的栈、队列，它们定义的对象也都是容器：**装数据的东西**。vector 是顺序容器的一种，底层是**内存连续的动态数组**，特点就一个：空间用完自动扩容。

要存任意类型，类模板伺候（第 18 篇）；内存要和对象分开管，配置器伺候（第 19 篇）。骨架：

```cpp
template<typename T, typename Allocator = std::allocator<T>>
class vector
{
    Allocator _allocator;
    T* first;     // 数组起始位置
    T* last;      // 最后一个有效元素的后继位置
    T* end_;      // 整个数组空间的后继位置
};
```

为什么不用"一个指针 + 两个 int"？三根指针的表达力在于**指针运算**：`last - first` 直接得到元素个数，`end_ - first` 得到容量，区间 `[first, last)` 就是有效元素——这套语义马上会反复兑现。

三个位置必须咬死：

- `first` → 数组第 0 号元素；
- `last` → **有效元素的后继**——最后一个元素"再往后一格"，它本身不是有效元素；
- `end_` → **数组空间的后继**——整块内存的末尾再往后一格。

`[first, last)` 是装了东西的区间，`[last, end_)` 是空着的余量。这个"后继位置"的口径就是**左闭右开**，C++ 遍历语义的地基，第 23 篇的 `end()` 迭代器一模一样——这里先埋个种子。

## 2. 构造与四个只读接口

构造函数把三根指针摆到位：

```cpp
vector(int size = 10)
    : first(_allocator.allocate(size)), last(first), end_(first + size) {}
```

配置器只开内存不造对象（第 19 篇），`last` 与 `first` 重合——空容器，零个对象。析构按第 19 篇的顺序：先逐个 `destroy` 有效元素，再 `deallocate` 整块内存。

有了三根指针，只读接口全是口算：

```cpp
bool empty() const { return first == last; }        // 没有有效元素
bool full()  const { return last == end_; }         // 余量用尽
int  size()  const { return last - first; }         // 元素个数
int  capacity() const { return end_ - first; }      // 总容量
```

注意这些接口全部 `const`——只读方法写成常成员方法，普通对象、常对象都能调（第 13 篇的守则）。`last - first` 能当元素个数，前提是 `T*` 指针相减得到的是"间隔的元素个数"而不是字节数——指针运算按指向类型计步，这是 C 指针的老规矩在容器里的直接应用。

`back()` 取末尾元素，是三指针语义的第一次小考验：

```cpp
T& back() { return *(last - 1); }     // last 是"后继"，末尾元素在它前一格
```

直接解引用 `last` 是错的——那格里没有元素。写容器接口时出错频率最高的就是这类"后继位置"的差一错误，位置语义在脑子里清楚了，代码才不会漂。

## 3. push_back 与 pop_back

增删接口也简单，但每一步都踩在前几篇的地基上：

```cpp
void push_back(const T& val)
{
    if (full())
        expand(size() * 2);                     // 满了先扩容
    _allocator.construct(last, val);            // 在 last 处拷贝构造
    ++last;
}

void pop_back()
{
    if (empty())
        return;
    --last;                                     // 先回退
    _allocator.destroy(last);                   // 再析构被挤出的对象
}
```

`push_back` 的语义读出来是"用 val 在 last 处**构造**一个新对象"——不是赋值，因为那个位置从来没有对象（第 19 篇的核心成果）。扩容触发条件是 `last == end_`。`pop_back` 的顺序（先回退再析构）在第 19 篇强调过：析构的是"刚被挤出去"的那个对象，外部资源不泄漏。

## 4. 扩容：搬家三件套

`expand` 是 vector 唯一有点规模的方法，动作是标准的"搬家"：

```cpp
void expand(int len)                            // 私有：只给内部接口用
{
    T* ptmp = _allocator.allocate(len);         // 开更大的新家
    int len2 = size();                          // 记住要搬的东西有多少
    for (int i = 0; i < len2; ++i)
        _allocator.construct(ptmp + i, first[i]);   // 逐个搬到新家
    // 旧家清算：只析构有效元素，再还整块内存
    for (int i = 0; i < len2; ++i)
        _allocator.destroy(first + i);
    _allocator.deallocate(first);
    first = ptmp;                               // 三根指针全部重指新家
    last = first + len2;
    end_ = first + len;
}
```

三个细节：**只搬有效元素**（`size()` 个，不搬 `[last, end_)` 的空位——那里根本没有对象）；旧家也要走"先析构有效元素再释放"的完整流程；三根指针必须**全部**重新指向新内存，漏一根就是悬空指针事故。

为什么是二倍扩容？一次扩 1 个元素太频繁（每次都搬家），一次扩太多浪费内存；按比例扩（常见 1.5～2 倍）让 N 次 `push_back` 的总搬家代价摊到均摊意义下的常数级。算法层面的详细账在数据结构课里算，这里记住工程结论：**按比例扩容，`vector` 的尾部插入是均摊 O(1)**。

## 5. 拷贝构造与赋值：老三样按新家规重写

第 14 篇的深拷贝纪律在容器上是第三次应用，这次的尺寸计算全靠指针：

```cpp
vector(const vector<T>& rhs)
    : first(_allocator.allocate(rhs.end_ - rhs.first))   // 开与源"等容量"的空间
{
    int len = rhs.last - rhs.first;                      // 只拷有效元素
    for (int i = 0; i < len; ++i)
        _allocator.construct(first + i, rhs.first[i]);
    last = first + len;
    end_ = first + (rhs.end_ - rhs.first);
}

vector<T>& operator=(const vector<T>& rhs)
{
    if (this == &rhs) return *this;                      // ① 防自赋值
    // ② 还旧账：先析构自己的有效元素，再释放自己的内存
    for (T* p = first; p != last; ++p) _allocator.destroy(p);
    _allocator.deallocate(first);
    // ③ 重开重拷，与拷贝构造相同
    int cap = rhs.end_ - rhs.first, len = rhs.last - rhs.first;
    first = _allocator.allocate(cap);
    for (int i = 0; i < len; ++i)
        _allocator.construct(first + i, rhs.first[i]);
    last = first + len;
    end_ = first + cap;
    return *this;                                        // 支持连续赋值
}
```

拷贝构造"开多大"有个口径选择：这里按源的**容量**开（`end_ - first`），拷贝时只填**有效元素**（`last - first` 个）——`last` 与 `end_` 各自对齐，不混淆。赋值则完全是拷贝构造加"先还旧账"，返回引用支持连续赋值（第 16 篇的推演原样适用）。

## 6. 用起来：一段完整的测试

```cpp
int main()
{
    vector<int> vec;
    for (int i = 0; i < 20; ++i)
    {
        vec.push_back(rand() % 100);      // 途中 10 → 20 触发一次扩容搬家
        cout << vec.back() << " ";        // back() 取刚放进去的
    }
    cout << endl;
    while (!vec.empty())
    {
        cout << vec.back() << " ";
        vec.pop_back();                   // 从末尾逐个弹出
    }
    return 0;
}
```

容量 10 的容器塞 20 个元素：第 11 个触发 `expand(20)`，一次搬家完成余下所有插入。用 `while (!empty()) pop_back()` 倒序清空——输出与插入顺序相反，正是"末尾进、末尾出"的向量语义。

到这里，一个类型安全、内存正确、对象生灭精确的 vector 就齐了。它与 STL 的差距还剩两块：迭代器（第 23 篇），以及中间位置的插入删除（第 24 篇迭代器失效的主角）。


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-core/cpp-core-20-handmade-vector-flow.gif)

## 小结

- 容器 = 装数据的对象；vector = 底层连续可扩容数组的顺序容器，类型与内存分别由模板参数和配置器解决
- 三根指针三种语义：`first` 数组头、`last` 有效元素后继、`end_` 空间后继；`[first, last)` 有效，`[last, end_)` 是余量
- `size()` 是 `last - first`，`empty()` 是两指针相等，`back()` 是 `*(last - 1)`——位置语义想清楚，接口全是口算
- `push_back` 满则扩容，在 `last` 处 `construct`；`pop_back` 先回退再 `destroy`
- 扩容搬家三件套：只搬有效元素、旧家先析构后释放、三根指针全部重指；按比例扩容让尾插均摊 O(1)
- 拷贝构造按源容量开、按有效元素拷；赋值 = 防自赋值 + 还旧账 + 同拷贝构造

vector 落成。下一篇暂别容器，回到内存管理的深水区：`new` 那 4 字节背后的完整一生——从 `operator new` 到构造函数，`delete` 从析构到 `free`，中间每一步都是面试考点。

<QuizBlock src="/quiz/2026-11-cpp-core/20.json" title="本章自测" />
