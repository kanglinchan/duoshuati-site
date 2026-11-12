# 附录 B 引用计数基础理论和实践

&gt; 原书第 341–353 页 ｜ 本节内容：shared_ptr 的引用计数与 string 三种数据存储方式（eager-copy、copy-on-write、短字符串优化）铺垫，重点以写时复制（copy-on-write）方式实现 mystring 类——stringvalue 辅助结构、构造/析构/拷贝构造/拷贝赋值运算符、operator[] 与写时复制、shareable 共享标记，以及引用计数实现代价的总结。

## B.1 shared_ptr 实现及 string 存储简单说明

### B.1.1 shared_ptr 智能指针实现简单说明

关于智能指针 shared_ptr，读者已经比较熟悉了。这个智能指针采用的是共享所有权来管理所指向对象的生命周期。所以，一个对象能够被多个 shared_ptr 所拥有，多个 shared_ptr 指针之间相互协作，从而确保在不再需要所指对象时把该对象释放掉。编写一段 shared_ptr 的简单应用代码：

```cpp
shared_ptr<int> myp(new int(5));
int icount = myp.use_count();       //1
cout << "icount = " << icount << endl;
{
    shared_ptr<int> myp2(myp);
    icount = myp2.use_count();      //2
    cout << "icount = " << icount << endl;
}
icount = myp.use_count();           //1
cout << "icount = " << icount << endl;
```

这里特意把 myp2 用{}括起来以展示 myp2 超出作用域后，shared_ptr 引用计数的变化。

通过上面这段代码，可以看到，整型数字 5 被保存到了内存中的一个位置，当执行到代码行"shared_ptr&lt;int&gt; myp2(myp);"的时候，myp 和 myp2 对象会同时指向内存中的整型数字 5，如图 B.1 所示。

![原书图 B.1 两个shared_ptr智能指针指向同一个数字](/assets/images/cpp-design-patterns/p352_fig2.png)

在图 B.1 中，中间圆圈中的数字 2 是一个**引用计数**，代表的是当前指向数字 5 这个内存地址的 shared_ptr 对象的数目有 2 个。为什么需要这个引用计数呢？很简单，因为存储数字 5 的内存是 new 出来的，当所有的 shared_ptr 对象都不指向这段内存地址的时候，就需要把这段内存 delete 掉。

### B.1.2 string 类型字符串存储方式的简单说明

读者都很熟悉 string 类型，这是一个标准库中的类型，代表一个可变长字符串。string 类型的实现代码比较复杂，实现方式（数据存储方式）也有很多种，比较典型的有 eager-copy（贪婪的/粗暴的拷贝）方式、copy-on-write（写时复制）方式以及 small string optimization（短字符串优化）方式等。

现在，通过编写一个短小的例子，看一下在 Visual Studio 2019 中的 string 类的实现方式，代码如下：

```cpp
string str1 = "I Love China!";
string str2 = str1;
printf("str1所存储的字符串的地址 = %p\n", str1.c_str());
printf("str2所存储的字符串的地址 = %p\n", str2.c_str());
```

执行一下程序，看一看输出结果：

```text
str1所存储的字符串的地址 = 0095F968
str2所存储的字符串的地址 = 0095F944
```

从结果中不难看到，str1 所存储的字符串"I Love China!"所在的内存地址与 str2 所存储的完全相同的字符串"I Love China!"的地址是不同的，虽然 str2 这个 string 对象的构造是通过 str1 这个 string 对象实现的，但所保存的"I Love China!"数据却是你存你的，我存我的，完全不相干。这种所保存数据不相干的 string 类实现方式，或者说是数据存储方式，称为 **eager-copy**，如图 B.2 所示。

![原书图 B.2 采用eager-copy数据存储方式的string类存储字符串时的示意图](/assets/images/cpp-design-patterns/p354_fig2.png)

