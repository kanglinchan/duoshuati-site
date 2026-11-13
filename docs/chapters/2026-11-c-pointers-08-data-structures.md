# 指针的真正用途：链表、树与 C 版"面向对象"

前面几课讲的指针用法——传地址、当数组用——其实都只是热身。指针真正的看家本领，是**把一个个独立的内存块"串"起来，搭出数据结构**。

这是 JS 里你天天在用、却很少意识到的东西：`{ value: 1, next: { value: 2, next: null } }`——对象的 `next` 就是个指针。C 只是把它赤裸裸地摆在你面前，并且把内存管理的活儿也交给你。

这一课我们用两个真实案例把指针用透：一个"统计单词频率"的小工具（链表），一个"绘图工具"的数据结构（函数指针实现多态）。

### 1. 热身：为什么数组搞不定词频统计

需求：读一段英文文本，统计每个单词出现几次，按字典序输出。

最直觉的做法是用数组，每个元素存 `{单词, 次数}`，保持数组始终按字典序排好。新单词来了，找到该插的位置插进去。

问题就出在"插进去"。**数组是连续内存，往中间插一个元素，后面所有元素都得往后挪一格。**

```c
/* 在 index 处插入，后面的元素全部后移 */
for (int i = count; i > index; i--)
    words[i] = words[i - 1];   /* O(n) 次搬运 */
words[index] = new_word;
count++;
```

一万个单词，每次插入平均搬五千次——这还只是插一个。数组的"连续"既是它的优点（能快速随机访问），也是它的死穴（中间插入要搬家）。

### 2. 链表：用指针把节点串起来

换个思路：**不让数据连着放，而是让每个数据节点带一个"指向下一个节点"的指针。**

```c
struct Word {
    char *name;          /* 单词 */
    int  count;          /* 出现次数 */
    struct Word *next;   /* 指向下一个节点 */
};

struct Word *head = NULL;   /* 链表头，NULL 表示空表 */
```

这种"自己里面装着指向同类型指针"的结构体，叫**自引用结构体**。注意成员 `next` 的类型写的是 `struct Word *`——此时 `Word` 这个 typedef 别名还没生效，只能用结构体标签。

把节点串起来的样子：

![链表：节点 + 指针箭头，末节点指向 NULL](/assets/images/c-pointers/cptr-08-linked-list.png)

每个节点都是单独 `malloc` 出来的，物理上可以东一块西一块，**顺序完全靠 `next` 指针维系**。插入一个新节点，只需要改两个指针，一个已有节点都不用动：

```c
/* 在 pos 后面插入 new_node */
new_node->next = pos->next;
pos->next = new_node;
```

对比一下：数组插入要搬 O(n) 个元素，链表插入只改 2 个指针——O(1)。代价是链表不能随机访问，想找第 100 个得从头数。

### 3. 链表三操作：遍历、插入、删除

链表的所有操作都是三个基本动作的组合。

**遍历**——一个 for 从头走到尾：

```c
for (struct Word *p = head; p != NULL; p = p->next) {
    printf("%s: %d\n", p->name, p->count);
}
```

**插入**（在 pos 之后）：

```c
new_node->next = pos->next;
pos->next = new_node;
```

**删除**（pos 之后那个）：

```c
struct Word *victim = pos->next;
pos->next = victim->next;   /* 让 pos 跳过 victim */
free(victim->name);         /* 记得把 malloc 的都还回去 */
free(victim);
```

删除有两个坑，都是血淋淋的经验：

**坑一：先摘下来再 free。** 如果先 `free(victim)` 再读 `victim->next`，就是在读已释放的内存（use-after-free，第 4 课的阴影）。

**坑二：谁分配谁释放，一个都不能漏。** 每个节点 malloc 了两次：节点本身一次、`name` 字符串一次。free 时也得两次都 free，顺序无所谓，但都不能少——少一个就是内存泄漏。

写个 `create_word` 把分配封装起来，代码会干净很多：

```c
struct Word *create_word(const char *name)
{
    struct Word *w = malloc(sizeof(struct Word));
    w->name = malloc(strlen(name) + 1);
    strcpy(w->name, name);
    w->count = 1;
    w->next = NULL;
    return w;
}
```

### 4. 数据结构的选型：没有银弹

词频统计这个例子，其实还能再想想：链表插入快但查找慢（线性扫描），数组查找快（有序数组能二分）但插入慢。

有没有两全的？有，比如**二叉搜索树**——既能二分查找，插入也只要挂个指针。但树的实现更复杂，还要小心退化（数据恰好有序时退化成链表）。

作者在这里给了一句很实在的话，值得记住：

> **没有哪个数据结构是万能的，它们各有优缺点。重要的是根据实际情况选合适的。**

数据结构是权衡的艺术。这正是为什么 JS 给了你这么多种集合：`Array`、`Map`、`Set`、`Object`——它们背后是不同的数据结构，各有适用场景。

### 5. 函数指针：C 也能"多态"

