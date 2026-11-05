# 第 23 讲：微分方程和矩阵指数 exp(At)

> 英文标题：Differential Equations and exp(At)  
> 讲师：Gilbert Strang  
> 整理方式：严格按照教授的实际授课顺序，完整展开课堂推导与计算


## 本讲目录

- [一、开场：从幂到指数](#一开场从幂到指数)
- [二、例题：二元一阶方程组](#二例题二元一阶方程组)
- [三、特征值先行：稳态的预告](#三特征值先行稳态的预告)
- [四、特征向量](#四特征向量)
- [五、通解与验证](#五通解与验证)
- [六、初始条件定系数](#六初始条件定系数)
- [七、稳态读出](#七稳态读出)
- [八、稳定性分类](#八稳定性分类)
- [九、复特征值：实部说了算](#九复特征值实部说了算)
- [十、二阶的快速判据：迹与行列式](#十二阶的快速判据迹与行列式)
- [十一、定系数 = 解 Sc = u₀](#十一定系数--解-sc--u)
- [十二、对角化路线：解耦](#十二对角化路线解耦)
- [十三、矩阵指数的定义：幂级数](#十三矩阵指数的定义幂级数)
- [十四、两个漂亮的泰勒级数](#十四两个漂亮的泰勒级数)
- [十五、e^{At} = Se^{Λt}S⁻¹ 的推导](#十五e--sλs-的推导)
- [十六、e^{Λt} 与稳定性区域](#十六eλt-与稳定性区域)
- [十七、收尾例：二阶标量方程化系统](#十七收尾例二阶标量方程化系统)
- [十八、课后练习](#十八课后练习)
- [十九、视频时间索引](#十九视频时间索引)

## 一、开场：从幂到指数

微分方程"点火起飞"。本节主题：**一阶、一阶导数、常系数线性方程组**的解法——做对了，它直接变成线性代数。

**关键观念**：常系数线性方程的解是**指数函数**。找指数解，只需确定指数上的数（$\lambda$）和乘在前面的一块（特征向量）——这就是线性代数。

与上一讲完全平行：

| | 差分方程 $\mathbf{u}_{k+1}=A\mathbf{u}_{k}$ | 微分方程 $\dfrac{d\mathbf{u}}{dt}=A\mathbf{u}$ |
|---|---|---|
| 纯解 | $\lambda^{k}\mathbf{x}$ | $e^{\lambda t}\mathbf{x}$ |
| 核心计算 | $A^{k}$ | $e^{At}$ |

## 二、例题：二元一阶方程组

$$
\frac{d\mathbf{u}}{dt}=A\mathbf{u},
\qquad
A=\begin{bmatrix}-1&2\\1&-2\end{bmatrix},
\qquad
\mathbf{u}(0)=\begin{bmatrix}1\\0\end{bmatrix}.
$$

物理图像：初始全在 $\mathbf{u}_{1}$；$d\mathbf{u}_{2}/dt$ 因 $\mathbf{u}_{1}$ 项为正——"人流"从分量 1 流向分量 2。

**第一步永远是**：找矩阵的特征值与特征向量。

## 三、特征值先行：稳态的预告

瞄一眼矩阵：**奇异**（第二列 = −2 倍第一列）⟹ $\lambda_{1}=0$！迹 $-3$ ⟹ $\lambda_{2}=-3$。正式算一遍：

$$
\det(A-\lambda I)
=\begin{vmatrix}-1-\lambda&2\\1&-2-\lambda\end{vmatrix}
=\lambda^{2}+3\lambda+0
=\lambda(\lambda+3)=0.
$$

$$
\boxed{\lambda_{1}=0,\qquad\lambda_{2}=-3}
$$

**特征值已经在剧透答案**：

- $e^{-3t}$ 项随时间**消失**；
- $e^{0t}=1$ 项是**常数**——**稳态（steady state）**。

（$\lambda=0$ 给出稳态——不是从特征值观点看的"特殊值"，而是物理上的宝贝。）

## 四、特征向量

- $\lambda_{1}=0$：矩阵本身奇异，零空间（自由变量取 1、上方需 2）：

$$
\mathbf{x}_{1}=\begin{bmatrix}2\\1\end{bmatrix};
$$

- $\lambda_{2}=-3$：$A+3I=\begin{bmatrix}2&2\\1&1\end{bmatrix}$（必须奇异 ✓），零空间：

$$
\mathbf{x}_{2}=\begin{bmatrix}1\\-1\end{bmatrix}
\quad(\text{取}(-1,1)\text{同样好}).
$$

## 五、通解与验证

两个特征值给两个**纯指数特解**；通解是它们的组合：

$$
\boxed{
\mathbf{u}(t)=c_{1}e^{\lambda_{1}t}\mathbf{x}_{1}+c_{2}e^{\lambda_{2}t}\mathbf{x}_{2}
}
$$

**验证**（以第一项为例，方程 $\frac{d\mathbf{u}}{dt}=A\mathbf{u}$）：

$$
\text{左边}=\frac{d}{dt}\big(e^{\lambda_{1}t}\mathbf{x}_{1}\big)=\lambda_{1}e^{\lambda_{1}t}\mathbf{x}_{1},
\qquad
\text{右边}=A\big(e^{\lambda_{1}t}\mathbf{x}_{1}\big)=e^{\lambda_{1}t}A\mathbf{x}_{1}=\lambda_{1}e^{\lambda_{1}t}\mathbf{x}_{1}.\quad\checkmark
$$

（对照表：上一讲的 $\lambda^{k}\mathbf{x}$ ↔ 本讲的 $e^{\lambda t}\mathbf{x}$——幂换成指数，戏码不变。）

## 六、初始条件定系数

$t=0$ 时代入 $\mathbf{u}(0)=(1,0)$：

$$
c_{1}\begin{bmatrix}2\\1\end{bmatrix}+c_{2}\begin{bmatrix}1\\-1\end{bmatrix}
=\begin{bmatrix}1\\0\end{bmatrix}.
$$

目测：取 $c_{1}=c_{2}=1$ 得 $(3,0)$，要 $(1,0)$ 就各除以 3：

$$
\boxed{c_{1}=\tfrac13,\qquad c_{2}=\tfrac13}
$$

## 七、稳态读出

$$
\mathbf{u}(t)=\frac13\begin{bmatrix}2\\1\end{bmatrix}
+\frac13 e^{-3t}\begin{bmatrix}1\\-1\end{bmatrix}.
$$

$t\to\infty$ 时第二项消失：

$$
\boxed{
\mathbf{u}(\infty)=\begin{bmatrix}\tfrac23\\tfrac13\end{bmatrix}
\quad(\text{稳态})
}
$$

——从 $(1,0)$ 出发，"人流"逐步移动，最终三分之一的人留在原处、三分之二到达 $\mathbf{u}_{2}$。对解的**全部行为**获得了彻底洞察。

## 八、稳定性分类

并非总有稳态——也可能趋于零，也可能爆炸。特征值裁决：

**稳定（$\mathbf{u}(t)\to\mathbf{0}$，对一切初值）**：所有特征值**为负**……但若特征值是复数呢？

## 九、复特征值：实部说了算

设 $\lambda=-3+6i$。$e^{\lambda t}=e^{-3t}\cdot e^{6it}$：

- $e^{6it}=\cos6t+i\sin6t$：模平方 $=\cos^{2}6t+\sin^{2}6t=1$——**在单位圆上转圈**，不影响大小；
- 所以 $|e^{\lambda t}|=e^{-3t}$：衰减与否由**实部**决定，虚部只是在两个分量之间**振荡**。

$$
\boxed{
\begin{aligned}
\text{稳定（趋于 0）}&:\ \text{所有 }\operatorname{Re}(\lambda)<0;\\
\text{稳态}&:\ \text{某 }\lambda=0,\ \text{其余 }\operatorname{Re}(\lambda)<0;\\
\text{爆炸}&:\ \text{某 }\operatorname{Re}(\lambda)>0.
\end{aligned}
}
$$

（把 $A$ 全部变号成 $-A$：特征值全体变号，$e^{-3t}$ 变 $e^{+3t}$——爆炸；零特征值仍是零。）

## 十、二阶的快速判据：迹与行列式

$2\times2$ 矩阵 $A=\begin{bmatrix}a&b\\c&d\end{bmatrix}$，不看特征值能否判断稳定（所有 $\operatorname{Re}\lambda<0$）？

- **迹必须为负**：$\operatorname{trace}=\lambda_{1}+\lambda_{2}<0$（若特征值是共轭复对 $-3\pm6i$，虚部相加抵消，实部相加 = 迹，仍为负）；
- **但负迹不充分**：$\begin{bmatrix}-2&0\\0&1\end{bmatrix}$ 迹 $-1$，特征值 $-2,+1$——$e^{+t}$ 爆炸；
- **再要行列式为正**：$\det=\lambda_{1}\lambda_{2}$，两特征值同为负（或共轭对，其积 $=|\lambda|^{2}>0$ 自动为正）⟹ 积为正。

$$
\boxed{
2\times2\ \text{稳定}\iff
\operatorname{trace}<0\ \text{且}\ \det>0
}
$$

## 十一、定系数 = 解 Sc = u₀

把定系数那步写成矩阵形式：

$$
S\mathbf{c}=\mathbf{u}(0)
\qquad
\Big(S=\begin{bmatrix}2&1\\1&-1\end{bmatrix}\ \text{正是特征向量矩阵！}\Big)
$$

——求 $c$ 就是解以 $S$ 为系数的方程组。"开局配平，之后永远正确"：每个纯指数一旦启动，就独自走自己的路。

**本质**：$A$ 把 $\mathbf{u}_{1},\mathbf{u}_{2}$ **耦合**起来；特征值与特征向量把系统**解耦（对角化）**。

## 十二、对角化路线：解耦

用 $S,\Lambda$ 重写全程。令 $\mathbf{u}=S\mathbf{v}$（换到特征向量坐标）：

$$
S\frac{d\mathbf{v}}{dt}=AS\mathbf{v}
\quad\Longrightarrow\quad
\frac{d\mathbf{v}}{dt}=S^{-1}AS\,\mathbf{v}=\Lambda\mathbf{v}.
$$

**解耦完成**：$dv_{1}/dt=\lambda_{1}v_{1}$，各自独立（$S$ 是常数矩阵，求导不碰它）。逐个解出：

$$
\mathbf{v}(t)=e^{\Lambda t}\mathbf{v}(0)
\quad\Longrightarrow\quad
\boxed{
\mathbf{u}(t)=S\,e^{\Lambda t}\,S^{-1}\,\mathbf{u}(0)
}
$$

——而 $Se^{\Lambda t}S^{-1}$ 正是 **$e^{At}$**！

## 十三、矩阵指数的定义：幂级数

$e^{At}$ 是什么意思？回到指数的**幂级数**定义——"世界上两个漂亮泰勒级数"之一：

$$
\boxed{
e^{At}=I+At+\frac{(At)^{2}}{2!}+\frac{(At)^{3}}{3!}+\cdots+\frac{(At)^{n}}{n!}+\cdots
}
$$

（$1\to I$，$x\to At$；除数是 $1,2,6,\dots$——**阶乘**。）

这个级数**永远收敛**：无论 $A$ 多大、$t$ 多大，除数（阶乘）越来越大，项趋于零——$e^{At}$ 完全有定义。

## 十四、两个漂亮的泰勒级数

另一个漂亮级数是**几何级数**（不除阶乘）：

$$
1+x+x^{2}+x^{3}+\cdots=\frac{1}{1-x},
$$

矩阵版：

$$
I+At+(At)^{2}+\cdots=(I-At)^{-1}
$$

——逆矩阵的级数！但**不总收敛**：$(At)^{k}$ 的特征值是 $\lambda^{k}t^{k}$，只要 $At$ 有特征值模超过 1 就爆炸。所以：

- **$|At|$ 的特征值全在 1 以下**时几何级数收敛，给出逆；
- $t$ 很小时截断也合理：$(I-At)^{-1}\approx I+At$（想更准就多留几项）。

指数级数因此更优：永远收敛。

## 十五、e^{At} = Se^{Λt}S⁻¹ 的推导

用本章的基本公式 $A=S\Lambda S^{-1}$ 代入级数：

- $At=S\Lambda S^{-1}t$；
- $(At)^{2}=S\Lambda S^{-1}S\Lambda S^{-1}t^{2}=S\Lambda^{2}S^{-1}t^{2}$（老朋友：内部相消）；
- $(At)^{3}=S\Lambda^{3}S^{-1}t^{3}/\dots$；

把 $I$ 写成 $SS^{-1}$、从两端提出 $S$ 与 $S^{-1}$，中间剩：

$$
I+\Lambda t+\frac{\Lambda^{2}t^{2}}{2!}+\cdots=e^{\Lambda t}.
$$

$$
\boxed{
e^{At}=S\,e^{\Lambda t}\,S^{-1}
}
$$

**与上一讲完美平行**：$A^{k}=S\Lambda^{k}S^{-1}$ ↔ $e^{At}=Se^{\Lambda t}S^{-1}$。

**适用前提**：$A$ 可对角化（有 $S^{-1}$）。退化矩阵（特征向量不足）不能对角化——可以**三角化**（若尔当形，后面的讲），但对角化到此为止。除此之外，公式是黄金。

## 十六、e^{Λt} 与稳定性区域

$\Lambda$ 是对角阵，指数逐项落在对角线上：

$$
e^{\Lambda t}=
\begin{bmatrix}
e^{\lambda_{1}t}&&\\
&\ddots&\\
&&e^{\lambda_{n}t}
\end{bmatrix}
\quad(\text{其余全零}).
$$

**$e^{At}\to0$ 的条件**：$S,S^{-1}$ 不动，命运在对角元——每个 $e^{\lambda_{i}t}\to0$ ⟺ **每个特征值的实部为负**。

复平面上的两幅稳定区域图（本讲压轴图）：

- **微分方程**（$e^{At}\to0$）：特征值须在**左半平面**（$\operatorname{Re}\lambda<0$）；
- **差分方程**（$A^{k}\to0$）：特征值须在**单位圆内**（$|\lambda|<1$）。

## 十七、收尾例：二阶标量方程化系统

最后一个例子：单个二阶方程

$$
y''+by'+ky=0
$$

怎么变成 $2\times2$ 一阶系统？——**斐波那契同款技巧**：令 $\mathbf{u}=\begin{bmatrix}y'\\y\end{bmatrix}$，补上平凡方程 $y'=y'$：

$$
\mathbf{u}'=
\begin{bmatrix}y''\\y'\end{bmatrix}
=
\begin{bmatrix}-b&-k\\1&0\end{bmatrix}
\begin{bmatrix}y'\\y\end{bmatrix}
=A\mathbf{u}.
$$

（第一行来自方程 $y''=-by'-ky$；第二行来自平凡方程。）

**一般规律**：$n$ 阶标量方程 → $n\times n$ 一阶系统——方程系数放在第一行，下面 $n-1$ 行是平凡方程的 1。特征值与原微分方程自然相连。

本讲小结：幂的平行课——**现在指数也会算了**。

## 十八、课后练习

### 练习 1：完整求解

$$
\frac{d\mathbf{u}}{dt}=\begin{bmatrix}0&1\\1&0\end{bmatrix}\mathbf{u},
\qquad
\mathbf{u}(0)=\begin{bmatrix}2\\0\end{bmatrix}.
$$

#### 解答

特征值：$\lambda^{2}-1=0\Rightarrow\lambda=\pm1$（迹 0 ✓、积 −1 ✓）。

- $\lambda=1$：$A-I=\begin{bmatrix}-1&1\\1&-1\end{bmatrix}$，$\mathbf{x}_{1}=(1,1)^{T}$；
- $\lambda=-1$：$A+I=\begin{bmatrix}1&1\\1&1\end{bmatrix}$，$\mathbf{x}_{2}=(1,-1)^{T}$。

初始条件：$c_{1}(1,1)+c_{2}(1,-1)=(2,0)\Rightarrow c_{1}=1,\ c_{2}=1$。

$$
\mathbf{u}(t)=e^{t}\begin{bmatrix}1\\1\end{bmatrix}+e^{-t}\begin{bmatrix}1\\-1\end{bmatrix}.
$$

$\lambda=1>0$：**爆炸**（分量沿 $(1,1)$ 方向指数增长）。

### 练习 2：稳定性快判

判断下列 $2\times2$ 系统的稳定性（稳定 / 稳态 / 爆炸）：

(a) $\begin{bmatrix}-1&0\\0&-2\end{bmatrix}$；(b) $\begin{bmatrix}-1&0\\0&0\end{bmatrix}$；(c) $\begin{bmatrix}1&2\\2&1\end{bmatrix}$；(d) $\begin{bmatrix}-1&5\\-5&-1\end{bmatrix}$。

#### 解答

**(a)** $\lambda=-1,-2$：全负 → **稳定**。
**(b)** $\lambda=0,-1$：零 + 负 → **稳态**。
**(c)** 迹 2 > 0 → **爆炸**（实际 $\lambda=3,-1$）。
**(d)** 迹 $-2<0$、$\det=1+25=26>0$ → **稳定**。特征值 $-1\pm5i$：实部 $-1$，衰减 + 振荡。

### 练习 3：矩阵指数小计算

对 $A=\begin{bmatrix}0&1\\1&0\end{bmatrix}$（练习 1 的矩阵），用 $e^{At}=Se^{\Lambda t}S^{-1}$ 写出 $e^{At}$ 的显式矩阵。

#### 解答

$$
S=\begin{bmatrix}1&1\\1&-1\end{bmatrix},\quad
S^{-1}=\frac12\begin{bmatrix}1&1\\1&-1\end{bmatrix},\quad
e^{\Lambda t}=\begin{bmatrix}e^{t}&0\\0&e^{-t}\end{bmatrix}.
$$

$$
e^{At}=S e^{\Lambda t}S^{-1}
=\frac12\begin{bmatrix}
e^{t}+e^{-t}&e^{t}-e^{-t}\\
e^{t}-e^{-t}&e^{t}+e^{-t}
\end{bmatrix}
=
\begin{bmatrix}
\cosh t&\sinh t\\
\sinh t&\cosh t
\end{bmatrix}.
$$

（练习 1 的解正是 $e^{At}\mathbf{u}(0)=(\cosh t+\sinh t,\ \cosh t-\sinh t)=(e^{t},e^{-t})$… 逐分量核对：$e^{At}(2,0)^{T}=(2\cosh t,2\sinh t)^{T}$；而练习 1 的解是 $(e^{t}+e^{-t},\,e^{t}-e^{-t})=(2\cosh t,2\sinh t)$ ✓。）

### 练习 4：三阶方程化系统

把 $y'''+2y''-y'+3y=0$ 化为 $3\times3$ 一阶系统并写出 $A$。

#### 解答

$\mathbf{u}=(y'',y',y)^{T}$，补两条平凡方程 $y''=y''$、$y'=y'$：

$$
\mathbf{u}'=
\begin{bmatrix}-2&1&-3\\1&0&0\\0&1&0\end{bmatrix}\mathbf{u}.
$$

（第一行来自 $y'''=-2y''+y'-3y$；下方是次对角线的 1。）特征方程即 $ \lambda^{3}+2\lambda^{2}-\lambda+3=0$。

## 十九、视频时间索引

以下时间点依据本地下载版本的字幕整理，顺序与正文一致：

| 时间 | 教授的授课内容 |
|---|---|
| 00:00:00 | 开场：微分方程点火 |
| 00:00:11 | 一阶、常系数线性方程组 |
| 00:00:32 | 关键：解是指数函数 |
| 00:00:56 | 与矩阵的幂完全平行 |
| 00:01:22 | 例题：$A=\begin{bmatrix}-1&2\\1&-2\end{bmatrix}$、$\mathbf{u}(0)=(1,0)$ |
| 00:02:00 | 流动图像：$\mathbf{u}_{1}$ 流向 $\mathbf{u}_{2}$ |
| 00:02:30 | 第一步：特征值与特征向量 |
| 00:03:07 | 矩阵奇异 ⟹ $\lambda=0$ |
| 00:03:33 | 迹 −3 ⟹ $\lambda_{2}=-3$ |
| 00:03:51 | 特征方程 $\lambda^{2}+3\lambda=0$ |
| 00:05:09 | 特征值剧透：$e^{-3t}$ 消失、$e^{0t}$ 是稳态 |
| 00:06:22 | $\lambda=0$ 的特征向量 $(2,1)$ |
| 00:07:01 | $\lambda=-3$：$A+3I$ 奇异，$\mathbf{x}_{2}=(1,-1)$ |
| 00:08:46 | 通解：两个纯指数的组合 |
| 00:09:47 | 验证：求导提出 $\lambda$、$A\mathbf{x}=\lambda\mathbf{x}$ |
| 00:11:02 | 与上一讲对照：$\lambda^{k}\mathbf{x}$ ↔ $e^{\lambda t}\mathbf{x}$ |
| 00:12:08 | $c_{1},c_{2}$ 待定 |
| 00:13:30 | 初始条件：$c_{1}(2,1)+c_{2}(1,-1)=(1,0)$ |
| 00:14:30 | 目测：各取三分之一 |
| 00:15:11 | 完整解；流动图像 |
| 00:15:59 | 稳态 $(\tfrac23,\tfrac13)$ |
| 00:16:32 | 三种命运：稳态 / 归零 / 爆炸 |
| 00:16:57 | 稳定 ⟺ 特征值全负 |
| 00:17:13 | 复特征值怎么办 |
| 00:17:54 | $\lambda=-3+6i$：$|e^{\lambda t}|=e^{-3t}$ |
| 00:18:45 | 虚部绕单位圆转；实部说了算 |
| 00:19:30 | 三情形判据（实部） |
| 00:20:49 | $-A$：特征值变号、爆炸 |
| 00:22:18 | 二阶快速判据 |
| 00:23:36 | 迹必为负（虚部相消） |
| 00:24:06 | 负迹不充分：$\begin{bmatrix}-2&0\\0&1\end{bmatrix}$ |
| 00:25:28 | 加上：行列式必为正 |
| 00:26:33 | 二阶稳定 ⟺ 迹负且积正 |
| 00:26:56 | 定系数 = $S\mathbf{c}=\mathbf{u}(0)$（$S$ 是特征向量矩阵） |
| 00:28:16 | 开局配平，永远正确 |
| 00:28:53 | $A$ 耦合、特征向量解耦 |
| 00:29:39 | 换基 $\mathbf{u}=S\mathbf{v}$ |
| 00:30:45 | $d\mathbf{v}/dt=\Lambda\mathbf{v}$：解耦 |
| 00:31:36 | $\mathbf{v}(t)=e^{\Lambda t}\mathbf{v}(0)$ |
| 00:32:16 | $\mathbf{u}(t)=Se^{\Lambda t}S^{-1}\mathbf{u}(0)$；$e^{At}$ 现身 |
| 00:33:42 | 矩阵指数的定义：幂级数 |
| 00:34:42 | 阶乘除数 |
| 00:35:20 | 两个漂亮泰勒级数 |
| 00:35:51 | 几何级数 = $1/(1-x)$；矩阵版 $(I-At)^{-1}$ |
| 00:36:59 | 小 $t$ 近似：$I+At$ |
| 00:37:41 | 指数级数永远收敛；几何级数会炸（特征值条件） |
| 00:39:02 | 推导 $e^{At}=Se^{\Lambda t}S^{-1}$：代入级数 |
| 00:40:56 | 幂的望远镜相消 |
| 00:41:45 | 提出 $S\ldots S^{-1}$：中间是 $e^{\Lambda t}$ |
| 00:42:39 | 适用前提：可对角化 |
| 00:43:24 | 退化矩阵：可三角化、不可对角化（预告） |
| 00:43:50 | $e^{\Lambda t}$：对角线上是标量指数 |
| 00:45:36 | $e^{At}\to0\iff$ 所有实部为负 |
| 00:46:24 | 复平面两幅稳定区域图 |
| 00:46:58 | 左半平面（微分方程）vs 单位圆（差分方程） |
| 00:47:38 | 收尾例：$y''+by'+ky=0$ |
| 00:48:28 | 化系统：$\mathbf{u}=(y',y)$ |
| 00:49:32 | $A=\begin{bmatrix}-b&-k\\1&0\end{bmatrix}$ |
| 00:49:59 | 一般 $n$ 阶 → $n\times n$；次对角线 1 |
| 00:50:41 | 小结：幂的平行课完成 |
