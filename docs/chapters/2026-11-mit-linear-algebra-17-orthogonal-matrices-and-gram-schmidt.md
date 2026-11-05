# 第 17 讲：正交矩阵和施密特正交化

> 英文标题：Orthogonal Matrices and Gram–Schmidt  
> 讲师：Gilbert Strang  
> 整理方式：严格按照教授的实际授课顺序，完整展开课堂推导与计算


## 本讲目录

- [一、开场：正交篇章的收官](#一开场正交篇章的收官)
- [二、标准正交基与 $Q^{T}Q=I$](#二标准正交基与-qᵀqi)
- [三、命名：正交矩阵](#三命名正交矩阵)
- [四、例子清单](#四例子清单)
- [五、为什么好：投影变平凡](#五为什么好投影变平凡)
- [六、为什么好：正规方程化为点积](#六为什么好正规方程化为点积)
- [七、施密特正交化：思想](#七施密特正交化思想)
- [八、三根向量的公式](#八三根向量的公式)
- [九、数值例子](#九数值例子)
- [十、列空间不变](#十列空间不变)
- [十一、矩阵形式：A = QR](#十一矩阵形式a--qr)
- [十二、本章小结与下一章预告](#十二本章小结与下一章预告)
- [十三、课后练习](#十三课后练习)
- [十四、视频时间索引](#十四视频时间索引)

## 一、开场：正交篇章的收官

正交篇章的最后一讲。已经见过正交向量（点积为零）、正交子空间（行空间 ⊥ 零空间……）；今天收官两件：**正交基**与**正交矩阵**。用词严格化：说**标准正交（orthonormal）**——两件事都要：

- **正交**：$\mathbf{q}_{i}^{T}\mathbf{q}_{j}=0\ (i\neq j)$；
- **规范（normal）**：$\mathbf{q}_{i}^{T}\mathbf{q}_{i}=1$（单位向量，长度平方为 1）。

字母约定：写 $\mathbf{q}$ 就提醒读者——这些不是普通向量，是标准正交的。

本讲两半：**前半**——有了标准正交基，一切计算变好（大量数值线性代数围绕它建立：不会溢出、不会失控）；**后半**——若手里的列**不**标准正交，怎么把它们变成标准正交：**施密特正交化（Gram–Schmidt）**。

## 二、标准正交基与 QᵀQ = I

把 $\mathbf{q}_{1},\dots,\mathbf{q}_{n}$ 竖成矩阵 $Q$ 的列。两条件合写成一个矩阵等式——看 $Q^{T}Q$：

$$
\boxed{
Q^{T}Q=I
}
$$

验证：$Q^{T}$ 的第 $i$ 行是 $\mathbf{q}_{i}^{T}$，乘 $Q$ 的第 $j$ 列 $\mathbf{q}_{j}$：对角线上是 $\mathbf{q}_{i}^{T}\mathbf{q}_{i}=1$，其余全为 0——单位矩阵。**这是本讲第一个最基本的实事。**

注意：此时 $Q$ **不必是方阵**——两根标准正交列、各 4 个分量，$Q^{T}Q=I$ 照样成立（$Q^{T}Q$ 问的正是所有点积，而点积只有 0 和 1）。

## 三、命名：正交矩阵

至此认识了一大串矩阵家族：三角阵、对角阵、置换阵（早期）、阶梯形、投影矩阵（本章）、现在的新类——**标准正交列的矩阵**。

按理该叫"标准正交矩阵"，但约定俗成：**只有 $Q$ 是方阵时**才叫**正交矩阵（orthogonal matrix）**。方阵时有大礼：

$$
\boxed{
Q\ \text{方阵}\ \Longrightarrow\ Q^{T}=Q^{-1}
}
$$

（$Q^{T}Q=I$ 直接读出逆——最好记的性质。）

## 四、例子清单

**例 1：任意置换矩阵**。如

$$
Q=\begin{bmatrix}0&0&1\\1&0&0\\0&1&0\end{bmatrix}:
$$

列全是坐标向量的重排——单位、互相垂直。$Q^{T}$ 也是正交矩阵，$Q^{T}Q=I$。

**例 2：旋转矩阵**。

$$
Q=\begin{bmatrix}
\cos\theta&-\sin\theta\\
\sin\theta&\cos\theta
\end{bmatrix}
$$

两列都是单位向量，点积 $-\sin\theta\cos\theta+\sin\theta\cos\theta=0$ ✓。

**例 3：差一点就行的**。$\begin{bmatrix}1&1\\1&-1\end{bmatrix}$：列正交但长度 $\sqrt2$——**除以 $\sqrt2$**：

$$
\frac{1}{\sqrt2}\begin{bmatrix}1&1\\1&-1\end{bmatrix}
$$

——正是例 2 取 $\theta=\tfrac{\pi}{4}$ 的特例。

**例 4：阿达马矩阵（Hadamard）**——世上最受宠的正交矩阵之一（纯 $\pm1$，再除以 2）：

$$
\frac12
\begin{bmatrix}
1&1&1&1\\
1&-1&1&-1\\
1&1&-1&-1\\
1&-1&-1&1
\end{bmatrix}
$$

（列间点积：两个减两个加 = 0；长度 $=2$，除以 2。）已知 $2,4,16,64,\dots$ 尺寸可造；哪些尺寸存在 $\pm1$ 正交矩阵**至今是未解问题**（5×5 肯定没有；某些尺寸无人知晓）。

**例 5：长方形的**。$3\times3$ 里取两根标准正交列：

$$
\mathbf{q}_{1}=\frac13\begin{bmatrix}1\\2\\2\end{bmatrix},
\qquad
\mathbf{q}_{2}=\frac13\begin{bmatrix}-2\\-1\\2\end{bmatrix}
$$

（长度 $=\sqrt{1+4+4}=3$；点积 $-2-2+4=0$ ✓。）第三根可以现成凑出（先除以长度，再调符号凑正交）：

$$
\mathbf{q}_{3}=\frac13\begin{bmatrix}2\\-2\\1\end{bmatrix}
\quad(\text{与 }\mathbf{q}_{1}\text{ 点积 }2-4+2=0\text{，与 }\mathbf{q}_{2}\text{ 点积 }-4+2+2=0\ \checkmark)
$$

（施密特正交化的代价是**开方**——除以长度必然遇到平方根；这几个例子的整数化是幸运的例外。）

另注意：**标准正交向量必无关**——彼此九十度，任何组合给零便逐项相消为零。

## 五、为什么好：投影变平凡

$Q$ 有标准正交列，往其列空间投影。投影矩阵的通用公式（上一讲）

$$
P=Q(Q^{T}Q)^{-1}Q^{T}
$$

中，中间的 $(Q^{T}Q)^{-1}=I^{-1}=I$——**不用求逆**：

$$
\boxed{
P=QQ^{T}
}
$$

性质当场自查：$QQ^{T}$ 对称 ✓；$(QQ^{T})(QQ^{T})=Q(Q^{T}Q)Q^{T}=QQ^{T}$ 幂等 ✓。

特例：$Q$ 是方阵时列空间 = 全空间，$P=I$（谁都在原位，投影不必挪动）。

## 六、为什么好：正规方程化为点积

正规方程 $A^{T}A\hat{\mathbf{x}}=A^{T}\mathbf{b}$ 中令 $A=Q$：

$$
Q^{T}Q\,\hat{\mathbf{x}}=Q^{T}\mathbf{b}
\quad\Longrightarrow\quad
\boxed{
\hat{\mathbf{x}}=Q^{T}\mathbf{b}
}
$$

左边直接塌成单位阵——**不用解方程组、不用求逆**。逐分量看：

$$
\hat{x}_{i}=\mathbf{q}_{i}^{T}\mathbf{b}
\qquad\text{（第 }i\text{ 个系数 = 第 }i\text{ 根基向量与 }\mathbf{b}\text{ 的点积）}
$$

教授点评：**这可能是数学几个重要领域里最重要的公式**——有标准正交基时，向基方向的投影就是一个点积（傅里叶级数的伏笔）。

## 七、施密特正交化：思想

后半场：手里只有**无关**向量，要造标准正交。类比：消元的目标是把矩阵变**三角**；正交化的目标是把矩阵的列变**标准正交**。

从两根无关向量 $\mathbf{a},\mathbf{b}$ 出发（可在 2 维或 12 维，无所谓）。目标：先造**正交**的 $\mathbf{A},\mathbf{B}$，再除以长度得 $\mathbf{q}_{1},\mathbf{q}_{2}$。

**分工笑话**：施密特的贡献——"除以长度"（简单）；格拉姆的想法——怎么造出 $\mathbf{B}$。

**造 $\mathbf{A}$**：第一个方向不用动，$\mathbf{A}=\mathbf{a}$。

**造 $\mathbf{B}$**：麻烦在 $\mathbf{b}$ 不垂直于 $\mathbf{a}$。哪里的向量天生垂直于 $\mathbf{A}$？——**本章的第一个计算**：投影！$\mathbf{b}$ 在 $\mathbf{A}$ 方向上的投影是 $\dfrac{\mathbf{A}^{T}\mathbf{b}}{\mathbf{A}^{T}\mathbf{A}}\mathbf{A}$，而我们要的恰恰是**剩下的那一块**——误差向量：

$$
\boxed{
\mathbf{B}=\mathbf{b}-\frac{\mathbf{A}^{T}\mathbf{b}}{\mathbf{A}^{T}\mathbf{A}}\,\mathbf{A}
}
$$

（当初拼命想求的投影，现在是要扔掉的部分；留下的是垂直部分。它不会是零——$\mathbf{b}$ 与 $\mathbf{a}$ 无关，否则只剩一个方向。）

**验证正交**：

$$
\mathbf{A}^{T}\mathbf{B}
=\mathbf{A}^{T}\mathbf{b}-\frac{\mathbf{A}^{T}\mathbf{A}}{\mathbf{A}^{T}\mathbf{A}}\mathbf{A}^{T}\mathbf{b}=0.\quad\checkmark
$$

最后一步（施密特的功劳）：$\mathbf{q}_{1}=\mathbf{A}/\|\mathbf{A}\|$、$\mathbf{q}_{2}=\mathbf{B}/\|\mathbf{B}\|$。

## 八、三根向量的公式

典型考题：给三根无关向量，造标准正交基。第三个的减法要做两次——从 $\mathbf{c}$ 里扣掉它在 $\mathbf{A}$ 方向和 $\mathbf{B}$ 方向的投影：

$$
\boxed{
\mathbf{C}=\mathbf{c}
-\frac{\mathbf{A}^{T}\mathbf{c}}{\mathbf{A}^{T}\mathbf{A}}\,\mathbf{A}
-\frac{\mathbf{B}^{T}\mathbf{c}}{\mathbf{B}^{T}\mathbf{B}}\,\mathbf{B}
}
\qquad\text{然后}\ \mathbf{q}_{3}=\mathbf{C}/\|\mathbf{C}\|.
$$

（应当垂直于 $\mathbf{A}$ 与 $\mathbf{B}$；只差单位化。）

## 九、数值例子

$$
\mathbf{a}=\begin{bmatrix}1\\1\\1\end{bmatrix},
\qquad
\mathbf{b}=\begin{bmatrix}1\\0\\2\end{bmatrix}
\quad(\text{不正交——否则不用算了}).
$$

**第一步**：$\mathbf{A}=\mathbf{a}=(1,1,1)$。

**第二步**：

$$
\mathbf{A}^{T}\mathbf{b}=1+0+2=3,
\qquad
\mathbf{A}^{T}\mathbf{A}=3,
$$

$$
\mathbf{B}=\mathbf{b}-\frac{3}{3}\,\mathbf{A}
=\begin{bmatrix}1\\0\\2\end{bmatrix}-\begin{bmatrix}1\\1\\1\end{bmatrix}
=\begin{bmatrix}0\\-1\\1\end{bmatrix}.
$$

**检验**：$\mathbf{A}\cdot\mathbf{B}=0-1+1=0$ ✓。

**单位化**：

$$
\boxed{
\mathbf{q}_{1}=\frac{1}{\sqrt3}\begin{bmatrix}1\\1\\1\end{bmatrix},
\qquad
\mathbf{q}_{2}=\frac{1}{\sqrt2}\begin{bmatrix}0\\-1\\1\end{bmatrix},
\qquad
Q=
\begin{bmatrix}
\tfrac{1}{\sqrt3}&0\
\tfrac{1}{\sqrt3}&-\tfrac{1}{\sqrt2}\
\tfrac{1}{\sqrt3}&\tfrac{1}{\sqrt2}
\end{bmatrix}
}
$$

——从原来的 $\begin{bmatrix}1&1\\1&0\\1&2\end{bmatrix}$ 到这个 $Q$，就是施密特正交化做的全部事情。

## 十、列空间不变

提问：$C(Q)$ 与 $C(A)$ 什么关系？——**同一个空间**。

两个向量在 $\mathbb{R}^{3}$ 里张成一张平面；算出的 $\mathbf{B}$ 本来就是 $\mathbf{b}$ 与 $\mathbf{a}$ 的组合——一直在同一平面里打转，只是把夹角全调成 $90°$。原来的列空间有一组好基，但不如这组好——因为不标准正交；现在投影、求解一切计算都成了"小菜一碟"。

## 十一、矩阵形式：A = QR

最后一击：像"消元 ⟹ $A=LU$"一样，施密特正交化也该有矩阵语言：

$$
\boxed{
A=QR
}
$$

（$A$：原来的列；$Q$：施密特产出的标准正交列；$R$：记录组合系数的矩阵。）$A$ 的每列是 $\mathbf{q}$ 们的组合，系数装进 $R$。

**主结论：$R$ 是上三角阵**。以两列为例，$R=Q^{T}A$ 的四个元素：

$$
R=
\begin{bmatrix}
\mathbf{q}_{1}^{T}\mathbf{a}_{1}&\mathbf{q}_{1}^{T}\mathbf{a}_{2}\
\mathbf{q}_{2}^{T}\mathbf{a}_{1}&\mathbf{q}_{2}^{T}\mathbf{a}_{2}
\end{bmatrix},
\qquad
\mathbf{a}_{1}^{T}\mathbf{q}_{2}=0!
$$

为什么那个零在？——$\mathbf{q}_{2}$ 的前身 $\mathbf{B}$ 的构造目标就是**垂直于 $\mathbf{a}_{1}$**（把 $\mathbf{a}_{1}$ 方向的投影全扣掉了）。施密特正交化让**后面的 $\mathbf{q}$ 垂直于前面所有的 $\mathbf{a}$**，于是 $R$ 左下角永远是零——上三角。

**数值例子的 $R$**：

$$
R=Q^{T}A:
\quad
\begin{aligned}
r_{11}&=\mathbf{q}_{1}^{T}\mathbf{a}_{1}=\sqrt3,\\
r_{12}&=\mathbf{q}_{1}^{T}\mathbf{a}_{2}=\tfrac{1+0+2}{\sqrt3}=\sqrt3,\\
r_{21}&=\mathbf{q}_{2}^{T}\mathbf{a}_{1}=\tfrac{0-1+1}{\sqrt2}=0,\\
r_{22}&=\mathbf{q}_{2}^{T}\mathbf{a}_{2}=\tfrac{0+0+2}{\sqrt2}=\sqrt2.
\end{aligned}
$$

$$
R=
\begin{bmatrix}
\sqrt3&\sqrt3\\
0&\sqrt2
\end{bmatrix},
\qquad
QR=
\begin{bmatrix}
1&1\\
1&-1\\
1&2
\end{bmatrix}
=A.\quad\checkmark
$$

总结陈词：**列无关的 $A$，经施密特正交化得到标准正交列的 $Q$，两者的联系是一个上三角 $R$**——$A=QR$。（"联系是上三角"这一点，请到书里再看一遍。）

## 十二、本章小结与下一章预告

正交篇章收官。全章三步：向量正交（点积为零）→ 子空间正交（四子空间两两配对）→ 标准正交基与 $A=QR$。

下一章换个数学对象：**行列式**。

## 十三、课后练习

### 练习 1：判定与修补

下列矩阵哪些满足 $Q^{T}Q=I$？不满足的请最小修正：

(a) $\begin{bmatrix}1&0\\0&-1\end{bmatrix}$；(b) $\begin{bmatrix}1&1\\1&1\end{bmatrix}$；(c) $\frac{1}{3}\begin{bmatrix}1&2\\2&-1\\2&2\end{bmatrix}$。

#### 解答

**(a) 满足**：列 $(1,0)$、$(0,-1)$ 单位且正交（这是反射矩阵）。

**(b) 不满足**：列 $(1,1)$、$(1,1)$ 平行！修正：改第二列为 $(-1,1)$ 并除以 $\sqrt2$：$\frac{1}{\sqrt2}\begin{bmatrix}1&1\\1&-1\end{bmatrix}$（即本讲例 3）。

**(c) 满足**：列 $\tfrac13(1,2,2)$、$\tfrac13(2,-1,2)$：长度 $=\tfrac13\cdot3=1$ ✓；点积 $\tfrac19(2-2+4)=0$ ✓。

### 练习 2：三根向量的施密特正交化

对 $\mathbf{a}=(1,1,1)$、$\mathbf{b}=(1,0,2)$、$\mathbf{c}=(1,2,3)$… 为减小计算量，改用 $\mathbf{c}=(2,1,3)$？——直接按原题：对 $\mathbf{a}=(1,1,1)$、$\mathbf{b}=(1,0,2)$、$\mathbf{c}=(1,2,3)$ 施密特正交化。

#### 解答

前两步沿用第九节：$\mathbf{A}=(1,1,1)$，$\mathbf{B}=(0,-1,1)$。

第三步：

$$
\mathbf{A}^{T}\mathbf{c}=1+2+3=6,
\qquad
\mathbf{B}^{T}\mathbf{c}=0-2+3=1,
\qquad
\mathbf{B}^{T}\mathbf{B}=2.
$$

$$
\mathbf{C}=\mathbf{c}-\frac{6}{3}\mathbf{A}-\frac{1}{2}\mathbf{B}
=\begin{bmatrix}1\\2\\3\end{bmatrix}
-2\begin{bmatrix}1\\1\\1\end{bmatrix}
-\frac12\begin{bmatrix}0\\-1\\1\end{bmatrix}
=\begin{bmatrix}1-2\\2-2+\tfrac12\\3-2-\tfrac12\end{bmatrix}
=\begin{bmatrix}-1\\ \tfrac12\\ \tfrac12\end{bmatrix}
\propto\begin{bmatrix}-2\\1\\1\end{bmatrix}.
$$

检验：$\mathbf{A}\cdot(-2,1,1)=0$ ✓；$\mathbf{B}\cdot(-2,1,1)=0+(-1)+1=0$ ✓。$\mathbf{q}_{3}=\frac{1}{\sqrt6}(-2,1,1)^{T}$。

### 练习 3：A = QR 的拼装

对练习 2 的完整 $A=[\,\mathbf{a}\ \mathbf{b}\ \mathbf{c}\,]$，写出 $Q$ 的三列与 $R$（利用 $R=Q^{T}A$），并验证 $A=QR$。

#### 解答

$$
Q=
\begin{bmatrix}
\tfrac{1}{\sqrt3}&0&-\tfrac{2}{\sqrt6}\
\tfrac{1}{\sqrt3}&-\tfrac{1}{\sqrt2}&\tfrac{1}{\sqrt6}\
\tfrac{1}{\sqrt3}&\tfrac{1}{\sqrt2}&\tfrac{1}{\sqrt6}
\end{bmatrix}.
$$

$R=Q^{T}A$（逐项算点积）：

- 第一列：$\mathbf{q}_{1}^{T}\mathbf{a}=\sqrt3$；$\mathbf{q}_{2}^{T}\mathbf{a}=0$；$\mathbf{q}_{3}^{T}\mathbf{a}=\tfrac{-2+1+1}{\sqrt6}=0$；
- 第二列：$\mathbf{q}_{1}^{T}\mathbf{b}=\sqrt3$；$\mathbf{q}_{2}^{T}\mathbf{b}=\sqrt2$；$\mathbf{q}_{3}^{T}\mathbf{b}=\tfrac{-2+0+2}{\sqrt6}=0$；
- 第三列：$\mathbf{q}_{1}^{T}\mathbf{c}=\sqrt3$；$\mathbf{q}_{2}^{T}\mathbf{c}=\tfrac{-2+3}{\sqrt2}=\tfrac{1}{\sqrt2}$；$\mathbf{q}_{3}^{T}\mathbf{c}=\tfrac{-2+2+3}{\sqrt6}=\tfrac{3}{\sqrt6}$。

$$
R=
\begin{bmatrix}
\sqrt3&\sqrt3&\sqrt3\\
0&\sqrt2&\tfrac{1}{\sqrt2}\\
0&0&\tfrac{3}{\sqrt6}
\end{bmatrix}
\quad\text{（上三角 ✓）}
$$

验证抽查：$Q$ 第 1 列 $\times R$ 第 1 列 $=\sqrt3\cdot\mathbf{q}_{1}=\mathbf{a}$ ✓；$Q$ 第 2 列组合：$\sqrt3\,\mathbf{q}_{1}+\sqrt2\,\mathbf{q}_{2}=(1,0,2)=\mathbf{b}$ ✓（第一列 $\mathbf{q}_{3}$ 系数为 0——正是上三角的零）。

### 练习 4：标准正交基下的系数

$\mathbf{b}=(6,0,0)$，用第九节的 $\mathbf{q}_{1},\mathbf{q}_{2}$（$Q$ 两列）求 $\hat{\mathbf{x}}=Q^{T}\mathbf{b}$ 及投影 $\mathbf{p}=Q\hat{\mathbf{x}}$。

#### 解答

$$
\hat{\mathbf{x}}=Q^{T}\mathbf{b}=
\begin{bmatrix}
\tfrac{6}{\sqrt3}\
0
\end{bmatrix}
=
\begin{bmatrix}2\sqrt3\\0\end{bmatrix}.
$$

$$
\mathbf{p}=Q\hat{\mathbf{x}}=2\sqrt3\,\mathbf{q}_{1}+0\cdot\mathbf{q}_{2}
=2\sqrt3\cdot\tfrac13(1,1,1)^{T}
=\tfrac{2}{\sqrt3}(1,1,1)^{2}
=\begin{bmatrix}\tfrac{2\sqrt3}{3}\\ \tfrac{2\sqrt3}{3}\\ \tfrac{2\sqrt3}{3}\end{bmatrix}
=\begin{bmatrix}2\\2\\2\end{bmatrix}\cdot\tfrac{1}{\sqrt3}\cdot\sqrt3
$$

老实算：$2\sqrt3\times\tfrac13=\tfrac{2\sqrt3}{3}=\tfrac{2}{\sqrt3}$。所以 $\mathbf{p}=(\tfrac{2}{\sqrt3},\tfrac{2}{\sqrt3},\tfrac{2}{\sqrt3})$。检验：$\mathbf{b}-\mathbf{p}=(6-\tfrac{2}{\sqrt3},-\tfrac{2}{\sqrt3},-\tfrac{2}{\sqrt3})$ 与 $\mathbf{q}_{1}$ 点积：$\tfrac16(6-\tfrac2{\sqrt3})-\tfrac{2}{3\sqrt3}-\tfrac{2}{3\sqrt3}=1-\tfrac{2}{3\sqrt3}\cdot3=1-\tfrac{2}{\sqrt3}$？

认真验算：$\mathbf{q}_{1}^{T}(\mathbf{b}-\mathbf{p})=\mathbf{q}_{1}^{T}\mathbf{b}-\mathbf{q}_{1}^{T}\mathbf{p}=2\sqrt3-2\sqrt3=0$ ✓（由构造直接成立，无需展开数字）。系数即点积——这正是第六节公式在实战中的省力之处。

## 十四、视频时间索引

以下时间点依据本地下载版本的字幕整理，顺序与正文一致：

| 时间 | 教授的授课内容 |
|---|---|
| 00:00:07 | 开场：正交篇章收官 |
| 00:00:43 | 标准正交：正交 + 单位长度 |
| 00:01:59 | 好处：计算不失控（数值线性代数） |
| 00:03:17 | 矩阵形式：$Q^{T}Q=I$ |
| 00:04:51 | $Q$ 不必方阵 |
| 00:06:11 | 命名：方阵时叫正交矩阵 |
| 00:07:19 | 方阵大礼：$Q^{T}=Q^{-1}$ |
| 00:08:12 | 例 1：置换矩阵 |
| 00:09:43 | 例 2：旋转 $\begin{bmatrix}\cos\theta&-\sin\theta\\\sin\theta&\cos\theta\end{bmatrix}$ |
| 00:10:19 | 例 3：$\begin{bmatrix}1&1\\1&-1\end{bmatrix}$ 除以 $\sqrt2$（$\theta=\tfrac\pi4$） |
| 00:11:26 | 例 4：阿达马矩阵（$\pm1$ 除以 2） |
| 00:12:49 | 阿达马的存在性是未解问题 |
| 00:14:02 | 例 5：长方形（$\tfrac13(1,2,2)$ 等） |
| 00:15:45 | 标准正交必无关 |
| 00:16:06 | 凑第三列 $\tfrac13(2,-2,1)$；施密特的平方根代价 |
| 00:17:42 | 投影矩阵：$P=Q(Q^{T}Q)^{-1}Q^{T}=QQ^{T}$ |
| 00:20:06 | 方阵特例：$P=I$ |
| 00:21:41 | 性质自查：对称、幂等 |
| 00:23:02 | 正规方程塌缩：$\hat{\mathbf{x}}=Q^{T}\mathbf{b}$ |
| 00:24:09 | 逐分量：$\hat{x}_{i}=\mathbf{q}_{i}^{T}\mathbf{b}$ |
| 00:24:26 | "数学几个重要领域最重要的公式" |
| 00:25:10 | 后半场：施密特正交化 |
| 00:25:43 | 类比：消元奔三角、正交化奔正交 |
| 00:27:03 | 分工玩笑：施密特除长度、格拉姆做减法 |
| 00:28:58 | $\mathbf{A}=\mathbf{a}$；$\mathbf{B}=\mathbf{b}-\dfrac{\mathbf{A}^{T}\mathbf{b}}{\mathbf{A}^{T}\mathbf{A}}\mathbf{A}$ |
| 00:30:19 | $\mathbf{B}$ 就是当年的误差向量 $\mathbf{e}$ |
| 00:32:58 | 验证 $\mathbf{A}^{T}\mathbf{B}=0$ |
| 00:34:05 | 三根向量的公式：扣两个投影 |
| 00:38:10 | 数值例子 $\mathbf{a}=(1,1,1)$、$\mathbf{b}=(1,0,2)$ |
| 00:39:57 | $\mathbf{A}^{T}\mathbf{b}=3=\mathbf{A}^{T}\mathbf{A}$：比例恰为 1 |
| 00:40:39 | $\mathbf{B}=(0,-1,1)$；正交检验 |
| 00:41:07 | $\mathbf{q}_{1},\mathbf{q}_{2}$ 单位化；$Q$ |
| 00:42:33 | 列空间不变（同一平面） |
| 00:44:09 | 矩阵形式 $A=QR$ |
| 00:44:44 | 类比消元的 $A=LU$ |
| 00:46:45 | $R$ 的元素 = 点积；$\mathbf{a}_{1}^{T}\mathbf{q}_{2}=0$ |
| 00:47:49 | 上三角的原因：后面的 $\mathbf{q}$ 垂直于前面的 $\mathbf{a}$ |
| 00:48:23 | 总结：$A$（无关列）→ $Q$（正交列）→ 联系 = 上三角 $R$ |
| 00:48:56 | 收尾 |
