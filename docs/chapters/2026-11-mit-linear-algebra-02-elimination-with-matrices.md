# 第 2 讲 · 矩阵消元

> 对应 MIT 18.06《Linear Algebra》Lecture 2：*Elimination with Matrices*（Gilbert Strang）。
> 这是这门课的中文学习笔记：知识点跟原课对齐，讲法和例子按中文读者的习惯重新组织。

上一篇的方程组之所以能"一眼看出解"，是因为右侧向量恰好等于矩阵的第三列——这是出题人给的运气，不是方法论。真实的线性代数问题没有这种巧合：几百个未知数，右侧向量毫无规律，你得有一套任何人（包括计算机）都能机械执行的办法。

这套办法就是消元法。读完这篇，你能完整跑通求解一个方程组的全流程：前向消元、判断消元会不会失败、回代求出答案；然后把这些手工步骤逐字翻译成矩阵乘法——初等矩阵、置换矩阵、结合律，以及逆矩阵的第一眼。后面十几讲的内容（LU 分解、矩阵求逆）全都从这里生长出来。

先划边界。本文自始至终不用行列式（原课把它压到很后面才讲）；例子都是 $3\times3$ 方阵，规模变了流程不变；消元结果还能怎么继续加工，是第 4 讲 LU 分解的事。

场景钩子先给你：在 MATLAB 里解方程组只要写 `A\b`，NumPy 里是 `np.linalg.solve(A, b)`。这一行代码的背后，不是什么迭代逼近，而是高斯在两百多年前发明的消元法。本讲你手推的每一步，就是那行代码内部执行的东西。

## 1. 消元法和主元

课堂例题，三个方程、三个未知数：

$$
\begin{cases}
x+2y+z=2\\
3x+8y+z=12\\
4y+z=2
\end{cases}
$$

第三个方程没有 $x$，补上零系数 $0x+4y+z=2$，写成矩阵形式：

$$
A=\begin{bmatrix}1&2&1\\3&8&1\\0&4&1\end{bmatrix},
\qquad
\mathbf{x}=\begin{bmatrix}x\\y\\z\end{bmatrix},
\qquad
\mathbf{b}=\begin{bmatrix}2\\12\\2\end{bmatrix}
$$

消元的策略是**先只处理系数矩阵 $A$**，右侧向量 $\mathbf{b}$ 先放一边，最后再带回来。原因马上会看到：$A$ 和 $\mathbf{b}$ 在整个过程中接受完全相同的行操作，分开处理条理更清楚。

消元的目标是把 $A$ 加工成上三角矩阵（第 3 节见），加工的原材料是一种行操作：**某一行减去另一行的倍数**。操作的基准叫**主元（pivot）**——每一轮消元里，用来消掉下方元素的那个数。主元有一个铁律：不能是零，零没法当"基准"。

## 2. 第一轮：消掉第二、三行里的 x

### 2.1 第一个主元是 1

左上角的 $1$ 就是第一个主元，它所在的行（第一行）本轮不动。要清除的位置是第二行第一列（记作 $(2,1)$），那里的元素是 $3$。

乘数 = 要消去的元素 ÷ 主元：

$$
\ell_{21}=\frac{3}{1}=3
$$

操作：第二行减去三倍第一行，$R_2\leftarrow R_2-3R_1$。逐列算一遍：

$$
\begin{aligned}
R_2-3R_1
&=\begin{bmatrix}3&8&1\end{bmatrix}-3\begin{bmatrix}1&2&1\end{bmatrix}\\
&=\begin{bmatrix}3-3&\;8-6\;&\;1-3\end{bmatrix}
=\begin{bmatrix}0&2&-2\end{bmatrix}
\end{aligned}
$$

矩阵变成：

$$
\begin{bmatrix}1&2&1\\0&2&-2\\0&4&1\end{bmatrix}
$$

用方程的语言复核一遍这道操作干了什么：第一个方程乘 3 得 $3x+6y+3z=6$，再用原第二个方程 $3x+8y+z=12$ 减它，$x$ 全部抵消，剩下 $2y-2z=6$。行操作从来不是"改了数字"，它改的是方程，而且改完的方程组和原来的同解。

### 2.2 位置 (3,1)：已经为零，乘数为 0

