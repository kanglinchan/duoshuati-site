# 第 29 讲：奇异值分解

> 英文标题：Singular Value Decomposition  
> 讲师：Gilbert Strang  
> 整理方式：严格按照教授的实际授课顺序，完整展开课堂推导与计算


## 本讲目录

- [一、开场：最终且最好的分解](#一开场最终且最好的分解)
- [二、特例：对称正定只需一个 Q](#二特例对称正定只需一个-q)
- [三、几何目标：行空间基映成列空间基](#三几何目标行空间基映成列空间基)
- [四、矩阵语言：AV = UΣ](#四矩阵语言av--uσ)
- [五、怎么找到它们：AᵀA 与 AAᵀ](#五怎么找到它们aᵀa-与-aaᵀ)
- [六、例一：完整演算（含教授的现场翻车）](#六例一完整演算含教授的现场翻车)
- [七、翻车的教训与修正](#七翻车的教训与修正)
- [八、例二：秩 1 矩阵的 SVD](#八例二秩-1-矩阵的-svd)
- [九、SVD 的深意：四子空间的正确基](#九svd-的深意四子空间的正确基)
- [十、课后练习](#十课后练习)
- [十一、视频时间索引](#十一视频时间索引)

## 一、开场：最终且最好的分解

**奇异值分解（SVD）**——矩阵的**最终且最好**的分解：

$$
\boxed{
A=U\Sigma V^{T}
\qquad
(\text{正交}\times\text{对角}\times\text{正交})
}
$$

- **任意矩阵** whatsoever 都有 SVD（对角化不行：$S$ 未必正交；若尔当形不够漂亮）；
- 新要点：需要**两个**（多半不同的）正交矩阵；
- 教授评价：这是"汇合本课程一切"的分解，近十年才进入 18.06 核心。

## 二、特例：对称正定只需一个 Q

若 $A$ 对称正定：特征向量正交 ⟹ $S$ 升级成 $Q$；$\Lambda$ 全正升格为正 $\Sigma$：

$$
A=Q\Lambda Q^{T}
\quad\text{——}\ U=V=Q\ \text{一个正交阵两用}.
$$

**一般矩阵没这福气**：特征向量矩阵不正交——所以必须找**两套**正交基。

## 三、几何目标：行空间基映成列空间基

线性变换的大图（行空间在左、列空间在右）上，SVD 要找的是：

> 行空间的一组**标准正交基** $\mathbf{v}_{1},\dots,\mathbf{v}_{r}$，被 $A$ 恰好送到列空间的一组**标准正交基** $\mathbf{u}_{1},\dots,\mathbf{u}_{r}$ 上。

- 任意正交基（施密特给得起）不稀奇；稀奇的是 $A$ 作用后**仍正交**；
- 顺带单位化：$A\mathbf{v}_{i}$ 是 $\mathbf{u}_{i}$ 的倍数——倍数不再叫 $\lambda$，改叫 **$\sigma$（奇异值，拉伸因子）**：

$$
A\mathbf{v}_{i}=\sigma_{i}\mathbf{u}_{i},\qquad i=1,\dots,r.
$$

**零空间不碍事**：往 $\mathbf{v}_{r+1},\dots,\mathbf{v}_{n}$（零空间基）与 $\mathbf{u}_{r+1},\dots,\mathbf{u}_{m}$（左零空间基）补齐标准正交基——它们将被 $\Sigma$ 对角线上的**零**收编。

## 四、矩阵语言：AV = UΣ

把目标堆成矩阵：

$$
A[\,\mathbf{v}_{1}\cdots\mathbf{v}_{r}\,]
=[\,\mathbf{u}_{1}\cdots\mathbf{u}_{r}\,]
\begin{bmatrix}\sigma_{1}&&\\&\ddots&\\&&\sigma_{r}\end{bmatrix}
\quad\xrightarrow{\ \text{补齐零空间}\ }\quad
\boxed{
AV=U\Sigma
\ \Longrightarrow\
A=U\Sigma V^{-1}=U\Sigma V^{T}
}
$$

（$V$ 方正交 ⟹ $V^{-1}=V^{T}$。）

## 五、怎么找到它们：AᵀA 与 AAᵀ

两个正交阵**不想同时找**——造一个让 $U$ 消失的组合（长方形矩阵的老朋友）：

$$
A^{T}A=(V\Sigma^{T}U^{T})(U\Sigma V^{T})
=V\,\underbrace{(U^{T}U)}_{=I}\,\Sigma^{T}\Sigma\,V^{T}
=V\begin{bmatrix}\sigma_{1}^{2}&&\\&\ddots&\\&&\sigma_{n}^{2}\end{bmatrix}V^{T}.
$$

**六项坍缩成三项**——这正是**谱形式** $Q\Lambda Q^{T}$！

$$
\boxed{
\begin{aligned}
V&=\text{（}A^{T}A\text{ 的特征向量）}\quad(\text{对称半正定，特征值}\ \sigma_{i}^{2}\ge0),\\
\sigma_{i}&=\sqrt{A^{T}A\text{ 的特征值}}\quad(\text{取正根}),\\
U&=\text{（}AA^{T}\text{ 的特征向量）}.
\end{aligned}
}
$$

（$A$ 本身平凡，$A^{T}A$ 却是正定（或半正定）好矩阵。）

## 六、例一：完整演算（含教授的现场翻车）

$$
A=\begin{bmatrix}4&4\\-3&3\end{bmatrix}
\quad(\text{可逆，秩 }2).
$$

**第一步**：

$$
A^{T}A=\begin{bmatrix}4&-3\\4&3\end{bmatrix}
\begin{bmatrix}4&4\\-3&3\end{bmatrix}
=\begin{bmatrix}25&7\\7&25\end{bmatrix}.
$$

**第二步（特征对）**：

- $(1,1)^{T}\mapsto(32,32)^{T}$：$\lambda_{1}=32$；
- $(1,-1)^{T}\mapsto(18,-18)^{T}$：$\lambda_{2}=18$；
- 单位化（除以 $\sqrt2$，不影响特征值）：

$$
V=\frac{1}{\sqrt2}\begin{bmatrix}1&1\\1&-1\end{bmatrix},
\qquad
\sigma_{1}=\sqrt{32},\quad\sigma_{2}=\sqrt{18}.
$$

**第三步（$U$）**：

$$
AA^{T}=\begin{bmatrix}4&4\\-3&3\end{bmatrix}
\begin{bmatrix}4&-3\\4&3\end{bmatrix}
=\begin{bmatrix}32&0\\0&18\end{bmatrix}
\quad(\text{碰巧已对角——幸运的意外}).
$$

特征向量 $(1,0)^{T},(0,1)^{T}$；特征值又是 $32,18$——**毫不意外**：

$$
\boxed{
AB\ \text{与}\ BA\ \text{的特征值相同}
}
$$

（交换乘法次序，特征值不动——一个值得记住的好事实。）

于是 $U=I$（最正交的正交阵）。

## 七、翻车的教训与修正

**当场验算**（教授："我祈祷它算对"）：

$$
U\Sigma V^{T}
=\begin{bmatrix}1&0\\0&1\end{bmatrix}
\begin{bmatrix}\sqrt{32}&0\\0&\sqrt{18}\end{bmatrix}
\cdot\frac1{\sqrt2}\begin{bmatrix}1&1\\1&-1\end{bmatrix}
=\begin{bmatrix}\sqrt{16}&\sqrt{16}\\ \sqrt9&-\sqrt9\end{bmatrix}
=\begin{bmatrix}4&4\\3&-3\end{bmatrix}.
$$

——第二行是 $(3,-3)$，原矩阵是 $(-3,3)$：**符号翻反**（教授："Phooey. 不该发生，但发生了……这给你周三回来的重要理由：抓那个符号差"）。

**症结**：特征向量本可带 $\pm$ 号任意翻转——但 SVD **不允许乱选**。正确规则：

$$
\boxed{
\mathbf{u}_{i}=\frac{A\mathbf{v}_{i}}{\sigma_{i}}
\quad(\text{由定义 }A\mathbf{v}_{i}=\sigma_{i}\mathbf{u}_{i}\ \text{倒逼符号})
}
$$

本例：$A\mathbf{v}_{2}=\dfrac{1}{\sqrt2}(4-4,\,-3-3)^{T}=(0,-3\sqrt2)^{T}=\sqrt{18}\,(0,-1)^{T}$——所以

$$
\mathbf{u}_{2}=\begin{bmatrix}0\\-1\end{bmatrix}
\quad(\text{而非}(0,1)^{T}！),
\qquad
U=\begin{bmatrix}1&0\\0&-1\end{bmatrix}.
$$

**修正后验算**：

$$
U\Sigma V^{T}=\begin{bmatrix}4&4\\-3&3\end{bmatrix}=A.\quad\checkmark
$$

（先选 $V$，再让 $U$ 服从 $A\mathbf{v}_{i}=\sigma_{i}\mathbf{u}_{i}$——符号一次到位。）

![SVD 几何（动态）：单位圆经 A=[4 4; −3 3] 变成椭圆，半轴 σ₁=4√2、σ₂=3√2](/assets/images/mit1806/mit1806-29-svd-circle-ellipse.gif)

![Avᵢ=σᵢuᵢ 完整链条：AᵀA → λ=32,18 → σ → U、Σ、V 组装出 A](/assets/images/mit1806/mit1806-29-av-u-chain.png)

## 八、例二：秩 1 矩阵的 SVD

$$
A=\begin{bmatrix}4&3\\8&6\end{bmatrix}
=\begin{bmatrix}1\\2\end{bmatrix}\begin{bmatrix}4&3\end{bmatrix}
\quad(\text{秩 }1).
$$

**四个子空间一眼看穿**：行空间 = $(4,3)$ 的倍数（一条线）；零空间 = 垂直线；列空间 = $(4,8)$（即 $(1,2)$ 方向）的倍数；左零空间 = 垂直于 $(1,2)$。

**选基**（只有一维，没有选择余地）：

$$
\mathbf{v}_{1}=\frac{(4,3)^{T}}{5}=\begin{bmatrix}0.8\\0.6\end{bmatrix},
\qquad
\mathbf{u}_{1}=\frac{(1,2)^{T}}{\sqrt5}.
$$

**算 $\Sigma$**：

$$
A^{T}A=\begin{bmatrix}80&60\\60&45\end{bmatrix}
\quad(\text{秩 }1,\ \text{各行是 }(4,3)\ \text{的倍数});
$$

特征值：$0$（秩 1 必有）与 $125$（迹 125）：

$$
\sigma_{1}=\sqrt{125}=5\sqrt5,\qquad \sigma_{2}=0.
$$

**补齐正交基**：$\mathbf{v}_{2}=(0.6,-0.8)^{T}$、$\mathbf{u}_{2}=(2,-1)^{T}/\sqrt5$。

**拼装**：

$$
\boxed{
A=
\underbrace{\frac{1}{\sqrt5}\begin{bmatrix}1&2\\2&-1\end{bmatrix}}_{U}
\underbrace{\begin{bmatrix}\sqrt{125}&0\\0&0\end{bmatrix}}_{\Sigma}
\underbrace{\begin{bmatrix}0.8&0.6\\0.6&-0.8\end{bmatrix}}_{V^{T}}
}
$$

**验算**：$\sqrt{125}/\sqrt5=\sqrt{25}=5$；$5\times(1,2)^{T}(0.8,0.6)=(4,3)$ ✓（第一行）；第二行被 $\sigma_{2}=0$ 整个杀掉 ✓——秩 1 矩阵的 SVD 干净利落。零空间方向的 $\mathbf{v}_{2},\mathbf{u}_{2}$ 乘的是零，白拿；**真正的功臣是行空间与列空间里的那几根**。

## 九、SVD 的深意：四子空间的正确基

教授的总结（SVD 的本质陈述）：

$$
\boxed{
\begin{aligned}
\mathbf{v}_{1},\dots,\mathbf{v}_{r}&:\ \text{行空间的标准正交基};\\
\mathbf{u}_{1},\dots,\mathbf{u}_{r}&:\ \text{列空间的标准正交基};\\
\mathbf{v}_{r+1},\dots,\mathbf{v}_{n}&:\ \text{零空间的标准正交基};\\
\mathbf{u}_{r+1},\dots,\mathbf{u}_{m}&:\ \text{左零空间的标准正交基}.
\end{aligned}
}
$$

- **基终于选对**：不仅标准正交（施密特第四章就能给），而且**让矩阵对角**——$A\mathbf{v}_{i}=\sigma_{i}\mathbf{u}_{i}$：$\mathbf{v}$ 之间无耦合、$\mathbf{u}$ 之间无耦合，$A$ 把每根 $\mathbf{v}_{i}$ 送进对应 $\mathbf{u}_{i}$ 的方向；
- 这正是**四个基本子空间的完美基**，维数恰好 $r,r,n-r,m-r$。

（SVD 还会发展，课程最后几讲再见。）

## 十、课后练习

### 练习 1：SVD 速算

$$
A=\begin{bmatrix}3&0\\0&2\end{bmatrix}.
$$

#### 解答

已是对角阵：$A^{T}A=\begin{bmatrix}9&0\\0&4\end{bmatrix}$，$\sigma_{1}=3,\sigma_{2}=2$，$V=U=I$：

$$
A=I\begin{bmatrix}3&0\\0&2\end{bmatrix}I^{T}.
$$

（对角阵的 SVD 就是自己——符号全取正即合规。）

### 练习 2：完整 SVD

$$
A=\begin{bmatrix}2&0\\0&-3\end{bmatrix}.
$$

#### 解答

$A^{T}A=\begin{bmatrix}4&0\\0&9\end{bmatrix}$：特征值 9, 4 → $\sigma_{1}=3,\sigma_{2}=2$；$V$：$\lambda=9$ 的特征向量 $(0,1)^{T}$、$\lambda=4$ 的 $(1,0)^{T}$：

$$
V=\begin{bmatrix}0&1\\1&0\end{bmatrix}.
$$

按规则定 $U$：$A\mathbf{v}_{1}=A(0,1)^{T}=(0,-3)^{T}=3\,(0,-1)^{T}\Rightarrow\mathbf{u}_{1}=(0,-1)^{T}$；$A\mathbf{v}_{2}=(2,0)^{T}=2(1,0)^{T}\Rightarrow\mathbf{u}_{2}=(1,0)^{T}$：

$$
U=\begin{bmatrix}0&1\\-1&0\end{bmatrix},
\qquad
A=U\begin{bmatrix}3&0\\0&2\end{bmatrix}V^{T}.\quad
\checkmark
$$

（教训与例一同源：负对角元必须被 $U$、$V$ 的符号吸收——$\Sigma$ 里永远放正数。）

### 练习 3：秩 1 的 SVD

$$
A=\begin{bmatrix}1&2\\2&4\end{bmatrix}.
$$

#### 解答

秩 1：$A=(1,2)^{T}(1,2)$。行空间方向 $(1,2)$：

$$
\mathbf{v}_{1}=\tfrac{1}{\sqrt5}(1,2)^{T},\qquad
\mathbf{u}_{1}=\tfrac{1}{\sqrt5}(1,2)^{T},\qquad
\sigma_{1}=\sqrt{25}=5.
$$

（$A^{T}A=\begin{bmatrix}5&10\\10&20\end{bmatrix}$：特征值 $25,0$ ✓。）

$$
V=\begin{bmatrix}1/\sqrt5&2/\sqrt5\\2/\sqrt5&-1/\sqrt5\end{bmatrix},
\quad
U=V\ (\text{对称幸运}),\quad
\Sigma=\begin{bmatrix}5&0\\0&0\end{bmatrix}.
$$

验算：$U\Sigma V^{T}=5\mathbf{u}_{1}\mathbf{v}_{1}^{T}=5\cdot\tfrac15\begin{bmatrix}1\\2\end{bmatrix}(1,2)=\begin{bmatrix}1&2\\2&4\end{bmatrix}=A.\ \checkmark$

### 练习 4：为什么 σ² 是 AᵀA 的特征值

设 $A\mathbf{v}=\sigma\mathbf{u}$（$\|\mathbf{v}\|=\|\mathbf{u}\|=1$，$\sigma\neq0$）。证明 $\sigma^{2}$ 是 $A^{T}A$ 的特征值、$\mathbf{v}$ 是对应特征向量。

#### 解答

$$
A^{T}A\mathbf{v}=A^{T}(\sigma\mathbf{u})=\sigma\,A^{T}\mathbf{u}.
$$

另一方面 $\|A\mathbf{v}\|^{2}=\sigma^{2}$，即 $\mathbf{v}^{T}A^{T}A\mathbf{v}=\sigma^{2}$；而 $A^{T}\mathbf{u}=\sigma\mathbf{v}$ 由 $A\mathbf{v}=\sigma\mathbf{u}$ 左乘 $A^{T}$ 且利用 $\mathbf{u}^{T}\mathbf{u}=1$ 的配对性可得（$A^{T}A\mathbf{v}=\sigma A^{T}\mathbf{u}$ 与 $A^{T}A\mathbf{v}=\sigma^{2}\mathbf{v}$ 都从谱形式读出）。最直接的路线：

$$
A^{T}A\mathbf{v}=V\Sigma^{T}\Sigma V^{T}\mathbf{v}=\sigma^{2}\mathbf{v}
$$

（$V^{T}\mathbf{v}=\mathbf{e}_{i}$。）∎

## 十一、视频时间索引

以下时间点依据本地下载版本的字幕整理，顺序与正文一致：

| 时间 | 教授的授课内容 |
|---|---|
| 00:00:14 | 开场：SVD——最终且最好的分解 |
| 00:00:37 | 因子：正交×对角×正交 |
| 00:00:58 | 任意矩阵都有 SVD |
| 00:01:17 | 汇合全课程 |
| 00:01:41 | 特例：对称正定 $A=Q\Lambda Q^{T}$（一个 $Q$ 两用） |
| 00:02:38 | 一般矩阵不行：特征向量不正交 |
| 00:03:10 | 线性变换大图：行空间 → 列空间 |
| 00:03:54 | 目标：正交基映成正交基 |
| 00:04:39 | 施密特给正交、但不保证映后仍正交 |
| 00:05:14 | 零空间不碍事（$\Sigma$ 对角线上的零） |
| 00:06:27 | 单位化：$A\mathbf{v}_{i}=\sigma_{i}\mathbf{u}_{i}$ |
| 00:07:09 | 矩阵语言：$AV=U\Sigma$ |
| 00:08:43 | 补齐零空间基 |
| 00:09:02 | $A=U\Sigma V^{T}$ |
| 00:13:08 | 找 $U,V$ 的组合：$A^{T}A$ |
| 00:14:30 | 六项坍缩：$U^{T}U=I$ |
| 00:14:52 | 谱形式：$V\sigma^{2}V^{T}$ |
| 00:15:17 | $V$ = $A^{T}A$ 特征向量；$\sigma$ = 正平方根 |
| 00:16:11 | $U$ = $AA^{T}$ 特征向量 |
| 00:16:52 | 例一：$A=\begin{bmatrix}4&4\\-3&3\end{bmatrix}$ |
| 00:17:12 | $A^{T}A=\begin{bmatrix}25&7\\7&25\end{bmatrix}$ |
| 00:18:10 | $(1,1)\to32$、$(1,-1)\to18$ |
| 00:19:24 | 单位化；$\sigma=\sqrt{32},\sqrt{18}$ |
| 00:21:15 | 求 $U$：$AA^{T}$ 路线 |
| 00:23:15 | $AA^{T}=\mathrm{diag}(32,18)$：幸运 |
| 00:24:18 | $AB$、$BA$ 特征值相同 |
| 00:25:31 | 验算：符号翻反——"Phooey" |
| 00:26:30 | "周三回来抓符号差" |
| 00:27:14 | 非法操作：$V^{T}$ 摆放 |
| 00:28:10 | 搁置，先讲例二 |
| 00:28:21 | 例二：$A=\begin{bmatrix}4&3\\8&6\end{bmatrix}$（秩 1） |
| 00:29:09 | 行空间/零空间/列空间/左零空间 |
| 00:31:13 | $\mathbf{v}_{1}=(0.8,0.6)$、$\mathbf{u}_{1}=(1,2)/\sqrt5$ |
| 00:33:10 | $A^{T}A=\begin{bmatrix}80&60\\60&45\end{bmatrix}$：特征值 125, 0 |
| 00:34:28 | $\sigma_{1}=\sqrt{125}$ |
| 00:34:41 | $\mathbf{v}_{2},\mathbf{u}_{2}$ 补齐 |
| 00:35:38 | SVD 拼装与验算 |
| 00:36:46 | 零方向乘零；行/列空间才是关键 |
| 00:37:25 | 本质：给四子空间选正确的基 |
| 00:38:39 | 四组标准正交基陈述 |
| 00:38:51 | 施密特只给正交、特征值才给对角 |
| 00:39:38 | 维数 $r,r,n-r,m-r$ |
| 00:40:10 | 收尾 |
