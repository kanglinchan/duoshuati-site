# 第 3 讲 · 矩阵乘法和逆矩阵

> 对应 MIT 18.06《Linear Algebra》Lecture 3：*Multiplication and Inverse Matrices*（Gilbert Strang）。
> 这是这门课的中文学习笔记：知识点跟原课对齐，讲法和例子按中文读者的习惯重新组织。

上一讲我们已经在算 $E_{32}E_{21}$ 这样的矩阵乘法了，但一直是"照着感觉按"——为什么那样乘是对的？这一讲把规则一次讲透，然后顺势回答上一讲结尾留下的问题：怎么系统地求出一个矩阵的逆。

读完这篇，你能做到三件事：

1. 用**五种**不同方式理解和计算同一个矩阵乘法 $AB=C$，并且知道每种方式适合什么场合；
2. 用一条最快的判据判断方阵不可逆：存在非零 $\mathbf{x}$ 使 $A\mathbf{x}=\mathbf{0}$；
3. 用高斯–若尔当法把 $[A\mid I]$ 消成 $[I\mid A^{-1}]$，并说清它为什么成立。

边界先声明：本讲的逆矩阵只讨论方阵；二阶行列式 $ad-bc$ 只借来用一下，系统讲解在第 18 讲；长方形矩阵的左逆右逆是第 33 讲的话题，这里不碰。

为什么一个乘法要学五种算法？因为它们不是五种"等价考试解法"，而是五把刻刀：手算单个元素用点积；理解消元和方程组用列观点；第 4 讲的 LU 分解靠行观点和分块；而"列乘行"会在第 11 讲把任何矩阵拆成一批简单矩阵之和。现在多花十分钟，后面几十讲都在收利息。

## 1. 第一种算法：逐个元素，行乘列

设 $AB=C$。先说记号：$C$ 的第 $i$ 行、第 $j$ 列元素记作 $c_{ij}$，下标顺序永远是**先行号、后列号**。

拿 $c_{34}$（第 3 行、第 4 列）开刀。它由 $A$ 的第 3 行和 $B$ 的第 4 列做点积得到：

$$
c_{34}=(A\text{ 的第 3 行})\cdot(B\text{ 的第 4 列})
=a_{31}b_{14}+a_{32}b_{24}+\cdots+a_{3n}b_{n4}
$$

核对下标：$a_{31}$ 是 $A$ 第 3 行第 1 列，$b_{14}$ 是 $B$ 第 1 行第 4 列——沿 $A$ 的一行向右走，同时沿 $B$ 的一列向下走，对应相乘再全部相加。紧凑写成求和：

$$
\boxed{c_{ij}=\sum_{k=1}^{n}a_{ik}b_{kj}}
$$

这是你在大多数教材里看到的定义，也是手算时最常用的。

## 2. 什么时候能乘：形状要对上

矩阵不是随便两个都能相乘。设 $A$ 是 $m\times n$（$m$ 行 $n$ 列），$B$ 是 $n\times p$。

能乘的原因藏在点积里：$A$ 的每一行有 $n$ 个数，$B$ 的每一列也得有 $n$ 个数，两边长度相同才点得起来。所以：

$$
\boxed{\text{A 的列数必须等于 B 的行数}}
$$

结果的形状是外层决定、中间对消：

$$
(m\times n)(n\times p)=(m\times p)
$$

结果共 $mp$ 个元素，每个都能用第 1 节的公式算出来。

## 3. 第二种算法：一次算一整列

逐元素算虽然稳，但看不清结构。把 $B$ 按列拆开，让 $A$ 分别去乘每一列：

$$
AB=A\begin{bmatrix}|&|&&|\\ \mathbf{b}_1&\mathbf{b}_2&\cdots&\mathbf{b}_p\\ |&|&&|\end{bmatrix}
=\begin{bmatrix}|&|&&|\\ A\mathbf{b}_1&A\mathbf{b}_2&\cdots&A\mathbf{b}_p\\ |&|&&|\end{bmatrix}
$$

即 $\mathbf{c}_j=A\mathbf{b}_j$：**结果的第 $j$ 列，就是 $A$ 乘 $B$ 的第 $j$ 列**。

