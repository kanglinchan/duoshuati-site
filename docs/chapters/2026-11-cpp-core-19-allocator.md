# 空间配置器 allocator：把"开内存"和"造对象"拆开

![allocator 四大职责：allocate/deallocate 管内存，construct/destroy 管对象，定位 new 在指定内存构造](/assets/images/cpp-core/cpp-core-19-allocator.png)

`vector<Test> vec;`——一个什么都没放的空容器，运行起来却打印了 **10 次** Test 的构造函数。容器析构时，又是 10 次析构。你明明一个元素都没塞进去。

这不是编译器抽风，是一份朴素手写 vector 的设计缺陷：它用 `new T[size]` 开底层内存，而 `new` 天生把"开内存"和"造对象"焊死在一起。容器恰恰是唯一需要把这两件事**拆开**的场景。负责拆开的那个组件，叫**空间配置器**（allocator）——STL 六大组件的地基，`vector` 的第一个模板参数。下一篇我们就会用上它，完整实现一个 vector。

边界：标准库 `std::allocator` 的默认实现就是 `malloc/free` 配定位 new；SGI STL 的内存池版本（二级配置器）是进阶话题，本文不展开。

## 1. 空容器凭空冒出十个对象

例. 复现一份朴素手写 vector 的行为：

```cpp
template<typename T>
class vector
{
    T* first;    // 数组起始
    T* last;     // 有效元素的后继位置
    T* end_;     // 整个数组空间的后继位置
public:
    vector(int size = 10) : first(new T[size]), last(first), end_(first + size) {}
    ~vector() { delete[] first; }
};
```

解. `vector<Test> vec;` 执行构造函数，`new Test[10]` 按第 11 篇的结论做了两件事：开 10 个 Test 大小的堆内存，**并把每个位置都当作对象构造一遍**——10 次构造调用。空容器满员"幽灵对象"。

第 18 篇刚说过 `new = 开内存 + 调构造`，对普通业务代码这是便利；对容器这是灾难。容器要的语义是：**空容器只有内存，没有对象**；`push_back` 时才在指定位置构造对象。`new` 恰好做不到。

## 2. 错误不止这一处

沿着裸 `new`/`delete` 往下捋，每个接口都有账要算：

**`push_back(val)` 变成了赋值。**每个位置已被 `new` 预先构造过对象，`*last = val` 是对已有对象赋值——本该发生的"用 val 拷贝构造一个新对象"从未发生。

**`pop_back` 泄漏外部资源。**实现只是 `last--`，指针一挪，那个 Test 对象"看不见"了。可 Test 可能持有外部资源（第 14 篇的判据），没人析构它，堆上字符串就丢了。想析构又不能用 `delete p`——`delete` 会连数组的堆内存一起 `free`，而那块内存是整个容器在用的。**需要"只析构对象、不动内存"**，`delete` 又做不到。

**容器析构误杀。**`delete[] first` 把数组里**每个位置**都当有效对象析构一遍——有效元素可能只有 2 个，被析构 10 次；出作用域时满屏析构打印。正确语义是：只析构 `first` 到 `last` 之间的有效对象，再释放整块内存。

四条账算完，病因一致：`new`/`delete` 是"两件事打包"的接口，容器需要"两件事拆开"的接口。打包接口造不出正确的容器。

## 3. allocator 的四大职责

空间配置器把这对打包操作拆成四个独立动作：

| 职责 | 方法 | 实现 | 语义 |
|---|---|---|---|
| 只开内存 | `allocate(n)` | `malloc(n * sizeof(T))` | 不构造任何对象 |
| 只释放内存 | `deallocate(p)` | `free(p)` | 不析构任何对象 |
| 只构造对象 | `construct(p, val)` | `new(p) T(val)` | 定位 new，调拷贝构造 |
| 只析构对象 | `destroy(p)` | `p->~T()` | 显式调析构，不碰内存 |

其中 `construct` 用到一个新语法——**定位 new**（placement new）：

```cpp
new(p) T(val);      // 在 p 指向的"已存在的内存"上构造一个值为 val 的对象
```

普通 `new` 找系统要内存再构造；定位 new **不分配内存**，直接在给定地址上构造，效果是调用 `T` 的拷贝构造。它是"开内存与造对象分离"之后，把对象放回去的唯一合法手段。