这里要特别说明一下，实际上 Visual Studio 2019 下 string 的数据存储方式是短字符串优化（Small String Optimization，SSO）。也就是说，如果字符串的长度**比较短**，那么这个字符串的内容实际上会被保存到 string 对象本身预留的空间里去，只有字符串足够长（**一般超过 14 个字符左右**）的时候，string 对象预留的空间保存不下了，才单独开辟一块内存保存实际的字符串。但是在这里，可以统一认为，string 就是以 eager-copy 存储方式来保存数据即可。

从图 B.2 可以看到，这种 eager-copy 存储字符串方式的缺点是浪费内存，str1 和 str2 存储的字符串内容完全相同，而且 str2 还是通过 str1 拷贝构造而来，结果每一个"I Love China!"字符串都分别用不同的内存来保存。那么 eager-copy 存储字符串方式的优点又是什么呢？优点是类 string 的实现代码简单，不容易出错。

除了 eager-copy 这种数据存储方式外，还有另外一种比较典型的也同样适用于 string 类的数据存储方式被称为写时复制，某些操作系统上的标准库采用的可能是这种数据存储方式。

其实，这种 copy-on-write 技术不仅应用于 string 类的实现中，也应用于很多场合。采用写时复制数据存储方式的 string 类存储字符串示意图如图 B.3 所示。

![原书图 B.3 采用写时复制数据存储方式的string类存储字符串时的示意图](/assets/images/cpp-design-patterns/p354_fig3.png)

图 B.3 和图 B.1 非常类似，中间圆圈中的数字 2 是一个引用计数，代表的是当前指向字符串"I Love China!"这个内存地址的 string 对象的数目有 2 个。这个引用计数存在的意义同样是当所有的 string 对象都不指向这段内存地址的时候，用于将这段内存 delete 掉（string 类内部处理 delete 问题，无须程序员操心），因为存储字符串"I Love China!"的这段内存也是 string 类内部 new 出来的。

这种写时复制存储字符串方式的优点是节省内存，因为 str1 和 str2 存储的字符串内容相同，而且 str2 是通过 str1 拷贝构造而来，那么 str1 和 str2 这两个 string 对象完全可以指向相同的字符串所代表的内存地址。写时复制存储字符串方式的缺点是代码实现比较复杂，一个疏忽就可能导致出现问题（bug）。

写时复制这个词是什么意思呢？读者如果学过 Linux C++ 编程，那么就比较熟悉 fork 这个用来从父进程中创建子进程的函数，fork 函数的执行效率很高，为什么高呢？因为 fork 的工作原理是：fork 产生的新进程并不复制原进程的内存空间，而是和原进程（父进程）一起共享一个内存空间，这个内存空间的特性是"写时复制"，也就是说，原来的进程和 fork 出来的子进程可以同时、自由地读取内存，但如果子进程（或者父进程）对内存进行修改，那么部分内存就会复制一份给该进程单独使用，以免影响到共享这部分内存空间的其他进程的使用。

这种写时复制的思想与现在谈到的 string 类的写时复制数据存储方式是同一个意思。拿图 B.3 来说，当通过 str1 来拷贝构造 str2 的时候，它们所指向的实际内存中的字符串"I Love China!"是同一个，只有 str1 或者 str2 的值发生改变的时候，才需要把"I Love China!"这段内容复制出来一份并进行相应的修改，之所以要复制出来一份，是因为这两个字符串中的内容已经不相同了，需要各自单独保存。

为了实现这种写时复制的数据存储方式，需要引用计数这种编程手段的介入。虽然这种数据存储方式在标准库中也有实现，但是标准库中的代码都比较复杂，这里笔者通过一个比较简单的范例，把**利用写时复制数据存储方式实现 string 类**的代码介绍给读者，以拓宽读者的开发视野和编程思路。创建一个新类，取名为 mystring，所有的代码都在这个新类中实现。

## B.2 通过写时复制方式实现的 mystring 类

### B.2.1 骨架与计数设计