再往下挖一层。第 1 讲的结论说矩阵乘列向量 = 各列的线性组合，所以

$$
\mathbf{c}_j=b_{1j}\mathbf{a}_1+b_{2j}\mathbf{a}_2+\cdots+b_{nj}\mathbf{a}_n
$$

**$C$ 的每一列都是 $A$ 各列的线性组合**，$B$ 里的数字负责报配方比例。形状上也能对上：$A$ 有 $m$ 行，$A$ 的列就有 $m$ 个分量，$C$ 的列也必须是 $m$ 个分量。

![列观点（动态）：A 乘 B 的每一列 = A 作用在 B 的对应列向量上](/assets/images/mit1806/mit1806-03-ax-b-columns.gif)

这个看法立刻有实战价值：上一讲 $EA=U$，$E$ 左乘 $A$，$U$ 的每一列都是 $E$ 各列的组合——消元从来不碰"列的配方结构"以外的东西。

## 4. 第三种算法：一次算一整行

对称地，把 $A$ 按行拆。设 $A$ 的第 $i$ 行为行向量 $\mathbf{a}_{i*}$，则

$$
\boxed{\mathbf{c}_{i*}=\mathbf{a}_{i*}B}
$$

结果第 $i$ 行 = $A$ 的第 $i$ 行去乘整个 $B$。展开：

$$
\mathbf{c}_{i*}=a_{i1}\mathbf{b}_{1*}+a_{i2}\mathbf{b}_{2*}+\cdots+a_{in}\mathbf{b}_{n*}
$$

**$C$ 的每一行都是 $B$ 各行的线性组合**，这次由 $A$ 报比例。上一讲构造消元矩阵 $E_{21}$ 时"每一行说明怎么组合 $A$ 的三行"，用的正是这个观点。

小结一下，同一道乘法已经有三张面孔：元素（$A$ 的行点 $B$ 的列）、列（$A$ 各列的组合）、行（$B$ 各行的组合）。

## 5. 第四种算法：列乘行，加出一整个矩阵

### 5.1 列乘行 ≠ 行乘列

一行乘一列，$(1\times n)(n\times1)$，点积塌缩成一个数。反过来，一列乘一行，$(m\times1)(1\times p)$，中间没有可对消的维度，结果是一个**完整的 $m\times p$ 矩阵**。

课堂例子，列 $(2,3,4)^T$ 乘行 $[1,6]$。逐行算：$2[1,6]=[2,12]$，$3[1,6]=[3,18]$，$4[1,6]=[4,24]$：

$$
\begin{bmatrix}2\\3\\4\end{bmatrix}\begin{bmatrix}1&6\end{bmatrix}
=\begin{bmatrix}2&12\\3&18\\4&24\end{bmatrix}
$$

### 5.2 完整的 AB 是若干"列乘行"之和

设 $A$ 的第 $k$ 列为 $\mathbf{a}_k$、$B$ 的第 $k$ 行为 $\mathbf{b}_{k*}$，则

$$
\boxed{AB=\sum_{k=1}^{n}\mathbf{a}_k\mathbf{b}_{k*}
=\mathbf{a}_1\mathbf{b}_{1*}+\mathbf{a}_2\mathbf{b}_{2*}+\cdots+\mathbf{a}_n\mathbf{b}_{n*}}
$$

每一项是一个完整矩阵，最后全加起来。验证一个完整例子：

$$
A=\begin{bmatrix}2&7\\3&8\\4&9\end{bmatrix},
\qquad
B=\begin{bmatrix}1&6\\0&0\end{bmatrix}
$$

第一列乘第一行就是刚才算过的 $\begin{bmatrix}2&12\\3&18\\4&24\end{bmatrix}$；第二列 $(7,8,9)^T$ 乘第二行 $[0,0]$ 全是零矩阵。相加：

$$
AB=\begin{bmatrix}2&12\\3&18\\4&24\end{bmatrix}+\begin{bmatrix}0&0\\0&0\\0&0\end{bmatrix}
=\begin{bmatrix}2&12\\3&18\\4&24\end{bmatrix}
$$

