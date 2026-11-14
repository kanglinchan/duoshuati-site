# 第 1 讲 · 线性方程的几何意义

> 对应 MIT 18.06《Linear Algebra》Lecture 1：*The Geometry of Linear Equations*（Gilbert Strang）。
> 这是这门课的中文学习笔记：知识点跟原课对齐，讲法和例子按中文读者的习惯重新组织。

先说一个尴尬的事实。中学我们都解过二元一次方程组：代入、消元，两分钟交卷。可一旦未知数变成三个、九个、九百万个——电路仿真、图像处理、机器学习里到处是这种规模的问题——中学那套手法不仅慢，而且你算完也说不清自己到底干了什么。

这一讲不教新的计算技巧，而是换一种眼光。读完这篇，你能做到三件事：

1. 把任意线性方程组写成 $A\mathbf{x}=\mathbf{b}$ 的矩阵形式；
2. 用"行图像"和"列图像"两种几何方式理解它的解；
3. 回答一个贯穿全课程的问题：什么样的方程组，对任何右侧向量都有解。

两点边界先说清楚。本文只讨论方程个数等于未知数个数的方阵情形，这是原课的主线；至于怎么把解真正"算"出来，那是第 2 讲消元法的事，这一讲只负责看懂。

## 1. 从一个你算过的方程组开始

场景很简单：考卷上写着

$$
\begin{cases}
2x-y=0\\
-x+2y=3
\end{cases}
$$

两个方程，两个未知数。你当年会消元，两分钟解完。现在把同一个方程组原样翻译成矩阵语言，看它变成什么。

把 $x$、$y$ 的系数按原来的位置抄下来，排成一张数表：

$$
A=\begin{bmatrix}2&-1\\-1&2\end{bmatrix}
$$

这张表就是**矩阵（matrix）**：把数按行、按列排成的矩形阵列，你可以把它想象成一张只填了数字的 Excel 表。这里两行两列，记录的恰好是方程组的全部系数，所以叫系数矩阵。

两个未知数竖着排成一列，就是一个**向量（vector）**。等号右边同理：

$$
\mathbf{x}=\begin{bmatrix}x\\y\end{bmatrix},
\qquad
\mathbf{b}=\begin{bmatrix}0\\3\end{bmatrix}
$$

$\mathbf{x}$ 装未知数，$\mathbf{b}$ 装右侧常数，叫右侧向量。于是方程组缩写成一行：

$$
A\mathbf{x}=\mathbf{b}
$$

注意，矩阵形式一个数都没改，它只是换了个组织方式。整门 MIT 18.06 都围绕这个式子展开。那么，$A\mathbf{x}=\mathbf{b}$ 该怎么"看"？Strang 给出三种方式：

1. **行图像（row picture）**：一次看一个方程；
2. **列图像（column picture）**：一次看矩阵的一列；
3. 矩阵形式：整体地看 $A\mathbf{x}=\mathbf{b}$。

行图像你其实已经见过——就是初中画的那张图。先从它开始。

## 2. 行图像：每个方程是一条直线

行图像的规则：**每一个方程，画成一个几何对象**。二维里，一个二元一次方程的解集是一条直线。

### 2.1 第一条直线

第一个方程 $2x-y=0$，移项得 $y=2x$。找几个满足它的点：

- 取 $x=0$，得 $y=0$，点 $(0,0)$；
- 取 $x=1$，得 $y=2$，点 $(1,2)$；
- 取 $x=\tfrac12$，得 $y=1$，点 $\left(\tfrac12,1\right)$。

三个点连成一条过原点的直线。这条线上所有点都满足第一个方程。

### 2.2 第二条直线

第二个方程 $-x+2y=3$。同样找点：

- 取 $y=0$，得 $-x=3$，即 $x=-3$，点 $(-3,0)$；
- 取 $x=-1$，得 $1+2y=3$，即 $y=1$，点 $(-1,1)$。

连起来是第二条直线。它不过原点——把 $(0,0)$ 代入，左边得 $0$，不等于 $3$。