第二个案例，做个绘图工具。能画三种图形：折线、矩形、椭圆。怎么存？

每种图形数据结构不同，用一个**带标签的联合体**装：

```c
enum ShapeType { POLYLINE, RECTANGLE, ELLIPSE };

struct Shape {
    enum ShapeType type;        /* 标签：我到底是哪种 */
    union {
        struct Polyline  pl;    /* 折线 */
        struct Rectangle rect;  /* 矩形 */
        struct Ellipse   el;    /* 椭圆 */
    } data;
};
```

`union` 让三个成员**共享同一块内存**（大小取最大的那个），`type` 标签记录当前装的到底是哪种。读的时候先看 `type` 再取对应的 `data`——这就是 TS 里"可辨识联合"的纯手工实现。

现在要遍历所有图形并绘制。最直接的想法是 switch：

```c
void draw(struct Shape *s)
{
    switch (s->type) {
    case POLYLINE:  draw_polyline(s);  break;
    case RECTANGLE: draw_rectangle(s); break;
    case ELLIPSE:   draw_ellipse(s);   break;
    }
}
```

能用，但有个隐患：**"绘制"只是对图形的操作之一**。点选、存盘、加载……每个操作都要写一遍这样的 switch。将来新增一种图形，得把所有 switch 都找出来加一个 case，漏一个就出 bug。

更优雅的做法：**用函数指针数组，把"按类型分发"变成一次数组寻址。**

```c
void (*draw_funcs[])(struct Shape *) = {
    draw_polyline,
    draw_rectangle,
    draw_ellipse,
};

/* 调用：按类型当下标，直接取出对应函数调用 */
draw_funcs[s->type](s);
```

![函数指针数组：枚举当下标，直接取出对应函数](/assets/images/c-pointers/cptr-08-func-table.png)

新增一种图形？只要在数组末尾加一个函数，所有用到这个表的地方自动生效。这其实就是面向对象里"虚函数表"的手工版。

### 6. 更进一步：把方法塞进结构体

函数指针还能玩得更"面向对象"一点——直接把函数指针放进结构体，让每个图形"自带"自己的绘制方法：

```c
struct Shape {
    enum ShapeType type;
    /* …数据… */
    void (*draw)(struct Shape *self);   /* "方法" */
};

/* 创建折线时，给它装上折线的画法 */
struct Shape *new_polyline(void)
{
    struct Shape *s = malloc(sizeof(struct Shape));
    /* …初始化数据… */
    s->draw = draw_polyline;    /* 装配实现 */
    return s;
}

/* 调用：不管什么图形，一律 s->draw(s) */
for (struct Shape *p = head; p != NULL; p = p->next)
    p->draw(p);
```

`s->draw(s)` 这行，`s` 是折线就调折线的画法，是矩形就调矩形的画法——**同一个写法，不同对象执行不同函数，这就是多态（polymorphism）**。那个显式传的 `s`，就是 JS/Java 里的隐式 `this`。

看到这是不是有点眼熟？JS 的对象方法就是这么回事：`obj.draw()` 本质上也是"在 obj 上找到 draw 这个函数，再以 obj 为 this 调用它"。JS 的原型链，就是这套"函数指针表"机制加了语言层面的托管。你在 JS 里每天写的面向对象，底下跑的就是这套逻辑。

### 7. 一个隐蔽的坑：结构体赋值的浅拷贝

最后提一个容易踩的坑。结构体可以直接赋值：

```c
struct Shape a = make_polyline(...);
struct Shape b = a;    /* 整体拷贝一份 */
```

看着挺美好，但如果 Shape 里有指针成员（比如折线的坐标数组 `Point *points`），拷贝的只是**指针的值**，不是指针指向的数据。

![结构体整体赋值是浅拷贝：两个对象共享同一份数据](/assets/images/c-pointers/cptr-08-shallow-copy.png)

结果 a 和 b 的 `points` 指向**同一块**坐标数组。改 a 的坐标，b 的也跟着变；free 掉 a，b 的 points 立刻变成野指针。

这就是 JS 里 `const b = a` 的同款问题——**浅拷贝只复制引用，不复制内容。** 只不过 C 没有 GC 兜底，后果更严重。要真正复制，得手动把指针指向的内容也拷贝一份（深拷贝）。

### 小结

- 数组搞不定"中间插入"，因为连续内存要搬家；链表用指针串节点，插入 O(1)
- 自引用结构体 + malloc/free，是链表的标配；删除要先摘再 free，分配的都要还
- 没有万能的数据结构，按场景选型
- 带标签的 union = TS 可辨识联合的手工版
- 函数指针数组把 switch 分发变成一次寻址；把函数指针放进结构体就实现了多态
- 结构体赋值是浅拷贝，指针成员只复制地址——改一处，处处变

下一课预告（最后一课）：把全书踩过的坑和惯用写法整理成一份速查清单，写代码时随手翻。

<QuizBlock src="/quiz/2026-11-c-pointers/08.json" title="本章自测" />