`destroy` 里的 `p->~T()` 是显式析构调用——日常代码里几乎唯一允许手写 `~T()` 的场景，容器实现是它的合法用户（第 11 篇说过手动析构危险，但容器管理的就是对象的生死，它必须精确控制）。

自己实现一个极简版，和标准库 `std::allocator` 的四个方法一一对应：

```cpp
template<typename T>
class Allocator
{
public:
    T* allocate(size_t size)            { return (T*)malloc(size * sizeof(T)); }
    void deallocate(T* p)               { free(p); }
    void construct(T* p, const T& val)  { new(p) T(val); }        // 定位 new
    void destroy(T* p)                  { p->~T(); }
};
```

标准库版的默认实现与此同源（`malloc/free` + 定位 new），名字就是 `std::allocator`。

## 4. 用配置器改造 vector

改造是机械替换，但每个替换点都对应第 2 节的一笔账。先给容器加一个模板参数，默认用标准库的：

```cpp
template<typename T, typename Allocator = std::allocator<T>>
class vector
{
    Allocator _allocator;      // 配置器对象（通常是空类，不占空间）
    ...
};
```

然后逐点替换：

- **构造函数**：`first = _allocator.allocate(size)`——只开内存，`last = first`，空容器干干净净；
- **`push_back`**：`_allocator.construct(_last, val); ++_last;`——在 `last` 位置拷贝构造，语义终于对了；
- **`pop_back`**：`--_last; _allocator.destroy(_last);`——注意顺序：先回退指针，再析构"刚被挤出去"的那个对象，外部资源不丢；
- **容器析构**：

```cpp
for (T* p = first; p != last; ++p)
    _allocator.destroy(p);          // 只析构有效对象（first~last，不到 end_）
_allocator.deallocate(first);       // 再释放整块内存
```

- **拷贝构造**：`allocate` 开同样的空间，再对每个位置 `construct(p, rhs.first[i])`；
- **赋值**：比拷贝构造多一步旧账（第 14 篇的三步）——先 destroy 自己的有效元素、deallocate 旧内存，再 allocate + construct；
- **扩容 `expand`**：`allocate` 二倍新空间 → 逐位置 `construct` 搬有效元素 → 旧内存逐个 `destroy` 后 `deallocate` → 指针三件套重新指向。

替换完成后，那个违和的打印消失了：空容器零次构造；`push_back(t1)` 一次拷贝构造；`pop_back` 一次析构；出作用域按有效元素个数析构——对象生灭与元素增减严格对应，这就是"正确"的样子。

## 5. 标准库就在你身边

`vector<T>` 的完整声明其实是 `vector<T, std::allocator<T>>`——配置器一直作为第二个模板参数存在，只是默认值让你从没写过它。STL 六大组件（容器、适配器、迭代器、算法、函数对象、配置器）里它最默默无闻，却是唯一被"埋"在每行容器代码里的。

面试谈容器时能说出这一层，深度立刻不同：容器不直接碰内存，内存的开辟释放、对象的构造析构全部委托配置器；这样"存什么类型"（模板参数 T）和"内存从哪来"（配置器）两个正交的问题就解耦了——你可以给容器换一个内存池配置器而不用改一行容器逻辑，SGI STL 的高性能配置器（带内存池的二级配置器）正是这么做的。


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-core/cpp-core-19-allocator-flow.gif)

## 小结

- `new = 开内存 + 构造`，`delete = 析构 + free`，两对打包操作造不出正确的容器：空容器冒对象、push 变赋值、pop 泄漏、析构误杀
- allocator 四大职责：`allocate`/`deallocate` 只管内存（malloc/free），`construct`/`destroy` 只管对象（定位 new / 显式析构）
- 定位 new `new(p) T(val)`：在已存在的内存上构造对象，不分配内存，调拷贝构造——拆开之后"放回对象"的唯一手段
- 改造要点：配置器作为第二模板参数默认 `std::allocator<T>`；`pop_back` 先回退指针再析构；析构容器先 destroy 有效元素（`first~last`）再 deallocate
- `vector` 的完整类型是 `vector<T, allocator<T>>`：存什么类型与内存从哪来正交解耦，换配置器不动容器逻辑

配置器管内存，对象放进内存之后，遍历它们的"指针"就是下一篇的主角：迭代器——亲手给 vector 和 string 写一个。

<QuizBlock src="/quiz/2026-11-cpp-core/19.json" title="本章自测" />