### 2.3 解就是交点

方程组的解必须同时满足两个方程，落在两条直线上，所以解 = 两条直线的公共点。把 $y=2x$ 代入第二个方程：

$$
-x+2(2x)=3
\;\Longrightarrow\;
3x=3
\;\Longrightarrow\;
x=1,\quad y=2
$$

代回两个方程检查：$2(1)-2=0$ 成立，$-1+2(2)=3$ 成立。所以解是 $(1,2)$。

![二维行图像：两条直线相交于解 (1, 2)](/assets/images/mit1806/mit1806-01-row-picture.png)

这就是行图像：把每一行看成一个几何对象，解是它们的公共点。二维里是"两条直线交于一点"，故事完整。

## 3. 列图像：把方程组看成"配方问题"

那么，既然行图像这么直观，Strang 为什么说列图像才是本讲最重要的内容？

因为行图像撑不了几维。三维勉强，四维以上彻底画不出来；而列图像可以一直工作到九维、九百万维。后面会反复用到它。

### 3.1 按列重写同一个方程组

把系数换个方向拆：$x$ 的两个系数归成一列，$y$ 的两个系数归成另一列，原方程组变成

$$
x\begin{bmatrix}2\\-1\end{bmatrix}
+y\begin{bmatrix}-1\\2\end{bmatrix}
=\begin{bmatrix}0\\3\end{bmatrix}
$$

这两个列向量恰好是矩阵 $A$ 的两列，记作 $\mathbf{a}_1$ 和 $\mathbf{a}_2$。方程组于是写成

$$
x\mathbf{a}_1+y\mathbf{a}_2=\mathbf{b}
$$

用大白话说就是：**取几份第 1 列、取几份第 2 列，才能拼出 $\mathbf{b}$？**解方程组，从"找两条线的交点"变成了"找正确的配方比例"。

### 3.2 线性组合：本讲最重要的概念

形如 $x\mathbf{a}_1+y\mathbf{a}_2$ 的表达式，叫作向量 $\mathbf{a}_1,\mathbf{a}_2$ 的**线性组合（linear combination）**。它只允许两种操作：用数去乘向量，再把结果相加。

线性组合之于向量，就像加减乘之于数字——是最基本的合法操作。求 $A\mathbf{x}=\mathbf{b}$ 的解，等价于问：$\mathbf{b}$ 能不能由 $A$ 的各列线性组合出来？系数是多少？

### 3.3 把两个列向量画出来

$\mathbf{a}_1=\begin{bmatrix}2\\-1\end{bmatrix}$：从原点出发，向右 2、向下 1，箭头落在 $(2,-1)$。

$\mathbf{a}_2=\begin{bmatrix}-1\\2\end{bmatrix}$：从原点出发，向左 1、向上 2，箭头落在 $(-1,2)$。

注意行图像和列图像画的东西完全不同：行图像画的是"满足方程的点集"（两条直线），列图像画的是"参与组合的向量本身"（两个箭头）。同一组方程，两幅不相干的图。

### 3.4 正确的配方：一份 a₁ 加两份 a₂

行图像已经算出 $x=1$、$y=2$，所以列图像里正确的组合是 $1\mathbf{a}_1+2\mathbf{a}_2$。验证：

$$
1\begin{bmatrix}2\\-1\end{bmatrix}
+2\begin{bmatrix}-1\\2\end{bmatrix}
=\begin{bmatrix}2\\-1\end{bmatrix}
+\begin{bmatrix}-2\\4\end{bmatrix}
=\begin{bmatrix}0\\3\end{bmatrix}
=\mathbf{b}
$$

### 3.5 向量加法的"首尾相接"看法

向量相加还有一个几何读法：把第二个向量的尾巴接到第一个向量的头上。

1. 从原点 $(0,0)$ 走一份 $\mathbf{a}_1=(2,-1)$，到达 $(2,-1)$；
2. 接一份 $\mathbf{a}_2=(-1,2)$，到达 $(1,1)$；
3. 再接一份 $\mathbf{a}_2$，到达 $(0,3)$，正好是 $\mathbf{b}$。