用第 1 节的元素公式抽查：第 $(1,1)$ 元素 $2(1)+7(0)=2$，第 $(3,2)$ 元素 $4(6)+9(0)=24$——两法一致。

### 5.3 这个结果矩阵长得非常特别

看 $\begin{bmatrix}2&12\\3&18\\4&24\end{bmatrix}$ 的结构。列方向：第二列 $(12,18,24)^T=6(2,3,4)^T$，两列共线，都在 $(2,3,4)^T$ 决定的直线上。行方向：三行分别是 $2[1,6]$、$3[1,6]$、$4[1,6]$，全部落在 $[1,6]$ 决定的直线上。

所有列的组合叫列空间，所有行的组合叫行空间（第 6 讲正式定义）——这个"列乘行"矩阵的列空间和行空间都只是一条直线。它是最"瘦"的一类矩阵，第 11 讲会把任意矩阵拆成若干个这样的积木。

![矩阵乘法的四种看法：行×列、列组合、行组合、列乘行求和](/assets/images/mit1806/mit1806-03-four-ways.png)

## 6. 第五种算法：分块乘法

最后一种最省事：把大矩阵切成块，假装块是数字。

$$
A=\begin{bmatrix}A_1&A_2\\A_3&A_4\end{bmatrix},
\qquad
B=\begin{bmatrix}B_1&B_2\\B_3&B_4\end{bmatrix}
$$

这里的 $A_1,\ldots,B_4$ 不是数，是小矩阵。只要块的形状互相配合，就按二阶乘法算：

$$
AB=\begin{bmatrix}
A_1B_1+A_2B_3 & A_1B_2+A_2B_4\\
A_3B_1+A_4B_3 & A_3B_2+A_4B_4
\end{bmatrix}
$$

注意左上角块是 $A_1B_1+A_2B_3$：来自 $A$ 的第一块行 $[A_1\ A_2]$ 与 $B$ 的第一块列 $[B_1\ B_3]^T$ 的"块点积"。比如一个 $20\times20$ 矩阵可以切成四个 $10\times10$ 块，先算小的。块的尺寸不必统一，但相乘、相加的块形状必须匹配——分块乘法没有新规则，它就是把前四种算法打包复用。

五种算法到齐：元素、列、行、列乘行、分块。它们算出同一个 $C$，区别只在你想看清哪一面。

## 7. 逆矩阵：定义与第一个反例

后半场讲逆矩阵。只看方阵 $A$，第一个问题不是"逆是多少"，而是"逆存不存在"。

**定义**：如果存在矩阵 $A^{-1}$ 使得

$$
\boxed{A^{-1}A=I\quad\text{且}\quad AA^{-1}=I}
$$

就称 $A$ 可逆。可逆方阵又叫**非奇异矩阵（non-singular matrix）**，不可逆的叫**奇异矩阵（singular matrix）**。对**方阵**而言，找到左逆就自动有右逆，两边是一回事；这个好性质对长方形矩阵不成立，别外推。

### 7.1 一个没有逆的矩阵

$$
A=\begin{bmatrix}1&3\\2&6\end{bmatrix}
$$

两个角度都能看出它没救。

用二阶行列式（第 18 讲正式讲，先用结论）$\det\begin{bmatrix}a&b\\c&d\end{bmatrix}=ad-bc$：

$$
\det A=1(6)-3(2)=6-6=0
$$

行列式为零，不可逆。

用第 1 讲的列图像看更本质：两列 $(1,2)^T$ 与 $(3,6)^T$，第二列是第一列的 3 倍，所有列组合 $(x+3y)\begin{bmatrix}1\\2\end{bmatrix}$ 全趴在一条直线上。而 $I$ 的第一列 $\mathbf{e}_1=(1,0)^T$ 不在这条线上——不存在 $t$ 使 $t(1,2)^T=(1,0)^T$（第一分量要求 $t=1$，第二分量要求 $t=0$，打架）。任何 $AB$ 的列都得是 $A$ 各列的组合，所以 $AB$ 永远凑不出 $I$。

### 7.2 最快的判据：Ax = 0 有非零解

