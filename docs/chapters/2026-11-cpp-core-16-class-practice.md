# 类与对象综合实践：String 与循环队列

![String 类四件套的内存要点与循环队列扩容：从 front 搬到 0 号位](/assets/images/cpp-core/cpp-core-16-class-practice.png)

"编写 String 类的构造、析构、拷贝构造和赋值函数"——这是《高质量 C++ 编程指南》里流传最广的一道笔试题，几乎是 C++ 面试的分水岭。题目本身不难，难的是每个函数里那一两个"不说就丢分"的细节：`strlen` 为什么要加 1、传 `nullptr` 为什么也要开内存、赋值为什么返回引用。

这篇用两个完整的类把第 10～14 篇的零件组装起来：先写 String 类四件套，再用一个循环队列把"扩容 + 深拷贝"的组合场景走一遍。读完你应该能不看资料默写出这两个类。

边界：循环队列的数据结构原理（为什么牺牲一格判满）只作必要说明；`= delete` 是 C++11 语法，本文先让读者见到它，语义在新特性篇展开。

## 1. String 类：为什么四个函数一个都不能少

成员变量只有一根指针：

```cpp
class String
{
    char* m_data;        // 对象本身 4 字节，字符串住在堆上
public:
    String(const char* str = nullptr);
    String(const String& other);
    ~String();
    String& operator=(const String& other);
};
```

用第 14 篇的判据扫一眼：指针成员指向对象之外的堆内存——**默认浅拷贝必出问题**。于是四个函数全部要自定义，缺一个都是事故：没有构造 → 野指针；没有拷贝构造/赋值 → 共享堆内存；没有析构 → 泄漏。

## 2. 构造函数：保证"底层一定有内存"

初学者最容易写出的版本是直接往指针里拷：

```cpp
String::String(const char* str)
{
    strcpy(m_data, str);        // 错：m_data 还没指向任何合法内存
}
```

`m_data` 是野指针，`strcpy` 往随机地址写字。正确做法是先按字符串长度开堆内存：

```cpp
String::String(const char* str)
{
    if (str == nullptr)
    {
        m_data = new char[1];       // 传空也开 1 字节
        m_data[0] = '\0';
    }
    else
    {
        m_data = new char[strlen(str) + 1];   // +1 给 '\0' 预留
        strcpy(m_data, str);
    }
}
```

两个细节各值一分。**`strlen(str) + 1`**：`strlen` 数的是不含结尾符的长度，字符串真正要占的字节多一个 `'\0'`，不开这 1 字节，`strcpy` 就把结尾符写出了界。**传 `nullptr` 也开 1 字节**而不是把指针置空：置空的对象"有时有内存、有时没有"，之后每个方法都得先判空，到处是分支；统一开 1 字节放 `'\0'`（空字符串），换来一条类不变式——**String 对象的底层指针永远有效**。后续所有方法因此免于判空，这是用构造函数给整个类"立规矩"。

> **边界：** `new char[1]` 写成数组形式而非 `new char`，是为了与 `delete[]` 配对（`new[]`/`delete[]` 对数组的记账方式不同，混用是未定义行为）；更深的原因在 `new`/`delete` 运算符重载篇揭晓。

## 3. 拷贝构造与析构

拷贝构造照第 14 篇的深拷贝模板写：

```cpp
String::String(const String& other)
{
    m_data = new char[strlen(other.m_data) + 1];
    strcpy(m_data, other.m_data);
}
```

按源对象的大小**重新开辟**堆内存，再拷内容——两个对象各持一份资源，析构互不干扰。这里不需要判空：构造函数的"始终有效"规矩保证了 `other.m_data` 一定指向合法内存，这就是第 2 节那条类不变式兑现红利的地方。

析构是收尾：`new[]` 配 `delete[]`，释放后指针置空防野指针：

```cpp
String::~String()
{
    delete[] m_data;
    m_data = nullptr;
}
```

## 4. 赋值函数：返回 String& 是为了连续赋值

赋值函数是四件套里最讲究的，先看成品：

```cpp
String& String::operator=(const String& other)
{
    if (this == &other)             // ① 防自赋值
        return *this;
    delete[] m_data;                // ② 释放自己原有的堆内存
    m_data = new char[strlen(other.m_data) + 1];   // ③ 重新开辟
    strcpy(m_data, other.m_data);
    return *this;                   // ④ 返回自己
}
```

三步走（防自赋值 → 还旧账 → 深拷贝）第 14 篇已经推过，新的问题是**返回类型为什么是 `String&`**——写 `void` 行不行？

看连续赋值 `str3 = str2 = str1;` 怎么执行。赋值**从右向左**结合，先算 `str2 = str1`：这是 `str2.operator=(str1)`，把 `str1` 的内容拷进 `str2`。这一步的**返回值**要接着被赋给 `str3`。若返回 `void`，`str3 = <void>` 直接编译失败——连续赋值断了。