完整路线：

$$
(0,0)\;\xrightarrow{\;+\mathbf{a}_1\;}\;(2,-1)\;\xrightarrow{\;+\mathbf{a}_2\;}\;(1,1)\;\xrightarrow{\;+\mathbf{a}_2\;}\;(0,3)
$$

一份第一列、两份第二列，首尾相接，终点恰好落在 $\mathbf{b}$ 上。

![二维列图像（动态）：从原点出发，先加一份 a₁，再加两份 a₂，首尾相接抵达 b](/assets/images/mit1806/mit1806-01-column-picture.gif)

![二维列图像（静态）：一份 a₁ 加两份 a₂ 合成 b=(0, 3)](/assets/images/mit1806/mit1806-01-column-picture.png)

## 4. 追问：所有线性组合能覆盖多大的地方

接下来是原课里反复出现的问题：**如果 $x$、$y$ 不止取 $1$ 和 $2$，而是取遍所有实数，$x\mathbf{a}_1+y\mathbf{a}_2$ 能到达平面上的哪些点？**

直觉说"到处都能到"，我们用代数验证。任取一个右侧向量 $\mathbf{b}=\begin{bmatrix}b_1\\b_2\end{bmatrix}$，解方程组

$$
\begin{cases}
2x-y=b_1\\
-x+2y=b_2
\end{cases}
$$

由第一个方程得 $y=2x-b_1$，代入第二个方程：

$$
-x+2(2x-b_1)=b_2
\;\Longrightarrow\;
3x=b_2+2b_1
$$

于是

$$
x=\frac{2b_1+b_2}{3},
\qquad
y=\frac{b_1+2b_2}{3}
$$

不管 $b_1,b_2$ 是多少，这两个公式都给出解。也就是说，**任何右侧向量都能被这两列组合出来**——两个列向量的全部线性组合填满整个二维平面。

代回课堂的例子核对：$b_1=0$、$b_2=3$ 时，$x=\frac{3}{3}=1$，$y=\frac{6}{3}=2$，与前面一致。

当然，"任何两个向量都填满平面"并不成立——如果两列共线，组合只能填一条直线。这个反面情形第 9 节会展开。

## 5. 升级到三维

二维看得清清楚楚，加一维试试。三个方程、三个未知数：

$$
\begin{cases}
2x-y=0\\
-x+2y-z=-1\\
-3y+4z=4
\end{cases}
$$

第三个方程没写 $x$，补一个零系数 $0x-3y+4z=4$，然后照抄矩阵形式：

$$
A=\begin{bmatrix}2&-1&0\\-1&2&-1\\0&-3&4\end{bmatrix},
\qquad
\mathbf{x}=\begin{bmatrix}x\\y\\z\end{bmatrix},
\qquad
\mathbf{b}=\begin{bmatrix}0\\-1\\4\end{bmatrix}
$$

还是 $A\mathbf{x}=\mathbf{b}$。此时解还不知道，行图像和列图像各看一遍。

## 6. 三维行图像：三个平面

行图像的升维规律很整齐：二维中一个方程对应一条直线，三维中一个方程对应一个平面。

### 6.1 先看第二个方程

$-x+2y-z=-1$ 的解集是一个平面。找三个点确认它的位置：

- $(1,0,0)$：$-1+0-0=-1$，满足；
- $(0,0,1)$：$-0+0-1=-1$，满足；
- $\left(0,-\tfrac12,0\right)$：$-0+2\left(-\tfrac12\right)-0=-1$，满足。

三个不共线的点确定一个平面。原点 $(0,0,0)$ 不在其中，因为代入得 $0\neq-1$。

### 6.2 另外两个方程

第一个方程 $2x-y=0$ 没写 $z$，等价于 $2x-y+0z=0$：只要 $x,y$ 满足 $2x=y$，$z$ 随便取。所以它的解集也是一个平面。第三个方程 $-3y+4z=4$ 同理。