教授最推崇的判据一句话：**如果存在非零向量 $\mathbf{x}$ 使 $A\mathbf{x}=\mathbf{0}$，那么 $A$ 不可逆。**

对刚才的矩阵取 $\mathbf{x}=(3,-1)^T$：

$$
A\mathbf{x}=\begin{bmatrix}1(3)+3(-1)\\2(3)+6(-1)\end{bmatrix}
=\begin{bmatrix}3-3\\6-6\end{bmatrix}
=\begin{bmatrix}0\\0\end{bmatrix}
$$

用列观点读：三份第一列减一份第二列等于零——两列共线的另一种说法。

证明它为何致命，用反证法。假设 $A^{-1}$ 存在，对 $A\mathbf{x}=\mathbf{0}$ 两边左乘 $A^{-1}$：

$$
A^{-1}(A\mathbf{x})=A^{-1}\mathbf{0}
\;\Longrightarrow\;
(A^{-1}A)\mathbf{x}=\mathbf{0}
\;\Longrightarrow\;
I\mathbf{x}=\mathbf{0}
\;\Longrightarrow\;
\mathbf{x}=\mathbf{0}
$$

（左边用结合律，右边任何矩阵乘零向量都是零向量。）但 $\mathbf{x}=(3,-1)^T\neq\mathbf{0}$，矛盾。直观说：$A$ 把一个非零向量压成了零，方向信息已丢失，而"从零恢复出非零"这件事任何矩阵都做不到。

## 8. 求逆矩阵：先拆成 n 个方程组

换一个可逆的矩阵：

$$
A=\begin{bmatrix}1&3\\2&7\end{bmatrix},
\qquad
\det A=1(7)-3(2)=7-6=1\neq0
$$

两列 $(1,2)^T$、$(3,7)^T$ 不共线，相信可逆。怎么把 $A^{-1}$ 算出来？

把 $A^{-1}$ 的四个元素写成未知数 $A^{-1}=\begin{bmatrix}a&c\\b&d\end{bmatrix}$，目标 $AA^{-1}=I$。用列观点拆开：**结果矩阵的第 $j$ 列 = $A$ 乘 $A^{-1}$ 的第 $j$ 列**。于是两个未知列各自对应一个方程组：

$$
A\begin{bmatrix}a\\b\end{bmatrix}=\begin{bmatrix}1\\0\end{bmatrix}
\;\Longleftrightarrow\;
\begin{cases}a+3b=1\\2a+7b=0\end{cases}
\qquad
A\begin{bmatrix}c\\d\end{bmatrix}=\begin{bmatrix}0\\1\end{bmatrix}
\;\Longleftrightarrow\;
\begin{cases}c+3d=0\\2c+7d=1\end{cases}
$$

一般地，$A^{-1}$ 的第 $j$ 列 $\mathbf{x}_j$ 满足 $A\mathbf{x}_j=\mathbf{e}_j$（$I$ 的第 $j$ 列）。**求逆 = 同时解 $n$ 个方程组**，系数矩阵全是同一个 $A$，只有右侧不同。

那为什么要傻乎乎地解 $n$ 遍？消元过程对同一个 $A$ 完全相同，合并处理就是下一节的高斯–若尔当法。

## 9. 高斯–若尔当法：[A|I] 消成 [I|A⁻¹]

### 9.1 机械步骤

把两个右侧向量 $\mathbf{e}_1,\mathbf{e}_2$ 同时贴在 $A$ 右边：

$$
\left[\begin{array}{cc|cc}1&3&1&0\\2&7&0&1\end{array}\right]
=[A\mid I]
$$

目标：用行操作把左半边变成 $I$，届时右半边自动是 $A^{-1}$。

第一步，向下消元。主元 $1$，乘数 $\ell_{21}=\frac21=2$，执行 $R_2\leftarrow R_2-2R_1$，**整行一起算，包括竖线右边**：

$$
\begin{bmatrix}2&7&0&1\end{bmatrix}-2\begin{bmatrix}1&3&1&0\end{bmatrix}
=\begin{bmatrix}0&1&-2&1\end{bmatrix}
$$