先写一个大概的 mystring 类骨架：

```cpp
class mystring
{
public:
    mystring(const char * tmpstr = "")      //构造函数
    {
        //...待增加
    }

private:
    char * point;               //指向实际的字符串
};
```

在 main 主函数中增加如下代码：

```cpp
mystring kxstr1("I Love China!");
mystring kxstr2 = ("I Love China!");
```

上面这两行代码虽然保存的字符串内容都一样，但是两个不同的对象，所以 kxstr1 和 kxstr2 这两个对象肯定不会共享"I Love China!"字符串，所以执行这两行代码后，这两个字符串的数据存储示意图应该如图 B.4 所示。

如果继续在 main 中增加下面两行代码：

```cpp
mystring kxstr3 = kxstr1;       //调用拷贝构造函数
kxstr2 = kxstr1;                //调用拷贝赋值运算符
```

在这两行代码中，上面的一行会调用 mystring 类的拷贝构造函数，下面的一行会调用 mystring 类的拷贝赋值运算符，执行之后数据存储示意图应该如图 B.5 所示。

![原书图 B.4 两个不同的mystring对象所保存的数据并不会共享](/assets/images/cpp-design-patterns/p355_fig2.png)

![原书图 B.5 3个不同的mystring对象所保存的数据共享](/assets/images/cpp-design-patterns/p355_fig3.png)

从图 B.5 中可以看到，kxstr1、kxstr2、kxstr3 共享（指向）同一个字符串，因为它们的字符串内容不但相同，而且 kxstr3 和 kxstr2 对象都是通过 kxstr1 构造出来的。同时不要忘记，图 B.4 中 kxstr2 指向的那块内容为"I Love China!"的内存就应该被释放掉了，因为 kxstr2 已经指向了不同的地址，造成原来那块内存内容的引用计数变成 0，只要引用计数变成了 0，就表示没有 mystring 对象再指向这块内存，所以必须要释放掉。

根据图 B.5 的设计思路，先尝试简单写一写 mystring 类的拷贝赋值运算符：

```cpp
public:
    mystring& operator = (const mystring& tmpstr)       //拷贝赋值运算符
    {
        if (this == &tmpstr)                            //增加是否是自己的判断
        {
            return *this;
        }
        delete[] point;
        point = new char[strlen(tmpstr.point) + 1];     //给字符串末尾的\0留位置
        strcpy(point, tmpstr.point);
        return *this;
    }
```

分析一下这段代码，例如执行代码行"kxstr2 = kxstr1;"，kxstr2 先把自己指向的内存删掉了，然后新创建一块内存，把 kxstr1 字符串拷贝到这块新内存中，这显然不对。如果这样写，则导致每个被赋值的对象（例如，这里"kxstr2 = kxstr1;"代码行中的 kxstr2）都有一块属于自己的内存了，与图 B.4 就很类似了，完全不是数据共享的效果，而实际上要达到的是图 B.5 那样的效果。

设想一下图 B.5，假设 kxstr1 被赋予了一个新值，那么"I Love China!"对应的内存必须依旧保留，因为 kxstr2、kxstr3 还在指向这块内存，只有所有对象全部不再指向"I Love China!"这块内存后，才应该把这块内存销毁掉。所以，必须要有一个计数器，用来记录指向"I Love China!"的 mystring 对象有几个，这个计数器就是所谓的引用计数。

现在问题的难点是**这个计数器保存在哪里**。可能读者的第一个反应是把这个计数器保存在 mystring 对象中。显然这是不行的，因为这个计数器是图 B.5 中 kxstr1、kxstr2、kxstr3 共享的。

所以，这里采用的编程方法是**专门创建一个结构**。这个结构中不但有计数器，还有所指向的内存内容（字符串）的指针（原 mystring 类中的 point 成员变量）。这个结构起名为 stringvalue，并且**放在 mystring 类中**，用 private 修饰，因为 stringvalue 类存在的意义就是**辅助 mystring 类的实现**，先把 mystring 类中拷贝赋值运算符中除"return *this;"外的代码行注释掉，成员变量 point 的定义注释掉，并在 mystring 类中增加如下代码（这些代码都是值得学习的代码，请读者注意）：

