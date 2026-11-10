# 第 1 讲：线性方程的几何意义

> 英文标题：The Geometry of Linear Equations  
> 讲师：Gilbert Strang  
> 整理方式：严格按照教授的实际授课顺序，完整展开课堂推导与计算


## 本讲目录

- [一、教授开场：线性代数的基本问题](#一教授开场线性代数的基本问题)
- [二、二维示例：先写出矩阵形式](#二二维示例先写出矩阵形式)
- [三、二维行图像：两条直线相交](#三二维行图像两条直线相交)
- [四、二维列图像：组合两个列向量](#四二维列图像组合两个列向量)
- [五、所有线性组合能覆盖哪里](#五所有线性组合能覆盖哪里)
- [六、三维示例：写出方程和矩阵](#六三维示例写出方程和矩阵)
- [七、三维行图像：三个平面相交](#七三维行图像三个平面相交)
- [八、三维列图像：组合三个列向量](#八三维列图像组合三个列向量)
- [九、保持矩阵不变，改变右侧向量](#九保持矩阵不变改变右侧向量)
- [十、能否对每一个右侧向量求解](#十能否对每一个右侧向量求解)
- [十一、什么时候无法得到每一个右侧向量](#十一什么时候无法得到每一个右侧向量)
- [十二、推广到九维空间](#十二推广到九维空间)
- [十三、矩阵乘向量的两种方式](#十三矩阵乘向量的两种方式)
- [十四、原课收尾](#十四原课收尾)
- [十五、课后练习](#十五课后练习)
- [十六、视频时间索引](#十六视频时间索引)

## 一、教授开场：线性代数的基本问题

教授首先介绍课程使用 *Introduction to Linear Algebra* 作为教材，并说明课程网站会提供习题、课程安排和相关代码。

随后进入本讲主题：

> **线性代数的基本问题之一，是求解线性方程组。**

本讲先考虑一种整齐的情况：

$$
n\text{ 个方程},\qquad n\text{ 个未知数}.
$$

也就是方程个数与未知数个数相等。

教授准备用三种方式观察同一个问题：

1. **行图像（row picture）**：一次看一个方程；
2. **列图像（column picture）**：一次看矩阵的一列；
3. **矩阵形式（matrix form）**：把整个方程组写成 $A\mathbf{x}=\mathbf{b}$。

其中列图像是本讲最重要的内容。

## 二、二维示例：先写出矩阵形式

教授先给出两个方程、两个未知数：

$$
\begin{cases}
2x-y=0,\
-x+2y=3.
\end{cases}
$$

虽然接下来要画几何图像，但教授先把矩阵形式写出来。

### 2.1 系数矩阵

把未知数的系数按原来的位置排列：

- 第一行记录 $2x-y$ 的系数 $2,-1$；
- 第二行记录 $-x+2y$ 的系数 $-1,2$。

得到：

$$
A=
\begin{bmatrix}
2&-1\\
-1&2
\end{bmatrix}.
$$

矩阵就是一个按行、列排列的矩形数表。这里有两行、两列，所以是二阶方阵。

### 2.2 未知向量与右侧向量

两个未知数组成向量：

$$
\mathbf{x}=
\begin{bmatrix}
x\\y
\end{bmatrix}.
$$

等号右侧的两个常数组成向量：

$$
\mathbf{b}=
\begin{bmatrix}
0\\3
\end{bmatrix}.
$$

于是原方程组可以写成：

$$
\boxed{A\mathbf{x}=\mathbf{b}}.
$$

代入具体符号就是：

$$
\begin{bmatrix}
2&-1\\
-1&2
\end{bmatrix}
\begin{bmatrix}
x\\y
\end{bmatrix}
=
\begin{bmatrix}
0\\3
\end{bmatrix}.
$$

矩阵形式没有改变方程，只是改变了组织方式。接下来分别从这个矩阵的行和列观察它。

## 三、二维行图像：两条直线相交

### 3.1 画第一个方程对应的直线

第一个方程是：

$$
2x-y=0.
$$

把 $y$ 单独写出来：

$$
\begin{aligned}
2x-y&=0,\\
-y&=-2x,\\
y&=2x.
\end{aligned}
$$

要找这条直线，可以先找几个满足方程的点。

令 $x=0,y=0$，代入原式：

$$
2(0)-0=0.
$$

所以：

$$
(0,0)
$$

在直线上。

令 $x=1$，则：

$$
2(1)-y=0.
$$

因此：

$$
2-y=0,
\qquad y=2.
$$

所以：

$$
(1,2)
$$

也在直线上。

再令 $x=\frac12$，则：

$$
2\left(\frac12\right)-y=0.
$$

计算得到：

$$
1-y=0,
\qquad y=1.
$$

所以：

$$
\left(\frac12,1\right)
$$

也在同一条直线上。

这些点都满足 $y=2x$。把所有满足第一个方程的点画出来，就得到一条经过原点的直线。

### 3.2 画第二个方程对应的直线

第二个方程是：

$$
-x+2y=3.
$$

先令 $y=0$，代入：

$$
-x+2(0)=3.
$$

化简：

$$
-x=3.
$$

两边同时乘以 $-1$：

$$
x=-3.
$$

所以点：

$$
(-3,0)
$$

在第二条直线上。

再令 $x=-1$，代入：

$$
-(-1)+2y=3.
$$

计算负号：

$$
1+2y=3.
$$

两边同时减去 $1$：

$$
2y=2.
$$

两边同时除以 $2$：

$$
y=1.
$$

所以点：

$$
(-1,1)
$$

也在第二条直线上。

连接这些点，就得到第二个方程对应的直线。

这条直线不经过原点，因为把 $(0,0)$ 代入后：

$$
-0+2(0)=0\neq3.
$$

### 3.3 找出两条直线的公共点

方程组的解必须同时满足两个方程，所以在行图像中，解就是两条直线的交点。

第一条直线满足：

$$
y=2x.
$$

把它代入第二个方程：

$$
-x+2y=3,
$$

得到：

$$
-x+2(2x)=3.
$$

展开并合并：

$$
-x+4x=3,
$$

$$
3x=3.
$$

两边同时除以 $3$：

$$
x=1.
$$

再代回 $y=2x$：

$$
y=2(1)=2.
$$

所以交点为：

$$
\boxed{(x,y)=(1,2)}.
$$

### 3.4 代回两个方程检查

第一个方程：

$$
2(1)-2=2-2=0.
$$

第二个方程：

$$
-1+2(2)=-1+4=3.
$$

两个方程都成立，所以：

$$
\boxed{\mathbf{x}=\begin{bmatrix}1\\2\end{bmatrix}}
$$

就是方程组的解。

这就是**行图像**：把每一行看成一个几何对象，然后寻找它们的公共部分。

在二维中，每个方程对应一条直线；两个方程的解对应两条直线的交点。

![二维行图像：两条直线相交于解 (1, 2)](/assets/images/mit1806/mit1806-01-row-picture.png)

## 四、二维列图像：组合两个列向量

### 4.1 把同一方程组按列重写

原方程组是：

$$
\begin{cases}
2x-y=0,\\
-x+2y=3.
\end{cases}
$$

现在把两个方程同时处理，将 $x$ 的系数放进第一个列向量，将 $y$ 的系数放进第二个列向量：

$$
x
\begin{bmatrix}
2\\-1
\end{bmatrix}
+y
\begin{bmatrix}
-1\\2
\end{bmatrix}
=
\begin{bmatrix}
0\\3
\end{bmatrix}.
$$

这两个列向量正好就是矩阵 $A$ 的两列：

$$
\mathbf{a}_1=
\begin{bmatrix}
2\\-1
\end{bmatrix},
\qquad
\mathbf{a}_2=
\begin{bmatrix}
-1\\2
\end{bmatrix}.
$$

右侧向量是：

$$
\mathbf{b}=
\begin{bmatrix}
0\\3
\end{bmatrix}.
$$

于是问题变成：

$$
x\mathbf{a}_1+y\mathbf{a}_2=\mathbf{b}.
$$

也就是：

> 分别取多少份第一列和第二列，才能拼出右侧向量 $\mathbf{b}$？

### 4.2 什么是线性组合

表达式：

$$
x\mathbf{a}_1+y\mathbf{a}_2
$$

称为两个向量的**线性组合（linear combination）**。

它只做两种操作：

1. 用数乘向量；
2. 把向量相加。

本讲要寻找正确的系数 $x,y$，使线性组合正好等于 $\mathbf{b}$。

### 4.3 在平面中画出两个列向量

第一个列向量是：

$$
\mathbf{a}_1=
\begin{bmatrix}
2\\-1
\end{bmatrix}.
$$

从原点出发，横坐标向右移动 $2$，纵坐标向下移动 $1$，就到达 $(2,-1)$。

第二个列向量是：

$$
\mathbf{a}_2=
\begin{bmatrix}
-1\\2
\end{bmatrix}.
$$

从原点出发，横坐标向左移动 $1$，纵坐标向上移动 $2$，就到达 $(-1,2)$。

列图像与行图像画的内容不同：

- 行图像画的是满足各方程的点；
- 列图像画的是矩阵的列向量以及它们的组合。

### 4.4 取一份第一列和两份第二列

行图像已经给出 $x=1,y=2$，所以正确的列组合是：

$$
1\mathbf{a}_1+2\mathbf{a}_2.
$$

先计算数乘：

$$
1\mathbf{a}_1
=1
\begin{bmatrix}
2\\-1
\end{bmatrix}
=
\begin{bmatrix}
2\\-1
\end{bmatrix},
$$

$$
2\mathbf{a}_2
=2
\begin{bmatrix}
-1\\2
\end{bmatrix}
=
\begin{bmatrix}
-2\\4
\end{bmatrix}.
$$

再相加：

$$
\begin{aligned}
1\mathbf{a}_1+2\mathbf{a}_2
&=
\begin{bmatrix}
2\\-1
\end{bmatrix}
+
\begin{bmatrix}
-2\\4
\end{bmatrix}\\
&=
\begin{bmatrix}
2+(-2)\\
-1+4
\end{bmatrix}\\
&=
\begin{bmatrix}
0\\3
\end{bmatrix}.
\end{aligned}
$$

所以：

$$
\boxed{1\mathbf{a}_1+2\mathbf{a}_2=\mathbf{b}}.
$$

### 4.5 用首尾相接的方法理解向量相加

向量相加还可以用箭头首尾相接来理解。

第一步，从原点出发，取一份第一列：

$$
(0,0)+(2,-1)=(2,-1).
$$

第二步，从 $(2,-1)$ 出发，接上一份第二列 $(-1,2)$：

$$
\begin{aligned}
(2,-1)+(-1,2)
&=(2-1,-1+2)\\
&=(1,1).
\end{aligned}
$$

所以加入一份第二列后，到达中间点：

$$
(1,1).
$$

第三步，再接上一份第二列 $(-1,2)$：

$$
\begin{aligned}
(1,1)+(-1,2)
&=(1-1,1+2)\\
&=(0,3).
\end{aligned}
$$

最终到达：

$$
(0,3)=\mathbf{b}.
$$

完整路线是：

$$
(0,0)
\xrightarrow{+\mathbf{a}_1}
(2,-1)
\xrightarrow{+\mathbf{a}_2}
(1,1)
\xrightarrow{+\mathbf{a}_2}
(0,3).
$$

这就是“一份第一列加两份第二列”的几何意义。

![二维列图像（动态）：从原点出发，先加一份 a₁，再加两份 a₂，首尾相接抵达 b](/assets/images/mit1806/mit1806-01-column-picture.gif)

![二维列图像（静态）：一份 a₁ 加两份 a₂ 合成 b=(0, 3)](/assets/images/mit1806/mit1806-01-column-picture.png)

## 五、所有线性组合能覆盖哪里

教授接着提出一个以后反复出现的问题：

> 如果让 $x,y$ 取遍所有实数，两个列向量的所有线性组合会得到什么？

答案是：本例的两个列向量不共线，它们的全部线性组合可以填满整个二维平面。

为了看清原因，取一个任意二维右侧向量：

$$
\mathbf{b}=
\begin{bmatrix}
b_1\\b_2
\end{bmatrix}.
$$

我们要解：

$$
x
\begin{bmatrix}
2\\-1
\end{bmatrix}
+y
\begin{bmatrix}
-1\\2
\end{bmatrix}
=
\begin{bmatrix}
b_1\\b_2
\end{bmatrix}.
$$

逐分量写出：

$$
\begin{cases}
2x-y=b_1,\\
-x+2y=b_2.
\end{cases}
$$

由第一个方程：

$$
-y=b_1-2x,
$$

所以：

$$
y=2x-b_1.
$$

代入第二个方程：

$$
-x+2(2x-b_1)=b_2.
$$

展开：

$$
-x+4x-2b_1=b_2.
$$

合并含 $x$ 的项：

$$
3x-2b_1=b_2.
$$

两边同时加上 $2b_1$：

$$
3x=b_2+2b_1.
$$

两边同时除以 $3$：

$$
x=\frac{2b_1+b_2}{3}.
$$

再求 $y$：

$$
\begin{aligned}
y
&=2x-b_1\\
&=2\left(\frac{2b_1+b_2}{3}\right)-b_1\\
&=\frac{4b_1+2b_2}{3}-\frac{3b_1}{3}\\
&=\frac{4b_1+2b_2-3b_1}{3}\\
&=\frac{b_1+2b_2}{3}.
\end{aligned}
$$

所以对于任意 $b_1,b_2$，都能找到组合系数：

$$
\boxed{
x=\frac{2b_1+b_2}{3},
\qquad
y=\frac{b_1+2b_2}{3}
}.
$$

检查课堂原例中的 $b_1=0,b_2=3$：

$$
x=\frac{2(0)+3}{3}=\frac33=1,
$$

$$
y=\frac{0+2(3)}{3}=\frac63=2.
$$

与前面的结果一致。

因此，本例中两个列向量的所有线性组合确实覆盖整个 $\mathbb{R}^2$。

## 六、三维示例：写出方程和矩阵

二维图像比较容易画。教授接着进入三个方程、三个未知数的情况：

$$
\begin{cases}
2x-y=0,\
-x+2y-z=-1,\
-3y+4z=4.
\end{cases}
$$

把缺失的变量补上零系数，可以写成：

$$
\begin{cases}
2x-y+0z=0,\
-x+2y-z=-1,\
0x-3y+4z=4.
\end{cases}
$$

系数矩阵为：

$$
A=
\begin{bmatrix}
2&-1&0\\
-1&2&-1\\
0&-3&4
\end{bmatrix}.
$$

未知向量为：

$$
\mathbf{x}=
\begin{bmatrix}
x\\y\\z
\end{bmatrix}.
$$

右侧向量为：

$$
\mathbf{b}=
\begin{bmatrix}
0\\-1\\4
\end{bmatrix}.
$$

矩阵形式仍然是：

$$
A\mathbf{x}=\mathbf{b}.
$$

即：

$$
\begin{bmatrix}
2&-1&0\\
-1&2&-1\\
0&-3&4
\end{bmatrix}
\begin{bmatrix}
x\\y\\z
\end{bmatrix}
=
\begin{bmatrix}
0\\-1\\4
\end{bmatrix}.
$$

此时还不知道解是什么。教授仍然分别使用行图像和列图像理解它。

## 七、三维行图像：三个平面相交

### 7.1 第二个方程对应一个平面

先看第二个方程：

$$
-x+2y-z=-1.
$$

所有满足这个方程的点 $(x,y,z)$ 构成三维空间中的一个平面。

找三个点来理解这个平面。

第一个点，令 $x=1,y=0,z=0$：

$$
-1+2(0)-0=-1.
$$

所以：

$$
(1,0,0)
$$

满足方程。

第二个点，令 $x=0,y=0,z=1$：

$$
-0+2(0)-1=-1.
$$

所以：

$$
(0,0,1)
$$

满足方程。

第三个点，令 $x=0,z=0$，则原方程变成：

$$
-0+2y-0=-1.
$$

所以：

$$
2y=-1.
$$

两边同时除以 $2$：

$$
y=-\frac12.
$$

因此：

$$
\left(0,-\frac12,0\right)
$$

也满足方程。

这三个不共线的点可以确定一个平面。平面上的其他点也都满足第二个方程。

原点不在这个平面上，因为：

$$
-0+2(0)-0=0\neq-1.
$$

### 7.2 第一个方程也对应一个平面

第一个方程是：

$$
2x-y=0.
$$

它没有写出 $z$，等价于：

$$
2x-y+0z=0.
$$

这表示只要 $x,y$ 满足 $2x-y=0$，$z$ 可以取任意实数。

因此所有满足第一个方程的点也构成一个平面。

### 7.3 第三个方程对应第三个平面

第三个方程是：

$$
-3y+4z=4.
$$

同样，所有满足它的三维点构成另一个平面。

### 7.4 三个平面的公共点

一般情况下，前两个平面相交于一条直线。

第三个平面再与这条直线相交，就得到三个平面的公共点。这个公共点就是方程组的解。

所以三维行图像是：

$$
\text{三个平面}
\longrightarrow
\text{前两个平面交于一条直线}
\longrightarrow
\text{第三个平面与这条直线交于一点}.
$$

本例的公共点稍后由列图像得到：

$$
(0,0,1).
$$

行图像在二维中很直观，但三维时已经比较难画清楚；进入四维及更高维后，更难依靠直接作图。

![三维行图像：三张平面交于解 (0, 0, 1)](/assets/images/mit1806/mit1806-01-3d-row-picture.png)

## 八、三维列图像：组合三个列向量

### 8.1 按列写出方程

把三个方程同时按列整理：

$$
x
\begin{bmatrix}
2\\-1\\0
\end{bmatrix}
+y
\begin{bmatrix}
-1\\2\\-3
\end{bmatrix}
+z
\begin{bmatrix}
0\\-1\\4
\end{bmatrix}
=
\begin{bmatrix}
0\\-1\\4
\end{bmatrix}.
$$

三个列向量分别记为：

$$
\mathbf{a}_1=
\begin{bmatrix}
2\\-1\\0
\end{bmatrix},
\qquad
\mathbf{a}_2=
\begin{bmatrix}
-1\\2\\-3
\end{bmatrix},
\qquad
\mathbf{a}_3=
\begin{bmatrix}
0\\-1\\4
\end{bmatrix}.
$$

右侧向量是：

$$
\mathbf{b}=
\begin{bmatrix}
0\\-1\\4
\end{bmatrix}.
$$

现在的问题是：

$$
x\mathbf{a}_1+y\mathbf{a}_2+z\mathbf{a}_3=\mathbf{b}.
$$

也就是寻找三个列向量的正确线性组合。

### 8.2 观察第三列

这个例子经过特别设计，因为：

$$
\mathbf{a}_3=\mathbf{b}.
$$

所以只要：

$$
x=0,
\qquad
y=0,
\qquad
z=1,
$$

就有：

$$
\begin{aligned}
0\mathbf{a}_1+0\mathbf{a}_2+1\mathbf{a}_3
&=
\begin{bmatrix}0\\0\\0\end{bmatrix}
+\begin{bmatrix}0\\0\\0\end{bmatrix}
+\begin{bmatrix}0\\-1\\4\end{bmatrix}\\
&=
\begin{bmatrix}0\\-1\\4\end{bmatrix}\\
&=\mathbf{b}.
\end{aligned}
$$

因此：

$$
\boxed{(x,y,z)=(0,0,1)}.
$$

### 8.3 代回三个方程检查

第一个方程：

$$
\begin{aligned}
2x-y
&=2(0)-0\\
&=0.
\end{aligned}
$$

第二个方程：

$$
\begin{aligned}
-x+2y-z
&=-0+2(0)-1\\
&=-1.
\end{aligned}
$$

第三个方程：

$$
\begin{aligned}
-3y+4z
&=-3(0)+4(1)\\
&=0+4\\
&=4.
\end{aligned}
$$

三个方程都成立。

所以 $(0,0,1)$ 既是列图像中正确的组合系数，也是行图像中三个平面的公共点。

这个例子的右侧恰好等于第三列，因此能直接看出答案。一般问题不会总是这样容易。下一讲的消元法将提供一种系统求解方法。

## 九、保持矩阵不变，改变右侧向量

教授保持三个列向量不变，构造一个新的右侧向量。

把第一列和第二列相加：

$$
\begin{aligned}
\mathbf{a}_1+\mathbf{a}_2
&=
\begin{bmatrix}
2\\-1\\0
\end{bmatrix}
+
\begin{bmatrix}
-1\\2\\-3
\end{bmatrix}\\
&=
\begin{bmatrix}
2-1\\
-1+2\\
0-3
\end{bmatrix}\\
&=
\begin{bmatrix}
1\\1\\-3
\end{bmatrix}.
\end{aligned}
$$

令新的右侧向量为：

$$
\mathbf{b}'=
\begin{bmatrix}
1\\1\\-3
\end{bmatrix}.
$$

因为：

$$
\mathbf{b}'=1\mathbf{a}_1+1\mathbf{a}_2+0\mathbf{a}_3,
$$

所以新方程组的解为：

$$
\boxed{x=1,\qquad y=1,\qquad z=0}.
$$

也就是：

$$
\boxed{(x,y,z)=(1,1,0)}.
$$

代入新的方程组检查。

第一行：

$$
2(1)-1=2-1=1.
$$

第二行：

$$
-1+2(1)-0=-1+2=1.
$$

第三行：

$$
-3(1)+4(0)=-3+0=-3.
$$

结果正好为：

$$
\begin{bmatrix}
1\\1\\-3
\end{bmatrix}
=\mathbf{b}'.
$$

在行图像中，改变右侧向量后，三个平面的位置发生变化，新交点变成 $(1,1,0)$。

在列图像中，三个列向量没有改变，只是要拼出的目标从 $\mathbf{b}$ 改成了 $\mathbf{b}'$。

## 十、能否对每一个右侧向量求解

教授进一步提出本讲的大问题：

$$
\boxed{\text{对于每一个 }\mathbf{b}\text{，方程 }A\mathbf{x}=\mathbf{b}\text{ 都有解吗？}}
$$

这里先不是问“怎样算出解”，而是问“解是否存在”。

用列图像的语言，这个问题可以重新表述为：

> **三个列向量的所有线性组合，能否填满整个三维空间？**

因为：

$$
A\mathbf{x}
=x\mathbf{a}_1+y\mathbf{a}_2+z\mathbf{a}_3.
$$

所以“某个 $\mathbf{b}$ 有解”与“某个 $\mathbf{b}$ 能由三个列向量组合出来”完全等价。

如果每一个三维向量 $\mathbf{b}$ 都能被组合出来，就说明三个列向量的线性组合填满整个三维空间。

本讲这个三维示例的矩阵属于良好情况，答案是肯定的。教授称这样的矩阵为：

- **非奇异矩阵（non-singular matrix）**；
- **可逆矩阵（invertible matrix）**。

对于这种方阵，每一个右侧向量都对应唯一解。求解的具体算法留到下一讲的消元法。

## 十一、什么时候无法得到每一个右侧向量

### 11.1 三个列向量落在同一平面中

假设三个三维列向量全部位于同一个经过原点的平面内。

向量相加和数乘都不会把结果带出这个平面，所以它们的所有线性组合仍然只能位于该平面内。

这时：

- 如果 $\mathbf{b}$ 位于这个平面内，就可能由这些列组合出来；
- 如果 $\mathbf{b}$ 位于平面外，就无法由这些列组合出来。

因此不可能对每一个 $\mathbf{b}$ 都有解。

### 11.2 第三列等于第一列加第二列

一个典型例子是：

$$
\mathbf{a}_3=\mathbf{a}_1+\mathbf{a}_2.
$$

这时第三列没有提供新的方向。

任意线性组合为：

$$
x\mathbf{a}_1+y\mathbf{a}_2+z\mathbf{a}_3.
$$

代入 $\mathbf{a}_3=\mathbf{a}_1+\mathbf{a}_2$：

$$
x\mathbf{a}_1+y\mathbf{a}_2+z(\mathbf{a}_1+\mathbf{a}_2).
$$

展开：

$$
x\mathbf{a}_1+y\mathbf{a}_2+z\mathbf{a}_1+z\mathbf{a}_2.
$$

合并 $\mathbf{a}_1$ 与 $\mathbf{a}_2$ 的系数：

$$
\boxed{(x+z)\mathbf{a}_1+(y+z)\mathbf{a}_2}.
$$

所以，即使表面上写了三个列向量，真正参与组合的仍然只有两个方向：

$$
\mathbf{a}_1,\qquad\mathbf{a}_2.
$$

第三列没有增加任何新的可达位置。

这种情况下，矩阵是**奇异的、不可逆的**。列向量的所有组合通常只能覆盖一个平面，而不是整个三维空间。

## 十二、推广到九维空间

教授接着让想象九个方程、九个未知数。

此时：

- 矩阵有九列；
- 每一列都有九个分量；
- 每个列向量都属于九维空间 $\mathbb{R}^9$；
- 目标是组合这九个列向量，使结果等于九维右侧向量 $\mathbf{b}$。

方程仍然可以写成：

$$
x_1\mathbf{a}_1+x_2\mathbf{a}_2+\cdots+x_9\mathbf{a}_9=\mathbf{b}.
$$

问题仍然是：

$$
\text{这九个列向量的所有线性组合，能否填满整个九维空间？}
$$

如果九列提供九个独立方向，它们的组合可以填满整个九维空间。

但是，如果第九列与第八列完全相同：

$$
\mathbf{a}_9=\mathbf{a}_8,
$$

那么第九列没有增加新方向。

把这两列合并：

$$
x_8\mathbf{a}_8+x_9\mathbf{a}_9
=x_8\mathbf{a}_8+x_9\mathbf{a}_8
=(x_8+x_9)\mathbf{a}_8.
$$

两个看似不同的列，实际上只贡献了一个方向。

这种情况下，列向量的组合不能填满整个九维空间，通常只能填满一个八维子空间。就会有许多九维右侧向量无法达到。

九维空间无法直接画出，但“列向量线性组合”的思考方式与二维、三维完全相同。

## 十三、矩阵乘向量的两种方式

教授最后回到矩阵形式 $A\mathbf{x}=\mathbf{b}$，具体说明怎样计算矩阵乘以向量。

使用新的例子：

$$
A=
\begin{bmatrix}
2&5\\
1&3
\end{bmatrix},
\qquad
\mathbf{x}=
\begin{bmatrix}
1\\2
\end{bmatrix}.
$$

要计算：

$$
A\mathbf{x}
=
\begin{bmatrix}
2&5\\
1&3
\end{bmatrix}
\begin{bmatrix}
1\\2
\end{bmatrix}.
$$

### 13.1 按列计算：列向量的线性组合

向量 $\mathbf{x}$ 的第一个分量是 $1$，第二个分量是 $2$。

因此取一份第一列和两份第二列：

$$
A\mathbf{x}
=1
\begin{bmatrix}
2\\1
\end{bmatrix}
+2
\begin{bmatrix}
5\\3
\end{bmatrix}.
$$

先计算数乘：

$$
1
\begin{bmatrix}
2\\1
\end{bmatrix}
=
\begin{bmatrix}
2\\1
\end{bmatrix},
$$

$$
2
\begin{bmatrix}
5\\3
\end{bmatrix}
=
\begin{bmatrix}
10\\6
\end{bmatrix}.
$$

再逐分量相加：

$$
\begin{aligned}
A\mathbf{x}
&=
\begin{bmatrix}
2\\1
\end{bmatrix}
+
\begin{bmatrix}
10\\6
\end{bmatrix}\\
&=
\begin{bmatrix}
2+10\\1+6
\end{bmatrix}\\
&=
\begin{bmatrix}
12\\7
\end{bmatrix}.
\end{aligned}
$$

所以：

$$
\boxed{A\mathbf{x}=\text{矩阵 }A\text{ 各列的线性组合}}.
$$

### 13.2 按行计算：行与向量的点积

同一个乘法也可以按行计算。

结果的第一个分量，用矩阵第一行与向量做点积：

$$
\begin{aligned}
2(1)+5(2)
&=2+10\\
&=12.
\end{aligned}
$$

结果的第二个分量，用矩阵第二行与向量做点积：

$$
\begin{aligned}
1(1)+3(2)
&=1+6\\
&=7.
\end{aligned}
$$

所以：

$$
A\mathbf{x}
=
\begin{bmatrix}
2(1)+5(2)\\
1(1)+3(2)
\end{bmatrix}
=
\begin{bmatrix}
12\\7
\end{bmatrix}.
$$

两种算法的结果完全相同。

### 13.3 与方程求解联系起来

如果右侧向量恰好是：

$$
\mathbf{b}=
\begin{bmatrix}
12\\7
\end{bmatrix},
$$

那么：

$$
\begin{bmatrix}
2&5\\
1&3
\end{bmatrix}
\begin{bmatrix}
1\\2
\end{bmatrix}
=
\begin{bmatrix}
12\\7
\end{bmatrix}.
$$

因此方程 $A\mathbf{x}=\mathbf{b}$ 的解就是：

$$
\boxed{\mathbf{x}=\begin{bmatrix}1\\2\end{bmatrix}}.
$$

按列看，是因为：

$$
1\,(\text{第一列})+2\,(\text{第二列})=\mathbf{b}.
$$

按行看，是因为两个点积分别得到 $12$ 和 $7$。

## 十四、原课收尾

本讲从同一个方程组的三种表达出发：

- 行图像：直线或平面的交点；
- 列图像：列向量的线性组合；
- 矩阵形式：$A\mathbf{x}=\mathbf{b}$。

教授最希望学生记住的是：

$$
\boxed{A\mathbf{x}\text{ 是矩阵 }A\text{ 各列的线性组合。}}
$$

由此，求解方程组可以理解为：

> 寻找矩阵各列的正确组合系数，使组合结果等于右侧向量 $\mathbf{b}$。

进一步的问题“是否每一个 $\mathbf{b}$ 都有解”，则等价于：

> 矩阵各列的全部线性组合能否填满整个空间？

本讲通过特殊例子直接看出了部分答案。下一讲将学习消元法，用系统步骤求解一般方程组。

## 十五、课后练习

### 练习 1：同时使用行图像和列图像

求解：

$$
\begin{cases}
x+y=4,\\
x-y=2.
\end{cases}
$$

#### 第一步：求交点

把两个方程相加：

$$
(x+y)+(x-y)=4+2.
$$

展开并合并：

$$
x+y+x-y=6,
$$

$$
2x=6.
$$

两边同时除以 $2$：

$$
x=3.
$$

代入第一个方程：

$$
3+y=4.
$$

两边同时减去 $3$：

$$
y=1.
$$

所以行图像中的两条直线交于：

$$
\boxed{(3,1)}.
$$

#### 第二步：检查列组合

原方程组按列写为：

$$
x
\begin{bmatrix}
1\\1
\end{bmatrix}
+y
\begin{bmatrix}
1\\-1
\end{bmatrix}
=
\begin{bmatrix}
4\\2
\end{bmatrix}.
$$

代入 $x=3,y=1$：

$$
\begin{aligned}
3
\begin{bmatrix}
1\\1
\end{bmatrix}
+1
\begin{bmatrix}
1\\-1
\end{bmatrix}
&=
\begin{bmatrix}
3\\3
\end{bmatrix}
+
\begin{bmatrix}
1\\-1
\end{bmatrix}\\
&=
\begin{bmatrix}
3+1\\3-1
\end{bmatrix}\\
&=
\begin{bmatrix}
4\\2
\end{bmatrix}.
\end{aligned}
$$

所以列图像需要三份第一列和一份第二列。

### 练习 2：两列共线时能得到哪些右侧向量

设：

$$
A=
\begin{bmatrix}
1&2\\
2&4
\end{bmatrix}.
$$

两列分别为：

$$
\mathbf{a}_1=
\begin{bmatrix}
1\\2
\end{bmatrix},
\qquad
\mathbf{a}_2=
\begin{bmatrix}
2\\4
\end{bmatrix}.
$$

观察可得：

$$
\mathbf{a}_2=2\mathbf{a}_1.
$$

任意线性组合为：

$$
\begin{aligned}
x\mathbf{a}_1+y\mathbf{a}_2
&=x\mathbf{a}_1+y(2\mathbf{a}_1)\\
&=x\mathbf{a}_1+2y\mathbf{a}_1\\
&=(x+2y)\mathbf{a}_1\\
&=(x+2y)
\begin{bmatrix}
1\\2
\end{bmatrix}\\
&=
\begin{bmatrix}
x+2y\\
2(x+2y)
\end{bmatrix}.
\end{aligned}
$$

因此结果的第二个分量永远是第一个分量的两倍。

若：

$$
\mathbf{b}=
\begin{bmatrix}
b_1\\b_2
\end{bmatrix}
$$

能够被两列组合出来，就必须满足：

$$
\boxed{b_2=2b_1}.
$$

例如：

$$
\begin{bmatrix}3\\6\end{bmatrix}
$$

在这条直线上，可以表示；而：

$$
\begin{bmatrix}3\\7\end{bmatrix}
$$

不满足 $7=2\times3$，所以不能由这两列组合出来。

因此这个矩阵不能对每一个二维右侧向量都求解。

### 练习 3：完整计算矩阵乘向量

计算：

$$
\begin{bmatrix}
1&0&2\\
-1&3&1\\
0&2&1
\end{bmatrix}
\begin{bmatrix}
2\\1\\-1
\end{bmatrix}.
$$

#### 按列计算

取向量分量 $2,1,-1$ 分别乘三列：

$$
2
\begin{bmatrix}
1\\-1\\0
\end{bmatrix}
+1
\begin{bmatrix}
0\\3\\2
\end{bmatrix}
-1
\begin{bmatrix}
2\\1\\1
\end{bmatrix}.
$$

先计算数乘：

$$
=
\begin{bmatrix}
2\\-2\\0
\end{bmatrix}
+
\begin{bmatrix}
0\\3\\2
\end{bmatrix}
+
\begin{bmatrix}
-2\\-1\\-1
\end{bmatrix}.
$$

再逐分量相加：

$$
=
\begin{bmatrix}
2+0-2\\
-2+3-1\\
0+2-1
\end{bmatrix}
=
\begin{bmatrix}
0\\0\\1
\end{bmatrix}.
$$

#### 按行计算

第一行做点积：

$$
1(2)+0(1)+2(-1)=2+0-2=0.
$$

第二行做点积：

$$
-1(2)+3(1)+1(-1)=-2+3-1=0.
$$

第三行做点积：

$$
0(2)+2(1)+1(-1)=0+2-1=1.
$$

所以两种算法都得到：

$$
\boxed{
\begin{bmatrix}
0\\0\\1
\end{bmatrix}}.
$$

## 十六、视频时间索引

以下时间点依据本地下载版本的字幕整理，顺序与正文一致：

| 时间 | 教授的授课内容 |
|---|---|
| 00:00:08 | 课程与教材介绍 |
| 00:01:02 | 线性代数的基本问题与三种观察方式 |
| 00:02:18 | 二维方程组示例 |
| 00:02:46 | 写出系数矩阵与 $A\mathbf{x}=\mathbf{b}$ |
| 00:04:24 | 开始二维行图像 |
| 00:04:53 | 第一条直线上的点 |
| 00:06:17 | 第二条直线上的点 |
| 00:07:31 | 两条直线交于 $(1,2)$ |
| 00:08:43 | 开始二维列图像 |
| 00:09:36 | 线性组合的定义与目标 |
| 00:10:41 | 画出两个列向量 |
| 00:12:06 | 一份第一列加两份第二列 |
| 00:13:23 | 分量计算得到 $(0,3)$ |
| 00:14:25 | 所有线性组合填满二维平面 |
| 00:15:31 | 三维方程组示例 |
| 00:16:19 | 三维矩阵形式 |
| 00:17:31 | 开始三维行图像 |
| 00:18:05 | 第二个方程对应平面上的三个点 |
| 00:19:51 | 第一个方程对应平面，两个平面交于直线 |
| 00:20:37 | 三个平面交于一点 |
| 00:22:04 | 开始三维列图像 |
| 00:24:33 | 右侧向量恰好等于第三列 |
| 00:25:02 | 解为 $(0,0,1)$ |
| 00:25:28 | 下一讲消元法预告 |
| 00:26:15 | 改变右侧向量 |
| 00:26:36 | 新右侧向量等于第一列加第二列 |
| 00:27:45 | 是否对每一个 $\mathbf{b}$ 都有解 |
| 00:29:21 | 矩阵乘向量是列的线性组合 |
| 00:30:35 | 三列共面时的奇异情况 |
| 00:32:25 | 推广到九维空间 |
| 00:33:59 | 第九列重复第八列时没有新方向 |
| 00:35:33 | 具体计算矩阵乘向量 |
| 00:36:50 | 按列计算 |
| 00:37:35 | 按行做点积计算 |
| 00:38:24 | 总结 $A\mathbf{x}$ 是列的线性组合 |
| 00:39:12 | 原课结束，下一讲消元 |