下一个该处理第三行第一列。那里本来就是 $0$，乘数 $\ell_{31}=\frac{0}{1}=0$，操作 $R_3\leftarrow R_3-0R_1$ 什么也不改变。

矩阵没动，但按流程来说 $(3,1)$ 这个位置已经"检查并处理完毕"——计算机就是这样一格一格扫过去的。

## 3. 第二轮：得到上三角矩阵 U

### 3.1 第二个主元是 2

现在看第二行第二列，那里的 $2$ 是第二个主元（经过第一轮消元，第二行只剩 $y,z$ 两个未知数了）。要清除的是 $(3,2)$ 位置的 $4$：

$$
\ell_{32}=\frac{4}{2}=2,
\qquad
R_3\leftarrow R_3-2R_2
$$

注意这里的 $R_2$ 是**消元后**的第二行 $\begin{bmatrix}0&2&-2\end{bmatrix}$，不是原始矩阵的第二行。逐列计算：

$$
\begin{aligned}
R_3-2R_2
&=\begin{bmatrix}0&4&1\end{bmatrix}-2\begin{bmatrix}0&2&-2\end{bmatrix}\\
&=\begin{bmatrix}0-0&\;4-4&\;1-2(-2)\end{bmatrix}
=\begin{bmatrix}0&0&5\end{bmatrix}
\end{aligned}
$$

最后一个位置最容易算错，单独拎出来：$1-2(-2)=1+4=5$。减去一个负数，是加法。

### 3.2 上三角矩阵 U

消元完成：

$$
U=\begin{bmatrix}\boxed{1}&2&1\\0&\boxed{2}&-2\\0&0&\boxed{5}\end{bmatrix}
$$

主对角线以下全为零，这样的矩阵叫**上三角矩阵（upper triangular matrix）**，字母 $U$ 就是 upper 的首字母。三个主元沿对角线排开：$1$、$2$、$5$。

本例没有换行就凑齐了三个非零主元，消元顺利成功。原课顺带预告了一个事实：全程只用"某行减另一行的倍数"、不换行也不把某行乘以常数的话，行列式等于主元乘积——$\det A=1\times2\times5=10$。行列式本身第 18 讲才登场，这里混个脸熟。

![消元全过程（动态）：两次行变换把 A 化成 U，主元 1、2、5 依次现形](/assets/images/mit1806/mit1806-02-elimination.gif)

## 4. 消元失败的三种情形

顺利的例子看完了。在继续解方程之前，先停下来回答一个反方向的问题：**消元什么时候会失败？**

### 4.1 主元位置是零：换行能救

假设左上角不是 $1$ 而是 $0$，比如这个矩阵：

$$
\begin{bmatrix}0&2&1\\1&3&0\\0&1&4\end{bmatrix}
$$

第一行没有 $x$，没法拿它消下面的 $x$。但这不等于无解，也不该停机——下方某行第一列有非零元素，交换两行就是了。$R_1\leftrightarrow R_2$：

$$
\begin{bmatrix}1&3&0\\0&2&1\\0&1&4\end{bmatrix}
$$

左上角有了非零主元 $1$，消元继续。零主元不一定致命，先试试换行。

### 4.2 第二主元变零：换行还能救

把课堂例题里的 $8$ 改成 $6$，看第二个主元会不会出事：

$$
A'=\begin{bmatrix}1&2&1\\3&6&1\\0&4&1\end{bmatrix}
$$

第一步照旧 $R_2\leftarrow R_2-3R_1$，第二行变成

$$
\begin{bmatrix}3&6&1\end{bmatrix}-3\begin{bmatrix}1&2&1\end{bmatrix}
=\begin{bmatrix}0&0&-2\end{bmatrix}
$$

第二个主元位置 $(2,2)$ 现在是 $0$。它正下方躺着一个 $4$，交换第二、三行，$R_2\leftrightarrow R_3$：

$$
\begin{bmatrix}1&2&1\\0&4&1\\0&0&-2\end{bmatrix}
$$

三个主元变成 $1$、$4$、$-2$，全部非零，消元依然成功。这是"换行可救"的临时故障。

### 4.3 第三个主元变零：没救了，矩阵奇异

再来一种换行救不了的。把原矩阵第三行的 $1$ 改成 $-4$：