```cpp
private:
    struct stringvalue
    {
        size_t refcount;                        //引用计数
        char * point;                           //指向实际的字符串
        stringvalue(const char * tmpstr)        //stringvalue构造函数
        {
        }
        ~stringvalue()
        {
        }
    };
    stringvalue * pvalue;                       //mystring类中指向stringvalue对象的指针
```

从上述代码中可以看到，引用计数以及指向实际字符串的指针都被移到了 stringvalue 结构中作为该结构的成员，后面会进一步看到，字符串本身实际上也被移到了 stringvalue 结构中，同时，在 mystring 类中增加了一个 pvalue 指针，用于指向 stringvalue 对象。注意，这种编程方法以往并不常见。

如果很难理解将 stringvalue 这个结构写在类 mystring 里面这种方式，那么不妨把 stringvalue 当成一个写在 mystring 类外面的结构，就认为这两个结构没有什么直接关系就好。

接着完善 stringvalue 结构，为它的构造函数和析构函数增加具体的代码：

```cpp
stringvalue(const char * tmpstr):refcount(1)        //stringvalue构造函数
{
    point = new char[strlen(tmpstr) + 1];
    strcpy(point, tmpstr);
}

~stringvalue()
{
    delete[] point;
}
```

读者在这里进一步看到了 stringvalue 结构存在的意义：把"要保存的字符串"以及"对这个字符串的引用计数"统一保存在一个 **stringvalue 对象**中。

下面再看一看如何完善 mystring 类。

### B.2.2 构造函数

首先考虑的是创建一个 mystring 对象的时候应该做一些什么事情，这就涉及 mystring 类构造函数的修改。注意，这里增加了初始化列表：

```cpp
mystring(const char * tmpstr = "") :pvalue(new stringvalue(tmpstr))     //构造函数
{
}
```

在 main 主函数中，注释掉原来的所有代码，重新加入下面两行代码：

```cpp
mystring kxstr1("I Love China!");
mystring kxstr2("I Love China!");
```

这两行代码执行后，应该是怎样的对象状态呢？如图 B.6 所示。

![原书图 B.6 两个不同的mystring对象所保存的数据并不会共享](/assets/images/cpp-design-patterns/p357_fig1.png)

从图 B.6 中可以进一步感受到，创建的是两个不同的 mystring 对象，所以即便它们所保存的字符串内容相同，它们之间也不会有任何关联——指向的都是不同的内存。

现在就来看一看，如何共享字符串，在 main 主函数中，增加如下代码行：

```cpp
mystring kxstr3 = kxstr1;
```

上面的代码是用 kxstr1 对象来构造 kxstr3 对象，毫无疑问，这会调用 mystring 类的**拷贝构造函数**。必须要手工写这个拷贝构造函数，因为这里涉及引用计数的问题。先抛开 kxstr2 先不谈，这里只谈 kxstr1 和 kxstr3 这两个对象。通过 kxstr1 对象来构造 kxstr3 对象，我们期望达到的效果应该如图 B.7 所示。

![原书图 B.7 通过kxstr1对象拷贝构造出kxstr3对象](/assets/images/cpp-design-patterns/p358_fig1.png)

从图 B.7 可以看到，kxstr3 对象的 pvalue 指针也要指向 kxstr1 对象的 pvalue 指针所指向的内存（堆中的 stringvalue 对象），并且，注意堆中的 stringvalue 对象的引用计数（refcount）已经从原来的 1 变成了 2，这表示有两个 mystring 对象（kxstr1 和 kxstr3）指向了堆中的"I Love China!"字符串，所以字符串的引用计数实际上是通过在堆中的 stringvalue 对象这么一个中间环节来实现的（不然引用计数这个数字没有合适的地方保存）。

