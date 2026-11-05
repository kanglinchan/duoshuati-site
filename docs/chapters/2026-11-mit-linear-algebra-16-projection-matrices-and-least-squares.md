# 第 16 讲：投影矩阵和最小二乘法

> 英文标题：Projection Matrices and Least Squares  
> 讲师：Gilbert Strang  
> 整理方式：严格按照教授的实际授课顺序，完整展开课堂推导与计算


## 本讲目录

- [一、开场：投影矩阵 P 到底干了什么](#一开场投影矩阵-p-到底干了什么)
- [二、两个极端情形的验证](#二两个极端情形的验证)
- [三、分解 $\mathbf{b}=\mathbf{p}+\mathbf{e}$ 与 I−P](#三分解-bpe-与-i-p)
- [四、最小二乘：问题的完整陈述](#四最小二乘问题的完整陈述)
- [五、两幅图：数据图与向量图](#五两幅图数据图与向量图)
- [六、统计学的注脚：回归与离群值](#六统计学的注脚回归与离群值)
- [七、动手算：正规方程](#七动手算正规方程)
- [八、解出最好的直线](#八解出最好的直线)
- [九、误差向量的三重检验](#九误差向量的三重检验)
- [十、微积分的路线：偏导数](#十微积分的路线偏导数)
- [十一、定理与证明：列无关 ⟹ AᵀA 可逆](#十一定理与证明列无关--a-a-可逆)
- [十二、预告：标准正交向量](#十二预告标准正交向量)
- [十三、课后练习](#十三课后练习)
- [十四、视频时间索引](#十四视频时间索引)

## 一、开场：投影矩阵 P 到底干了什么

回顾上一讲的魔术公式：

$$
P=A(A^{T}A)^{-1}A^{T}
$$

——把任意 $\mathbf{b}$ 投到**列空间里最近的点**。两个极端情形先把直觉钉死：

- 若 $\mathbf{b}$ **已在**列空间里：投影就是自己，$P\mathbf{b}=\mathbf{b}$；
- 若 $\mathbf{b}$ **垂直于**列空间（想象列空间是平面、$\mathbf{b}$ 笔直竖起）：最近点就是原点，$P\mathbf{b}=\mathbf{0}$。

一般的向量介于两者之间：$\mathbf{b}=\mathbf{p}+\mathbf{e}$，投影**杀死垂直部分、保留列空间部分**。

## 二、两个极端情形的验证

**情形 1：$\mathbf{b}\perp C(A)$。**垂直于列空间的向量住在哪？——**$N(A^{T})$**（第 14 讲的核心几何）。于是 $A^{T}\mathbf{b}=\mathbf{0}$，代进公式：

$$
P\mathbf{b}=A(A^{T}A)^{-1}\underbrace{A^{T}\mathbf{b}}_{=\mathbf{0}}=\mathbf{0}.\quad\checkmark
$$

**情形 2：$\mathbf{b}\in C(A)$。**列空间里的向量的标准写法：$\mathbf{b}=A\mathbf{x}$（列的组合——教授说这句话要"说一千遍"，考试必考）。代进公式：

$$
P\mathbf{b}=A(A^{T}A)^{-1}A^{T}(A\mathbf{x})
=A\underbrace{(A^{T}A)^{-1}(A^{T}A)}_{=I}\mathbf{x}
=A\mathbf{x}=\mathbf{b}.\quad\checkmark
$$

几何图像：列空间一旁垂直着 $N(A^{T})$，一般的 $\mathbf{b}$ 被分成投影 $\mathbf{p}=P\mathbf{b}$ 与误差 $\mathbf{e}=\mathbf{b}-\mathbf{p}$，两块拼回原向量。

## 三、分解 b = p + e 与 I−P

**追问**：把 $\mathbf{b}$ 投到**垂直空间**（$N(A^{T})$）上的投影矩阵是什么？要的是"剩下的那一块"：

$$
\boxed{
I-P
}
$$

——它把 $\mathbf{b}$ 变成 $\mathbf{e}$。而且投影矩阵的两条性质自动遗传：

- $P$ 对称 ⟹ $I-P$ 对称；
- $P^{2}=P$ ⟹ $(I-P)^{2}=I-2P+P^{2}=I-P$。

（代数只是把图画的东西照抄一遍。）

## 四、最小二乘：问题的完整陈述

上讲搭台的例子正式开算。数据点：

$$
(t,b)=(1,1),\quad(2,2),\quad(3,2).
$$

前两点恰好在一条 $45°$ 直线上，第三点不在——**没有直线穿过全部三点**。要找**最好的直线**

$$
y=C+Dt.
$$

"最好"必须先定义：它决定谁是赢家。想穿而穿不过的方程组：

$$
\begin{cases}
C+D=1\\
C+2D=2\\
C+3D=2
\end{cases}
\qquad
A=\begin{bmatrix}1&1\\1&2\\1&3\end{bmatrix},\quad
\mathbf{x}=\begin{bmatrix}C\\D\end{bmatrix},\quad
\mathbf{b}=\begin{bmatrix}1\\2\\2\end{bmatrix}.
$$

$A$ 是 $3\times2$，两列无关（列空间有一组好基），但 $\mathbf{b}$ 不在列空间里——无解，但**有"最好的解"**。

**误差的度量**：三处各差一点，记误差向量

$$
\mathbf{e}=A\mathbf{x}-\mathbf{b}=(e_{1},e_{2},e_{3}),
$$

总误差取**平方和**：

$$
\|\mathbf{e}\|^{2}=e_{1}^{2}+e_{2}^{2}+e_{3}^{2}
\quad\text{（永不取负；为零当且仅当精确可解）}.
$$

要最小化的就是它——**最小二乘（least squares）**得名于此。

## 五、两幅图：数据图与向量图

教授强调同一件事有两幅图：

**图 1（数据图）**：横轴 $t$、纵轴 $b$；三个数据点、一条最佳直线；三个误差 $e_{1},e_{2},e_{3}$ 是**竖直方向**到直线的距离。

**图 2（向量图）**：$\mathbb{R}^{3}$ 里，$\mathbf{b}=(1,2,2)$，列空间是两张列向量张成的平面；直线上的三点高度 $(P_{1},P_{2},P_{3})$ 构成向量 $\mathbf{p}$——**列空间里离 $\mathbf{b}$ 最近的组合**；$\mathbf{e}=\mathbf{b}-\mathbf{p}$ 垂直于整个列空间。

把 $(P_{1},P_{2},P_{3})$ 代进三个方程会发生什么？**方程组变得可解**——直线恰好穿过这三个"投影点"。$C,D$ 就是拼出 $\mathbf{p}$ 的那组列组合系数。两幅图是同一件事的两面。

## 六、统计学的注脚：回归与离群值

- 拟合直线是统计学的大事，术语叫**回归（regression）**，此处是线性回归；
- 度量用平方和：解出来干净、导出漂亮的线性方程组；
- 但平方有个副作用：**离群值（outlier）**。若某个测量远偏离群，它的误差一平方就"高耸入云"，整条直线被它牵着跑——而它可能只是记录错误。统计学家对离群值会先识别、再处理；最小二乘用得最多，但**不是唯一**的度量，原因正是平方对离群值过度敏感。

## 七、动手算：正规方程

中心方程（教授称其为**统计学与估计里最重要的方程**——凡是用少量参数拟合带噪声的数据，第一步就是它）：

$$
A^{T}A\hat{\mathbf{x}}=A^{T}\mathbf{b}.
$$

逐项计算：

$$
A^{T}A=
\begin{bmatrix}
1&1&1\\
1&2&3
\end{bmatrix}
\begin{bmatrix}
1&1\\
1&2\\
1&3
\end{bmatrix}
=
\begin{bmatrix}
3&6\\
6&14
\end{bmatrix}
\qquad(3=1+1+1;\ 6=1+2+3;\ 14=1+4+9),
$$

$$
A^{T}\mathbf{b}=
\begin{bmatrix}
1&1&1\\
1&2&3
\end{bmatrix}
\begin{bmatrix}1\\2\\2\end{bmatrix}
=
\begin{bmatrix}5\\11\end{bmatrix}
\qquad(5=1+2+2;\ 11=1+4+6).
$$

（计算前教授先"预报"了三个待检性质：**对称**✓、**可逆**（列无关）✓、以及将来要讲的**正定**。）

方程组（它们有个正式名字——**正规方程（normal equations）**）：

$$
\begin{cases}
3C+6D=5\\
6C+14D=11
\end{cases}
$$

## 八、解出最好的直线

消元：第二式减去第一式的 2 倍：

$$
2D=1\quad\Longrightarrow\quad D=\tfrac12;
$$

回代：$3C+6\cdot\tfrac12=5\Rightarrow3C=2\Rightarrow C=\tfrac23$。

$$
\boxed{
\hat{\mathbf{x}}=\left(\tfrac23,\ \tfrac12\right),
\qquad
\text{最好的直线：}\ y=\tfrac23+\tfrac12\,t
}
$$

（数字出奇地干净——教授坦白原以为会很难看。）

**三个投影点**（直线在 $t=1,2,3$ 处的高度）：

$$
P_{1}=\tfrac23+\tfrac12=\tfrac76,\qquad
P_{2}=\tfrac23+1=\tfrac53,\qquad
P_{3}=\tfrac23+\tfrac32=\tfrac{13}{6}.
$$

（$P_{1}=\tfrac76$ 高于数据 $1$；$P_{2}=\tfrac53$ 低于数据 $2$；$P_{3}=\tfrac{13}{6}$ 高于数据 $2$。）

## 九、误差向量的三重检验

**误差向量**（约定 $\mathbf{p}+\mathbf{e}=\mathbf{b}$）：

$$
\mathbf{e}=\mathbf{b}-\mathbf{p}
=\left(-\tfrac16,\ \tfrac13,\ -\tfrac16\right)
=\left(-\tfrac16,\ \tfrac26,\ -\tfrac16\right).
$$

**检验 1：和复原。**$\mathbf{p}+\mathbf{e}=(\tfrac76-\tfrac16,\ \tfrac53+\tfrac13,\ \tfrac{13}{6}-\tfrac16)=(1,2,2)=\mathbf{b}$ ✓

**检验 2：$\mathbf{p}\perp\mathbf{e}$。**点积：

$$
\mathbf{p}\cdot\mathbf{e}
=-\tfrac{7}{36}+\tfrac{20}{36}-\tfrac{13}{36}=0.\quad\checkmark
$$

**检验 3：$\mathbf{e}$ 垂直于整个列空间。**列空间的两个现成成员：

$$
\mathbf{e}\cdot(1,1,1)=-\tfrac16+\tfrac26-\tfrac16=0.\quad\checkmark
\qquad
\mathbf{e}\cdot(1,2,3)=-\tfrac16+\tfrac46-\tfrac36=0.\quad\checkmark
$$

（$(1,1,1)$、$(1,2,3)$ 正是 $A$ 的两列——$\mathbf{e}\in N(A^{T})$，与理论完全一致。）

两幅图在此合一：数据图里"三个竖直小误差"，向量图里"一根垂直于平面的误差向量"。

## 十、微积分的路线：偏导数

同一结果可从微积分独立推出。总误差是 $C,D$ 的函数：

$$
E(C,D)=(C+D-1)^{2}+(C+2D-2)^{2}+(C+3D-2)^{2}.
$$

求最小值：取偏导、令其为零——$\partial E/\partial C=0$ 给出第一条正规方程，$\partial E/\partial D=0$ 给出第二条。**平方的导数是线性的**——这正是选平方作度量的第二个理由：两条路（线性代数、微积分）殊途同归于同一组线性方程。这组方程到处出现。

## 十一、定理与证明：列无关 ⟹ AᵀA 可逆

本讲补上一直引用却未证明的中心事实（教授：本课不滥证明，但这是核心实事，而且调动了全部家底）。

$$
\boxed{
A\ \text{列无关}\ \Longrightarrow\ A^{T}A\ \text{可逆}
}
$$

**证明思路**：可逆 ⟺ 零空间只有零向量。所以设 $A^{T}A\mathbf{x}=\mathbf{0}$，目标是逼出 $\mathbf{x}=\mathbf{0}$。

**妙手**：两边左乘 $\mathbf{x}^{T}$：

$$
\mathbf{x}^{T}A^{T}A\mathbf{x}=0
\quad\Longleftrightarrow\quad
(A\mathbf{x})^{T}(A\mathbf{x})=\|A\mathbf{x}\|^{2}=0.
$$

（括号放对位置——看到 $\mathbf{y}^{T}\mathbf{y}=0$ 就该喊出 $\mathbf{y}=\mathbf{0}$：长度平方为零者只有零向量。）于是 $A\mathbf{x}=\mathbf{0}$。

**启用假设**（"数学家总得用上假设"）：$A$ 列无关 ⟹ $N(A)=\{\mathbf{0}\}$ ⟹ $\mathbf{x}=\mathbf{0}$。∎

整条推理用到了两件家当：$(\cdot)^{T}(\cdot)$ 是长度平方；列无关矩阵的零空间只有零。

## 十二、预告：标准正交向量

有一种情形列**必然**无关——下一讲的钥匙：

$$
\boxed{
\text{列两两垂直且都是单位向量（标准正交，orthonormal）}
\Longrightarrow
\text{必然无关}
}
$$

（"orthogonal + normal（单位长度）"；排除零列的方式就是要求单位长度。）例子：

- $\mathbf{e}_{1}=(1,0,0)$、$\mathbf{e}_{2}=(0,1,0)$、$\mathbf{e}_{3}=(0,0,1)$：以它们为列的矩阵满足 $A^{T}A=I$！
- 最钟爱的一对：$(\cos\theta,\sin\theta)$ 与 $(-\sin\theta,\cos\theta)$——都是单位向量、夹角 $90°$。

下一讲任务：**为什么标准正交列如此好用**，以及**如何把任意无关向量组变成标准正交**（施密特正交化）。

## 十三、课后练习

### 练习 1：另一组数据的最小二乘

数据点 $(1,0),(2,1),(3,4)$，拟合 $y=C+Dt$。求正规方程、解出 $C,D$、写出最佳直线与误差向量。

#### 解答

想解而不得：$C+D=0,\ C+2D=1,\ C+3D=4$。

$$
A^{T}A=\begin{bmatrix}3&6\\6&14\end{bmatrix},
\qquad
A^{T}\mathbf{b}=
\begin{bmatrix}1&1&1\\1&2&3\end{bmatrix}
\begin{bmatrix}0\\1\\4\end{bmatrix}
=\begin{bmatrix}5\\14\end{bmatrix}.
$$

正规方程：$3C+6D=5,\ 6C+14D=14$。消元：第二式减第一式 2 倍：$2D=4\Rightarrow D=2$；回代 $3C+12=5\Rightarrow C=-\tfrac73$。

最佳直线：$y=-\tfrac73+2t$。投影点：$P_{1}=-\tfrac73+2=-\tfrac13$，$P_{2}=-\tfrac73+4=\tfrac53$，$P_{3}=-\tfrac73+6=\tfrac{11}3$。误差 $\mathbf{e}=\mathbf{b}-\mathbf{p}=(\tfrac13,\ \tfrac23,\ \tfrac13)$。正交检验：$\mathbf{p}\cdot\mathbf{e}=-\tfrac13\cdot\tfrac13+\tfrac53\cdot\tfrac23+\tfrac{11}{3}\cdot\tfrac13=(-1+10+11)/9=\tfrac{20}{9}$？

重算：$-\tfrac13\cdot\tfrac13=-\tfrac19$；$\tfrac53\cdot\tfrac23=\tfrac{10}{9}$；$\tfrac{11}{3}\cdot\tfrac13=\tfrac{11}{9}$。和 $=(-1+10+11)/9=\tfrac{20}{9}\neq0$——哪里错了？检查投影点：$P_{1}=-\tfrac73+2\cdot1=-\tfrac73+\tfrac63=-\tfrac13$ ✓；$P_{2}=-\tfrac73+4=\tfrac53$ ✓；$P_{3}=-\tfrac73+6=\tfrac{11}{3}$ ✓。误差：$0-(-\tfrac13)=\tfrac13$ ✓；$1-\tfrac53=-\tfrac23$（**不是** $\tfrac23$，符号反了！）；$4-\tfrac{11}{3}=\tfrac13$ ✓。所以 $\mathbf{e}=(\tfrac13,-\tfrac23,\tfrac13)$，$\mathbf{p}\cdot\mathbf{e}=(-1-10+11)/9=0$ ✓。

（教训：$\mathbf{e}=\mathbf{b}-\mathbf{p}$ 别写反；以及中间数据点低于拟合线时误差为负。）

### 练习 2：I−P 的性质

设 $P$ 为投影矩阵。证明 $I-P$ 也是投影矩阵（对称、幂等），并说明它把向量投到哪里。

#### 解答

对称：$(I-P)^{T}=I-P^{T}=I-P$ ✓。幂等：$(I-P)^{2}=I-2P+P^{2}=I-2P+P=I-P$ ✓。几何：$I-P$ 把 $\mathbf{b}$ 的列空间分量删掉、留下垂直分量——它是到 $N(A^{T})$（列空间的正交补）的投影。

### 练习 3：验证两个极端

取练习 1 的 $A=\begin{bmatrix}1&1\\1&2\\1&3\end{bmatrix}$ 与其 $P$（不必显式算出 $P$）。验证 (a) $\mathbf{b}'=(1,2,3)$（第一列）满足 $P\mathbf{b}'=\mathbf{b}'$；(b) $\mathbf{b}''=(-1,1,-1)$… 先验证 $\mathbf{b}''=(1,-2,1)\in N(A^{T})$ 且 $P\mathbf{b}''=\mathbf{0}$。

#### 解答

**(a)** $\mathbf{b}'=A(1,0)^{T}\in C(A)$。由第二节公式：$P\mathbf{b}'=A(A^{T}A)^{-1}A^{T}A(1,0)^{T}=A(1,0)^{T}=\mathbf{b}'$ ✓。

**(b)** $A^{T}\mathbf{b}''=\begin{bmatrix}1&1&1\\1&2&3\end{bmatrix}\begin{bmatrix}1\\-2\\1\end{bmatrix}=(0,\ 0)^{T}$：$\mathbf{b}''\in N(A^{T})$ ✓。代入公式：$P\mathbf{b}''=A(A^{T}A)^{-1}\cdot\mathbf{0}=\mathbf{0}$ ✓。

（顺带：$\mathbf{b}'\cdot\mathbf{b}''=1-4+3=0$——列空间成员与左零空间成员正交，第 14 讲定理的实例。）

### 练习 4：AᵀA 可逆性的证明练习

用第十一节的方法证明：若 $A$ 列无关，则 $A^{T}A$ 的任何特征……——更正：证明 $N(A^{T}A)=N(A)$（两个包含都证）。

#### 解答

**$N(A)\subseteq N(A^{T}A)$**：$A\mathbf{x}=\mathbf{0}\Rightarrow A^{T}A\mathbf{x}=A^{T}\mathbf{0}=\mathbf{0}$。

**$N(A^{T}A)\subseteq N(A)$**：$A^{T}A\mathbf{x}=\mathbf{0}\Rightarrow\mathbf{x}^{T}A^{T}A\mathbf{x}=0\Rightarrow\|A\mathbf{x}\|^{2}=0\Rightarrow A\mathbf{x}=\mathbf{0}$。

两个包含合起来 $N(A^{T}A)=N(A)$。此等式不依赖列无关假设，永远成立；"列无关"只在最后一步用来断言 $N(A)=\{\mathbf{0}\}$、从而 $A^{T}A$ 可逆。

## 十四、视频时间索引

以下时间点依据本地下载版本的字幕整理，顺序与正文一致：

| 时间 | 教授的授课内容 |
|---|---|
| 00:00:09 | 开场：回顾投影矩阵公式 |
| 00:00:54 | 极端一：$\mathbf{b}\in C(A)\Rightarrow P\mathbf{b}=\mathbf{b}$ |
| 00:01:32 | 极端二：$\mathbf{b}\perp C(A)\Rightarrow P\mathbf{b}=\mathbf{0}$ |
| 00:02:30 | 一般 $\mathbf{b}=\mathbf{p}+\mathbf{e}$：杀垂直、留列空间 |
| 00:03:10 | 用四子空间语言：$\perp C(A)\iff\in N(A^{T})$ |
| 00:04:08 | 验证：$A^{T}\mathbf{b}=0\Rightarrow P\mathbf{b}=0$ |
| 00:04:44 | $\mathbf{b}=A\mathbf{x}$（列空间的写法，考试必考） |
| 00:05:14 | 验证：$A^{T}A$ 与逆相消，还原 $\mathbf{b}$ |
| 00:06:55 | $I-P$：投到垂直空间的投影 |
| 00:07:40 | $I-P$ 对称、幂等 |
| 00:08:46 | 正式开算：最佳直线 |
| 00:09:22 | 数据点 $(1,1),(2,2),(3,2)$ |
| 00:10:12 | 三个想解而不得的方程 |
| 00:11:06 | $A\mathbf{x}=\mathbf{b}$：$3\times2$、列无关、$\mathbf{b}$ 不在列空间 |
| 00:12:01 | "最好"的定义：平方和最小 |
| 00:13:38 | 误差 $\mathbf{e}=A\mathbf{x}-\mathbf{b}$；长度平方 |
| 00:13:45 | 两幅图登场 |
| 00:14:00 | 数据图：三个竖直误差 |
| 00:14:44 | $e_{1}^{2}+e_{2}^{2}+e_{3}^{2}$：最小二乘 |
| 00:14:54 | 统计学注脚：回归 |
| 00:15:32 | 离群值：平方的过度敏感 |
| 00:17:08 | 向量图：$\mathbf{p}=(P_{1},P_{2},P_{3})$ 是列空间最近点 |
| 00:19:01 | 把 $P$ 代入三方程则可解 |
| 00:20:28 | 开算：中心方程 |
| 00:21:19 | "统计学最重要的方程" |
| 00:21:46 | $A^{T}A=\begin{bmatrix}3&6\\6&14\end{bmatrix}$ |
| 00:22:17 | 预报性质：对称、可逆、（将来的）正定 |
| 00:22:47 | $A^{T}\mathbf{b}=(5,11)^{T}$ |
| 00:23:42 | 命名：正规方程 |
| 00:24:16 | 微积分路线：$E(C,D)$ 的偏导数 |
| 00:26:07 | 平方的导数是线性的：两路同归 |
| 00:26:20 | 消元：$2D=1\Rightarrow D=\tfrac12$ |
| 00:26:51 | 回代：$C=\tfrac23$ |
| 00:27:29 | 最佳直线 $y=\tfrac23+\tfrac12 t$ |
| 00:28:00 | $P_{1}=\tfrac76,\ P_{2}=\tfrac53,\ P_{3}=\tfrac{13}{6}$ |
| 00:29:15 | 误差：$-\tfrac16,\tfrac26,-\tfrac16$（符号按 $\mathbf{p}+\mathbf{e}=\mathbf{b}$ 修正） |
| 00:32:21 | $\mathbf{p}\cdot\mathbf{e}=(-7+20-13)/36=0$ |
| 00:33:49 | $\mathbf{e}\perp(1,1,1)$；$\mathbf{e}\perp(1,2,3)$ |
| 00:34:32 | 两幅图合一；$C,D$ = 拼 $\mathbf{p}$ 的组合系数 |
| 00:36:06 | 定理：列无关 ⟹ $A^{T}A$ 可逆 |
| 00:38:17 | 证明开始：设 $A^{T}A\mathbf{x}=0$ |
| 00:40:12 | 妙手：左乘 $\mathbf{x}^{T}$ |
| 00:41:37 | $\|A\mathbf{x}\|^{2}=0\Rightarrow A\mathbf{x}=0$ |
| 00:42:37 | 启用假设：列无关 ⟹ $\mathbf{x}=0$ |
| 00:44:38 | 预告：何时列必然无关 |
| 00:45:01 | 垂直 + 单位长度 ⟹ 必无关 |
| 00:45:42 | 例子：三个坐标向量；$A^{T}A=I$ |
| 00:46:41 | 命名：标准正交（orthonormal） |
| 00:47:06 | 最钟爱的一对：$(\cos\theta,\sin\theta)$、$(-\sin\theta,\cos\theta)$ |
| 00:47:36 | 下一讲：标准正交的好处与施密特正交化 |