$$
\left[\begin{array}{cc|cc}1&3&1&0\\0&1&-2&1\end{array}\right]
$$

到这一步左半边已是上三角。普通高斯消元在此收手改回代；若尔当（Jordan）的加戏是**继续向上消元**，把左侧直接干成 $I$。

第二步，向上消元。第二主元是 $1$，第一行第二列是 $3$，执行 $R_1\leftarrow R_1-3R_2$：

$$
\begin{bmatrix}1&3&1&0\end{bmatrix}-3\begin{bmatrix}0&1&-2&1\end{bmatrix}
=\begin{bmatrix}1&0&7&-3\end{bmatrix}
$$

容易看走眼的是右侧第一位：$1-3(-2)=1+6=7$，减负数是加法。最终：

$$
\left[\begin{array}{cc|cc}1&0&7&-3\\0&1&-2&1\end{array}\right]
=[I\mid A^{-1}]
\qquad\Longrightarrow\qquad
A^{-1}=\begin{bmatrix}7&-3\\-2&1\end{bmatrix}
$$

### 9.2 三重检验

按第 8 节的两个方程组核对：第一列 $(7,-2)^T$ 满足 $7+3(-2)=1$、$2(7)+7(-2)=0$，正是 $A\mathbf{x}_1=\mathbf{e}_1$；第二列 $(-3,1)^T$ 满足 $-3+3(1)=0$、$2(-3)+7(1)=1$，正是 $A\mathbf{x}_2=\mathbf{e}_2$。

再整体乘一遍。$A^{-1}A$ 的四个元素：$7(1)-3(2)=1$，$7(3)-3(7)=0$，$-2(1)+1(2)=0$，$-2(3)+1(7)=1$，得 $I$。$AA^{-1}$ 同样逐元素：$1(7)+3(-2)=1$，$1(-3)+3(1)=0$，$2(7)+7(-2)=0$，$2(-3)+7(1)=1$，也是 $I$。两个方向都通过。

### 9.3 为什么右边恰好是逆矩阵

步骤人人会按，但凭什么左边变 $I$ 时右边自动变 $A^{-1}$？用第 2 讲的工具说穿它。

第一步 $R_2\leftarrow R_2-2R_1$ 对应初等矩阵 $E_{21}=\begin{bmatrix}1&0\\-2&1\end{bmatrix}$，第二步 $R_1\leftarrow R_1-3R_2$ 对应 $E_{12}=\begin{bmatrix}1&-3\\0&1\end{bmatrix}$。合并（先 $E_{21}$ 后 $E_{12}$，顺序别颠倒）：

$$
E=E_{12}E_{21}
=\begin{bmatrix}1&-3\\0&1\end{bmatrix}\begin{bmatrix}1&0\\-2&1\end{bmatrix}
=\begin{bmatrix}1+6&-3\\-2&1\end{bmatrix}
=\begin{bmatrix}7&-3\\-2&1\end{bmatrix}
$$

对整个长矩阵左乘 $E$，用第 6 节的分块乘法展开：

$$
E[A\mid I]=[EA\mid EI]=[I\mid E]
$$

左半边 $EA$ 是全部行操作作用在 $A$ 上，最后成了 $I$；右半边 $EI$ 只是 $E$ 本身。而 $EA=I$ 恰好说明 $E$ 就是 $A^{-1}$——所以右半边不偏不倚落在逆矩阵上。高斯–若尔当法不是技巧，是分块乘法的必然。

![逆变换（动态）：A 把 x=(1,0) 送到 (1,2)，A⁻¹ 再送回来——两边都回到 x](/assets/images/mit1806/mit1806-03-inverse.gif)

## 小结