### B.2.3 拷贝构造函数

根据图 B.7 写一下 mystring 类的拷贝构造函数：

```cpp
mystring(const mystring& tmpstr) :pvalue(tmpstr.pvalue)     //拷贝构造函数
{
    ++pvalue->refcount;
}
```

上面这段代码有两个值得注意的地方（结合图 B.7 一下就看出来了）：一个是初始化列表中，让 kxstr3 对象的 pvalue 指向 kxstr1 对象的 pvalue 所指向的内容（堆中的 stringvalue 对象）；一个是让堆中的 stringvalue 对象的引用计数加 1。

从效率上来讲，这样编写的 mystring 类的工作效率肯定是更高的。不然，新生成一个字符串就要 new 一块内存。而现在，无非就是动一个指针，引用计数再加 1 而已。

### B.2.4 析构函数

但现在的代码是存在内存泄漏的，因为没有给 mystring 类写析构函数，"I Love China!"这个字符串所占内存的释放代码在 stringvalue 的析构函数中写好了，就差堆中的 stringvalue 对象的释放了。编写 mystring 类的析构函数：

```cpp
public:
    ~mystring()                                 //析构函数
    {
        --pvalue->refcount;
        if (pvalue->refcount == 0)
        {
            delete pvalue;
        }
    }
```

这段代码很简单，当释放一个 mystring 类对象的时候，引用计数 refcount 肯定要先减 1，如果减 1 之后是 0 了，那么就表示没有其他的 mystring 类对象再指向这个字符串，这个时候，字符串"I Love China!"以及为了维持这个字符串的引用计数相关的堆中的 stringvalue 对象也就没有存在的意义了，于是，就把堆中的 stringvalue 对象 delelte 掉，这样自然会执行 stringvalue 类的析构函数，从而就把字符串也 delete 掉了。因此，所有堆中内存就都被释放了。

### B.2.5 拷贝赋值运算符

好像还缺点什么，再看一看。如果在 main 主函数中增加如下代码：

```cpp
kxstr2 = kxstr1;
```

上面的代码行是对象赋值，调用的是 mystring 类的拷贝赋值运算符。所以，重新编写一下 mystring 类的拷贝赋值运算符。试想一下，执行了上面的代码行之后，kxstr2 也指向了 kxstr1 所指向的堆中的 stringvalue 对象，同时，引用计数变为 3（kxstr1、kxstr2、kxstr3）。不要忘记的是，kxstr2 原来所指向的另一个堆中的 stringvalue 对象的引用计数会从 1 变成 0，这就会导致该堆中 stringvalue 对象被释放（同时所指向的"I Love China!"字符串也被释放），达到的效果应该如图 B.8 所示才是正确的。

![原书图 B.8 通过kxstr1对象给kxstr2对象赋值（图中×部分表示内存被释放）](/assets/images/cpp-design-patterns/p359_fig2.png)

下面编写 mystring 类的拷贝赋值运算符：

```cpp
public:
    mystring& operator = (const mystring& tmpstr)       //拷贝赋值运算符
    {
        if (this == &tmpstr)                            //增加是否是自己的判断
        {
            return *this;
        }
        --pvalue->refcount;                             //自己所指向的字符串引用计数先减1
        if (pvalue->refcount == 0)
        {
            delete pvalue;                              //把自己所指向的堆中的stringvalue删除
        }
        pvalue = tmpstr.pvalue;
        ++pvalue->refcount;
        return *this;
    }
```

请记住一个原则，如果一个类中包含有指针成员（例如，mystring 类中包含 pvalue），那么一般都需要手工为该类书写拷贝构造函数和拷贝赋值运算符，否则，可能会导致问题。

### B.2.6 外部加锁、内部加锁、写时复制

先引入两个概念：

（1）外部加锁——调用者负责加锁，由调用者决定跨线程使用共享对象时的加锁时机。