$$
A''=\begin{bmatrix}1&2&1\\3&8&1\\0&4&-4\end{bmatrix}
$$

两步照旧。$R_2\leftarrow R_2-3R_1$ 后是 $\begin{bmatrix}0&2&-2\end{bmatrix}$；再执行 $R_3\leftarrow R_3-2R_2$：

$$
\begin{bmatrix}0&4&-4\end{bmatrix}
-2\begin{bmatrix}0&2&-2\end{bmatrix}
=\begin{bmatrix}0&0&0\end{bmatrix}
$$

第三个主元位置是 $0$，而且下面已经没有行可以换了。凑不齐三个非零主元，消元彻底失败——这说明原方阵是**奇异的（singular）**、不可逆的。

那么"奇异"是不是等于"这个方程组无解"？不是，两件事要分开。对具体的 $A\mathbf{x}=\mathbf{b}$，奇异矩阵可能无解，也可能有无穷多解，取决于右侧向量。奇异能确定只有一句话：**不能保证对每一个右侧向量都有唯一解**。这正是第 1 讲"填不满整个空间"在消元语言里的样子。

## 5. 把 b 带回来：增广矩阵与回代

失败情形讨论完，回到能成功消元的原矩阵，正式把 $\mathbf{b}$ 接进来。

### 5.1 增广矩阵

把 $\mathbf{b}=\begin{bmatrix}2\\12\\2\end{bmatrix}$ 拼到 $A$ 的右边，竖线隔开：

$$
\left[\begin{array}{ccc|c}1&2&1&2\\3&8&1&12\\0&4&1&2\end{array}\right]
$$

这叫**增广矩阵（augmented matrix）**——"增广"就是多带了一列。规则只有一条：竖线左侧做行操作时，右侧必须做一模一样的操作，因为对方程的一边做了什么，另一边必须同步。

### 5.2 右侧跟着走两步

第一步 $R_2\leftarrow R_2-3R_1$ 只动第二行，右侧的变化就一处：

$$
b_2'=12-3\times2=6
$$

第一行不动（右侧还是 $2$），第三行乘数为 $0$ 也不动（还是 $2$）。此时右侧是 $\begin{bmatrix}2\\6\\2\end{bmatrix}$。

第二步 $R_3\leftarrow R_3-2R_2$，用的是**更新后**的第二行右侧值 $6$：

$$
b_3''=2-2\times6=-10
$$

最终的增广矩阵：

$$
\left[\begin{array}{ccc|c}1&2&1&2\\0&2&-2&6\\0&0&5&-10\end{array}\right]
$$

也就是 $U\mathbf{x}=\mathbf{c}$，其中

$$
U=\begin{bmatrix}1&2&1\\0&2&-2\\0&0&5\end{bmatrix},
\qquad
\mathbf{c}=\begin{bmatrix}2\\6\\-10\end{bmatrix}
$$

$U$ 是 $A$ 经历行操作的结果，$\mathbf{c}$ 是 $\mathbf{b}$ 经历同样操作的结果。原来的方程组和 $U\mathbf{x}=\mathbf{c}$ 同解，但后者好解得多。

### 5.3 回代：从下往上逐个解出

把最终增广矩阵翻译回三个方程：

$$
x+2y+z=2,\qquad
2y-2z=6,\qquad
5z=-10
$$

最后一个方程只含 $z$，先解它；解出一个，往上一行代一个。这个过程叫**回代（back substitution）**——从最后一行出发，与消元方向相反，逐行向上。

第一步，$5z=-10$，两边除以 $5$：

$$
z=-2
$$

第二步，代入中间方程 $2y-2z=6$：

$$
2y-2(-2)=6
\;\Longrightarrow\;
2y+4=6
\;\Longrightarrow\;
y=1
$$

第三步，把 $y=1$、$z=-2$ 代入第一行 $x+2y+z=2$：

$$
x+2-2=2
\;\Longrightarrow\;
x=2
$$

最终答案 $\mathbf{x}=\begin{bmatrix}2\\1\\-2\end{bmatrix}$。代回**原始**方程组检验：$2+2(1)+(-2)=2$ 成立；$3(2)+8(1)+(-2)=12$ 成立；$4(1)+(-2)=2$ 成立。三个全对，收工。

