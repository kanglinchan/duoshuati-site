# 第 22 讲：对角化和矩阵的幂

> 英文标题：Diagonalization and Powers of A  
> 讲师：Gilbert Strang  
> 整理方式：严格按照教授的实际授课顺序，完整展开课堂推导与计算


## 本讲目录

- [一、开场：找到之后做什么](#一开场找到之后做什么)
- [二、核心推导：AS = SΛ](#二核心推导as--sλ)
- [三、新的分解：A = SΛS⁻¹](#三新的分解a--sλs)
- [四、矩阵的幂：A² 与 Aᵏ](#四矩阵的幂a-与-a)
- [五、定理：幂趋于零（稳定性）](#五定理幂趋于零稳定性)
- [六、哪些矩阵可对角化](#六哪些矩阵可对角化)
- [七、不可对角化的例子](#七不可对角化的例子)
- [八、代数重数与几何重数](#八代数重数与几何重数)
- [九、差分方程：u_{k+1} = Au_k](#九差分方程u_1--au_k)
- [十、真正解法：把 u₀ 拆成特征向量](#十真正解法把-u-拆成特征向量)
- [十一、应用：斐波那契数列](#十一应用斐波那契数列)
- [十二、特征方程与递推式的重逢](#十二特征方程与递推式的重逢)
- [十三、黄金比例与增长速度](#十三黄金比例与增长速度)
- [十四、特征向量与初始向量](#十四特征向量与初始向量)
- [十五、静态与动态](#十五静态与动态)
- [十六、课后练习](#十六课后练习)
- [十七、视频时间索引](#十七视频时间索引)

## 一、开场：特征值讲的第二讲

上一讲拿到关键方程 $A\mathbf{x}=\lambda\mathbf{x}$。本讲任务：**用它**——找到特征值与特征向量之后干什么？最好的答案：**把矩阵对角化**。

## 二、核心推导：AS = SΛ

设 $A$ 有 $n$ 个**线性无关**的特征向量，把它们竖成矩阵 $S$ 的列——**特征向量矩阵**。算 $AS$（逐列乘）：

$$
AS=A[\,\mathbf{x}_{1}\ \mathbf{x}_{2}\ \cdots\ \mathbf{x}_{n}\,]
=[\,A\mathbf{x}_{1}\ \ A\mathbf{x}_{2}\ \cdots\ A\mathbf{x}_{n}\,]
=[\,\lambda_{1}\mathbf{x}_{1}\ \ \lambda_{2}\mathbf{x}_{2}\ \cdots\ \lambda_{n}\mathbf{x}_{n}\,].
$$

现在把 $\lambda$ 从各列中"剥"出来——$\lambda_{1}$ 乘的是第一列，正好等于 $S$ 乘一个**对角阵**（$\lambda_{1}$ 放在 $(1,1)$ 位置、其余为零；要 $\lambda_{n}\mathbf{x}_{n}$ 出现在最后一列，就把 $\lambda_{n}$ 放 $(n,n)$）：

$$
\boxed{
AS=S\Lambda,
\qquad
\Lambda=
\begin{bmatrix}
\lambda_{1}&&&\\
&\lambda_{2}&&\\
&&\ddots&\\
&&&\lambda_{n}
\end{bmatrix}
}
$$

——矩阵乘法规则全程在打工；特征值整齐地坐在对角线上。

## 三、新的分解：A = SΛS⁻¹

要能左乘 $S^{-1}$，必须 $S$ 可逆——这正是"**$n$ 个无关特征向量**"假设的用武之地（绝大多数矩阵满足；少数例外本讲后面交代）。

$$
\boxed{
S^{-1}AS=\Lambda
\qquad\Longleftrightarrow\qquad
A=S\Lambda S^{-1}
}
$$

（记忆口诀：**$A$ 乘的是自己的特征向量**——$A$ 紧挨着 $S$；$S^{-1}$ 站在另一头把整个式子对角化。）

这是本课程的新分解：消元给 $A=LU$、施密特给 $A=QR$，现在**对角化给 $A=S\Lambda S^{-1}$**——"矩阵 × 对角阵 × 第一个矩阵的逆"，这一章反复出现的老搭档。

## 四、矩阵的幂：A² 与 Aᵏ

**向量证法**：$A\mathbf{x}=\lambda\mathbf{x}$，两边乘 $A$：

$$
A^{2}\mathbf{x}=A(\lambda\mathbf{x})=\lambda\,A\mathbf{x}=\lambda^{2}\mathbf{x}.
$$

**矩阵证法**：

$$
A^{2}=(S\Lambda S^{-1})(S\Lambda S^{-1})=S\Lambda\underbrace{(S^{-1}S)}_{=I}\Lambda S^{-1}
=S\Lambda^{2}S^{-1}.
$$

两路同归：

$$
\boxed{
A^{2}\ \text{的特征值}=\lambda^{2}\ \text{（平方）},\qquad
\text{特征向量不变}
}
$$

继续 $k$ 次——中间的 $S^{-1}S$ 不断相消：

$$
\boxed{
A^{k}=S\Lambda^{k}S^{-1}
}
$$

（$\Lambda^{k}$ 仍是对角阵：对角线上是 $\lambda_{1}^{k},\dots,\lambda_{n}^{k}$。）于是**$A^{k}$ 的特征值是各 $\lambda$ 的 $k$ 次幂、特征向量与 $A$ 相同**。

对比：$LU$ 自乘一百次得到一百个 $LU$，束手无策；$S\Lambda S^{-1}$ 自乘一百次内部相消九十九次，**一次看清** $A^{100}$。特征值给出了从前无法企及的"矩阵幂的透视"。

## 五、定理：幂趋于零（稳定性）

**定理**（教授特意用"定理"一词标出这个大实事）：

$$
\boxed{
A^{k}\to0\ (k\to\infty)
\iff
\text{所有 }|\lambda_{i}|<1
}
$$

**理由**：$S$ 与 $S^{-1}$ 不随 $k$ 移动，命运全在 $\Lambda^{k}$ 手里——对角元 $\lambda^{k}$ 要消失，须 $|\lambda|<1$。绝对值不可省：$\lambda$ 可以是负的、甚至是复数（旋转矩阵的 $\pm i$，模恰好为 1，不收敛也不爆炸）。

**持续有效的假设**：整套推理基于 $n$ 个无关特征向量。若没有，就无法对角化、无法到达对角阵——这套"纯特征值方法"失效。

## 六、哪些矩阵可对角化

**好情形（敞开说）**：

$$
\boxed{
\text{所有 }\lambda_{i}\ \text{互不相同（无重复）}
\Longrightarrow
n\ \text{个特征向量自动无关}
\Longrightarrow
\text{必可对角化}
}
$$

（证明见教材。）Matlab 里 `eig(rand(10,10))` 给出随机 $10\times10$ 矩阵的 10 个特征值——**它们互不相同**：随机矩阵的常态。

## 七、不可对角化的例子

**重复特征值**时必须细查——**可能有也可能没有**足够的特征向量。

**反例先看正面的**：$A=I$（10 阶单位阵）。特征值 1 重复十次——但**每个向量**都是特征向量，随便选十根无关的；$S^{-1}IS=I$（本来就是对的：对角阵的特征值就坐在对角线上）。可对角化 ✓。

**真正麻烦的三角阵**：

$$
A=\begin{bmatrix}2&1\\0&2\end{bmatrix}.
$$

- 特征值（三角阵读对角线）：

$$
\det(A-\lambda I)=\begin{vmatrix}2-\lambda&1\\0&2-\lambda\end{vmatrix}
=(2-\lambda)^{2}=0
\quad\Longrightarrow\quad
\lambda=2\ (\text{两次}).
$$

- 特征向量：$A-2I=\begin{bmatrix}0&1\\0&0\end{bmatrix}$，零空间**一维**：

$$
\mathbf{x}=\begin{bmatrix}1\\0\end{bmatrix}
\quad(\text{只有这一条线；}(0,1)\ \text{不在零空间}).
$$

两个特征值只凑出一根独立特征向量——**不可对角化**。

## 八、代数重数与几何重数

给这对现象正式命名：

- **代数重数**：$\lambda$ 作为特征多项式根的重复次数（本例 2）；
- **几何重数**：$\dim N(A-\lambda I)$——独立特征向量的根数（本例 1）。

**不可对角化 ⟺ 某个 $\lambda$ 的几何重数 < 代数重数**。互异特征值时两者都是 1，永远安全。（这类矩阵本讲的处理方式覆盖不到，但绝大多数矩阵覆盖到了。）

## 九、差分方程：u_{k+1} = Au_k

本讲的后台主角——**一阶差分方程组**（下一讲升级为微分方程组）：

$$
\boxed{
\mathbf{u}_{k+1}=A\mathbf{u}_{k},
\qquad
\mathbf{u}_{0}\ \text{给定}
}
$$

（一阶：只连一层；系统：$\mathbf{u}$ 是向量、$A$ 是矩阵。）

**紧凑解**：

$$
\mathbf{u}_{1}=A\mathbf{u}_{0},\quad
\mathbf{u}_{2}=A^{2}\mathbf{u}_{0},\quad\dots\quad
\boxed{
\mathbf{u}_{k}=A^{k}\mathbf{u}_{0}
}
$$

（$\mathbf{u}_{100}=A^{100}\mathbf{u}_{0}$——最紧凑的公式，但怎么**真正算出** $\mathbf{u}_{100}$？）

## 十、真正解法：把 u₀ 拆成特征向量

$$
\text{把 }\mathbf{u}_{0}\ \text{写成特征向量的组合：}\quad
\mathbf{u}_{0}=c_{1}\mathbf{x}_{1}+c_{2}\mathbf{x}_{2}+\cdots+c_{n}\mathbf{x}_{n}=S\mathbf{c}.
$$

乘 $A$——看特征向量的魔法：每一块**独立行进**（"each piece goes its own merry way"）：

$$
A\mathbf{u}_{0}=c_{1}\lambda_{1}\mathbf{x}_{1}+c_{2}\lambda_{2}\mathbf{x}_{2}+\cdots+c_{n}\lambda_{n}\mathbf{x}_{n};
$$

乘 $A^{100}$：

$$
\boxed{
\mathbf{u}_{100}=c_{1}\lambda_{1}^{100}\mathbf{x}_{1}+c_{2}\lambda_{2}^{100}\mathbf{x}_{2}+\cdots
=S\Lambda^{100}\mathbf{c}
}
$$

每个纯特征向量方向上，乘 $A$ 只带来标量 $\lambda$；一百步带来 $\lambda^{100}$。这就是 $A^{k}=S\Lambda^{k}S^{-1}$ 的"用法说明"：**展开初始向量 → 让每个特征向量自己演化 → 读答案**。

![矩阵的幂（动态）：u₀ 分解到两个特征方向，u₁、u₂、u₃ 步步贴近主特征方向](/assets/images/mit1806/mit1806-22-powers-eigenbasis.gif)

## 十一、应用：斐波那契数列

经典登场。数列：

$$
F_{0}=0,\quad F_{1}=1,\quad
F_{2}=1,\ F_{3}=2,\ F_{4}=3,\ F_{5}=5,\ F_{6}=8,\ F_{7}=13,\ \dots
$$

（规则：下一个 = 前两个之和。看 1,2,3,4,5 以为要线性增长——第 6 步就拐了。）

**问题**：$F_{100}$ 是多少？这些数**增长多快**？——肯定在增长（不是稳定情形：特征值不会都小于 1），但速率由谁控制？答案藏在特征值里。

**化为一阶系统**（小技巧，与二阶微分方程降阶同款）：

$$
F_{k+2}=F_{k+1}+F_{k}
\quad\text{是二阶标量递推}\ \longrightarrow\ \text{引入向量}
$$

$$
\mathbf{u}_{k}=\begin{bmatrix}F_{k+1}\\F_{k}\end{bmatrix},
\qquad
\mathbf{u}_{k+1}=
\begin{bmatrix}F_{k+2}\\F_{k+1}\end{bmatrix}
=
\begin{bmatrix}1&1\\1&0\end{bmatrix}
\begin{bmatrix}F_{k+1}\\F_{k}\end{bmatrix}
=A\mathbf{u}_{k}.
$$

（第二个方程 $F_{k+1}=F_{k+1}$ 是人造的凑数方程。）二阶标量问题 → 一阶 $2\times2$ 系统。

## 十二、特征方程与递推式的重逢

$$
A=\begin{bmatrix}1&1\\1&0\end{bmatrix}
\quad(\text{对称}\Rightarrow\text{实特征值、正交特征向量}).
$$

**先验快查**：$\lambda_{1}+\lambda_{2}=\operatorname{trace}=1$；$\lambda_{1}\lambda_{2}=\det=-1$。

**特征方程**：

$$
\det(A-\lambda I)
=\begin{vmatrix}1-\lambda&1\\1&-\lambda\end{vmatrix}
=\lambda^{2}-\lambda-1=0.
$$

对比斐波那契递推 $F_{k+2}-F_{k+1}-F_{k}=0$——**特征方程就是递推式本身**（把 $F$ 换成 $\lambda$）！这不是巧合，是"递推阶数 = 系统维数"的普遍规律。

**求根**（没法因式分解，上求根公式）：

$$
\lambda=\frac{1\pm\sqrt{1+4}}{2}=\frac{1\pm\sqrt5}{2}.
$$

$$
\boxed{
\lambda_{1}=\frac{1+\sqrt5}{2}\approx1.618,
\qquad
\lambda_{2}=\frac{1-\sqrt5}{2}\approx-0.618
}
$$

（和为 1 ✓、积为 $-1$ ✓。一个大于 1、一个模小于 1——绝佳的组合：特征值互异 → **必可对角化**。）

## 十三、黄金比例与增长速度

- $\lambda_{1}=\tfrac{1+\sqrt5}{2}\approx1.618$ 正是**黄金比例**；
- $F_{100}\approx c_{1}\lambda_{1}^{100}$——第二大项 $\lambda_{2}^{100}=(-0.618)^{100}$ 是**极小**的数，早已消失；主导项掌控一切；
- **斐波那契数每步约乘 1.618**——增长速率的精确信息，全部来自特征值。

![斐波那契与黄金比（动态）：相邻比 1, 2, 1.5, 1.67, 1.6, 1.625, 1.615 → φ≈1.618](/assets/images/mit1806/mit1806-22-fibonacci-golden.gif)

## 十四、特征向量与初始向量

**特征向量**（二阶的小技巧）：取 $\mathbf{x}=(\lambda,1)^{T}$——

$$
A\begin{bmatrix}\lambda\\1\end{bmatrix}
=\begin{bmatrix}\lambda+1\\\lambda\end{bmatrix}
=\lambda\begin{bmatrix}\lambda\\1\end{bmatrix}
\iff
\lambda^{2}=\lambda+1
\iff
\lambda^{2}-\lambda-1=0.\ \checkmark
$$

所以

$$
\mathbf{x}_{1}=\begin{bmatrix}\lambda_{1}\\1\end{bmatrix},
\qquad
\mathbf{x}_{2}=\begin{bmatrix}\lambda_{2}\\1\end{bmatrix}.
$$

**初始向量**：$\mathbf{u}_{0}=\begin{bmatrix}F_{1}\\F_{0}\end{bmatrix}=\begin{bmatrix}1\\0\end{bmatrix}$。最后一步：解 $c_{1}\mathbf{x}_{1}+c_{2}\mathbf{x}_{2}=\mathbf{u}_{0}$ 定出 $c_{1},c_{2}$，答案齐活。（具体系数下讲/作业完成。）

## 十五、静态与动态

- $A\mathbf{x}=\mathbf{b}$：**静态**问题；
- $\mathbf{u}_{k+1}=A\mathbf{u}_{k}$、$A^{k}$：**动态**——随时间演化的问题。

演化问题的钥匙是特征值：它直接告诉你解是爆炸、消失还是振荡；特征向量告诉你朝哪些方向演化。**记住公式 $A^{k}=S\Lambda^{k}S^{-1}$**——这就是差分方程的全部。

（作业里会有不同于斐波那契的例子；下一讲：微分方程。）

## 十六、课后练习

### 练习 1：对角化一个矩阵

对 $A=\begin{bmatrix}4&1\\2&3\end{bmatrix}$：求 $\Lambda$ 与 $S$，写出 $A=S\Lambda S^{-1}$。

#### 解答

$$
\det(A-\lambda I)=(4-\lambda)(3-\lambda)-2=\lambda^{2}-7\lambda+10=0
\quad\Longrightarrow\quad
\lambda=5,\ 2.
$$

（迹 7 ✓、积 10 ✓。互异 → 可对角化。）

- $\lambda=5$：$A-5I=\begin{bmatrix}-1&1\\2&-2\end{bmatrix}$，$\mathbf{x}_{1}=(1,1)^{T}$；
- $\lambda=2$：$A-2I=\begin{bmatrix}2&1\\2&1\end{bmatrix}$，$\mathbf{x}_{2}=(1,-2)^{T}$。

$$
S=\begin{bmatrix}1&1\\1&-2\end{bmatrix},
\qquad
\Lambda=\begin{bmatrix}5&0\\0&2\end{bmatrix}.
$$

（$\det S=-3\neq0$ ✓。）抽查：$A\mathbf{x}_{2}=(2,-4)^{T}=2(1,-2)^{T}$ ✓。

### 练习 2：幂的速答

用练习 1 的 $A$：$A^{k}$ 的特征值与特征向量？$\det(A^{k})$？

#### 解答

特征值 $5^{k},2^{k}$；特征向量仍是 $(1,1),(1,-2)$。$\det(A^{k})=(\det A)^{k}=(5\cdot2)^{k}=10^{k}$（性质九 + 本讲的 $\Lambda^{k}$ 视角一致）。

### 练习 3：另一个递推

$\mathbf{u}_{k+1}=A\mathbf{u}_{k}$，$A=\begin{bmatrix}0&1\\-1&0\end{bmatrix}$，$\mathbf{u}_{0}=(1,0)^{T}$。$\mathbf{u}_{k}$ 的命运？

#### 解答

特征方程 $\lambda^{2}+1=0$：$\lambda=\pm i$（旋转 90° 的矩阵！）。$|\lambda|=1$：既不爆炸也不消失——$\mathbf{u}_{k}$ 周期性旋转：$\mathbf{u}_{4}=\mathbf{u}_{0}$（转四圈回原位）。

### 练习 4：卢卡斯数列

数列 $L_{0}=2,\ L_{1}=1,\ L_{k+2}=L_{k+1}+L_{k}$（卢卡斯数列：2, 1, 3, 4, 7, 11, …）。它与斐波那契用什么矩阵？$L_{100}$ 的增长由谁控制？

#### 解答

同一个矩阵 $A=\begin{bmatrix}1&1\\1&0\end{bmatrix}$、同一组特征值 $\tfrac{1\pm\sqrt5}{2}$——递推式相同、只有初始向量不同（$\mathbf{u}_{0}=(1,2)^{T}$）。增长由主导特征值 $\lambda_{1}\approx1.618$ 控制：$L_{100}\approx c_{1}\lambda_{1}^{100}$。（顺带：$L_{k}=F_{k-1}+F_{k+1}$。）

## 十七、视频时间索引

以下时间点依据本地下载版本的字幕整理，顺序与正文一致：

| 时间 | 教授的授课内容 |
|---|---|
| 00:00:11 | 开场：特征值第二讲——用起来 |
| 00:00:44 | 对角化登场 |
| 00:01:03 | $S$ = 特征向量矩阵；$S^{-1}AS$ 的魔术组合 |
| 00:01:33 | 需要 $n$ 个无关特征向量 |
| 00:02:24 | 逐列算 $AS$：$A\mathbf{x}_{i}=\lambda_{i}\mathbf{x}_{i}$ |
| 00:03:44 | 剥出 $\lambda$：$AS=S\Lambda$ |
| 00:05:45 | $\Lambda$：特征值坐在对角线上 |
| 00:06:50 | $S$ 可逆 ⟺ $n$ 个无关特征向量 |
| 00:07:51 | 两个等价形式；记忆口诀 |
| 00:08:36 | 新分解：$A=S\Lambda S^{-1}$（对照 $LU$、$QR$） |
| 00:09:14 | $A^{2}$：向量证法 |
| 00:10:28 | $\lambda^{2}$、特征向量不变 |
| 00:11:00 | 矩阵证法：$S^{-1}S$ 相消 |
| 00:12:36 | $A^{k}=S\Lambda^{k}S^{-1}$ |
| 00:13:15 | 对比 $LU$ 自乘一百次 |
| 00:14:21 | 定理：$A^{k}\to0\iff|\lambda_{i}|<1$ |
| 00:15:41 | 绝对值（负数、复数）；假设仍在 |
| 00:17:15 | 哪些矩阵可对角化 |
| 00:18:05 | 好情形：特征值互不相同 |
| 00:18:39 | 随机矩阵的十个特征值互异 |
| 00:19:41 | 重复时必须细查 |
| 00:20:43 | $A=I$：1 重复十次但特征向量管够 |
| 00:21:46 | 对角阵的特征值坐在对角线上 |
| 00:22:08 | 三角阵 $\begin{bmatrix}2&1\\0&2\end{bmatrix}$ |
| 00:23:10 | $(2-\lambda)^{2}$：$\lambda=2$ 两次 |
| 00:23:56 | 零空间一维：只有 $(1,0)$ |
| 00:24:03 | 特征向量不够：不可对角化 |
| 00:24:07 | 代数重数 vs 几何重数 |
| 00:25:36 | 覆盖范围说明 |
| 00:26:21 | 差分方程 $\mathbf{u}_{k+1}=A\mathbf{u}_{k}$ |
| 00:27:42 | 紧凑解 $\mathbf{u}_{k}=A^{k}\mathbf{u}_{0}$ |
| 00:28:45 | $\mathbf{u}_{100}$ 怎么真正算出 |
| 00:29:34 | 把 $\mathbf{u}_{0}$ 写成特征向量组合 |
| 00:30:04 | 魔法：每块独立行进 |
| 00:31:27 | $A^{100}$ 作用：$\lambda^{100}$ 出现 |
| 00:33:22 | $\mathbf{u}_{100}=S\Lambda^{100}\mathbf{c}$ |
| 00:34:16 | 例：斐波那契 |
| 00:35:02 | 数列 0,1,1,2,3,5,8,13 |
| 00:35:35 | $F_{100}$？增长多快？ |
| 00:36:17 | 化为一阶系统：$\mathbf{u}_{k}=(F_{k+1},F_{k})$ |
| 00:37:38 | 矩阵 $A=\begin{bmatrix}1&1\\1&0\end{bmatrix}$ |
| 00:39:37 | 对称 ⟹ 实特征值 |
| 00:40:49 | 迹 1、积 −1 快查 |
| 00:41:22 | $\lambda^{2}-\lambda-1=0$：递推式重逢 |
| 00:42:09 | 求根公式：$\tfrac{1\pm\sqrt5}{2}$ |
| 00:43:09 | $1.618$ 与 $-0.618$ |
| 00:44:20 | 互异 → 可对角化 |
| 00:44:54 | 增长由大特征值控制 |
| 00:45:43 | $F_{100}\approx c_{1}\lambda_{1}^{100}$；$\lambda_{2}^{100}$ 消失 |
| 00:47:23 | 动态 vs 静态 |
| 00:47:52 | 补特征向量 |
| 00:48:37 | 二阶技巧：$\mathbf{x}=(\lambda,1)$ |
| 00:49:17 | $\mathbf{u}_{0}=(F_{1},F_{0})=(1,0)$ |
| 00:50:05 | 收尾重述思想 |
| 00:51:10 | 记住 $A^{k}=S\Lambda^{k}S^{-1}$；下一讲微分方程 |