（2）内部加锁——对象将所有对自己的访问串行化，通过为每个成员函数加锁的方法来实现，这样就不需要在多线程中共享该对象时进行外部加锁了（内部加锁的应用并不常见）。

现在，考虑一下写时复制问题。写时复制技术读者已经知道，优点是节省内存，但有些人不建议采用这种技术，理由是若运用这种技术实现一些接口的**多线程版本**（支持在多线程中安全使用）时，效率会明显下降，因为多线程版本往往意味着会大量使用内部加锁。

在笔者看来，实现出某些接口的**多线程版本**的动机和必要性是值得深思的：

（1）绝大多数情况下，如果需要支持该接口在多线程中的加锁和解锁操作，都应该由程序员来控制加解锁的时机（外部加锁），而在某个接口内部（这里指对象的成员函数中）直接加锁解锁（内部加锁）以支持多线程可能根本没有效果。试想一下对容器做内部加锁：在线程 A 中返回一个容器的迭代器，还没等使用，在线程 B 中就可能因为删除了某个元素直接导致线程 A 中的迭代器失效，这会直接造成程序运行崩溃。

（2）内部加锁只适合于操作很独立、很完整的接口。就拿 vector 容器的 begin 成员函数来说，begin 返回一个迭代器来指向容器的第一个元素，显然 begin 这种操作既不独立也不完整，因为后续代码可能会利用这个返回的迭代器来做其他事情。

在这里，不仅针对 copy-on-write 技术所实现的接口，即便是很多其他的技术所实现的接口，在多线程中使用它们时笔者也强烈建议采用外部加锁而非内部加锁的方式。下面将 copy-on-write 技术的实现方式展现给读者。

回想一下标准库中的 string 字符串类，如果单独输出其中的一个字符是可以做到的，那么在 main 中加入如下代码：

```cpp
string ms = "I Love China!";
cout << ms[0] << endl;                  //输出I
ms[0] = 'Y';
cout << ms.c_str() << endl;             //输出Y Love China!
```

执行一下程序，看一看输出结果：

```text
I
Y Love China!
```

可以看到，通过这种标号的方式，能够读出字符串中的单个字符。也可以通过下标的方式，修改字符串中的某个字符。这就是所谓字符串中单个字符的读和写。

回到 mystring 类，显然，"读"这件事非常简单，把字符从字符串中提取出来，返回去，就行了。但"写"这件事，就显得比较烦琐，因为"写"这个动作，涉及要修改所指向的字符串内容，但是观察一下图 B.8，可以看到，这里因为不止一个 mystring 对象指向这个字符串，所以，如果单独某个 mystring 对象要修改所指向的字符串的内容，那么就要把原来的字符串复制出来一份单独修改，这就叫"**写时复制**"。

如果通过[]来读 mystring 类对象指向的字符串中的某个字符，则只需要重载[]操作符。在 mystring 类中，增加如下代码：

```cpp
public:
    const char& operator[](int idx)const
    {
        return pvalue->point[idx];
    }
```

在 main 主函数中，增加如下代码：

```cpp
cout << kxstr1[0] << endl;              //输出I
```

上面这行代码调用了上述的 **operator[]操作符**，从而正确地输出了一个字符'I'。但是，如果继续向 main 主函数中增加如下代码行：

```cpp
kxstr1[0] = 'Y';
cout << kxstr1[0] << endl;
```

此时编译就会报错，提示："kxstr1"：不能给常量赋值。这说明，在这里重载的 operator[]操作符返回的是"const char&"类型，这种带有 const 的类型属于常量类型，不允许出现在赋值运算符的左侧（不允许被修改），所以编译时会报错。

那么为了让"kxstr1[0] = 'Y';"代码行顺利通过编译，必须再重载一个非 const 版本的[]操作符，那么这个非 const 版本的[]操作符，如果执行了"kxstr1[0] = 'Y';"代码行，应该是怎样的效果呢？如图 B.9 所示才是正确的。

