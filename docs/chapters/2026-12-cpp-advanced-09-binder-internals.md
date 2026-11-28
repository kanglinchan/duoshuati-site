# 绑定器底层原理：二元函数对象怎么变成一元

![绑定器底层：函数模板封装一元函数对象的产生；保存 comp 与 val，operator() 转发调用](/assets/images/cpp-advanced/cpp-advanced-09-binder-internals.png)

第 40 篇用过绑定器：`bind1st(greater<int>(), 48)` 把二元比较装配成一元谓词。当时留了个"怎么做到的"——这篇把底层拆开：**手写 mybind1st 与 myfind_if**，你会发现绑定器的全部实现就是"一个保存参数的小类 + 一次转发调用"。

顺带回答一个隐藏问题：为什么 bind1st 要设计成函数模板而不是直接写类？答案是模板实参推演帮你免写类型参数——这个小技巧正是理解下一篇 function 实现的铺垫。

边界：bind2nd 与 bind1st 只差"绑第几个参数"，留作练习；C++11 的通用 bind（任意参数、占位符）在 12 篇。

## 1. 先补齐 myfind_if：谓词的消费端

绑定器不是孤立组件，它服务于"需要一元谓词"的算法。先把 find_if 的简化版手写出来，消费端就齐了：

```cpp
template<typename Iterator, typename Comparator>
Iterator myfind_if(Iterator first, Iterator last, Comparator comp)
{
    for (; first != last; ++first)
    {
        if (comp(*first))            // 一元调用：一次只取容器一个元素
            return first;
    }
    return last;
}
```

结构与 sort/find 同源（第 40 篇）：模板 + 迭代器区间 + 函数对象策略。`comp(*first)` 这一行暴露了硬性要求——**comp 必须是一元的**，每次只从容器拿一个元素判断真假。而我们手头只有 greater、less 这些**二元**比较器。差距怎么补？绑定器登场。

## 2. mybind1st：保存 + 转发，就这么多

绑定器要做的事：接住"二元函数对象 + 要绑死的值"，对外伪装成一个一元函数对象。两个零件：

**零件一：一元函数对象类**——保存参数，operator() 里转发：

```cpp
template<typename Compare, typename T>
class mybind1st
{
public:
    mybind1st(Compare comp, T val) : comp(comp), val(val) {}

    bool operator()(const T& second)        // 一元：只收容器元素
    {
        return comp(val, second);           // 转发：绑死的值放第一位
    }

private:
    Compare comp;                           // 保存二元函数对象
    T val;                                  // 保存绑死的值
};
```

它的 operator() 只做一件事：**把绑死的 val 和外部传入的 second 按顺序喂给底层二元函数对象**——"bind1st 绑第一参"的全部含义就是调用时 val 在前。做实事的始终是底层的 greater/less，绑定器只是个带记忆的转发器。

**零件二：函数模板**——免写类型参数的工厂：

```cpp
template<typename Compare, typename T>
mybind1st<Compare, T> mybind1st_fn(Compare comp, T val)
{
    return mybind1st<Compare, T>(comp, val);
}
```

为什么不直接用类？因为类要手写类型：`mybind1st<greater<int>, int>(greater<int>(), 48)`——类型写两遍，啰嗦且易错。函数模板的**实参推演**（第 17 篇）从实参自动推出 `Compare` 与 `T`，调用处只剩 `mybind1st_fn(greater<int>(), 48)`。标准库把 bind1st 做成函数模板，正是为了这份推演便利。

> **边界：** 这个"函数模板包装类构造"的手法是 C++11 前的通用套路（make_pair 同理）；C++11 之后 CTAD（类模板实参推演）让直接写类名也能推演，但包装函数在库源码里依然是主流形态。

## 3. 全链验证

装配起来跑一遍降序 vector 找"第一个小于 48"：

```cpp
auto it = myfind_if(v.begin(), v.end(),
                    mybind1st_fn(greater<int>(), 48));
```

执行链路逐层看：`myfind_if` 遍历容器 → 对每个元素调 `mybind1st::operator()(elem)` → 内部调 `greater<int>::operator()(48, elem)` → 返回 `48 > elem`。**每一层都是一次 operator() 调用，底层的二元函数对象从头到尾没变过**——绑定器没有产生任何新逻辑，只是参数装配方式变了。

这就是"绑定器是函数对象的应用"的准确含义：**绑定器 = 函数对象 + 保存的参数 + 一次转发**。bind2nd 与此只差转发时参数顺序（second 在前），留作练习。

## 4. bind1st/bind2nd 的天花板

这套机制有个硬限制：**只适用于二元函数对象**——它们只认识"绑第一个/绑第二个"。可现实中的谓词从三元到 N 元都有（比较三个值、带上下文的过滤……），二元绑定器覆盖不了。

标准库的回答是 C++11 从 boost 收编的通用 `std::bind`：任意参数绑定、`placeholders::_1/_2` 占位符、配合 function 留类型复用——能力全面升级，那是第 12 篇的战场。在此之前，先把"保存 + 转发"这个最小内核吃透，后面的通用版只是它的 N 参数推广。


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-advanced/cpp-advanced-09-binder-internals-flow.gif)

## 小结

- myfind_if 暴露消费端要求：谓词必须一元——`comp(*first)` 一次只取一个元素
- 绑定器的内核 = 保存参数的小类（comp + val）+ operator() 转发调用；做实事的始终是底层二元函数对象
- bind1st 绑第一参 = 转发时 val 在前；bind2nd 只差参数顺序
- bind1st 设计成函数模板的原因：实参推演免写类型参数——"函数模板包装类构造"是 C++11 前的通用手法（make_pair 同理）
- 全链验证：find_if → 绑定器 operator() → greater operator()，每层都是一次调用，无新逻辑产生
- 天花板：只支持二元 → C++11 通用 bind（任意参数 + 占位符）是它的 N 参数推广

绑定器解决了"二元变一元"。下一个问题更根本：**函数对象必须先定义类型**——为一次 find_if 定义一个类，类型名永远留在代码里。下一篇 function：让"可调用物"拥有统一的类型收容器。

<QuizBlock src="/quiz/2026-12-cpp-advanced/09.json" title="本章自测" />