### 6.3 三个平面怎么交

一般情形：第一个平面和第二个平面相交于一条直线；这条直线再穿过第三个平面，交出一个点。这个公共点就是方程组的解。本例的公共点是 $(0,0,1)$，下一节用列图像直接看出它。

![三维行图像：三张平面交于解 (0, 0, 1)](/assets/images/mit1806/mit1806-01-3d-row-picture.png)

三维行图像到这里就有点吃力了：平面不好画，交线交点更靠想象。那么四维呢？四维中一个方程对应一个"超平面"，根本无法作图。行图像到三维为止——这是必须掌握列图像的第一个理由。

## 7. 三维列图像：这个例子能一眼看出解

把三维方程组按列拆开：

$$
x\begin{bmatrix}2\\-1\\0\end{bmatrix}
+y\begin{bmatrix}-1\\2\\-3\end{bmatrix}
+z\begin{bmatrix}0\\-1\\4\end{bmatrix}
=\begin{bmatrix}0\\-1\\4\end{bmatrix},
\qquad\text{即}\quad
x\mathbf{a}_1+y\mathbf{a}_2+z\mathbf{a}_3=\mathbf{b}
$$

仔细看：第三列 $\mathbf{a}_3=\begin{bmatrix}0\\-1\\4\end{bmatrix}$ 和右侧向量 $\mathbf{b}$ 一模一样。所以取零份 $\mathbf{a}_1$、零份 $\mathbf{a}_2$、一份 $\mathbf{a}_3$，直接命中：

$$
0\mathbf{a}_1+0\mathbf{a}_2+1\mathbf{a}_3=\mathbf{b}
\;\Longrightarrow\;
(x,y,z)=(0,0,1)
$$

代回三个方程检验：$2(0)-0=0$；$-0+2(0)-1=-1$；$-3(0)+4(1)=4$。全部成立，$(0,0,1)$ 同时也是行图像里三个平面的公共点。

这个例子是特别设计的——$\mathbf{b}$ 恰好等于第三列。真实问题没有这种巧合，所以需要一门系统的算法，就是第 2 讲的消元法。

## 8. 固定矩阵，换一个右侧向量

保持三个列向量不动，把右侧换掉。令 $\mathbf{b}'$ 等于第一列加第二列：

$$
\mathbf{b}'=\mathbf{a}_1+\mathbf{a}_2
=\begin{bmatrix}2\\-1\\0\end{bmatrix}
+\begin{bmatrix}-1\\2\\-3\end{bmatrix}
=\begin{bmatrix}1\\1\\-3\end{bmatrix}
$$

新方程组 $A\mathbf{x}=\mathbf{b}'$ 的解不用算——因为 $\mathbf{b}'=1\mathbf{a}_1+1\mathbf{a}_2+0\mathbf{a}_3$，配方比例直接写在脸上：

$$
(x,y,z)=(1,1,0)
$$

代回检验：$2(1)-1=1$；$-1+2(1)-0=1$；$-3(1)+4(0)=-3$，得到 $\begin{bmatrix}1\\1\\-3\end{bmatrix}=\mathbf{b}'$，正确。

同一件事在两种图像里样子完全不同。行图像：三个平面的位置全变了，交点从 $(0,0,1)$ 挪到 $(1,1,0)$。列图像：三个箭头原地不动，只是拼图目标从 $\mathbf{b}$ 换成了 $\mathbf{b}'$。"矩阵固定、右侧随便换"这类问题，列图像明显更省力。

## 9. 大问题：什么时候对每个 b 都有解

现在提出本讲的核心问题：

$$
\text{对每一个 }\mathbf{b}\text{，方程 }A\mathbf{x}=\mathbf{b}\text{ 都有解吗？}
$$

注意这不是问"怎么算"，而是问"是否存在"。用列图像的语言重述一遍：

> $A$ 的三个列向量，所有线性组合能否填满整个三维空间？

两件事完全等价："$\mathbf{b}$ 有解"就是"$\mathbf{b}$ 能被各列组合出来"；每个 $\mathbf{b}$ 都有解，就是组合能覆盖整个空间。