![回代（动态）：从最后一行向上逐行求出 z=−2、y=1、x=2](/assets/images/mit1806/mit1806-02-back-substitution.gif)

至此求解流程完整：消元把 $A\mathbf{x}=\mathbf{b}$ 变成 $U\mathbf{x}=\mathbf{c}$，回代从 $U\mathbf{x}=\mathbf{c}$ 解出 $\mathbf{x}$。

## 6. 矩阵语言第一课：乘法的两个方向

接下来是本讲的第二件事：把消元本身写成矩阵乘法。动手之前，先补两块地基——矩阵乘法从左边看和从右边看是两回事。

**矩阵乘列向量**：结果是矩阵各列的线性组合。设 $A$ 的三列是 $\mathbf{a}_1,\mathbf{a}_2,\mathbf{a}_3$，则

$$
A\begin{bmatrix}3\\4\\5\end{bmatrix}
=3\,\mathbf{a}_1+4\,\mathbf{a}_2+5\,\mathbf{a}_3
$$

这正是第 1 讲的核心结论，向量在右边时，它就是一份"配方比例"。

**行向量乘矩阵**：结果是矩阵各行的线性组合。把行向量放在左边：

$$
\begin{bmatrix}1&2&7\end{bmatrix}A
=1\times(\text{第 1 行})+2\times(\text{第 2 行})+7\times(\text{第 3 行})
$$

现在关键判断来了：消元操作的是**行**，所以表示消元的矩阵必须放在 $A$ 的**左边**（左乘）。这个方向感贯穿整个矩阵消元。

## 7. 一步消元 = 一个初等矩阵

### 7.1 目标与构造

第一步消元做的是：$R_1$、$R_3$ 不动，$R_2\leftarrow R_2-3R_1$。找一个矩阵 $E_{21}$，左乘 $A$ 后恰好完成这件事：

$$
E_{21}A=\begin{bmatrix}1&2&1\\0&2&-2\\0&4&1\end{bmatrix}
$$

下标 $21$ 的含义就是"负责清除 $(2,1)$ 位置"。

构造方法来自第 6 节的行观点：$E_{21}$ 的每一行，说明 $A$ 的三行怎么组合。第一行要保持原样，组合系数是"一份第一行，其他不要"：

$$
E_{21}\text{ 的第 1 行}=\begin{bmatrix}1&0&0\end{bmatrix}
$$

第二行要变成"负三倍第一行加一份第二行"：

$$
E_{21}\text{ 的第 2 行}=\begin{bmatrix}-3&1&0\end{bmatrix}
$$

第三行保持原样：

$$
E_{21}\text{ 的第 3 行}=\begin{bmatrix}0&0&1\end{bmatrix}
$$

三行拼起来：

$$
E_{21}=\begin{bmatrix}1&0&0\\-3&1&0\\0&0&1\end{bmatrix}
$$

![初等矩阵消元：E₂₁ 的一行 = 「新行2 = 行2 − 3×行1」](/assets/images/mit1806/mit1806-02-elimination-matrix.png)

### 7.2 完整验证 E₂₁A

左乘是行的线性组合，逐行算：

- 第 1 行：$1\begin{bmatrix}1&2&1\end{bmatrix}=\begin{bmatrix}1&2&1\end{bmatrix}$；
- 第 2 行：$-3\begin{bmatrix}1&2&1\end{bmatrix}+1\begin{bmatrix}3&8&1\end{bmatrix}=\begin{bmatrix}-3+3&-6+8&-3+1\end{bmatrix}=\begin{bmatrix}0&2&-2\end{bmatrix}$；
- 第 3 行：$1\begin{bmatrix}0&4&1\end{bmatrix}=\begin{bmatrix}0&4&1\end{bmatrix}$。

$$
E_{21}A=\begin{bmatrix}1&2&1\\0&2&-2\\0&4&1\end{bmatrix}
$$

和第 2 节手工消元的结果一字不差。

再抽查一个元素，顺便看矩阵乘法的元素级定义：结果第 $(2,3)$ 个元素，等于**左矩阵第 2 行与右矩阵第 3 列的点积**：