![原书图 B.9 执行"kxstr1[0]='Y';"后的效果示意图](/assets/images/cpp-design-patterns/p361_fig2.png)

那么就来在 mystring 类中写一写非 const 版本的 operator[]，这个版本不管是通过[]来读还是向[]中写，都能正常工作：

```cpp
public:
    char& operator[](int idx)
    {
        if(pvalue->refcount > 1)
        {
            //说明还有其他对象指向这个字符串
            --pvalue->refcount;
            pvalue = new stringvalue(pvalue->point);        //写时复制
        }
        return pvalue->point[idx];
    }
```

从上面的代码中，读者不难感受到写时复制：如果引用计数大于 1，则会创建新的 stringvalue 对象以及新的堆中字符串。

这些写时复制技术其实在很多地方都有应用，读者只需要先掌握这种思想，以后需要用的时候自然就能回想起来，这里先不多说。

值得注意的是，一旦非 const 版本的 operator[]写出来后，原本执行"cout &lt;&lt; kxstr1[0] &lt;&lt; endl;"代码行时会调用 const 版本的 operator[]，现在居然也去调用非 const 版本的 operator[]了。实际上，针对 mystring 对象使用[]操作符的时候，**编译器根本就无法判断调用的是 const 版本的[]还是非 const 版本的[]操作符**（换句话来说，编译器无法判断对[]的调用是用于读还是用于写），反正只要有非 const 版本的[]存在，就会调用非 const 版本的[]，所以，这里 const 版本的[]不提供其实也行。为简单清晰起见，就把刚刚返回 const char& 类型的 operator[]版本注释掉了。

### B.2.7 通过指针修改 mystring 所指字符串的内容

目前的程序执行情形是图 B.9 所示的情形：kxstr3 和 kxstr2 指向了一个相同的字符串"I Love China!"，而 kxstr1 指向了字符串"Y Love China!"。

从当前状况来看，mystring 类的实现代码还是不错的。不难看到，为了引入计数功能，为了实现写时复制，程序员还是要多写很多代码的，这也使得 mystring 类比较复杂。这么复杂的类，其代码的完善也不是一蹴而就的，也就是说，要不断发现问题，不断解决问题。

下面就是在使用 mystring 类时发现的一个问题。在 main 主函数中，增加如下代码行：

```cpp
mystring kxstr4 = "I Love China!";
char * mypoint = &kxstr4[0];
mystring kxstr5 = kxstr4;
```

这几行代码，应注意顺序，顺序不能乱（先给 mypoint 指针赋值，然后再用 kxstr4 构造 kxstr5），执行后，效果如图 B.10 所示。

![原书图 B.10 一个额外的mypoint指针直接指向字符串](/assets/images/cpp-design-patterns/p362_fig2.png)

从图 B.10 可以观察到，mypoint 这个裸指针并没有通过堆中的 stringvalue 对象指向字符串"I Love China!"，而是直接指向了该字符串。试想，如果继续在 main 主函数中增加如下代码：

```cpp
*mypoint = 'T';
```

那么代码一旦执行，就会导致"I Love China!"变成了"T Love China!"，这就意味着 kxstr4 和 kxstr5 对象最终指向的字符串都发生了变化，但是实际上因为代码行"char * mypoint = &kxstr4[0];"的存在，通过 mypoint 应该只修改 kxstr4 指向的字符串才对。

问题的难点在于构造 kxstr5 的时候，要调用 mystring 类的拷贝构造函数，但是拷贝构造函数并没有办法知道当前 kxstr4 和 mypoint 指针都正在指向"I Love China!"这个字符串。所以构造完 kxstr5 后，就造成了 kxstr4、kxstr5 以及 mypoint 都指向了"I Love China"字符串，尤其是 mypoint 指针是直接指向了该字符串而并没有通过 stringvalue 对象来指向。

那么如何解决这种问题呢？