### 9.1 良好情况：非奇异

本讲的三维例子属于良好情况，答案是肯定的。这样的矩阵称为**非奇异矩阵（non-singular matrix）**，也叫**可逆矩阵（invertible matrix）**——"可逆"的含义到第 3 讲会讲清楚，这里先记住：方阵列向量方向齐全，任何 $\mathbf{b}$ 都组合得出来，且解唯一。

### 9.2 反面情况：列向量挤在低维空间里

什么时候填不满？第一种情形：三个列向量全落在同一个过原点的平面里。数乘和加法都出不了这个平面，所以组合永远被困在里面——平面外的 $\mathbf{b}$ 一律无解。

最典型的例子是第三列本身就是前两列之和，$\mathbf{a}_3=\mathbf{a}_1+\mathbf{a}_2$。把它代入任意组合：

$$
x\mathbf{a}_1+y\mathbf{a}_2+z\mathbf{a}_3
=(x+z)\mathbf{a}_1+(y+z)\mathbf{a}_2
$$

表面上有三个未知数，实际只有两个自由的方向。第三列没有提供任何新位置。这样的矩阵是**奇异的（singular）**、不可逆的。

### 9.3 推广到九维

把想象力推到九个方程、九个未知数：矩阵有九列，每列是九维空间 $\mathbb{R}^9$ 里的向量，目标是组合出九维的 $\mathbf{b}$。问题原样照抄：这九列的组合能否填满 $\mathbb{R}^9$？

如果九列提供九个独立方向，可以填满。但如果第九列和第八列完全相同，$\mathbf{a}_9=\mathbf{a}_8$，合并同类项：

$$
x_8\mathbf{a}_8+x_9\mathbf{a}_9=(x_8+x_9)\mathbf{a}_8
$$

两列合成一个方向，九列实际只有八个方向，组合填不满九维空间。

九维画不出来，但判断方法和二维三维完全一样：数方向。这就是列图像的价值——它把"解方程"变成"数向量方向"，而数方向这件事不需要画图。

## 10. 顺手把工具备齐：矩阵怎么乘向量

最后解决一个具体计算：$A\mathbf{x}$ 到底怎么算。用一个新矩阵：

$$
A=\begin{bmatrix}2&5\\1&3\end{bmatrix},
\qquad
\mathbf{x}=\begin{bmatrix}1\\2\end{bmatrix}
$$

**按列算**：把 $\mathbf{x}$ 看成配方比例，一份第一列加两份第二列：

$$
A\mathbf{x}
=1\begin{bmatrix}2\\1\end{bmatrix}
+2\begin{bmatrix}5\\3\end{bmatrix}
=\begin{bmatrix}2\\1\end{bmatrix}
+\begin{bmatrix}10\\6\end{bmatrix}
=\begin{bmatrix}12\\7\end{bmatrix}
$$

**按行算**：结果的第一行 = 矩阵第一行与 $\mathbf{x}$ 的点积，第二行同理：

$$
A\mathbf{x}
=\begin{bmatrix}
2(1)+5(2)\\
1(1)+3(2)
\end{bmatrix}
=\begin{bmatrix}12\\7\end{bmatrix}
$$

两条路，同一个结果 $(12,7)$。反过来读这个式子也成立：如果右侧恰好是 $\mathbf{b}=\begin{bmatrix}12\\7\end{bmatrix}$，那么方程组 $A\mathbf{x}=\mathbf{b}$ 的解就是 $\begin{bmatrix}1\\2\end{bmatrix}$。

本讲最重要的一句话，就是这两种算法背后的共同结论：

$$
\boxed{\,A\mathbf{x}\ \text{是矩阵 }A\text{ 各列的线性组合}\,}
$$

## 小结