$$
\begin{bmatrix}-3&1&0\end{bmatrix}\cdot\begin{bmatrix}1\\1\\1\end{bmatrix}
=(-3)(1)+1(1)+0(1)=-2
$$

对得上。

### 7.3 单位矩阵与初等矩阵

假如三行都不想动，每行系数就是"只要自己"：

$$
I=\begin{bmatrix}1&0&0\\0&1&0\\0&0&1\end{bmatrix},
\qquad
IA=A
$$

$I$ 叫**单位矩阵（identity matrix）**，在矩阵乘法里的地位相当于数字 $1$。而 $E_{21}$ 可以看成"单位矩阵做了一次行操作"的产物，这类矩阵叫**初等矩阵（elementary matrix）**，也叫消元矩阵。

## 8. 第二个消元矩阵与结合律

第二步消元 $R_3\leftarrow R_3-2R_2$ 用同一个方法构造，前两行不动、第三行取"负两倍第二行加一份第三行"：

$$
E_{32}=\begin{bmatrix}1&0&0\\0&1&0\\0&-2&1\end{bmatrix}
$$

代入第一步的结果验证：

$$
E_{32}(E_{21}A)
=\begin{bmatrix}1&0&0\\0&1&0\\0&-2&1\end{bmatrix}
\begin{bmatrix}1&2&1\\0&2&-2\\0&4&1\end{bmatrix}
=\begin{bmatrix}1&2&1\\0&2&-2\\0&0&5\end{bmatrix}
=U
$$

（第三行算一下：$-2\begin{bmatrix}0&2&-2\end{bmatrix}+1\begin{bmatrix}0&4&1\end{bmatrix}=\begin{bmatrix}0&0&5\end{bmatrix}$，正是那个容易错的 $5$。）

两次消元接力的完整写法是 $E_{32}(E_{21}A)=U$。那么能不能先把两个 $E$ 乘起来，一步到位？矩阵乘法有一条**结合律（associative law）**保证这件事合法：

$$
\boxed{E_{32}(E_{21}A)=(E_{32}E_{21})A}
$$

结合律的含义要读准：**括号可以移动**（先算哪一对乘积随便挑），但矩阵的**书写顺序不能变**。"先算哪一对"是自由的，"谁乘谁"不是。这条定律后面几十讲的推导里到处都用。

## 9. 置换矩阵：左乘换行，右乘换列

第 4 节失败讨论里用过行交换。行交换也能写成矩阵乘法，干这活的矩阵叫**置换矩阵（permutation matrix）**，记作 $P$。

### 9.1 左乘 P：交换两行

想交换 $A=\begin{bmatrix}a&b\\c&d\end{bmatrix}$ 的两行，把单位矩阵的两行交换一下就得到 $P$：

$$
P=\begin{bmatrix}0&1\\1&0\end{bmatrix},
\qquad
PA=\begin{bmatrix}0&1\\1&0\end{bmatrix}
\begin{bmatrix}a&b\\c&d\end{bmatrix}
=\begin{bmatrix}c&d\\a&b\end{bmatrix}
$$

用行观点读：$PA$ 的第一行是"一份 $A$ 的第二行"，第二行是"一份 $A$ 的第一行"——两行互换。

### 9.2 右乘 P：交换两列

想交换**列**呢？方向反过来，把 $P$ 放右边。逐元素算四个位置：

$$
AP=\begin{bmatrix}a&b\\c&d\end{bmatrix}
\begin{bmatrix}0&1\\1&0\end{bmatrix}
=\begin{bmatrix}a(0)+b(1)&a(1)+b(0)\\c(0)+d(1)&c(1)+d(0)\end{bmatrix}
=\begin{bmatrix}b&a\\d&c\end{bmatrix}
$$

两列互换了。合起来是一条必须记住的规则：

$$
\boxed{\text{左乘对应行操作，右乘对应列操作。}}
$$

### 9.3 交换律不成立

同一个 $A$、同一个 $P$，两个方向的乘积却不相等：

$$
PA=\begin{bmatrix}c&d\\a&b\end{bmatrix}
\neq
\begin{bmatrix}b&a\\d&c\end{bmatrix}=AP
$$