返回 `*this` 呢？`this` 指向的就是 `str2`，把 `str2` 自己返回出去，正好接上 `str3 = str2` 的右半边。而返回**引用**有两个理由：引用就是返回地址，开销最小；更关键的是函数执行完 `str2` 这个对象**还活着**（它是调用者，不在函数里销毁），返回引用安全。若写成返回值 `String`，会把 `str2` 再拷贝一份构造临时对象——多做一次深拷贝，纯属浪费。

顺带把初始化与赋值的判据再演练一遍：`String s4 = s3;`、`String s5(s3);` 都是**拷贝构造**（左边对象正在诞生）；只有 `s1 = s2;`（两边都已存在）才是赋值。判断标准永远是一条：**等号左边是不是正在构造的新对象**。

## 5. 循环队列：扩容遇上循环的深拷贝

第二个例子是环形缓冲的标准实现。成员四个：

```cpp
class CircleQueue
{
    int* pque;       // 队列数组（可扩容 → 外部资源 → 浅拷贝必有问题）
    int front;       // 队头下标
    int rear;        // 队尾下标（指向下一个可放的位置）
    int size;        // 总容量
};
```

数组实现队列的痛点：出队只挪 `front`，数组前段的空间废着不能复用。循环队列的解法是让下标**转圈**——每走一步都取模：

```cpp
rear  = (rear + 1) % size;      // 入队后
front = (front + 1) % size;     // 出队后
```

队尾走到末尾就绕回 0 号位，复用前面空出的格子。判空与判满的约定：`front == rear` 为空；`(rear + 1) % size == front` 为满——**牺牲一个格子**不存数据，否则满和空时下标关系一样，区分不开。

扩容是这个类最有味道的地方，也是和普通顺序栈扩容的本质差别。不能无脑二倍开新数组按下标照搬——因为转圈之后完全可能出现 **`rear` 在前、`front` 在后**的局面，按下标直搬会把队列顺序彻底打乱。正确做法是从 `front` 出发**沿着队列逻辑顺序**遍历到 `rear`，把元素依次放进新数组 0 号位开始的位置：

```cpp
void CircleQueue::resize()
{
    int* ptmp = new int[size * 2];
    int index = 0;
    for (int i = front; i != rear; i = (i + 1) % size)
        ptmp[index++] = pque[i];
    delete[] pque;
    pque = ptmp;
    size *= 2;
    front = 0;          // 逻辑顺序重排后，队列从 0 号位开始
    rear = index;       // index 正是元素个数
}
```

扩容完的队列逻辑上"站直了"：`front` 归 0，`rear` 落在元素个数上。入队 20 个元素（默认容量 5，途中扩容三次）再依次出队，顺序不乱——这套 `% size` 的遍历配合就是循环队列的正确性所在。

拷贝构造与赋值函数照深拷贝三步写，唯一的差别是搬运那段必须用上面这个"从 `front` 转圈到 `rear`"的循环——第 14 篇的结论在这里具象化：**搬对象永远用 `for`，让每个元素走它该走的逻辑**。

## 6. 第三种选择：不想拷贝就禁掉

写完循环队列你可以问：这个类真需要拷贝吗？很多持有资源的类（文件句柄、锁、网络连接）拷贝本来就不合理。C++11 给了第三种答案——**删除**这两个函数：

```cpp
CircleQueue(const CircleQueue&) = delete;
CircleQueue& operator=(const CircleQueue&) = delete;
```

`= delete` 把函数从重载决议里移除，用户一写拷贝，编译期直接报错"尝试引用已删除的函数"。要么规范实现深拷贝，要么明确禁用——最糟的选择是什么都不写，让默认浅拷贝在运行时爆炸。这个语法点先认识，C++11 特性篇再收编。


![本讲主题的完整推演过程（动图：逐步演进、首帧含完整骨架）](/assets/images/cpp-core/cpp-core-16-class-practice-flow.gif)

## 小结

- 指针成员 = 外部资源 = 四件套（构造/析构/拷贝构造/赋值）必须自定义，笔试题考的就是这四件的细节
- 构造函数：`strlen + 1` 给 `'\0'` 留位；传 `nullptr` 也开 1 字节——立下"底层指针永远有效"的类不变式，后续方法免判空
- 拷贝构造：按源对象大小重新开辟再拷贝，深拷贝；析构 `delete[]` 后置空
- 赋值返回 `String&` 支持连续赋值（从右向左，返回 `*this` 接力）；返回引用开销最小且对象仍在存活期
- 初始化 vs 赋值：左边对象正在诞生是拷贝构造，两边都已存在是赋值
- 循环队列：下标 `% size` 转圈；牺牲一格判满；扩容必须沿 `front → rear` 逻辑顺序搬到新数组 0 号位，然后 `front = 0`、`rear = 元素个数`
- 不该拷贝的类用 `= delete` 明确禁用，别把事故留给运行时

类和对象的全部基础语法到此收工。下一篇换赛道进入模板：为什么同一个 `compare` 函数要抄三遍？编译器能不能替你生成？

<QuizBlock src="/quiz/2026-11-cpp-core/16.json" title="本章自测" />
