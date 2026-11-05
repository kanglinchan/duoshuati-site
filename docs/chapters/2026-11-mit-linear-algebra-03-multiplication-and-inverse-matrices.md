# 第 3 讲：矩阵乘法和逆矩阵

> 英文标题：Multiplication and Inverse Matrices  
> 讲师：Gilbert Strang  
> 整理方式：严格按照教授的实际授课顺序，完整展开课堂推导与计算


## 本讲目录

- [一、教授开场：矩阵乘法与逆矩阵](#一教授开场矩阵乘法与逆矩阵)
- [二、第一种乘法：逐个元素计算](#二第一种乘法逐个元素计算)
- [三、矩阵什么时候可以相乘](#三矩阵什么时候可以相乘)
- [四、第二种乘法：一次计算一整列](#四第二种乘法一次计算一整列)
- [五、第三种乘法：一次计算一整行](#五第三种乘法一次计算一整行)
- [六、第四种乘法：列乘行再相加](#六第四种乘法列乘行再相加)
- [七、列乘行矩阵的行空间与列空间](#七列乘行矩阵的行空间与列空间)
- [八、第五种乘法：分块乘法](#八第五种乘法分块乘法)
- [九、逆矩阵的定义](#九逆矩阵的定义)
- [十、没有逆矩阵的例子](#十没有逆矩阵的例子)
- [十一、非零向量被变成零：不可逆的关键原因](#十一非零向量被变成零不可逆的关键原因)
- [十二、把求逆矩阵拆成多个方程组](#十二把求逆矩阵拆成多个方程组)
- [十三、高斯–若尔当法求逆矩阵](#十三高斯若尔当法求逆矩阵)
- [十四、为什么右侧会变成逆矩阵](#十四为什么右侧会变成逆矩阵)
- [十五、原课收尾](#十五原课收尾)
- [十六、课后练习](#十六课后练习)
- [十七、视频时间索引](#十七视频时间索引)

## 一、教授开场：矩阵乘法与逆矩阵

前两讲已经使用过矩阵乘法，本讲首先系统讨论矩阵乘法的规则。

教授特别强调：同一个矩阵乘法可以用多种方式理解和计算。这些方式得到相同答案，而且各有用途。

本讲有两部分：

1. 矩阵乘法；
2. 逆矩阵，包括逆矩阵何时存在以及怎样求出它。

## 二、第一种乘法：逐个元素计算

设：

$$
AB=C.
$$

结果矩阵 $C$ 的第 $i$ 行、第 $j$ 列元素记作：

$$
c_{ij}.
$$

下标顺序永远是：

$$
\boxed{\text{先写行号，再写列号}}.
$$

### 2.1 以 c34 为例

元素 $c_{34}$ 位于结果矩阵第 $3$ 行、第 $4$ 列。

它由：

- 矩阵 $A$ 的第 $3$ 行；
- 矩阵 $B$ 的第 $4$ 列；

做点积得到：

$$
c_{34}=(A\text{ 的第 }3\text{ 行})\cdot(B\text{ 的第 }4\text{ 列}).
$$

把点积逐项展开，前两项是：

$$
a_{31}b_{14}+a_{32}b_{24}+\cdots.
$$

下标可以这样核对：

- $a_{31}$：$A$ 的第 $3$ 行、第 $1$ 列；
- $b_{14}$：$B$ 的第 $1$ 行、第 $4$ 列；
- $a_{32}$：$A$ 的第 $3$ 行、第 $2$ 列；
- $b_{24}$：$B$ 的第 $2$ 行、第 $4$ 列。

也就是沿着 $A$ 的一行向右走，同时沿着 $B$ 的一列向下走，把对应元素相乘，再全部相加。

### 2.2 用求和符号写出完整公式

用 $k$ 表示当前走到的位置，完整公式为：

$$
\boxed{
c_{34}=\sum_{k=1}^{n}a_{3k}b_{k4}
}.
$$

展开就是：

$$
c_{34}
=a_{31}b_{14}+a_{32}b_{24}+\cdots+a_{3n}b_{n4}.
$$

对一般的 $c_{ij}$，公式为：

$$
\boxed{
c_{ij}=\sum_{k=1}^{n}a_{ik}b_{kj}
}.
$$

这就是最常见的“行乘列”规则。

## 三、矩阵什么时候可以相乘

设 $A$ 是 $m\times n$ 矩阵：

$$
A\text{ 有 }m\text{ 行、}n\text{ 列}.
$$

设 $B$ 是 $n\times p$ 矩阵：

$$
B\text{ 有 }n\text{ 行、}p\text{ 列}.
$$

能够相乘的原因是：

- $A$ 的每一行有 $n$ 个数；
- $B$ 的每一列有 $n$ 个数；
- 两边长度相同，才能做点积。

因此：

$$
\boxed{A\text{ 的列数必须等于 }B\text{ 的行数}}.
$$

结果的形状是：

$$
\boxed{
(m\times n)(n\times p)=(m\times p)
}.
$$

也就是说：

- 结果的行数取 $A$ 的行数 $m$；
- 结果的列数取 $B$ 的列数 $p$；
- 中间两个 $n$ 必须一致。

结果矩阵一共有 $mp$ 个元素，每个元素都可以使用前面的点积公式计算。

## 四、第二种乘法：一次计算一整列

仍然设：

$$
AB=C.
$$

这一次不逐个元素看，而是把 $B$ 按列拆开：

$$
B=
\begin{bmatrix}
|&|&&|\\
\mathbf{b}_1&\mathbf{b}_2&\cdots&\mathbf{b}_p\\
|&|&&|
\end{bmatrix}.
$$

矩阵乘法可以写成：

$$
AB
=A
\begin{bmatrix}
|&|&&|\\
\mathbf{b}_1&\mathbf{b}_2&\cdots&\mathbf{b}_p\\
|&|&&|
\end{bmatrix}.
$$

分别让 $A$ 乘 $B$ 的每一列：

$$
\boxed{
AB=
\begin{bmatrix}
|&|&&|\\
A\mathbf{b}_1&A\mathbf{b}_2&\cdots&A\mathbf{b}_p\\
|&|&&|
\end{bmatrix}
}.
$$

所以：

$$
\boxed{\text{结果的第 $j$ 列，就是 $A$ 乘 $B$ 的第 $j$ 列}}.
$$

即：

$$
\mathbf{c}_j=A\mathbf{b}_j.
$$

### 4.1 为什么结果各列来自 A 的列

第 1 讲已经学过：矩阵乘列向量，是矩阵各列的线性组合。

如果：

$$
A=
\begin{bmatrix}
|&|&&|\\
\mathbf{a}_1&\mathbf{a}_2&\cdots&\mathbf{a}_n\\
|&|&&|
\end{bmatrix},
\qquad
\mathbf{b}_j=
\begin{bmatrix}
b_{1j}\\
b_{2j}\\
\vdots\\
b_{nj}
\end{bmatrix},
$$

那么：

$$
\begin{aligned}
\mathbf{c}_j
&=A\mathbf{b}_j\\
&=b_{1j}\mathbf{a}_1+b_{2j}\mathbf{a}_2+\cdots+b_{nj}\mathbf{a}_n.
\end{aligned}
$$

所以：

$$
\boxed{C\text{ 的每一列，都是 }A\text{ 各列的线性组合}}.
$$

$B$ 中的数字负责告诉我们：每个 $A$ 的列应该取多少倍。

从形状上也能检查：若 $A$ 有 $m$ 行，则 $A$ 的列向量有 $m$ 个分量；结果 $C$ 的列向量也必须有 $m$ 个分量。

## 五、第三种乘法：一次计算一整行

现在把 $A$ 按行拆开。

设 $A$ 的第 $i$ 行为：

$$
\mathbf{a}_{i*}=
\begin{bmatrix}
a_{i1}&a_{i2}&\cdots&a_{in}
\end{bmatrix}.
$$

那么结果的第 $i$ 行就是：

$$
\boxed{\mathbf{c}_{i*}=\mathbf{a}_{i*}B}.
$$

整个矩阵乘法可以理解为：依次用 $A$ 的每一行乘整个矩阵 $B$，得到结果的对应行。

### 5.1 为什么结果各行来自 B 的行

把 $B$ 的各行记为：

$$
\mathbf{b}_{1*},\mathbf{b}_{2*},\ldots,\mathbf{b}_{n*}.
$$

则：

$$
\begin{aligned}
\mathbf{c}_{i*}
&=\mathbf{a}_{i*}B\\
&=a_{i1}\mathbf{b}_{1*}+a_{i2}\mathbf{b}_{2*}+\cdots+a_{in}\mathbf{b}_{n*}.
\end{aligned}
$$

所以：

$$
\boxed{C\text{ 的每一行，都是 }B\text{ 各行的线性组合}}.
$$

这次由 $A$ 中的数字决定：每个 $B$ 的行应该取多少倍。

至此已经有三种看法：

1. 每个元素是 $A$ 的一行与 $B$ 的一列的点积；
2. 结果的每一列是 $A$ 各列的组合；
3. 结果的每一行是 $B$ 各行的组合。

## 六、第四种乘法：列乘行再相加

### 6.1 行乘列与列乘行不是一回事

一行乘一列，例如 $1\times n$ 乘 $n\times1$，结果是一个数：

$$
(1\times n)(n\times1)=1\times1.
$$

现在反过来：一列乘一行。

若：

- $A$ 的一列形状为 $m\times1$；
- $B$ 的一行形状为 $1\times p$；

则结果为：

$$
(m\times1)(1\times p)=m\times p.
$$

所以：

$$
\boxed{\text{列乘行会得到一个完整矩阵，而不是一个数}}.
$$

### 6.2 课堂例子：完整计算列乘行

教授取列向量：

$$
\begin{bmatrix}
2\\3\\4
\end{bmatrix}
$$

和行向量：

$$
\begin{bmatrix}1&6\end{bmatrix}.
$$

相乘：

$$
\begin{bmatrix}
2\\3\\4
\end{bmatrix}
\begin{bmatrix}1&6\end{bmatrix}.
$$

左侧是 $3\times1$，右侧是 $1\times2$，所以结果是 $3\times2$ 矩阵。

逐个元素计算。

第一行：

$$
\begin{aligned}
2\begin{bmatrix}1&6\end{bmatrix}
&=\begin{bmatrix}2(1)&2(6)\end{bmatrix}\\
&=\begin{bmatrix}2&12\end{bmatrix}.
\end{aligned}
$$

第二行：

$$
\begin{aligned}
3\begin{bmatrix}1&6\end{bmatrix}
&=\begin{bmatrix}3(1)&3(6)\end{bmatrix}\\
&=\begin{bmatrix}3&18\end{bmatrix}.
\end{aligned}
$$

第三行：

$$
\begin{aligned}
4\begin{bmatrix}1&6\end{bmatrix}
&=\begin{bmatrix}4(1)&4(6)\end{bmatrix}\\
&=\begin{bmatrix}4&24\end{bmatrix}.
\end{aligned}
$$

所以：

$$
\boxed{
\begin{bmatrix}
2\\3\\4
\end{bmatrix}
\begin{bmatrix}1&6\end{bmatrix}
=
\begin{bmatrix}
2&12\\
3&18\\
4&24
\end{bmatrix}}.
$$

### 6.3 完整的 AB 是多个列乘行之和

设 $A$ 的第 $k$ 列为 $\mathbf{a}_k$，$B$ 的第 $k$ 行为 $\mathbf{b}_{k*}$。第四种乘法公式为：

$$
\boxed{
AB=\sum_{k=1}^{n}\mathbf{a}_k\mathbf{b}_{k*}
}.
$$

展开就是：

$$
AB
=\mathbf{a}_1\mathbf{b}_{1*}
+\mathbf{a}_2\mathbf{b}_{2*}
+\cdots
+\mathbf{a}_n\mathbf{b}_{n*}.
$$

每一项都是一个完整矩阵，最后把这些矩阵相加。

### 6.4 完整计算教授的两列、两行示例

取：

$$
A=
\begin{bmatrix}
2&7\\
3&8\\
4&9
\end{bmatrix},
\qquad
B=
\begin{bmatrix}
1&6\\
0&0
\end{bmatrix}.
$$

$A$ 是 $3\times2$，$B$ 是 $2\times2$，所以 $AB$ 是 $3\times2$。

$A$ 的第一列乘 $B$ 的第一行：

$$
\begin{bmatrix}
2\\3\\4
\end{bmatrix}
\begin{bmatrix}1&6\end{bmatrix}
=
\begin{bmatrix}
2&12\\
3&18\\
4&24
\end{bmatrix}.
$$

$A$ 的第二列乘 $B$ 的第二行：

$$
\begin{aligned}
\begin{bmatrix}
7\\8\\9
\end{bmatrix}
\begin{bmatrix}0&0\end{bmatrix}
&=
\begin{bmatrix}
7(0)&7(0)\\
8(0)&8(0)\\
9(0)&9(0)
\end{bmatrix}\\
&=
\begin{bmatrix}
0&0\\
0&0\\
0&0
\end{bmatrix}.
\end{aligned}
$$

两部分相加：

$$
\begin{aligned}
AB
&=
\begin{bmatrix}
2&12\\
3&18\\
4&24
\end{bmatrix}
+
\begin{bmatrix}
0&0\\
0&0\\
0&0
\end{bmatrix}\\
&=
\begin{bmatrix}
2&12\\
3&18\\
4&24
\end{bmatrix}.
\end{aligned}
$$

用第一种“行乘列”方法检查。

结果第一行第一列：

$$
2(1)+7(0)=2+0=2.
$$

结果第一行第二列：

$$
2(6)+7(0)=12+0=12.
$$

结果第二行第一列：

$$
3(1)+8(0)=3+0=3.
$$

结果第二行第二列：

$$
3(6)+8(0)=18+0=18.
$$

结果第三行第一列：

$$
4(1)+9(0)=4+0=4.
$$

结果第三行第二列：

$$
4(6)+9(0)=24+0=24.
$$

两种方法结果一致。

## 七、列乘行矩阵的行空间与列空间

矩阵：

$$
M=
\begin{bmatrix}
2&12\\
3&18\\
4&24
\end{bmatrix}
$$

具有非常特殊的结构。

### 7.1 所有列都是同一列向量的倍数

两列分别是：

$$
\begin{bmatrix}2\\3\\4\end{bmatrix},
\qquad
\begin{bmatrix}12\\18\\24\end{bmatrix}.
$$

第二列可以写成：

$$
\begin{bmatrix}12\\18\\24\end{bmatrix}
=6
\begin{bmatrix}2\\3\\4\end{bmatrix}.
$$

所以两列方向相同，都在由 $(2,3,4)^T$ 决定的一条直线上。

所有行的组合所形成的空间称为行空间，所有列的组合所形成的空间称为列空间。后面会系统学习这些概念。

这个矩阵的列空间只是一条直线。

### 7.2 所有行都是同一行向量的倍数

三行分别为：

$$
\begin{bmatrix}2&12\end{bmatrix},
\quad
\begin{bmatrix}3&18\end{bmatrix},
\quad
\begin{bmatrix}4&24\end{bmatrix}.
$$

它们可以写成：

$$
\begin{bmatrix}2&12\end{bmatrix}
=2\begin{bmatrix}1&6\end{bmatrix},
$$

$$
\begin{bmatrix}3&18\end{bmatrix}
=3\begin{bmatrix}1&6\end{bmatrix},
$$

$$
\begin{bmatrix}4&24\end{bmatrix}
=4\begin{bmatrix}1&6\end{bmatrix}.
$$

所以三行也都在由 $[1,6]$ 决定的一条直线上。

这个矩阵的行空间同样只是一条直线。

## 八、第五种乘法：分块乘法

矩阵还可以先分成若干块，再按块相乘。

设：

$$
A=
\begin{bmatrix}
A_1&A_2\\
A_3&A_4
\end{bmatrix},
\qquad
B=
\begin{bmatrix}
B_1&B_2\\
B_3&B_4
\end{bmatrix}.
$$

这里的 $A_1,A_2,\ldots,B_4$ 不是单个数字，而是较小矩阵。

只要各块的形状能够正确配合，就可以像普通二阶矩阵乘法一样按块计算：

$$
AB=
\begin{bmatrix}
A_1B_1+A_2B_3 & A_1B_2+A_2B_4\\
A_3B_1+A_4B_3 & A_3B_2+A_4B_4
\end{bmatrix}.
$$

教授重点问左上角这一块来自哪里。完整展开为：

$$
\boxed{A_1B_1+A_2B_3}.
$$

原因是：

- $A$ 的第一块行是 $[A_1,A_2]$；
- $B$ 的第一块列是 $[B_1,B_3]^T$；
- 对应块相乘后相加。

例如，一个 $20\times20$ 矩阵可以分成四个 $10\times10$ 块。块乘法允许先处理较小的矩阵乘法。

块的大小不必全部相同，但相乘和相加的块必须在形状上匹配。

至此，教授介绍了五种方式：

1. 逐个元素，行乘列；
2. 一次一列；
3. 一次一行；
4. 列乘行再求和；
5. 分块乘法。

它们最终都在做同样的乘法，只是组织计算的方式不同。

## 九、逆矩阵的定义

接下来进入本讲第二部分：逆矩阵。

先考虑方阵 $A$。方阵不一定可逆，所以首先必须问：

$$
A\text{ 是否可逆？}
$$

如果存在另一个矩阵 $A^{-1}$，使得：

$$
\boxed{A^{-1}A=I},
$$

并且：

$$
\boxed{AA^{-1}=I},
$$

那么 $A^{-1}$ 称为 $A$ 的逆矩阵。

可逆矩阵也称为**非奇异矩阵（non-singular matrix）**；没有逆矩阵的方阵称为**奇异矩阵（singular matrix）**。

对于方阵，如果能找到满足 $A^{-1}A=I$ 的左逆矩阵，那么它也是满足 $AA^{-1}=I$ 的右逆矩阵。

这个性质不能不加区分地推广到长方形矩阵。长方形矩阵的左右逆问题留到后面讨论。

## 十、没有逆矩阵的例子

教授先给出一个没有逆矩阵的矩阵：

$$
A=
\begin{bmatrix}
1&3\\
2&6
\end{bmatrix}.
$$

可以从几个角度理解。

### 10.1 行列式为零

如果使用后面才会系统学习的二阶行列式公式：

$$
\det
\begin{bmatrix}
a&b\\
c&d
\end{bmatrix}
=ad-bc,
$$

则：

$$
\begin{aligned}
\det A
&=1(6)-3(2)\\
&=6-6\\
&=0.
\end{aligned}
$$

行列式为零，对应矩阵不可逆。

### 10.2 两列共线

两列为：

$$
\mathbf{a}_1=
\begin{bmatrix}1\\2\end{bmatrix},
\qquad
\mathbf{a}_2=
\begin{bmatrix}3\\6\end{bmatrix}.
$$

第二列是第一列的三倍：

$$
\mathbf{a}_2=3\mathbf{a}_1.
$$

任意列组合为：

$$
\begin{aligned}
x\mathbf{a}_1+y\mathbf{a}_2
&=x\mathbf{a}_1+y(3\mathbf{a}_1)\\
&=(x+3y)\mathbf{a}_1\\
&=(x+3y)
\begin{bmatrix}1\\2\end{bmatrix}.
\end{aligned}
$$

所以所有可能的列组合都在一条直线上。

单位矩阵的第一列是：

$$
\mathbf{e}_1=
\begin{bmatrix}1\\0\end{bmatrix}.
$$

若要由 $\mathbf{a}_1$ 的倍数得到 $\mathbf{e}_1$，必须存在 $t$，使：

$$
t
\begin{bmatrix}1\\2\end{bmatrix}
=
\begin{bmatrix}1\\0\end{bmatrix}.
$$

逐分量比较：

$$
t=1,
\qquad
2t=0.
$$

由第二式得 $t=0$，与第一式 $t=1$ 矛盾。因此 $\mathbf{e}_1$ 不在这些列向量能到达的直线上。

矩阵乘法 $AB$ 的每一列都必须是 $A$ 各列的组合，所以 $AB$ 不可能得到单位矩阵 $I$。

这就是从列图像理解不可逆。

## 十一、非零向量被变成零：不可逆的关键原因

教授最重视的判断方式是：

> 如果存在非零向量 $\mathbf{x}$，使 $A\mathbf{x}=\mathbf{0}$，那么 $A$ 不可能可逆。

### 11.1 找到这个非零向量

对刚才的矩阵：

$$
A=
\begin{bmatrix}
1&3\\
2&6
\end{bmatrix},
$$

取：

$$
\mathbf{x}=
\begin{bmatrix}
3\\-1
\end{bmatrix}.
$$

这个向量显然不是零向量。

计算：

$$
\begin{aligned}
A\mathbf{x}
&=
\begin{bmatrix}
1&3\\
2&6
\end{bmatrix}
\begin{bmatrix}
3\\-1
\end{bmatrix}\\
&=
\begin{bmatrix}
1(3)+3(-1)\\
2(3)+6(-1)
\end{bmatrix}\\
&=
\begin{bmatrix}
3-3\\
6-6
\end{bmatrix}\\
&=
\begin{bmatrix}
0\\0
\end{bmatrix}.
\end{aligned}
$$

按列理解，这就是：

$$
3
\begin{bmatrix}1\\2\end{bmatrix}
-1
\begin{bmatrix}3\\6\end{bmatrix}
=
\begin{bmatrix}0\\0\end{bmatrix}.
$$

即三份第一列减去一份第二列等于零。

### 11.2 假设逆矩阵存在，会推出矛盾

从：

$$
A\mathbf{x}=\mathbf{0}
$$

开始。

假设 $A^{-1}$ 存在，在等式两边同时左乘 $A^{-1}$：

$$
A^{-1}(A\mathbf{x})=A^{-1}\mathbf{0}.
$$

左侧利用结合律：

$$
A^{-1}(A\mathbf{x})=(A^{-1}A)\mathbf{x}=I\mathbf{x}=\mathbf{x}.
$$

右侧因为任何矩阵乘零向量都是零向量：

$$
A^{-1}\mathbf{0}=\mathbf{0}.
$$

于是必然得到：

$$
\mathbf{x}=\mathbf{0}.
$$

但我们已经知道：

$$
\mathbf{x}=
\begin{bmatrix}3\\-1\end{bmatrix}
\neq\mathbf{0}.
$$

两者矛盾，所以最初“逆矩阵存在”的假设不可能成立。

直观上说，矩阵 $A$ 把非零向量 $\mathbf{x}$ 压成了零，原来的方向信息已经丢失。再乘任何矩阵都无法从零向量恢复出原来的非零向量。

## 十二、把求逆矩阵拆成多个方程组

现在取一个可逆矩阵：

$$
A=
\begin{bmatrix}
1&3\\
2&7
\end{bmatrix}.
$$

其行列式为：

$$
\begin{aligned}
\det A
&=1(7)-3(2)\\
&=7-6\\
&=1.
\end{aligned}
$$

行列式非零。两列 $(1,2)^T$ 与 $(3,7)^T$ 也不共线，因此相信它可逆。

要求矩阵 $A^{-1}$，使得：

$$
AA^{-1}=I.
$$

把逆矩阵的四元素暂时写成：

$$
A^{-1}=
\begin{bmatrix}
a&c\\
b&d
\end{bmatrix}.
$$

单位矩阵为：

$$
I=
\begin{bmatrix}
1&0\\
0&1
\end{bmatrix}.
$$

### 12.1 第一列对应一个方程组

矩阵乘法的列观点告诉我们：结果第一列等于 $A$ 乘 $A^{-1}$ 的第一列。

因此：

$$
A
\begin{bmatrix}
a\\b
\end{bmatrix}
=
\begin{bmatrix}
1\\0
\end{bmatrix}.
$$

代入 $A$：

$$
\begin{bmatrix}
1&3\\
2&7
\end{bmatrix}
\begin{bmatrix}
a\\b
\end{bmatrix}
=
\begin{bmatrix}
1\\0
\end{bmatrix}.
$$

逐行写出：

$$
\begin{cases}
a+3b=1,\\
2a+7b=0.
\end{cases}
$$

解出 $a,b$，就得到逆矩阵的第一列。

### 12.2 第二列对应另一个方程组

同理：

$$
A
\begin{bmatrix}
c\\d
\end{bmatrix}
=
\begin{bmatrix}
0\\1
\end{bmatrix}.
$$

代入 $A$：

$$
\begin{bmatrix}
1&3\\
2&7
\end{bmatrix}
\begin{bmatrix}
c\\d
\end{bmatrix}
=
\begin{bmatrix}
0\\1
\end{bmatrix}.
$$

逐行写出：

$$
\begin{cases}
c+3d=0,\\
2c+7d=1.
\end{cases}
$$

解出 $c,d$，就得到逆矩阵的第二列。

### 12.3 一般形式

对一般的 $n\times n$ 矩阵，若 $\mathbf{x}_j$ 是 $A^{-1}$ 的第 $j$ 列，$\mathbf{e}_j$ 是单位矩阵的第 $j$ 列，则：

$$
\boxed{A\mathbf{x}_j=\mathbf{e}_j}.
$$

求逆矩阵相当于同时求解 $n$ 个方程组：

- 左侧系数矩阵全部是 $A$；
- 右侧向量依次是 $\mathbf{e}_1,\mathbf{e}_2,\ldots,\mathbf{e}_n$；
- 解向量依次组成 $A^{-1}$ 的各列。

既然它们使用同一个 $A$，就没有必要把消元过程重复写 $n$ 次。高斯–若尔当法把这些方程组一起处理。

## 十三、高斯若尔当法求逆矩阵

### 13.1 同时附上两个右侧向量

第一个方程组的右侧是：

$$
\begin{bmatrix}1\\0\end{bmatrix},
$$

第二个方程组的右侧是：

$$
\begin{bmatrix}0\\1\end{bmatrix}.
$$

把它们同时附在 $A$ 的右侧：

$$
\left[
\begin{array}{cc|cc}
1&3&1&0\\
2&7&0&1
\end{array}
\right].
$$

这就是：

$$
\boxed{[A\mid I]}.
$$

接下来对整个长矩阵做行操作，目标是让左半部分从 $A$ 变成 $I$：

$$
[A\mid I]\longrightarrow[I\mid A^{-1}].
$$

### 13.2 第一步：向下消元

第一个主元是 $1$。第二行第一列为 $2$，所以乘数为：

$$
\ell_{21}=\frac{2}{1}=2.
$$

执行：

$$
R_2\leftarrow R_2-2R_1.
$$

对整条第二行计算，包括竖线右侧：

$$
\begin{aligned}
R_2-2R_1
&=
\begin{bmatrix}2&7&0&1\end{bmatrix}
-2\begin{bmatrix}1&3&1&0\end{bmatrix}\\
&=
\begin{bmatrix}2&7&0&1\end{bmatrix}
-\begin{bmatrix}2&6&2&0\end{bmatrix}\\
&=
\begin{bmatrix}
2-2&7-6&0-2&1-0
\end{bmatrix}\\
&=
\begin{bmatrix}0&1&-2&1\end{bmatrix}.
\end{aligned}
$$

第一行保持不变，所以矩阵变为：

$$
\left[
\begin{array}{cc|cc}
1&3&1&0\\
0&1&-2&1
\end{array}
\right].
$$

左半部分已经是上三角矩阵。普通高斯消元此时可以停止向下消元，再进行回代；若尔当步骤继续向上消元，直接把左侧化成单位矩阵。

### 13.3 第二步：向上消元

当前左半部分为：

$$
\begin{bmatrix}
1&3\\
0&1
\end{bmatrix}.
$$

第二个主元是 $1$，第一行第二列为 $3$。为了消去这个 $3$，执行：

$$
R_1\leftarrow R_1-3R_2.
$$

完整计算：

$$
\begin{aligned}
R_1-3R_2
&=
\begin{bmatrix}1&3&1&0\end{bmatrix}
-3\begin{bmatrix}0&1&-2&1\end{bmatrix}\\
&=
\begin{bmatrix}1&3&1&0\end{bmatrix}
-\begin{bmatrix}0&3&-6&3\end{bmatrix}\\
&=
\begin{bmatrix}
1-0&3-3&1-(-6)&0-3
\end{bmatrix}\\
&=
\begin{bmatrix}1&0&7&-3\end{bmatrix}.
\end{aligned}
$$

其中右侧第一个数单独核对：

$$
1-3(-2)=1-(-6)=1+6=7.
$$

第二行保持不变，所以最终得到：

$$
\boxed{
\left[
\begin{array}{cc|cc}
1&0&7&-3\\
0&1&-2&1
\end{array}
\right]}.
$$

左半部分已经成为单位矩阵，右半部分就是逆矩阵：

$$
\boxed{
A^{-1}=
\begin{bmatrix}
7&-3\\
-2&1
\end{bmatrix}}.
$$

### 13.4 回代检查两个方程组的解

前面把逆矩阵写为：

$$
A^{-1}=
\begin{bmatrix}
a&c\\
b&d
\end{bmatrix}.
$$

与求出的结果对照：

$$
a=7,
\qquad
b=-2,
\qquad
c=-3,
\qquad
d=1.
$$

检查第一列对应的方程组：

$$
a+3b=7+3(-2)=7-6=1,
$$

$$
2a+7b=2(7)+7(-2)=14-14=0.
$$

所以：

$$
A
\begin{bmatrix}7\\-2\end{bmatrix}
=
\begin{bmatrix}1\\0\end{bmatrix}.
$$

检查第二列对应的方程组：

$$
c+3d=-3+3(1)=-3+3=0,
$$

$$
2c+7d=2(-3)+7(1)=-6+7=1.
$$

所以：

$$
A
\begin{bmatrix}-3\\1\end{bmatrix}
=
\begin{bmatrix}0\\1\end{bmatrix}.
$$

两列都正确。

### 13.5 直接做矩阵乘法检验

计算 $A^{-1}A$：

$$
A^{-1}A
=
\begin{bmatrix}
7&-3\\
-2&1
\end{bmatrix}
\begin{bmatrix}
1&3\\
2&7
\end{bmatrix}.
$$

第一行第一列：

$$
7(1)+(-3)(2)=7-6=1.
$$

第一行第二列：

$$
7(3)+(-3)(7)=21-21=0.
$$

第二行第一列：

$$
-2(1)+1(2)=-2+2=0.
$$

第二行第二列：

$$
-2(3)+1(7)=-6+7=1.
$$

所以：

$$
\boxed{
A^{-1}A=
\begin{bmatrix}
1&0\\
0&1
\end{bmatrix}
=I}.
$$

再计算 $AA^{-1}$：

$$
AA^{-1}
=
\begin{bmatrix}
1&3\\
2&7
\end{bmatrix}
\begin{bmatrix}
7&-3\\
-2&1
\end{bmatrix}.
$$

第一行第一列：

$$
1(7)+3(-2)=7-6=1.
$$

第一行第二列：

$$
1(-3)+3(1)=-3+3=0.
$$

第二行第一列：

$$
2(7)+7(-2)=14-14=0.
$$

第二行第二列：

$$
2(-3)+7(1)=-6+7=1.
$$

因此：

$$
\boxed{AA^{-1}=I}.
$$

两个方向的乘法都验证通过。

## 十四、为什么右侧会变成逆矩阵

高斯–若尔当法的机械步骤已经清楚，但教授继续追问：为什么左边变成 $I$ 时，右边恰好是 $A^{-1}$？

### 14.1 把两步操作写成矩阵

第一步是：

$$
R_2\leftarrow R_2-2R_1.
$$

对应的初等矩阵为：

$$
E_{21}=
\begin{bmatrix}
1&0\\
-2&1
\end{bmatrix}.
$$

第二步是：

$$
R_1\leftarrow R_1-3R_2.
$$

对应的初等矩阵为：

$$
E_{12}=
\begin{bmatrix}
1&-3\\
0&1
\end{bmatrix}.
$$

全部行操作合并为：

$$
E=E_{12}E_{21}.
$$

实际计算：

$$
\begin{aligned}
E
&=
\begin{bmatrix}
1&-3\\
0&1
\end{bmatrix}
\begin{bmatrix}
1&0\\
-2&1
\end{bmatrix}\\
&=
\begin{bmatrix}
1(1)+(-3)(-2)&1(0)+(-3)(1)\\
0(1)+1(-2)&0(0)+1(1)
\end{bmatrix}\\
&=
\begin{bmatrix}
1+6&0-3\\
0-2&0+1
\end{bmatrix}\\
&=
\begin{bmatrix}
7&-3\\
-2&1
\end{bmatrix}.
\end{aligned}
$$

### 14.2 对整个增广矩阵左乘 E

每一次行操作都同时作用于长矩阵的左右两半，所以整个过程可以写成：

$$
E[A\mid I].
$$

分块乘法给出：

$$
E[A\mid I]=[EA\mid EI].
$$

因为：

$$
EA=I,
$$

并且：

$$
EI=E,
$$

所以：

$$
[EA\mid EI]=[I\mid E].
$$

而 $EA=I$ 正好说明：

$$
E=A^{-1}.
$$

因此：

$$
\boxed{E[A\mid I]=[I\mid A^{-1}]}.
$$

这就是高斯–若尔当法的原理：

- 左半边记录 $EA$，最后成为 $I$；
- 右半边记录 $EI$，最后成为 $E$；
- 因为 $EA=I$，这个 $E$ 就是 $A^{-1}$。

## 十五、原课收尾

本讲先学习了矩阵乘法的五种理解方式：

1. 元素公式：$c_{ij}=\sum_k a_{ik}b_{kj}$；
2. 按列：$C$ 的列是 $A$ 各列的组合；
3. 按行：$C$ 的行是 $B$ 各行的组合；
4. 列乘行：$AB=\sum_k\mathbf{a}_k\mathbf{b}_{k*}$；
5. 分块乘法。

随后学习了逆矩阵：

- 可逆矩阵满足 $A^{-1}A=AA^{-1}=I$；
- 如果存在非零 $\mathbf{x}$ 使 $A\mathbf{x}=\mathbf{0}$，则 $A$ 不可逆；
- 求逆矩阵可以拆成求解 $A\mathbf{x}_j=\mathbf{e}_j$；
- 高斯–若尔当法同时求解这些方程组：
  $$
  \boxed{[A\mid I]\longrightarrow[I\mid A^{-1}]}.
  $$

课堂矩阵的最终结果为：

$$
\boxed{
\begin{bmatrix}
1&3\\
2&7
\end{bmatrix}^{-1}
=
\begin{bmatrix}
7&-3\\
-2&1
\end{bmatrix}}.
$$

## 十六、课后练习

### 练习 1：用两种方式计算矩阵乘法

设：

$$
A=
\begin{bmatrix}
1&2\\
3&4
\end{bmatrix},
\qquad
B=
\begin{bmatrix}
2&0\\
1&3
\end{bmatrix}.
$$

#### 方法一：逐个元素计算

第一行第一列：

$$
1(2)+2(1)=2+2=4.
$$

第一行第二列：

$$
1(0)+2(3)=0+6=6.
$$

第二行第一列：

$$
3(2)+4(1)=6+4=10.
$$

第二行第二列：

$$
3(0)+4(3)=0+12=12.
$$

所以：

$$
AB=
\begin{bmatrix}
4&6\\
10&12
\end{bmatrix}.
$$

#### 方法二：列乘行再相加

$A$ 的第一列乘 $B$ 的第一行：

$$
\begin{bmatrix}1\\3\end{bmatrix}
\begin{bmatrix}2&0\end{bmatrix}
=
\begin{bmatrix}
1(2)&1(0)\\
3(2)&3(0)
\end{bmatrix}
=
\begin{bmatrix}
2&0\\
6&0
\end{bmatrix}.
$$

$A$ 的第二列乘 $B$ 的第二行：

$$
\begin{bmatrix}2\\4\end{bmatrix}
\begin{bmatrix}1&3\end{bmatrix}
=
\begin{bmatrix}
2(1)&2(3)\\
4(1)&4(3)
\end{bmatrix}
=
\begin{bmatrix}
2&6\\
4&12
\end{bmatrix}.
$$

相加：

$$
\begin{aligned}
AB
&=
\begin{bmatrix}
2&0\\
6&0
\end{bmatrix}
+
\begin{bmatrix}
2&6\\
4&12
\end{bmatrix}\\
&=
\begin{bmatrix}
2+2&0+6\\
6+4&0+12
\end{bmatrix}\\
&=
\begin{bmatrix}
4&6\\
10&12
\end{bmatrix}.
\end{aligned}
$$

两种方法结果相同。

### 练习 2：证明矩阵不可逆

设：

$$
A=
\begin{bmatrix}
2&4\\
1&2
\end{bmatrix}.
$$

取非零向量：

$$
\mathbf{x}=
\begin{bmatrix}
2\\-1
\end{bmatrix}.
$$

计算：

$$
\begin{aligned}
A\mathbf{x}
&=
\begin{bmatrix}
2&4\\
1&2
\end{bmatrix}
\begin{bmatrix}
2\\-1
\end{bmatrix}\\
&=
\begin{bmatrix}
2(2)+4(-1)\\
1(2)+2(-1)
\end{bmatrix}\\
&=
\begin{bmatrix}
4-4\\
2-2
\end{bmatrix}\\
&=
\begin{bmatrix}
0\\0
\end{bmatrix}.
\end{aligned}
$$

假设 $A^{-1}$ 存在，则：

$$
A^{-1}(A\mathbf{x})=A^{-1}\mathbf{0}.
$$

左边为：

$$
(A^{-1}A)\mathbf{x}=I\mathbf{x}=\mathbf{x},
$$

右边为：

$$
A^{-1}\mathbf{0}=\mathbf{0}.
$$

这会推出 $\mathbf{x}=\mathbf{0}$，与 $\mathbf{x}=(2,-1)^T\neq\mathbf{0}$ 矛盾。

所以 $A$ 不可逆。

### 练习 3：用高斯–若尔当法求逆矩阵

求：

$$
A=
\begin{bmatrix}
2&1\\
1&1
\end{bmatrix}
$$

的逆矩阵。

#### 第一步：写出增广矩阵

$$
\left[
\begin{array}{cc|cc}
2&1&1&0\\
1&1&0&1
\end{array}
\right].
$$

为了得到主元 $1$，交换两行：

$$
R_1\leftrightarrow R_2.
$$

得到：

$$
\left[
\begin{array}{cc|cc}
1&1&0&1\\
2&1&1&0
\end{array}
\right].
$$

#### 第二步：消去第二行第一列

执行：

$$
R_2\leftarrow R_2-2R_1.
$$

完整计算：

$$
\begin{aligned}
R_2-2R_1
&=
\begin{bmatrix}2&1&1&0\end{bmatrix}
-2\begin{bmatrix}1&1&0&1\end{bmatrix}\\
&=
\begin{bmatrix}2&1&1&0\end{bmatrix}
-\begin{bmatrix}2&2&0&2\end{bmatrix}\\
&=
\begin{bmatrix}0&-1&1&-2\end{bmatrix}.
\end{aligned}
$$

得到：

$$
\left[
\begin{array}{cc|cc}
1&1&0&1\\
0&-1&1&-2
\end{array}
\right].
$$

#### 第三步：把第二个主元变成 1

执行：

$$
R_2\leftarrow(-1)R_2.
$$

逐项计算：

$$
(-1)
\begin{bmatrix}0&-1&1&-2\end{bmatrix}
=
\begin{bmatrix}0&1&-1&2\end{bmatrix}.
$$

得到：

$$
\left[
\begin{array}{cc|cc}
1&1&0&1\\
0&1&-1&2
\end{array}
\right].
$$

#### 第四步：消去第一行第二列

执行：

$$
R_1\leftarrow R_1-R_2.
$$

完整计算：

$$
\begin{aligned}
R_1-R_2
&=
\begin{bmatrix}1&1&0&1\end{bmatrix}
-\begin{bmatrix}0&1&-1&2\end{bmatrix}\\
&=
\begin{bmatrix}
1-0&1-1&0-(-1)&1-2
\end{bmatrix}\\
&=
\begin{bmatrix}1&0&1&-1\end{bmatrix}.
\end{aligned}
$$

最终：

$$
\left[
\begin{array}{cc|cc}
1&0&1&-1\\
0&1&-1&2
\end{array}
\right].
$$

所以：

$$
\boxed{
A^{-1}=
\begin{bmatrix}
1&-1\\
-1&2
\end{bmatrix}}.
$$

#### 第五步：检验

$$
AA^{-1}
=
\begin{bmatrix}
2&1\\
1&1
\end{bmatrix}
\begin{bmatrix}
1&-1\\
-1&2
\end{bmatrix}.
$$

逐项计算：

$$
2(1)+1(-1)=2-1=1,
$$

$$
2(-1)+1(2)=-2+2=0,
$$

$$
1(1)+1(-1)=1-1=0,
$$

$$
1(-1)+1(2)=-1+2=1.
$$

所以：

$$
AA^{-1}
=
\begin{bmatrix}
1&0\\
0&1
\end{bmatrix}
=I.
$$

## 十七、视频时间索引

以下时间点依据本地下载版本的字幕整理，顺序与正文一致：

| 时间 | 教授的授课内容 |
|---|---|
| 00:00:08 | 矩阵乘法与逆矩阵导言 |
| 00:00:48 | 第一种乘法：逐个元素 |
| 00:01:37 | 以 $c_{34}$ 为例 |
| 00:03:33 | 用求和符号写出元素公式 |
| 00:04:38 | 矩阵形状与可乘条件 |
| 00:06:15 | 第二种乘法：按列 |
| 00:09:01 | 结果的列是 $A$ 各列的组合 |
| 00:10:09 | 第三种乘法：按行 |
| 00:10:37 | 结果的行是 $B$ 各行的组合 |
| 00:11:39 | 第四种乘法：列乘行 |
| 00:13:28 | 计算 $(2,3,4)^T[1,6]$ |
| 00:14:29 | 结果各行、各列的倍数关系 |
| 00:15:15 | 完整的列乘行求和公式 |
| 00:15:40 | 两列、两行的完整示例 |
| 00:17:12 | 行空间与列空间都是直线 |
| 00:18:23 | 第五种乘法：分块乘法 |
| 00:19:54 | 结果左上角为 $A_1B_1+A_2B_3$ |
| 00:21:22 | 开始逆矩阵 |
| 00:22:12 | 逆矩阵存在的条件与定义 |
| 00:23:10 | 方阵的左逆也是右逆 |
| 00:24:17 | 奇异矩阵与不可逆 |
| 00:25:02 | 矩阵 $[1,3;2,6]$ 没有逆 |
| 00:25:45 | 行列式为零与两列共线 |
| 00:27:37 | 通过 $A\mathbf{x}=\mathbf{0}$ 判断不可逆 |
| 00:29:09 | 非零解 $(3,-1)^T$ |
| 00:29:42 | 假设有逆并推出矛盾 |
| 00:31:57 | 可逆矩阵 $[1,3;2,7]$ |
| 00:33:19 | 按列拆分 $AA^{-1}=I$ |
| 00:35:55 | 高斯–若尔当：同时解多个方程组 |
| 00:37:36 | 在 $A$ 右侧附加两个右侧向量 |
| 00:38:32 | 目标 $[A\mid I]\to[I\mid A^{-1}]$ |
| 00:39:14 | 第一步：第二行减两倍第一行 |
| 00:39:53 | 若尔当继续向上消元 |
| 00:40:14 | 第二步：第一行减三倍第二行 |
| 00:41:00 | 得到逆矩阵 |
| 00:41:50 | 矩阵乘法检验 |
| 00:42:43 | 追问为什么右侧是逆矩阵 |
| 00:43:30 | 用消元矩阵 $E$ 表示全部行操作 |
| 00:45:09 | $EA=I$，所以 $E=A^{-1}$ |
| 00:45:39 | $EI=E$，右半部分成为逆矩阵 |
| 00:46:14 | 原课总结与结束 |