- 矩阵乘法五种算法，同一个答案：元素公式 $c_{ij}=\sum_k a_{ik}b_{kj}$；列观点（$C$ 的列是 $A$ 各列的组合）；行观点（$C$ 的行是 $B$ 各行的组合）；列乘行求和 $AB=\sum_k\mathbf{a}_k\mathbf{b}_{k*}$；分块乘法。
- 可乘条件：$A$ 的列数 = $B$ 的行数，$(m\times n)(n\times p)=(m\times p)$；列乘行 $(m\times1)(1\times p)$ 得整矩阵，其行空间、列空间各是一条直线。
- 方阵可逆 $\iff$ 存在 $A^{-1}$ 使 $A^{-1}A=AA^{-1}=I$；方阵的左逆自动是右逆。判据：$\det=0$、列共线、或存在非零 $\mathbf{x}$ 使 $A\mathbf{x}=\mathbf{0}$（反证一行搞定）。
- 求逆 = 解 $n$ 个方程组 $A\mathbf{x}_j=\mathbf{e}_j$；高斯–若尔当把它们合并为 $[A\mid I]\to[I\mid A^{-1}]$，本例 $\begin{bmatrix}1&3\\2&7\end{bmatrix}^{-1}=\begin{bmatrix}7&-3\\-2&1\end{bmatrix}$；原理 $E[A\mid I]=[EA\mid EI]=[I\mid E]$，$E$ 即 $A^{-1}$。

逆矩阵在手，下一讲回头审视第 2 讲的 $EA=U$，把它翻个面变成 $A=LU$——计算机解方程组时真正存储的形状。

## 练一练

**例 1.** 用"逐元素"和"列乘行"两种方法计算 $AB$，其中 $A=\begin{bmatrix}1&2\\3&4\end{bmatrix}$，$B=\begin{bmatrix}2&0\\1&3\end{bmatrix}$。

解. 逐元素：$1(2)+2(1)=4$，$1(0)+2(3)=6$，$3(2)+4(1)=10$，$3(0)+4(3)=12$。列乘行：

$$
AB=\begin{bmatrix}1\\3\end{bmatrix}\begin{bmatrix}2&0\end{bmatrix}
+\begin{bmatrix}2\\4\end{bmatrix}\begin{bmatrix}1&3\end{bmatrix}
=\begin{bmatrix}2&0\\6&0\end{bmatrix}
+\begin{bmatrix}2&6\\4&12\end{bmatrix}
=\begin{bmatrix}4&6\\10&12\end{bmatrix}
$$

两法一致。

**例 2.** 证明 $A=\begin{bmatrix}2&4\\1&2\end{bmatrix}$ 不可逆。

解. 取 $\mathbf{x}=(2,-1)^T\neq\mathbf{0}$：

$$
A\mathbf{x}=\begin{bmatrix}2(2)+4(-1)\\1(2)+2(-1)\end{bmatrix}
=\begin{bmatrix}4-4\\2-2\end{bmatrix}
=\begin{bmatrix}0\\0\end{bmatrix}
$$

若 $A^{-1}$ 存在，左乘得 $(A^{-1}A)\mathbf{x}=I\mathbf{x}=\mathbf{x}=\mathbf{0}$，与 $\mathbf{x}\neq\mathbf{0}$ 矛盾。所以 $A$ 不可逆。（顺带：两列 $(2,1)^T$、$(4,2)^T$ 共线，$\det=2(2)-4(1)=0$，三重印证。）

**例 3.** 用高斯–若尔当法求 $A=\begin{bmatrix}2&1\\1&1\end{bmatrix}$ 的逆。

解. 写出 $[A\mid I]$，先换行把主元换成 $1$（$R_1\leftrightarrow R_2$）：

$$
\left[\begin{array}{cc|cc}1&1&0&1\\2&1&1&0\end{array}\right]
$$

$R_2\leftarrow R_2-2R_1$ 得 $\begin{bmatrix}0&-1&1&-2\end{bmatrix}$；再把第二主元缩成 $1$，$R_2\leftarrow(-1)R_2$ 得 $\begin{bmatrix}0&1&-1&2\end{bmatrix}$；最后向上消元 $R_1\leftarrow R_1-R_2$ 得 $\begin{bmatrix}1&0&1&-1\end{bmatrix}$。于是

$$
A^{-1}=\begin{bmatrix}1&-1\\-1&2\end{bmatrix}
$$

检验：$AA^{-1}$ 逐元素 $2(1)+1(-1)=1$、$2(-1)+1(2)=0$、$1(1)+1(-1)=0$、$1(-1)+1(2)=1$，正是 $I$。
