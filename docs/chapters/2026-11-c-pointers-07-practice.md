# 实战：动态数组、字符串数组与命令行参数

前面几课把理论打牢了，这一课全部用来解决实际问题。C 里没有 JS 那样"随便 push"的数组，一切动态行为都得自己用指针和 malloc 搭。这一课把最常用的几个模式都搭一遍：动态数组、一组字符串、`argv`、二维动态数组。

学完你会发现，这些"看着高级"的写法，拆开全是前几课讲过的零件。

### 1. 动态数组：长度运行时才知道

最基础的需求：数组长度要用户输入了才知道。栈数组做不到（长度编译期定死），用堆：

```c
int n;
scanf("%d", &n);

int *arr = malloc(sizeof(int) * n);   /* 运行时申请 n 个 int */
for (int i = 0; i < n; i++) arr[i] = i;

/* 用完记得还 */
free(arr);
```

用法上 `arr[i]` 和普通数组一模一样（因为 `arr[i]` 本来就是 `*(arr+i)`，数组和指针在这殊途同归）。

**但要注意一个区别**：`malloc` 出来的内存，编译器不知道它有多长。`sizeof(arr)` 得到的是指针大小（8），不是数组大小。所以**长度 `n` 要你自己拿个变量记下来，走到哪带到哪**——这就是 C 动态数组和 JS 数组最大的不同，JS 数组自带 `length`，C 得你自己管。

需要扩容时用 `realloc`（第 4 课讲过，注意接返回值、判 NULL）。

### 2. 一组字符串：`char *arr[]`

第二个常见需求：存一组字符串，比如一周的每日标语，每条长度不一。

如果开 `char slogans[7][1024]`，那就是 7 行每行 1024 字节——不管标语是 5 个字还是 500 个字，每行都占满 1024。短标语白白浪费空间。

更省的做法是**指针数组**：`char *slogans[7]`，每个元素是一个 `char*`，各自指向一块按实际长度 malloc 的内存。

```c
char *slogans[7];

char buf[1024];                 /* 临时缓冲区 */
for (int i = 0; i < 7; i++) {
    fgets(buf, sizeof(buf), stdin);
    int len = strlen(buf);
    if (buf[len-1] == '\n') buf[--len] = '\0';   /* 去掉换行符 */

    slogans[i] = malloc(len + 1); /* 按实际长度分配 */
    strcpy(slogans[i], buf);
}
```

![指针的数组：每条标语独立一块内存，长度各异](/assets/images/c-pointers/cptr-07-string-array.png)

每条标语占多少就分多少，一点不浪费。访问某个字符用 `slogans[i][j]`——注意这和二维数组的 `slogans[i][j]` 内存布局完全不同（第 6 课讲过），只是语法上长得像。

### 3. `char **`：指针的指针

上面那个 `slogans` 数组，如果要传给函数怎么办？

按第 2 课的规则，数组传参会转成"指向首元素的指针"。slogans 的首元素是 `char*`，所以"指向它的指针"就是 `char **`——**指针的指针**。

```c
void print_all(char **slogans, int count)
{
    for (int i = 0; i < count; i++)
        printf("%s\n", slogans[i]);   /* slogans[i] 是 char* */
}

print_all(slogans, 7);   /* char *[7] → char ** */
```

`char **` 看着唬人，其实就是"指向 char* 的指针"。它有两个主要用途：一是这种"字符串数组"传参，二是**通过参数返回一个指针**（出参）。

比如函数要给调用方带回一个 malloc 出来的字符串，返回值要留给状态码，就得用出参：

```c
int read_line(char **out)   /* 出参：指向 char* 的指针 */
{
    char *line = malloc(100);
    /* …填充 line… */
    *out = line;            /* 顺着指针把 line 写到调用方的变量里 */
    return 0;               /* 返回值专门用来报告状态：0 成功 */
}

/* 调用方 */
char *line;
if (read_line(&line) == 0) {
    printf("%s\n", line);
    free(line);
}
```

`&line` 是 `char **`——把 line 这个指针变量的地址传进去，函数往里填真正的字符串地址。

### 4. `argv`：命令行参数就是个 `char **`

现在看一个你天天在用、却可能没注意过的 `char **`——命令行参数。