这就是矩阵乘法的第一条"反常"：**交换律通常不成立，$AB\neq BA$**。数字世界里 $3\times5=5\times3$ 的直觉，搬进矩阵要关掉。但结合律依然成立。两条并排记：

$$
(AB)C=A(BC)\quad\text{成立};
\qquad
AB=BA\quad\text{通常不成立}
$$

### 9.4 把两个消元矩阵乘起来

回到主线。现在真的把"先乘两个消元矩阵"算出来。$E_{32}E_{21}$ 左乘是行的组合，逐行算：

- 第 1 行：$\begin{bmatrix}1&0&0\end{bmatrix}$；
- 第 2 行：$\begin{bmatrix}-3&1&0\end{bmatrix}$；
- 第 3 行：$-2\begin{bmatrix}-3&1&0\end{bmatrix}+1\begin{bmatrix}0&0&1\end{bmatrix}=\begin{bmatrix}6&-2&1\end{bmatrix}$。

$$
E_{32}E_{21}
=\begin{bmatrix}1&0&0\\-3&1&0\\6&-2&1\end{bmatrix}
$$

注意第三行冒出来的 $6$：它是"先减三倍第一行，再减两倍新第二行"两步在第一行上的叠加（$-2\times(-3)=6$）。整个消元从此压缩成一个字母 $E$ 和一个式子：

$$
\boxed{EA=U}
$$

## 10. 反向一瞥：撤销一次消元

最后换一个方向思考。前面一直在问"怎么从 $A$ 到 $U$"，现在问"怎么从 $U$ 回到 $A$"——也就是撤销消元。

$E_{21}$ 执行的是"第二行减三倍第一行"。看它对一个具体向量的作用：

$$
E_{21}\begin{bmatrix}2\\12\\2\end{bmatrix}
=\begin{bmatrix}2\\12-3\times2\\2\end{bmatrix}
=\begin{bmatrix}2\\6\\2\end{bmatrix}
$$

撤销它，把减掉的三倍第一行加回来就行——执行"第二行**加**三倍第一行"的矩阵是：

$$
E_{21}^{-1}=\begin{bmatrix}1&0&0\\3&1&0\\0&0&1\end{bmatrix}
$$

验证一下它真能复原。逐行算 $E_{21}^{-1}E_{21}$：第一、三行显然是 $\begin{bmatrix}1&0&0\end{bmatrix}$、$\begin{bmatrix}0&0&1\end{bmatrix}$；第二行：

$$
3\begin{bmatrix}1&0&0\end{bmatrix}
+1\begin{bmatrix}-3&1&0\end{bmatrix}
=\begin{bmatrix}0&1&0\end{bmatrix}
$$

所以

$$
E_{21}^{-1}E_{21}=I
$$

把 $(2,6,2)$ 里的 $6$ 加回 $3\times2$，$\begin{bmatrix}2\\12\\2\end{bmatrix}$ 分毫不差地回来了。

乘积等于 $I$ 的那对矩阵互为**逆矩阵（inverse matrix）**，$E_{21}^{-1}$ 这个记号就是为此准备的。"撤销一次行操作"是认识逆矩阵最朴素的人口。提醒一句：这里能"把 $-3$ 改成 $3$"轻松造逆，是因为初等矩阵只做了一次非常简单的行加法；随便抓一个矩阵可没有这么容易，下一讲专门讲矩阵乘法与求逆。

## 小结

- 消元流程：选主元 → 算乘数 $\ell=\frac{\text{要消的元素}}{\text{主元}}$ → 行减倍数；主元不能为零。
- $A$ 消成上三角矩阵 $U$，主元 $1,2,5$ 落在对角线上；不换行不缩放时 $\det A=$ 主元乘积 $=10$。
- 消元失败三态：零主元换行可救（两次实例）；最后一个主元为零、无行可换 → 矩阵奇异。奇异 ≠ 当前方程组无解，只是不能保证每个 $\mathbf{b}$ 都有唯一解。
- 增广矩阵让 $\mathbf{b}$ 与 $A$ 同步行操作，得到 $U\mathbf{x}=\mathbf{c}$；回代从最后一行向上解出 $(2,1,-2)$。
- 矩阵乘法两个方向：矩阵乘列向量 = 列的线性组合；行向量乘矩阵 = 行的线性组合。消元矩阵必须左乘。
- 一步消元对应一个初等矩阵 $E_{21}$、$E_{32}$；结合律允许合并为 $E=E_{32}E_{21}$，$EA=U$；置换矩阵左乘换行、右乘换列；$AB\neq BA$，$(AB)C=A(BC)$。
- 撤销 $E_{21}$ 的就是 $E_{21}^{-1}$，验证 $E_{21}^{-1}E_{21}=I$——逆矩阵的第一眼。