- 同一个方程组有三种看法：行图像（每行一个几何对象）、列图像（各列的线性组合）、矩阵形式 $A\mathbf{x}=\mathbf{b}$。
- 行图像二维是直线交点，三维是平面交点，四维以上失效；列图像不依赖作图，多少维都能用。
- 线性组合 = 数乘向量 + 向量相加；解 $A\mathbf{x}=\mathbf{b}$ 就是找各列的正确配方比例。
- 本例中两个列向量的组合填满整个平面；三个列向量若共面（如 $\mathbf{a}_3=\mathbf{a}_1+\mathbf{a}_2$），组合被困在平面内，矩阵奇异。九维同理：数独立方向。
- 矩阵乘向量可按列（线性组合）或按行（点积）计算，结果一致；核心结论：$A\mathbf{x}$ 是 $A$ 各列的线性组合。

这一讲只回答了"解是什么意思"，还没回答"怎么系统地算出解"。下一篇讲消元法——计算机求解线性方程组时真正在执行的那套流程。

## 练一练

**例 1.** 用行图像和列图像两种方式，求解 $\begin{cases}x+y=4\\x-y=2\end{cases}$。

解. 行图像：两式相加得 $2x=6$，即 $x=3$；代入第一式得 $y=1$。两条直线交于 $(3,1)$。列图像检验：按列写出 $x\begin{bmatrix}1\\1\end{bmatrix}+y\begin{bmatrix}1\\-1\end{bmatrix}=\begin{bmatrix}4\\2\end{bmatrix}$，代入 $(3,1)$：

$$
3\begin{bmatrix}1\\1\end{bmatrix}
+1\begin{bmatrix}1\\-1\end{bmatrix}
=\begin{bmatrix}3\\3\end{bmatrix}
+\begin{bmatrix}1\\-1\end{bmatrix}
=\begin{bmatrix}4\\2\end{bmatrix}
$$

三份第一列加一份第二列，正好拼出右侧向量。

**例 2.** 设 $A=\begin{bmatrix}1&2\\2&4\end{bmatrix}$。哪些右侧向量 $\mathbf{b}$ 能由 $A$ 的两列线性组合出来？

解. 两列是 $\mathbf{a}_1=\begin{bmatrix}1\\2\end{bmatrix}$、$\mathbf{a}_2=\begin{bmatrix}2\\4\end{bmatrix}$，后者是前者的两倍：$\mathbf{a}_2=2\mathbf{a}_1$。任意组合

$$
x\mathbf{a}_1+y\mathbf{a}_2
=(x+2y)\mathbf{a}_1
=(x+2y)\begin{bmatrix}1\\2\end{bmatrix}
$$

第二个分量永远是第一个分量的两倍。所以 $\mathbf{b}=\begin{bmatrix}b_1\\b_2\end{bmatrix}$ 能被组合出来，当且仅当 $b_2=2b_1$：$\begin{bmatrix}3\\6\end{bmatrix}$ 可以，$\begin{bmatrix}3\\7\end{bmatrix}$ 不行。两列只提供一个方向，这个矩阵填不满 $\mathbb{R}^2$。

**例 3.** 分别按列、按行计算 $\begin{bmatrix}1&0&2\\-1&3&1\\0&2&1\end{bmatrix}\begin{bmatrix}2\\1\\-1\end{bmatrix}$。

解. 按列（线性组合）：

$$
2\begin{bmatrix}1\\-1\\0\end{bmatrix}
+1\begin{bmatrix}0\\3\\2\end{bmatrix}
+(-1)\begin{bmatrix}2\\1\\1\end{bmatrix}
=\begin{bmatrix}2\\-2\\0\end{bmatrix}
+\begin{bmatrix}0\\3\\2\end{bmatrix}
+\begin{bmatrix}-2\\-1\\-1\end{bmatrix}
=\begin{bmatrix}0\\0\\1\end{bmatrix}
$$

按行（点积）：第一行 $1(2)+0(1)+2(-1)=0$；第二行 $-1(2)+3(1)+1(-1)=0$；第三行 $0(2)+2(1)+1(-1)=1$。两种算法都得 $\begin{bmatrix}0\\0\\1\end{bmatrix}$。
