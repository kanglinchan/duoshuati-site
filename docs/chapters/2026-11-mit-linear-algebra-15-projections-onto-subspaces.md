# 第 15 讲：子空间投影

> 英文标题：Projections onto Subspaces  
> 讲师：Gilbert Strang  
> 整理方式：严格按照教授的实际授课顺序，完整展开课堂推导与计算


## 本讲目录

- [一、开场：把 $\mathbf{b}$ 投到一条直线上](#一开场把-b-投到一条直线上)
- [二、一维投影的方程与三个公式](#二一维投影的方程与三个公式)
- [三、公式的两个快问快答](#三公式的两个快问快答)
- [四、投影矩阵 P](#四投影矩阵-p)
- [五、投影矩阵的两条性质](#五投影矩阵的两条性质)
- [六、为什么要投影](#六为什么要投影)
- [七、升维：往平面上投影](#七升维往平面上投影)
- [八、方程：Aᵀ(b − Ax̂) = 0](#八方程aᵀb--ax--0)
- [九、误差向量住在哪个子空间](#九误差向量住在哪个子空间)
- [十、n 维的三个公式](#十n-维的三个公式)
- [十一、一个危险的"化简"：拆逆](#十一一个危险的化简拆逆)
- [十二、方阵特例的检验](#十二方阵特例的检验)
- [十三、高维性质验证：Pᵀ = P 与 P² = P](#十三高维性质验证p--p-与-p--p)
- [十四、应用开场：直线拟合（最小二乘）](#十四应用开场直线拟合最小二乘)
- [十五、课后练习](#十五课后练习)
- [十六、视频时间索引](#十六视频时间索引)

## 一、开场：把 $\mathbf{b}$ 投到一条直线上

本讲重要：**投影（projection）**。从二维的图像开始——把向量 $\mathbf{b}$ 沿垂线"压"到过 $\mathbf{a}$ 的直线（一维子空间）上：

- 要找的是直线上**离 $\mathbf{b}$ 最近的点**，记作 $\mathbf{p}$；
- **正交性是全部关键**：误差向量 $\mathbf{e}=\mathbf{b}-\mathbf{p}$（"我错了多少"）与直线**垂直**——那个直角告诉我们 $\mathbf{p}$ 在哪里；
- 三角学路线（$\sin\theta,\cos\theta$）会给出难看的公式；线性代数给出的公式干净漂亮。

![投影（动态）：b 在哪，垂足 p 都是直线上离 b 最近的点，误差 e 恒⊥a](/assets/images/mit1806/mit1806-15-projection-line.gif)

## 二、一维投影的方程与三个公式

$\mathbf{p}$ 在直线上，必是 $\mathbf{a}$ 的倍数：

$$
\mathbf{p}=x\,\mathbf{a}
$$

——真正要找的是这个数 $x$。垂直条件：

$$
\mathbf{a}\perp\mathbf{e}
\quad\Longleftrightarrow\quad
\mathbf{a}^{T}(\mathbf{b}-x\mathbf{a})=0.
$$

展开：

$$
\mathbf{a}^{T}\mathbf{b}-x\,\mathbf{a}^{T}\mathbf{a}=0
\quad\Longrightarrow\quad
x\,\mathbf{a}^{T}\mathbf{a}=\mathbf{a}^{T}\mathbf{b}.
$$

一维情形 $\mathbf{a}^{T}\mathbf{a}$ 只是个数（$\|\mathbf{a}\|^{2}$），直接除：

$$
\boxed{
x=\frac{\mathbf{a}^{T}\mathbf{b}}{\mathbf{a}^{T}\mathbf{a}}
}
\qquad\text{（第一个公式：系数）}
$$

$$
\boxed{
\mathbf{p}=\mathbf{a}\,\frac{\mathbf{a}^{T}\mathbf{b}}{\mathbf{a}^{T}\mathbf{a}}
}
\qquad\text{（第二个公式：投影点）}
$$

（$\mathbf{a}^{T}\mathbf{b}/\mathbf{a}^{T}\mathbf{a}$ 里其实藏着 $\cos\theta$，但我们从头到尾不需要角度——只有向量。）第三个公式马上出场。

## 三、公式的两个快问快答

![一维投影公式总览（示例 a=(1,1)，b=(4,2)）：p=(3,3)，e=(1,−1)⊥a，P=aaᵀ/aᵀa](/assets/images/mit1806/mit1806-15-projection-formula.png)

**问：$\mathbf{b}$ 加倍，投影怎样？**——加倍。$\mathbf{b}\to2\mathbf{b}$ 使分子多出因子 2，$\mathbf{p}$ 跟着翻倍（画图一致：$\mathbf{b}$ 走多远，垂足走多远）。

**问：$\mathbf{a}$ 加倍呢？**——**不变**。直线没变（$\mathbf{a}$ 或 $-\mathbf{a}$ 都是同一条线）：分子分母各多出因子 2（原是 4 的两个因子），抵消。投影纹丝不动。

## 四、投影矩阵 P

视角升级：投影是**某个矩阵作用在 $\mathbf{b}$ 上**的结果：

$$
\mathbf{p}=P\mathbf{b},
\qquad
\boxed{
P=\frac{\mathbf{a}\mathbf{a}^{T}}{\mathbf{a}^{T}\mathbf{a}}
}
\qquad\text{（第三个公式：投影矩阵）}
$$

- 分母 $\mathbf{a}^{T}\mathbf{a}$：**一个数**（长度平方）；
- 分子 $\mathbf{a}\mathbf{a}^{T}$：**列乘行**——第 11 讲的秩 1 矩阵！整个 $P$ 是 $n\times n$ 矩阵。

**提醒**：分子分母**不会**"约掉"——上面是矩阵、下面是数，别想着写成 1。

**关于 $P$ 立刻可知**：

- **列空间** = 过 $\mathbf{a}$ 的直线（$P\mathbf{b}$ 永远落在那根线上）；
- **秩 = 1**（正是"列乘行"的标准形状）。

## 五、投影矩阵的两条性质

**性质 1：对称**。

$$
P^{T}=\left(\frac{\mathbf{a}\mathbf{a}^{T}}{\mathbf{a}^{T}\mathbf{a}}\right)^{T}
=\frac{\mathbf{a}\mathbf{a}^{T}}{\mathbf{a}^{T}\mathbf{a}}=P.
$$

**性质 2：幂等**——投两次等于投一次。几何上：第一次投影把 $\mathbf{b}$ 压到直线上；再投一次，点已在直线上，垂足就是它自己，**原地不动**。代数验证（一维）：

$$
P^{2}=\frac{\mathbf{a}\mathbf{a}^{T}\,\mathbf{a}\mathbf{a}^{T}}{(\mathbf{a}^{T}\mathbf{a})^{2}}
=\frac{\mathbf{a}\,(\mathbf{a}^{T}\mathbf{a})\,\mathbf{a}^{T}}{(\mathbf{a}^{T}\mathbf{a})^{2}}
=\frac{\mathbf{a}\mathbf{a}^{T}}{\mathbf{a}^{T}\mathbf{a}}=P.
$$

> **对称 + 幂等**（$P^{T}=P,\ P^{2}=P$）就是投影矩阵的身份证。

至此一维投影的全部拼图：**$x$、$\mathbf{p}$、$P$ 三个公式**，请背下来——高维版本马上原样再现。

## 六、为什么要投影

上一讲埋的问题现在揭晓。新篇章处理 $A\mathbf{x}=\mathbf{b}$ **无解**的情形——方程太多（$m>n$）、$\mathbf{b}$ 带噪声，$\mathbf{b}\notin C(A)$。

策略：**解一个最接近的、可解的问题**。

- $A\mathbf{x}$ 永远落在列空间里——这是逃不掉的约束；
- 那就把右端换成列空间里**离 $\mathbf{b}$ 最近的向量**：

$$
\boxed{
A\hat{\mathbf{x}}=\mathbf{p},
\qquad
\mathbf{p}=\mathbf{b}\ \text{在}\ C(A)\ \text{上的投影}
}
$$

解出来的是 $\hat{\mathbf{x}}$（"帽子" = 最好可能的解）——不存在的 $\mathbf{x}$ 的最佳替身。所以必须会算"往列空间投影"。

## 七、升维：往平面上投影

三维图像：$\mathbf{b}$ 在平面外，投到平面上。平面怎么给定？——**给一组基**：两个向量 $\mathbf{a}_{1},\mathbf{a}_{2}$（不必垂直，但必须无关）。

矩阵化：把 $\mathbf{a}_{1},\mathbf{a}_{2}$ 竖成两列——平面 = 矩阵 $A$ 的**列空间**：

$$
A=[\,\mathbf{a}_{1}\ \ \mathbf{a}_{2}\,]\quad(m\times2)
$$

（推广到 $n$ 列毫无障碍：$m\times n$，列空间为 $n$ 维子空间。）

- 若 $\mathbf{b}$ 已在列空间里：投影就是 $\mathbf{b}$ 本身（误差为零）；
- 一般情形：$\mathbf{b}=\mathbf{p}+\mathbf{e}$，$\mathbf{p}=A\hat{\mathbf{x}}$ 在平面内，$\mathbf{e}=\mathbf{b}-\mathbf{p}$ 垂直于平面。

**关键事实（几何/微积分/线性代数三路皆可达）**：误差向量 $\mathbf{e}$ **垂直于整个平面**。

## 八、方程：Aᵀ(b − Ax̂) = 0

把"垂直于平面"翻译成方程。垂直于平面 ⟺ 垂直于平面里的**每一根向量** ⟺ 垂直于基 $\mathbf{a}_{1},\mathbf{a}_{2}$：

$$
\mathbf{a}_{1}^{T}(\mathbf{b}-A\hat{\mathbf{x}})=0,
\qquad
\mathbf{a}_{2}^{T}(\mathbf{b}-A\hat{\mathbf{x}})=0.
$$

两个未知数 $\hat{x}_{1},\hat{x}_{2}$，恰好两个方程。摞成矩阵——$\mathbf{a}_{1}^{T},\mathbf{a}_{2}^{T}$ 正是 $A^{T}$ 的两行：

$$
\boxed{
A^{T}(\mathbf{b}-A\hat{\mathbf{x}})=\mathbf{0}
}
$$

两个观察：

- **一维对照**：$\mathbf{a}$ 只有一列时，这就是第一节那个方程 $\mathbf{a}^{T}(\mathbf{b}-x\mathbf{a})=0$——一模一样；
- **移项即得中心方程**：

$$
\boxed{
A^{T}A\,\hat{\mathbf{x}}=A^{T}\mathbf{b}
}
\qquad\text{（本篇章的中心方程）}
$$

（$A^{T}A$ 是 $n\times n$ 方阵——上一讲已验证它方、对称、列无关时可逆。）

## 九、误差向量住在哪个子空间

趁热把四个子空间接进来：方程 $A^{T}\mathbf{e}=\mathbf{0}$ 说明

$$
\mathbf{e}\in N(A^{T})
$$

——误差向量住在**左零空间**！而第 14 讲恰好证明过 $N(A^{T})\perp C(A)$："误差垂直于列空间"与"$\mathbf{e}\in N(A^{T})$"是同一句话。四子空间理论与投影严丝合缝——教授感慨：算出来的方程正是想要的那个。

## 十、n 维的三个公式

解中心方程（$A^{T}A$ 可逆时）：

$$
\boxed{
\hat{\mathbf{x}}=(A^{T}A)^{-1}A^{T}\mathbf{b}
}
\qquad\text{（系数向量）}
$$

$$
\boxed{
\mathbf{p}=A\hat{\mathbf{x}}
=A(A^{T}A)^{-1}A^{T}\mathbf{b}
}
\qquad\text{（投影向量）}
$$

$$
\boxed{
P=A(A^{T}A)^{-1}A^{T}
}
\qquad\text{（投影矩阵）}
$$

一维对照：$A$ 换成单列 $\mathbf{a}$，$(A^{T}A)^{-1}$ 缩成一个数的倒数，公式逐字退化回第二节的三个。**同样的公式，只是"除法"换成了"逆"**（因为面对的是 $n\times n$ 矩阵而非数字）。

## 十一、一个危险的"化简"：拆逆

教授故意踩一次坑：$(A^{T}A)^{-1}$ 是乘积的逆，能不能拆成

$$
(A^{T}A)^{-1}=A^{-1}(A^{T})^{-1}\quad?
$$

若真这么拆：$A\cdot A^{-1}\,(A^{T})^{-1}A^{T}=I$——投影矩阵变成单位阵？！哪里错了？

**错在 $A$ 不是方阵**——长方形矩阵**没有逆**，$(A^{T}A)^{-1}$ 这种整体逆不能拆。只有 $A$ 是可逆方阵时才允许拆。

## 十二、方阵特例的检验

那当 $A$ 确实是 $n\times n$ 可逆阵时，公式给出什么？

- 列空间 = 整个 $\mathbb{R}^{n}$；
- 往全空间投影：$\mathbf{b}$ 本来就在里面，投影 = 自己；

$$
P=A(A^{T}A)^{-1}A^{T}=A\,A^{-1}(A^{T})^{-1}A^{T}=I.
$$

公式自洽：**满秩方阵的投影矩阵是单位阵**。而真正的用武之地（$m>n$、列空间只是子空间）就必须保持原公式不拆。

## 十三、高维性质验证：Pᵀ = P 与 P² = P

**对称**：

$$
P^{T}=\big(A(A^{T}A)^{-1}A^{T}\big)^{T}
=A\,\big((A^{T}A)^{-1}\big)^{T}A^{T}
=A(A^{T}A)^{-1}A^{T}=P,
$$

（$A^{T}A$ 对称，其逆也对称；两个 $A^{T}$ 互换后复原。）

**幂等**——几何上必须成立（投两次原地不动），代数上靠放对括号：

$$
P^{2}
=A(A^{T}A)^{-1}A^{T}\,A(A^{T}A)^{-1}A^{T}
=A(A^{T}A)^{-1}\underbrace{(A^{T}A)}_{\text{与逆相消}}(A^{T}A)^{-1}A^{T}
=A(A^{T}A)^{-1}A^{T}=P.
$$

两条性质双双过关——投影矩阵的身份证在高维依然有效。

## 十四、应用开场：直线拟合（最小二乘）

本篇章最重要的应用：**用直线拟合数据点**（today 只搭台，数值下讲算）。

数据点（贴近一条直线但不在其上）：

$$
(t,b)=(1,1),\quad(2,2),\quad(3,2).
$$

想用直线 $b=C+Dt$ 拟合，找使三处误差都尽量小的 $C,D$。**穿过三点的直线不存在**——这正是"想解而解不了"的方程组：

$$
\begin{cases}
C+D=1\\
C+2D=2\\
C+3D=2
\end{cases}
\qquad\Longleftrightarrow\qquad
A\mathbf{x}=\mathbf{b}:
\quad
\begin{bmatrix}
1&1\\
1&2\\
1&3
\end{bmatrix}
\begin{bmatrix}C\\D\end{bmatrix}
=
\begin{bmatrix}1\\2\\2\end{bmatrix}
$$

三个方程、两个未知数——无解（除非数据换组）。**改解中心方程** $A^{T}A\hat{\mathbf{x}}=A^{T}\mathbf{b}$：它必有解，其解给出最好的 $C,D$、最好的投影、背后的投影矩阵。

下一讲：完整数值计算。

## 十五、课后练习

### 练习 1：一维投影

$\mathbf{b}=(1,2,2)$，投影到 $\mathbf{a}=(1,1,1)$ 的方向上。求 $x$、$\mathbf{p}$、误差 $\mathbf{e}$，并验证 $\mathbf{e}\perp\mathbf{a}$。

#### 解答

$$
x=\frac{\mathbf{a}^{T}\mathbf{b}}{\mathbf{a}^{T}\mathbf{a}}
=\frac{1+2+2}{3}=\frac{5}{3},
\qquad
\mathbf{p}=\frac{5}{3}(1,1,1)=\left(\tfrac53,\tfrac53,\tfrac53\right),
$$
$$
\mathbf{e}=\mathbf{b}-\mathbf{p}=\left(-\tfrac23,\tfrac13,\tfrac13\right),
\qquad
\mathbf{a}^{T}\mathbf{e}=-\tfrac23+\tfrac13+\tfrac13=0.\ \checkmark
$$

投影矩阵：

$$
P=\frac{\mathbf{a}\mathbf{a}^{T}}{\mathbf{a}^{T}\mathbf{a}}
=\frac13
\begin{bmatrix}
1&1&1\\1&1&1\\1&1&1
\end{bmatrix}.
$$

### 练习 2：P 的性质

对练习 1 的 $P$：(a) 验证 $P^{T}=P$；(b) 验证 $P^{2}=P$；(c) 求 $P\mathbf{b}$ 与 $P\mathbf{a}$。

#### 解答

**(a)** $P$ 的元素全为 $\tfrac13$，转置不变 ✓。

**(b)** $P^{2}=\frac19\cdot\begin{bmatrix}3&3&3\\3&3&3\\3&3&3\end{bmatrix}=\frac13\begin{bmatrix}1&1&1\\1&1&1\\1&1&1\end{bmatrix}=P$ ✓（或按公式：中间 $\mathbf{a}^{T}\mathbf{a}=3$ 与两个 3 相消）。

**(c)** $P\mathbf{b}=\mathbf{p}=(\tfrac53,\tfrac53,\tfrac53)$（练习 1）；$P\mathbf{a}=\frac13\,(3,3,3)^{T}=\mathbf{a}$——$\mathbf{a}$ 已在直线上，投影是自己（这正是 $P^{2}=P$ 的特写）。

### 练习 3：二维投影的方程

$A=\begin{bmatrix}1&0\\0&1\\1&1\end{bmatrix}$（列 $\mathbf{a}_{1}=(1,0,1)$、$\mathbf{a}_{2}=(0,1,1)$），$\mathbf{b}=(1,2,3)$。写出中心方程 $A^{T}A\hat{\mathbf{x}}=A^{T}\mathbf{b}$ 并解出 $\hat{\mathbf{x}}$、$\mathbf{p}$。

#### 解答

$$
A^{T}A=
\begin{bmatrix}
2&1\\1&2
\end{bmatrix},
\qquad
A^{T}\mathbf{b}=
\begin{bmatrix}
1+3\\
2+3
\end{bmatrix}
=
\begin{bmatrix}4\\5\end{bmatrix}.
$$

中心方程：

$$
\begin{bmatrix}2&1\\1&2\end{bmatrix}
\begin{bmatrix}\hat{x}_{1}\\\hat{x}_{2}\end{bmatrix}
=
\begin{bmatrix}4\\5\end{bmatrix}
\Longrightarrow
\hat{\mathbf{x}}=(1,2).
$$

（$\det=3\neq0$，$A^{T}A$ 可逆——列无关 ✓。）

$$
\mathbf{p}=A\hat{\mathbf{x}}=1\cdot(1,0,1)+2\cdot(0,1,1)=(1,2,3)=\mathbf{b}!
$$

$\mathbf{b}$ 本来就在列空间里（$\mathbf{b}=\mathbf{a}_{1}+2\mathbf{a}_{2}$），误差为零。✓

### 练习 4：直线拟合的方程组

数据点 $(1,0),(2,1),(3,4)$，拟 合 $b=C+Dt$。写出 $A\mathbf{x}=\mathbf{b}$（无解）与中心方程 $A^{T}A\hat{\mathbf{x}}=A^{T}\mathbf{b}$（不解数值）。

#### 解答

想解而不得的方程组：$C+D=0$、$C+2D=1$、$C+3D=4$。

$$
A=\begin{bmatrix}1&1\\1&2\\1&3\end{bmatrix},
\qquad
\mathbf{b}=\begin{bmatrix}0\\1\\4\end{bmatrix}.
$$

$$
A^{T}A=\begin{bmatrix}3&6\\6&14\end{bmatrix},
\qquad
A^{T}\mathbf{b}=\begin{bmatrix}5\\14\end{bmatrix}.
$$

中心方程：$\begin{bmatrix}3&6\\6&14\end{bmatrix}\begin{bmatrix}C\\D\end{bmatrix}=\begin{bmatrix}5\\14\end{bmatrix}$（下讲数值求解）。

## 十六、视频时间索引

以下时间点依据本地下载版本的字幕整理，顺序与正文一致：

| 时间 | 教授的授课内容 |
|---|---|
| 00:00:23 | 开场：投影 |
| 00:00:30 | 把 $\mathbf{b}$ 投到过 $\mathbf{a}$ 的直线上 |
| 00:01:30 | 关键：误差 $\mathbf{e}\perp\mathbf{a}$（直角定位置） |
| 00:02:14 | 三角学会给难看的公式；线代给漂亮的 |
| 00:02:42 | $\mathbf{p}=x\mathbf{a}$：要找的是数 $x$ |
| 00:03:31 | 方程 $\mathbf{a}^{T}(\mathbf{b}-x\mathbf{a})=0$ |
| 00:04:00 | 化简：$x\,\mathbf{a}^{T}\mathbf{a}=\mathbf{a}^{T}\mathbf{b}$ |
| 00:04:35 | 公式一：$x=\mathbf{a}^{T}\mathbf{b}/\mathbf{a}^{T}\mathbf{a}$ |
| 00:04:55 | 公式二：$\mathbf{p}=\mathbf{a}x$ |
| 00:06:32 | 快问：$\mathbf{b}$ 加倍 ⟹ $\mathbf{p}$ 加倍 |
| 00:07:14 | 快问：$\mathbf{a}$ 加倍 ⟹ $\mathbf{p}$ 不变（4 相消） |
| 00:07:48 | 公式三：投影矩阵 $P=\mathbf{a}\mathbf{a}^{T}/\mathbf{a}^{T}\mathbf{a}$ |
| 00:08:51 | 分子列乘行、分母是数；不会"约分" |
| 00:11:40 | $P$ 的列空间 = 那条线；秩 1 |
| 00:12:40 | 性质一：$P^{T}=P$（对称） |
| 00:13:12 | 性质二：投两次原地不动，$P^{2}=P$ |
| 00:14:41 | 三公式小结 |
| 00:15:45 | 为什么要投影：$A\mathbf{x}=\mathbf{b}$ 可能无解 |
| 00:17:09 | 策略：解最近的可解问题 |
| 00:17:21 | $A\mathbf{x}$ 必在列空间；把 $\mathbf{b}$ 换成投影 $\mathbf{p}$ |
| 00:18:04 | $\hat{\mathbf{x}}$：最好可能的解 |
| 00:18:50 | 升维：投影到平面 |
| 00:19:53 | 平面 = $A$ 的列空间（两列 $\mathbf{a}_{1},\mathbf{a}_{2}$ 无关即可） |
| 00:22:01 | $\mathbf{b}$ 在列空间时投影 = $\mathbf{b}$ |
| 00:22:25 | 关键事实：$\mathbf{e}=\mathbf{b}-\mathbf{p}\perp$ 平面 |
| 00:23:31 | $\mathbf{p}=A\hat{\mathbf{x}}$；找 $\hat{\mathbf{x}}$ |
| 00:25:45 | 垂直于平面 ⟺ 垂直于 $\mathbf{a}_{1}$ 与 $\mathbf{a}_{2}$ |
| 00:26:31 | 两个方程摞成 $A^{T}(\mathbf{b}-A\hat{\mathbf{x}})=\mathbf{0}$ |
| 00:28:06 | 一维对照：同一方程 |
| 00:28:48 | $\mathbf{e}\in N(A^{T})$：四子空间严丝合缝 |
| 00:29:51 | $N(A^{T})\perp C(A)$：正是上讲定理 |
| 00:31:23 | 中心方程：$A^{T}A\hat{\mathbf{x}}=A^{T}\mathbf{b}$ |
| 00:32:49 | 公式一：$\hat{\mathbf{x}}=(A^{T}A)^{-1}A^{T}\mathbf{b}$ |
| 00:33:13 | 公式二：$\mathbf{p}=A\hat{\mathbf{x}}$ |
| 00:35:03 | 公式三：$P=A(A^{T}A)^{-1}A^{T}$ |
| 00:35:53 | 危险的拆逆：$(A^{T}A)^{-1}\neq A^{-1}(A^{T})^{-1}$ |
| 00:37:19 | 原因：$A$ 不是方阵、没有逆 |
| 00:37:44 | 方阵特例：列空间 = 全空间、$P=I$ |
| 00:39:47 | 高维对称性：$P^{T}=P$ |
| 00:40:14 | 高维幂等性：$P^{2}=P$（括号放对、$A^{T}A$ 自消） |
| 00:41:50 | 应用开场：直线拟合 |
| 00:43:03 | 数据点 $(1,1),(2,2),(3,2)$ |
| 00:44:54 | 拟合 $b=C+Dt$；找 $C,D$ |
| 00:45:32 | 想解而解不了的三个方程 |
| 00:46:56 | $A=\begin{bmatrix}1&1\\1&2\\1&3\end{bmatrix}$，$\mathbf{b}=(1,2,2)$ |
| 00:47:40 | 改解 $A^{T}A\hat{\mathbf{x}}=A^{T}\mathbf{b}$ |
| 00:48:37 | 预告：下讲数值计算 |