（1）不解决。如果非这么写程序，造成的后果就要程序员自身承担，如果所写的类要提供给别人使用。文档应该说明这种情况。

（2）通过代码解决这个问题。

①首先，在 stringvalue 结构中引入一个 bool 类型的成员，例如名字叫作 shareable 用来标记所指向的字符串是否可以被共享（是否可以被其他 mystring 对象共享）。刚创建一个 mystring 对象的时候所指向的字符串当然是可以被共享的。修改 stringvalue 结构，增加 shareable 成员：

```cpp
bool shareable;             //一个是否能被共享的标记
```

继续修改 stringvalue 的构造函数，将 shareable 初始化为 true。

```cpp
stringvalue(const char * tmpstr):refcount(1), shareable(true)
{
    ...
}
```

②那么什么时候这个 shareable 标记会变成 false 呢？就是一旦调用了 mystring 类的 operator[]操作符的时候。修改 operator[]操作符，在最后一行的 return 语句（return pvalue-&gt;point[idx];）之前，增加如下代码行：

```cpp
pvalue->shareable = false;
```

现在，shareable 标记的 true 和 false 时机就设置好了。那么如何运用这个标记呢？

③在 mystring 的拷贝构造函数中，就是运用这个标记的好时机，修改 mystring 拷贝构造函数。注意，因为要进行条件判断，所以，初始化列表中的内容要移动到函数体中去：

```cpp
mystring(const mystring& tmpstr)            //拷贝构造函数
{
    if (tmpstr.pvalue->shareable)
    {
        pvalue = tmpstr.pvalue;
        ++pvalue->refcount;
    }
    else
    {
        //复制一份
        pvalue = new stringvalue(tmpstr.pvalue->point);
    }
}
```

修改后的拷贝构造函数也比较简单，如果共享标记 shareable 为 true，表示允许共享，那么 mystring 拷贝构造函数的代码相当于没变；如果共享标记 shareable 为 false，就表示这个原来的 mystring 对象（mystring 拷贝构造函数中形参 tmpstr 所代表的 mystring 对象）已经不允许共享了，那么在这里要被创建的 mystring 对象只能重新在堆中创建 stringvalue 对象和具体的字符串，并让 stringvalue 对象指向该字符串。

通过上面的代码，读者可以看到，对操作符 operator[]的调用，会导致 mystring 对象无法再被共享，显然，对操作符 operator[]的调用不是一件好事，它减少了字符串在多个 mystring 对象之间的共享次数。凡是已经被标记成非共享的 mystring 对象，就再没有办法和其他 mystring 对象共享所指向的字符串了。因为 shareable 的状态只能从 true 变成 false，无法从 false 再变回 true。

如果再次执行如下代码行：

```cpp
mystring kxstr4 = "I Love China!";
char * mypoint = &kxstr4[0];
mystring kxstr5 = kxstr4;
*mypoint = 'T';
```

代码执行效果如图 B.11 所示。

![原书图 B.11 因调用operator[]导致kxstr4共享标记变为false，从而无法共享字符串了](/assets/images/cpp-design-patterns/p364_fig1.png)

看起来一切正常，至此，这个 mystring 类就设计完毕了。引用计数虽然节省了内存资源，但是实现它也付出了一定的代价，总结如下：

（1）额外引入了 stringvalue 这种辅助类，这种辅助类对象也是需要占内存的。

（2）在类 mystring 的实现中也额外增加了很多代码，从而提高了程序的复杂度。

所以有的时候进行程序设计，可以通过提高复杂度来节省资源，而且同时还能提高程序执行效率（创建新对象时不需要做额外的字符串拷贝）。在本例中，共享的字符串所占的空间越大，这种 mystring 共享对象越多，那么使用 mystring 类节省的内存就越多。

当然，如果创建的字符串无须共享，那么引用计数的实现就无意义，只是徒增了代码复杂度并更多地占用了内存空间。