```c
int main(int argc, char *argv[])   /* 等价于 char **argv */
{
    for (int i = 0; i < argc; i++)
        printf("参数%d: %s\n", i, argv[i]);
    return 0;
}
```

`argv` 就是一个字符串数组（指针的数组）：`argv[0]` 是程序名，`argv[1]`、`argv[2]`…… 是各个参数。`argc` 是参数个数。

![argv 的结构：char* 数组，argv[argc] 是 NULL 哨兵](/assets/images/c-pointers/cptr-07-argv.png)

写个最简单的 `cat` 练练手：

```c
int main(int argc, char *argv[])
{
    if (argc < 2) {
        printf("用法: %s <文件名>\n", argv[0]);
        return 1;
    }
    FILE *fp = fopen(argv[1], "r");
    if (fp == NULL) { perror("打开失败"); return 1; }

    int ch;
    while ((ch = fgetc(fp)) != EOF) putchar(ch);
    fclose(fp);
    return 0;
}
```

现在 `gcc mycat.c -o mycat && ./mcat hello.txt` 你就懂了：`argv[1]` 是 `"hello.txt"`，`argc` 是 2。

### 5. 二维动态数组的四种造法

最后攻一个硬需求：要一个行数、列数都运行时才知道的二维数组（比如棋盘、编辑器缓冲区）。有四种造法，各有取舍。

**方案一：C99 的可变长方式（推荐）**，一行搞定，还能用 `board[i][j]`：

```c
int (*board)[cols] = malloc(sizeof(int) * rows * cols);
board[i][j] = 5;      /* 语法和真二维数组一样 */
free(board);
```

`int (*board)[cols]` 是"指向 cols 个 int 的数组"的指针，配合 malloc 的一大块连续内存，`board[i][j]` 就能正常寻址。**要求编译器支持 C99 的可变长数组特性。**

**方案二：指针的数组**，每一行单独 malloc：

```c
int **board = malloc(sizeof(int*) * rows);     /* 先分配"行指针"数组 */
for (int i = 0; i < rows; i++)
    board[i] = malloc(sizeof(int) * cols);     /* 每行再单独分配 */

board[i][j] = 5;

/* 释放要两层：先逐行 free，再 free 指针数组 */
for (int i = 0; i < rows; i++) free(board[i]);
free(board);
```

**方案三：一维数组 + 手动换算下标**，最朴素也最灵活：

```c
int *board = malloc(sizeof(int) * rows * cols);
board[i * cols + j] = 5;    /* 自己算一维下标 */
free(board);
```

**方案四：结构体柔性数组（C99）**，把"长度信息"和"数据"打包进一个结构体里一次 malloc：

```c
struct Board {
    int rows, cols;
    int data[];             /* 柔性数组成员：不占固定大小 */
};

struct Board *b = malloc(sizeof(struct Board) + sizeof(int)*rows*cols);
b->rows = rows; b->cols = cols;
b->data[i * cols + j] = 5;
free(b);      /* 一次 free 全释放 */
```

柔性数组成员 `int data[]` 不占结构体大小，但它必须放最后；分配时在结构体末尾多留出数据的空间。好处是"尺寸信息和数据永远绑在一起，一次 malloc/free 搞定"。

![动态二维数组的两种布局：连续内存 vs 指针数组](/assets/images/c-pointers/cptr-07-2d-dynamic.png)

怎么选？**日常使用优先方案一（写法最自然）或方案三（最通用、缓存友好）；需要把行列数跟着数据一起传递时选方案四。** 方案二能少一块连续大内存的门槛，但分配释放都麻烦，缓存也不友好。

### 小结

- 动态数组 = `malloc` + 自己记长度 + `free`；扩容用 `realloc`
- 一组字符串用 `char *arr[]`，每条独立 malloc，比二维数组省空间
- `char **` 两个用途：字符串数组传参、通过出参带回一个指针
- `argv` 就是个 `char **`（`char *argv[]`），`argc` 记个数
- 二维动态数组四种造法：C99 可变长指针、指针的数组、一维手算下标、结构体柔性数组——按场景选

下一课预告：指针真正的杀手锏登场——用它把一个个节点串成链表、搭出树，再用函数指针给 C 拼出一套"面向对象"。

<QuizBlock src="/quiz/2026-11-c-pointers/07.json" title="本章自测" />