下一篇讲矩阵乘法的完整规则和逆矩阵——$EA=U$ 里的 $E$ 乘 $A$ 到底怎么按元素、按块来算。

## 练一练

**例 1.** 完整求解 $\begin{cases}2x+4y-2z=2\\4x+9y-3z=8\\-2x-3y+7z=10\end{cases}$。

解. 增广矩阵 $\left[\begin{array}{ccc|c}2&4&-2&2\\4&9&-3&8\\-2&-3&7&10\end{array}\right]$。第一主元 $2$，乘数 $\ell_{21}=\frac42=2$、$\ell_{31}=\frac{-2}{2}=-1$：

$$
R_2-2R_1=\begin{bmatrix}0&1&1&4\end{bmatrix},
\qquad
R_3-(-1)R_1=\begin{bmatrix}0&1&5&12\end{bmatrix}
$$

第二主元 $1$，乘数 $\ell_{32}=\frac11=1$，$R_3-R_2=\begin{bmatrix}0&0&4&8\end{bmatrix}$。主元为 $2,1,4$。回代：$4z=8$ 得 $z=2$；$y+2=4$ 得 $y=2$；$2x+4(2)-2(2)=2$ 得 $x=-1$。检验：$-2+8-4=2$，$-4+18-6=8$，$2-6+14=10$，全部成立。解为 $(x,y,z)=(-1,2,2)$。

**例 2.** 对 $\begin{bmatrix}0&2&1\\1&3&0\\0&1&4\end{bmatrix}$ 消元，主元是多少？

解. 第一主元位置是 $0$，换行：$R_1\leftrightarrow R_2$ 得 $\begin{bmatrix}1&3&0\\0&2&1\\0&1&4\end{bmatrix}$。第二主元 $2$，乘数 $\ell_{32}=\frac12$，执行 $R_3-\frac12R_2=\begin{bmatrix}0&1&4\end{bmatrix}-\begin{bmatrix}0&1&\frac12\end{bmatrix}=\begin{bmatrix}0&0&\frac72\end{bmatrix}$。三个主元为 $1,\;2,\;\frac72$。

**例 3.** 构造左乘后执行 $R_3\leftarrow R_3+4R_1$ 的矩阵 $E$，并求 $E^{-1}$。

解. 对单位矩阵执行同样的行操作：$\begin{bmatrix}0&0&1\end{bmatrix}+4\begin{bmatrix}1&0&0\end{bmatrix}=\begin{bmatrix}4&0&1\end{bmatrix}$，所以

$$
E=\begin{bmatrix}1&0&0\\0&1&0\\4&0&1\end{bmatrix},
\qquad
E^{-1}=\begin{bmatrix}1&0&0\\0&1&0\\-4&0&1\end{bmatrix}
$$

验证关键元素：$-4(1)+1(4)=0$，其余行不变，$E^{-1}E=I$。

**例 4.** 设 $P=\begin{bmatrix}0&1\\1&0\end{bmatrix}$，$A=\begin{bmatrix}1&2\\3&4\end{bmatrix}$，计算 $PA$ 和 $AP$，说明各自效果。

解.

$$
PA=\begin{bmatrix}0&1\\1&0\end{bmatrix}
\begin{bmatrix}1&2\\3&4\end{bmatrix}
=\begin{bmatrix}3&4\\1&2\end{bmatrix}
\qquad\text{（交换两行）}
$$

$$
AP=\begin{bmatrix}1&2\\3&4\end{bmatrix}
\begin{bmatrix}0&1\\1&0\end{bmatrix}
=\begin{bmatrix}2&1\\4&3\end{bmatrix}
\qquad\text{（交换两列）}
$$

$PA\neq AP$，同一个置换矩阵左乘、右乘效果不同——矩阵乘法不满足交换律的又一例证。
