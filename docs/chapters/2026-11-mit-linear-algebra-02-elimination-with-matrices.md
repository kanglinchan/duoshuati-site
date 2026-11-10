# 第 2 讲：矩阵消元

> 英文标题：Elimination with Matrices  
> 讲师：Gilbert Strang  
> 整理方式：严格按照教授的实际授课顺序，完整展开课堂推导与计算


## 本讲目录

- [一、教授开场：本讲要做什么](#一教授开场本讲要做什么)
- [二、写出要求解的方程组](#二写出要求解的方程组)
- [三、前向消元：先把 A 变成 U](#三前向消元先把-a-变成-u)
- [四、消元可能怎样失败](#四消元可能怎样失败)
- [五、把右侧向量带回来，进行回代](#五把右侧向量带回来进行回代)
- [六、矩阵乘法的列观点与行观点](#六矩阵乘法的列观点与行观点)
- [七、用矩阵完成第一步消元](#七用矩阵完成第一步消元)
- [八、用矩阵完成第二步消元](#八用矩阵完成第二步消元)
- [九、把消元步骤合并，认识结合律](#九把消元步骤合并认识结合律)
- [十、置换矩阵：交换行与交换列](#十置换矩阵交换行与交换列)
- [十一、矩阵乘法通常不能交换顺序](#十一矩阵乘法通常不能交换顺序)
- [十二、反向撤销消元：初等矩阵的逆](#十二反向撤销消元初等矩阵的逆)
- [十三、原课收尾](#十三原课收尾)
- [十四、课后练习](#十四课后练习)
- [十五、视频时间索引](#十五视频时间索引)

## 一、教授开场：本讲要做什么

教授首先给出本讲要处理的方程组，然后说明求解方法：

- 本讲**不使用行列式**求解，行列式留到后面的课程；
- 本讲使用**消元法（elimination）**；
- 消元是各类数学软件求解线性方程组的基本方法；
- 如果矩阵情况良好，消元会顺利得到答案；
- 学习消元时，还要同时观察它可能怎样失败；
- 消元成功后，再通过**回代（back substitution）**完成求解；
- 最后，要把手工消元过程翻译成**矩阵运算**。

因此，本讲不是只学习一种手算技巧，而是按以下顺序逐步深入：

$$
\text{方程组}
\longrightarrow
\text{消元}
\longrightarrow
\text{回代}
\longrightarrow
\text{消元的矩阵表达}.
$$

## 二、写出要求解的方程组

课堂例题包含三个方程、三个未知数：

$$
\begin{cases}
x+2y+z=2,\
3x+8y+z=12,\
4y+z=2.
\end{cases}
$$

把它写成 $A\mathbf{x}=\mathbf{b}$。

系数矩阵为：

$$
A=
\begin{bmatrix}
1&2&1\\
3&8&1\\
0&4&1
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
2\\12\\2
\end{bmatrix}.
$$

第三个方程 $4y+z=2$ 中没有出现 $x$，所以它在矩阵第三行第一列的系数为 $0$：

$$
0x+4y+z=2.
$$

教授接下来先只处理左侧的系数矩阵 $A$，暂时不处理 $\mathbf{b}$。这样做是为了先看清：

$$
A\quad\text{怎样经过消元变成上三角矩阵 }U.
$$

右侧向量之后会接受完全相同的行操作。

## 三、前向消元：先把 A 变成 U

### 3.1 第一个主元

从矩阵左上角开始：

$$
\begin{bmatrix}
\boxed{1}&2&1\\
3&8&1\\
0&4&1
\end{bmatrix}.
$$

这个 $1$ 是第一个**主元（pivot）**。第一行是当前的主元行，本步保持不变。

主元不能取零。主元的作用是作为基准，消去它下方同一列的元素。

### 3.2 消去第二行第一列的 3

当前要清除的位置是第 $2$ 行、第 $1$ 列，记作 $(2,1)$。

该位置的元素是 $3$，主元是 $1$，所以乘数为：

$$
\ell_{21}
=\frac{\text{要消去的元素}}{\text{当前主元}}
=\frac{3}{1}
=3.
$$

把第一行乘以 $3$，再从第二行减去：

$$
R_2\leftarrow R_2-3R_1.
$$

完整计算如下：

$$
\begin{aligned}
R_2-3R_1
&=
\begin{bmatrix}3&8&1\end{bmatrix}
-3\begin{bmatrix}1&2&1\end{bmatrix}\\
&=
\begin{bmatrix}3&8&1\end{bmatrix}
-\begin{bmatrix}3&6&3\end{bmatrix}\\
&=
\begin{bmatrix}
3-3&8-6&1-3
\end{bmatrix}\\
&=
\begin{bmatrix}0&2&-2\end{bmatrix}.
\end{aligned}
$$

因此矩阵变为：

$$
\begin{bmatrix}
1&2&1\\
0&2&-2\\
0&4&1
\end{bmatrix}.
$$

用方程语言检查第二步。第一方程乘以 $3$：

$$
3(x+2y+z)=3(2),
$$

展开得到：

$$
3x+6y+3z=6.
$$

原第二个方程为：

$$
3x+8y+z=12.
$$

用原第二个方程减去上面的方程：

$$
(3x+8y+z)-(3x+6y+3z)=12-6.
$$

逐项合并：

$$
(3x-3x)+(8y-6y)+(z-3z)=6,
$$

所以：

$$
0x+2y-2z=6,
$$

即：

$$
2y-2z=6.
$$

这样，第二个方程中的 $x$ 就被消去了。

### 3.3 处理第三行第一列

下一个位置是 $(3,1)$，即第 $3$ 行、第 $1$ 列。

当前矩阵为：

$$
\begin{bmatrix}
1&2&1\\
0&2&-2\\
0&4&1
\end{bmatrix}.
$$

第三行第一列本来就是 $0$，所以乘数为：

$$
\ell_{31}=\frac{0}{1}=0.
$$

相应的行操作是：

$$
R_3\leftarrow R_3-0R_1.
$$

完整写出来：

$$
\begin{aligned}
R_3-0R_1
&=
\begin{bmatrix}0&4&1\end{bmatrix}
-0\begin{bmatrix}1&2&1\end{bmatrix}\\
&=
\begin{bmatrix}0&4&1\end{bmatrix}
-\begin{bmatrix}0&0&0\end{bmatrix}\\
&=
\begin{bmatrix}0&4&1\end{bmatrix}.
\end{aligned}
$$

所以第三行不变。虽然不需要实际修改矩阵，但从算法步骤上说，$(3,1)$ 位置已经检查并处理完毕。

### 3.4 找出第二个主元

完成第一列后，看第二行、第二列。当前矩阵是：

$$
\begin{bmatrix}
1&2&1\\
0&\boxed{2}&-2\\
0&4&1
\end{bmatrix}.
$$

这里的 $2$ 是第二个主元。

现在第二行只含 $y,z$，第三行也只含 $y,z$。接下来的目标是利用第二行，消去第三行第二列的 $4$，即清除 $(3,2)$ 位置。

乘数为：

$$
\ell_{32}
=\frac{\text{当前 }(3,2)\text{ 元素}}{\text{第二个主元}}
=\frac{4}{2}
=2.
$$

执行：

$$
R_3\leftarrow R_3-2R_2.
$$

注意，这里的 $R_2$ 是已经消元后的第二行 $[0,2,-2]$，不是原始矩阵的第二行。

完整计算为：

$$
\begin{aligned}
R_3-2R_2
&=
\begin{bmatrix}0&4&1\end{bmatrix}
-2\begin{bmatrix}0&2&-2\end{bmatrix}\\
&=
\begin{bmatrix}0&4&1\end{bmatrix}
-\begin{bmatrix}0&4&-4\end{bmatrix}\\
&=
\begin{bmatrix}
0-0&4-4&1-(-4)
\end{bmatrix}\\
&=
\begin{bmatrix}0&0&5\end{bmatrix}.
\end{aligned}
$$

最后一个位置特别容易算错，单独写出：

$$
1-2(-2)=1-(-4)=1+4=5.
$$

### 3.5 得到上三角矩阵 U

消元完成，得到：

$$
U=
\begin{bmatrix}
\boxed{1}&2&1\\
0&\boxed{2}&-2\\
0&0&\boxed{5}
\end{bmatrix}.
$$

$U$ 的主对角线下方全部是零，所以它是**上三角矩阵（upper triangular matrix）**，字母 $U$ 就来自 upper。

三个主元依次为：

$$
\boxed{1,\qquad 2,\qquad 5}.
$$

本例不需要换行就找到了三个非零主元，因此消元顺利成功。

教授还提前指出一个与行列式有关的事实：本例只使用了“某行减去另一行的倍数”，没有交换行，也没有把某行乘以常数，因此行列式等于主元乘积：

$$
\det A
=1\times2\times5
=10.
$$

但再次强调，本讲求解方程用的是消元，不是行列式。

![消元全过程（动态）：两次行变换把 A 化成 U，主元 1、2、5 依次现形](/assets/images/mit1806/mit1806-02-elimination.gif)

## 四、消元可能怎样失败

教授在继续求解之前，先停下来讨论：怎样才会得不到三个非零主元？

### 4.1 第一个主元位置是零

假设原矩阵左上角不是 $1$，而是 $0$。这时第一行没有 $x$，不能直接用这一行消去下面各行中的 $x$。

这不表示方程组无解，也不表示应该停止计算。只要下方某一行第一列有非零元素，就可以交换两行。

例如：

$$
\begin{bmatrix}
0&2&1\\
1&3&0\\
0&1&4
\end{bmatrix}.
$$

交换第一行和第二行：

$$
R_1\leftrightarrow R_2.
$$

得到：

$$
\begin{bmatrix}
1&3&0\\
0&2&1\\
0&1&4
\end{bmatrix}.
$$

现在左上角有了非零主元 $1$，可以继续消元。

因此：

$$
\boxed{\text{主元位置出现零，不等于矩阵一定奇异；先检查能否换行。}}
$$

### 4.2 把原矩阵中的 8 改成 6

教授接着问：第二个主元有没有可能变成零？

把原矩阵第二行第二列的 $8$ 改为 $6$：

$$
A'=
\begin{bmatrix}
1&2&1\\
3&6&1\\
0&4&1
\end{bmatrix}.
$$

仍然先执行：

$$
R_2\leftarrow R_2-3R_1.
$$

完整计算：

$$
\begin{aligned}
R_2-3R_1
&=
\begin{bmatrix}3&6&1\end{bmatrix}
-3\begin{bmatrix}1&2&1\end{bmatrix}\\
&=
\begin{bmatrix}3&6&1\end{bmatrix}
-\begin{bmatrix}3&6&3\end{bmatrix}\\
&=
\begin{bmatrix}0&0&-2\end{bmatrix}.
\end{aligned}
$$

所以矩阵变成：

$$
\begin{bmatrix}
1&2&1\\
0&0&-2\\
0&4&1
\end{bmatrix}.
$$

第二个主元位置 $(2,2)$ 现在是 $0$。但是它的正下方有一个 $4$，所以交换第二、第三行：

$$
R_2\leftrightarrow R_3.
$$

得到：

$$
\begin{bmatrix}
1&2&1\\
0&4&1\\
0&0&-2
\end{bmatrix}.
$$

现在三个主元是：

$$
1,\qquad4,\qquad-2.
$$

它们都非零，所以消元仍然成功。这是一种**可以通过换行解决的临时问题**。

### 4.3 把第三行最后的 1 改成 -4

再看一种无法通过换行挽救的情况。把原矩阵第三行第三列的 $1$ 改为 $-4$：

$$
A''=
\begin{bmatrix}
1&2&1\\
3&8&1\\
0&4&-4
\end{bmatrix}.
$$

第一步仍然是：

$$
R_2\leftarrow R_2-3R_1,
$$

得到：

$$
\begin{bmatrix}
1&2&1\\
0&2&-2\\
0&4&-4
\end{bmatrix}.
$$

第二步仍然是：

$$
R_3\leftarrow R_3-2R_2.
$$

完整计算：

$$
\begin{aligned}
R_3-2R_2
&=
\begin{bmatrix}0&4&-4\end{bmatrix}
-2\begin{bmatrix}0&2&-2\end{bmatrix}\\
&=
\begin{bmatrix}0&4&-4\end{bmatrix}
-\begin{bmatrix}0&4&-4\end{bmatrix}\\
&=
\begin{bmatrix}0&0&0\end{bmatrix}.
\end{aligned}
$$

最终得到：

$$
\begin{bmatrix}
1&2&1\\
0&2&-2\\
0&0&0
\end{bmatrix}.
$$

第三个主元位置为零，下面已经没有其他行可以交换，因此无法得到三个非零主元。

这种情况说明原方阵是**奇异的、不可逆的**。

但“矩阵奇异”不能直接翻译成“当前这个方程组一定无解”。对具体的 $A\mathbf{x}=\mathbf{b}$，还可能无解，也可能有无穷多解，需要结合右侧向量继续判断。这里能够确定的是：

$$
\boxed{\text{不能保证对每一个右侧向量都有唯一解。}}
$$

讨论完失败情形后，教授回到原来能够成功消元的矩阵，继续求解。

## 五、把右侧向量带回来，进行回代

### 5.1 写出增广矩阵

原方程组的右侧向量是：

$$
\mathbf{b}=
\begin{bmatrix}
2\\12\\2
\end{bmatrix}.
$$

把它附加到 $A$ 的右边，形成**增广矩阵（augmented matrix）**：

$$
\left[
\begin{array}{ccc|c}
1&2&1&2\\
3&8&1&12\\
0&4&1&2
\end{array}
\right].
$$

“增广”就是附加了一列。竖线左侧是系数，竖线右侧是方程右边的常数。

对左侧系数做行操作时，右侧必须做同样的操作，因为对方程的一边做某种运算时，另一边也必须保持同步。

### 5.2 第一步行操作怎样改变 b

第一步是：

$$
R_2\leftarrow R_2-3R_1.
$$

对竖线右侧分别计算：

$$
b_1'=2,
$$

因为第一行不变；

$$
\begin{aligned}
b_2'
&=b_2-3b_1\\
&=12-3\times2\\
&=12-6\\
&=6;
\end{aligned}
$$

$$
b_3'=2,
$$

因为第三步中 $R_3\leftarrow R_3-0R_1$，所以第三行不变。

因此，第一步之后的增广矩阵是：

$$
\left[
\begin{array}{ccc|c}
1&2&1&2\\
0&2&-2&6\\
0&4&1&2
\end{array}
\right].
$$

### 5.3 第二步行操作怎样改变 b

第二步是：

$$
R_3\leftarrow R_3-2R_2.
$$

第一行和第二行不变，所以右侧前两个数仍是 $2,6$。第三个数变为：

$$
\begin{aligned}
b_3''
&=b_3'-2b_2'\\
&=2-2\times6\\
&=2-12\\
&=-10.
\end{aligned}
$$

最终增广矩阵为：

$$
\left[
\begin{array}{ccc|c}
1&2&1&2\\
0&2&-2&6\\
0&0&5&-10
\end{array}
\right].
$$

也就是说：

$$
U=
\begin{bmatrix}
1&2&1\\
0&2&-2\\
0&0&5
\end{bmatrix},
\qquad
\mathbf{c}=
\begin{bmatrix}
2\\6\\-10
\end{bmatrix}.
$$

消元后的方程组是：

$$
U\mathbf{x}=\mathbf{c}.
$$

$U$ 是 $A$ 经过行操作后的结果，$\mathbf{c}$ 是 $\mathbf{b}$ 经过相同行操作后的结果。

### 5.4 把矩阵恢复成三个方程

逐行读取最终增广矩阵。

第一行：

$$
x+2y+z=2.
$$

第二行：

$$
2y-2z=6.
$$

第三行：

$$
5z=-10.
$$

所以完整方程组为：

$$
\begin{cases}
x+2y+z=2,\
2y-2z=6,\
5z=-10.
\end{cases}
$$

### 5.5 第一步回代：完整求出 z

从最后一个方程开始：

$$
5z=-10.
$$

两边同时除以 $5$：

$$
\frac{5z}{5}=\frac{-10}{5}.
$$

化简两边：

$$
z=-2.
$$

因此：

$$
\boxed{z=-2}.
$$

### 5.6 第二步回代：完整求出 y

第二个方程是：

$$
2y-2z=6.
$$

把刚刚求出的 $z=-2$ 代入：

$$
2y-2(-2)=6.
$$

先计算乘法：

$$
-2(-2)=4.
$$

所以方程变为：

$$
2y+4=6.
$$

两边同时减去 $4$：

$$
2y+4-4=6-4.
$$

化简：

$$
2y=2.
$$

两边同时除以 $2$：

$$
\frac{2y}{2}=\frac{2}{2}.
$$

得到：

$$
\boxed{y=1}.
$$

### 5.7 第三步回代：完整求出 x

第一个方程是：

$$
x+2y+z=2.
$$

把 $y=1$ 和 $z=-2$ 同时代入：

$$
x+2(1)+(-2)=2.
$$

计算 $2(1)$：

$$
x+2-2=2.
$$

合并常数：

$$
x+0=2.
$$

所以：

$$
\boxed{x=2}.
$$

### 5.8 写出并检验最终答案

最终解为：

$$
\boxed{
\mathbf{x}=
\begin{bmatrix}
2\\1\\-2
\end{bmatrix}}
$$

或者写成：

$$
\boxed{(x,y,z)=(2,1,-2)}.
$$

代回原方程组逐题检查。

第一个方程：

$$
\begin{aligned}
x+2y+z
&=2+2(1)+(-2)\\
&=2+2-2\\
&=2.
\end{aligned}
$$

第二个方程：

$$
\begin{aligned}
3x+8y+z
&=3(2)+8(1)+(-2)\\
&=6+8-2\\
&=14-2\\
&=12.
\end{aligned}
$$

第三个方程：

$$
\begin{aligned}
4y+z
&=4(1)+(-2)\\
&=4-2\\
&=2.
\end{aligned}
$$

三个结果都与原来的右侧一致，因此答案正确。

这种先求 $z$，再求 $y$，最后求 $x$ 的过程就叫**回代**：因为消元后的最后一个方程最容易求解，所以按照与消元相反的方向逐行向上代入。

![回代（动态）：从最后一行向上逐行求出 z=−2、y=1、x=2](/assets/images/mit1806/mit1806-02-back-substitution.gif)

## 六、矩阵乘法的列观点与行观点

到这里，教授完成了“消元与回代”的第一部分。接下来进入第二部分：把消元步骤本身写成矩阵。

在构造消元矩阵之前，他先强调矩阵乘法的两种整体理解。

### 6.1 矩阵乘列向量：组合矩阵的列

设矩阵 $A$ 有三个列向量 $\mathbf{a}_1,\mathbf{a}_2,\mathbf{a}_3$，则：

$$
A=
\begin{bmatrix}
|&|&|\\
\mathbf{a}_1&\mathbf{a}_2&\mathbf{a}_3\\
|&|&|
\end{bmatrix}.
$$

用 $A$ 乘列向量：

$$
A
\begin{bmatrix}
3\\4\\5
\end{bmatrix}
=3\mathbf{a}_1+4\mathbf{a}_2+5\mathbf{a}_3.
$$

也就是：

$$
A
\begin{bmatrix}
3\\4\\5
\end{bmatrix}
=3\,(\text{第 1 列})+4\,(\text{第 2 列})+5\,(\text{第 3 列}).
$$

结果仍是一个列向量。

这就是第 1 讲强调的列观点：

$$
\boxed{\text{矩阵乘列向量，是矩阵各列的线性组合。}}
$$

### 6.2 行向量乘矩阵：组合矩阵的行

现在把一个行向量放在矩阵左边：

$$
\begin{bmatrix}1&2&7\end{bmatrix}A.
$$

它表示：

$$
1\,(\text{第 1 行})+2\,(\text{第 2 行})+7\,(\text{第 3 行}).
$$

结果是一个行向量。

因此：

$$
\boxed{\text{行向量乘矩阵，是矩阵各行的线性组合。}}
$$

消元要组合矩阵的行，所以接下来构造的消元矩阵必须放在 $A$ 的**左边**。

## 七、用矩阵完成第一步消元

### 7.1 要实现的行操作

第一步消元要做的是：

$$
R_2\leftarrow R_2-3R_1,
$$

同时：

$$
R_1\leftarrow R_1,
\qquad
R_3\leftarrow R_3.
$$

我们需要找一个矩阵 $E_{21}$，使得它左乘 $A$ 后正好完成这些操作：

$$
E_{21}A
=
\begin{bmatrix}
1&2&1\\
0&2&-2\\
0&4&1
\end{bmatrix}.
$$

下标 $21$ 表示这个矩阵负责清除第 $2$ 行、第 $1$ 列的元素。

![初等矩阵消元：E₂₁ 的一行 = 「新行2 = 行2 − 3×行1」](/assets/images/mit1806/mit1806-02-elimination-matrix.png)

### 7.2 逐行构造 E21

因为 $E_{21}$ 左乘 $A$，所以 $E_{21}$ 的每一行都会说明怎样组合 $A$ 的三行。

第一行不能改变，所以取：

$$
1R_1+0R_2+0R_3.
$$

因此 $E_{21}$ 的第一行为：

$$
\begin{bmatrix}1&0&0\end{bmatrix}.
$$

第二行需要变成：

$$
-3R_1+1R_2+0R_3.
$$

因此 $E_{21}$ 的第二行为：

$$
\begin{bmatrix}-3&1&0\end{bmatrix}.
$$

第三行不能改变，所以取：

$$
0R_1+0R_2+1R_3.
$$

因此 $E_{21}$ 的第三行为：

$$
\begin{bmatrix}0&0&1\end{bmatrix}.
$$

组合起来：

$$
\boxed{
E_{21}=
\begin{bmatrix}
1&0&0\\
-3&1&0\\
0&0&1
\end{bmatrix}}.
$$

### 7.3 完整检查 E21A

计算：

$$
E_{21}A
=
\begin{bmatrix}
1&0&0\\
-3&1&0\\
0&0&1
\end{bmatrix}
\begin{bmatrix}
1&2&1\\
3&8&1\\
0&4&1
\end{bmatrix}.
$$

结果的第一行：

$$
1\begin{bmatrix}1&2&1\end{bmatrix}
+0\begin{bmatrix}3&8&1\end{bmatrix}
+0\begin{bmatrix}0&4&1\end{bmatrix}
=
\begin{bmatrix}1&2&1\end{bmatrix}.
$$

结果的第二行：

$$
\begin{aligned}
&-3\begin{bmatrix}1&2&1\end{bmatrix}
+1\begin{bmatrix}3&8&1\end{bmatrix}
+0\begin{bmatrix}0&4&1\end{bmatrix}\\
&=\begin{bmatrix}-3&-6&-3\end{bmatrix}
+\begin{bmatrix}3&8&1\end{bmatrix}
+\begin{bmatrix}0&0&0\end{bmatrix}\\
&=\begin{bmatrix}0&2&-2\end{bmatrix}.
\end{aligned}
$$

结果的第三行：

$$
0\begin{bmatrix}1&2&1\end{bmatrix}
+0\begin{bmatrix}3&8&1\end{bmatrix}
+1\begin{bmatrix}0&4&1\end{bmatrix}
=
\begin{bmatrix}0&4&1\end{bmatrix}.
$$

所以：

$$
E_{21}A
=
\begin{bmatrix}
1&2&1\\
0&2&-2\\
0&4&1
\end{bmatrix}.
$$

与手工消元完全一致。

### 7.4 用点积检查其中一个元素

教授还单独检查了结果矩阵第 $(2,3)$ 个元素。

矩阵乘法中，结果的第 $(2,3)$ 个元素由：

- 左矩阵的第 $2$ 行；
- 右矩阵的第 $3$ 列；

做点积得到。

左矩阵第 $2$ 行：

$$
\begin{bmatrix}-3&1&0\end{bmatrix}.
$$

右矩阵第 $3$ 列：

$$
\begin{bmatrix}1\\1\\1\end{bmatrix}.
$$

点积为：

$$
\begin{aligned}
(-3)\times1+1\times1+0\times1
&=-3+1+0\\
&=-2.
\end{aligned}
$$

这正是 $E_{21}A$ 第二行第三列的元素。

### 7.5 单位矩阵与初等矩阵

如果第二行也不希望改变，那么第二行系数应写成：

$$
\begin{bmatrix}0&1&0\end{bmatrix}.
$$

此时整个矩阵为：

$$
I=
\begin{bmatrix}
1&0&0\\
0&1&0\\
0&0&1
\end{bmatrix}.
$$

它满足：

$$
IA=A.
$$

所以 $I$ 称为**单位矩阵（identity matrix）**，作用类似普通数字中的 $1$。

而 $E_{21}$ 是在单位矩阵基础上加入一次行操作得到的，称为**初等矩阵（elementary matrix）**或消元矩阵。

## 八、用矩阵完成第二步消元

第二步要执行：

$$
R_3\leftarrow R_3-2R_2.
$$

第一行、第二行不变，第三行改为“原第三行减去两倍第二行”。

因此构造：

$$
\boxed{
E_{32}=
\begin{bmatrix}
1&0&0\\
0&1&0\\
0&-2&1
\end{bmatrix}}.
$$

逐行理解：

- 第一行 $[1,0,0]$：保留原第一行；
- 第二行 $[0,1,0]$：保留原第二行；
- 第三行 $[0,-2,1]$：取 $-2$ 倍原第二行，再加 $1$ 倍原第三行。

下标 $32$ 表示它负责清除第 $3$ 行、第 $2$ 列的元素。

计算：

$$
E_{32}(E_{21}A).
$$

先代入已经算出的 $E_{21}A$：

$$
E_{32}(E_{21}A)
=
\begin{bmatrix}
1&0&0\\
0&1&0\\
0&-2&1
\end{bmatrix}
\begin{bmatrix}
1&2&1\\
0&2&-2\\
0&4&1
\end{bmatrix}.
$$

结果第一行保持为：

$$
\begin{bmatrix}1&2&1\end{bmatrix}.
$$

结果第二行保持为：

$$
\begin{bmatrix}0&2&-2\end{bmatrix}.
$$

结果第三行为：

$$
\begin{aligned}
&0\begin{bmatrix}1&2&1\end{bmatrix}
-2\begin{bmatrix}0&2&-2\end{bmatrix}
+1\begin{bmatrix}0&4&1\end{bmatrix}\\
&=\begin{bmatrix}0&0&0\end{bmatrix}
-\begin{bmatrix}0&4&-4\end{bmatrix}
+\begin{bmatrix}0&4&1\end{bmatrix}\\
&=\begin{bmatrix}0&0&5\end{bmatrix}.
\end{aligned}
$$

所以：

$$
E_{32}(E_{21}A)
=
\begin{bmatrix}
1&2&1\\
0&2&-2\\
0&0&5
\end{bmatrix}
=U.
$$

## 九、把消元步骤合并，认识结合律

目前得到：

$$
E_{32}(E_{21}A)=U.
$$

这里先做 $E_{21}A$，完成第一步消元；再左乘 $E_{32}$，完成第二步消元。

教授接下来问：能不能先构造一个矩阵，让它一次完成全部消元？

答案是先计算：

$$
E_{32}E_{21}.
$$

矩阵乘法满足**结合律（associative law）**：

$$
\boxed{
E_{32}(E_{21}A)=(E_{32}E_{21})A
}.
$$

结合律的意思是：可以改变括号的位置，也就是改变先计算哪一对乘积，但矩阵的书写顺序没有改变。

结合律在后面很多矩阵推导中都会使用。教授特别区分了两件事：

- 可以移动括号；
- 不可以随意交换矩阵顺序。

## 十、置换矩阵：交换行与交换列

前面讨论失败情形时用过行交换。行交换同样可以写成矩阵乘法，相应矩阵称为**置换矩阵（permutation matrix）**，记作 $P$。

### 10.1 左乘 P：交换两行

考虑：

$$
A=
\begin{bmatrix}
a&b\\
c&d
\end{bmatrix}.
$$

希望交换两行，得到：

$$
\begin{bmatrix}
c&d\\
a&b
\end{bmatrix}.
$$

交换单位矩阵的两行，得到：

$$
P=
\begin{bmatrix}
0&1\\
1&0
\end{bmatrix}.
$$

计算 $PA$：

$$
PA
=
\begin{bmatrix}
0&1\\
1&0
\end{bmatrix}
\begin{bmatrix}
a&b\\
c&d
\end{bmatrix}.
$$

结果第一行取原矩阵第二行：

$$
0\begin{bmatrix}a&b\end{bmatrix}
+1\begin{bmatrix}c&d\end{bmatrix}
=
\begin{bmatrix}c&d\end{bmatrix}.
$$

结果第二行取原矩阵第一行：

$$
1\begin{bmatrix}a&b\end{bmatrix}
+0\begin{bmatrix}c&d\end{bmatrix}
=
\begin{bmatrix}a&b\end{bmatrix}.
$$

所以：

$$
\boxed{
PA=
\begin{bmatrix}
c&d\\
a&b
\end{bmatrix}}.
$$

左乘 $P$ 完成了行交换。

### 10.2 右乘 P：交换两列

如果希望交换两列，得到：

$$
\begin{bmatrix}
b&a\\
d&c
\end{bmatrix},
$$

就不能使用 $PA$，而要计算 $AP$：

$$
AP
=
\begin{bmatrix}
a&b\\
c&d
\end{bmatrix}
\begin{bmatrix}
0&1\\
1&0
\end{bmatrix}.
$$

逐项计算四个元素。

第一行第一列：

$$
a\times0+b\times1=b.
$$

第一行第二列：

$$
a\times1+b\times0=a.
$$

第二行第一列：

$$
c\times0+d\times1=d.
$$

第二行第二列：

$$
c\times1+d\times0=c.
$$

因此：

$$
\boxed{
AP=
\begin{bmatrix}
b&a\\
d&c
\end{bmatrix}}.
$$

右乘 $P$ 完成了列交换。

由此得到本讲非常重要的规律：

$$
\boxed{\text{左乘对应行操作，右乘对应列操作。}}
$$

## 十一、矩阵乘法通常不能交换顺序

刚才同一个矩阵 $A$ 和同一个置换矩阵 $P$，给出了：

$$
PA=
\begin{bmatrix}
c&d\\
a&b
\end{bmatrix},
\qquad
AP=
\begin{bmatrix}
b&a\\
d&c
\end{bmatrix}.
$$

一个交换行，一个交换列，通常并不相等。因此：

$$
PA\neq AP.
$$

一般地：

$$
\boxed{AB\neq BA}.
$$

这就是矩阵乘法通常**不满足交换律**的含义。

所以必须分清：

$$
\boxed{(AB)C=A(BC)\quad\text{结合律，成立}}
$$

与：

$$
\boxed{AB=BA\quad\text{交换律，通常不成立}}.
$$

移动括号是允许的；交换矩阵的左右位置是不允许的。

### 11.1 回到两个消元矩阵，把它们实际乘出来

讨论完矩阵顺序后，教授回到 $E_{32}$ 与 $E_{21}$。现在把“先乘两个消元矩阵”具体计算出来：

$$
E_{32}E_{21}
=
\begin{bmatrix}
1&0&0\\
0&1&0\\
0&-2&1
\end{bmatrix}
\begin{bmatrix}
1&0&0\\
-3&1&0\\
0&0&1
\end{bmatrix}.
$$

结果第一行：

$$
1\begin{bmatrix}1&0&0\end{bmatrix}
+0\begin{bmatrix}-3&1&0\end{bmatrix}
+0\begin{bmatrix}0&0&1\end{bmatrix}
=
\begin{bmatrix}1&0&0\end{bmatrix}.
$$

结果第二行：

$$
0\begin{bmatrix}1&0&0\end{bmatrix}
+1\begin{bmatrix}-3&1&0\end{bmatrix}
+0\begin{bmatrix}0&0&1\end{bmatrix}
=
\begin{bmatrix}-3&1&0\end{bmatrix}.
$$

结果第三行：

$$
\begin{aligned}
&0\begin{bmatrix}1&0&0\end{bmatrix}
-2\begin{bmatrix}-3&1&0\end{bmatrix}
+1\begin{bmatrix}0&0&1\end{bmatrix}\\
&=\begin{bmatrix}0&0&0\end{bmatrix}
+\begin{bmatrix}6&-2&0\end{bmatrix}
+\begin{bmatrix}0&0&1\end{bmatrix}\\
&=\begin{bmatrix}6&-2&1\end{bmatrix}.
\end{aligned}
$$

因此：

$$
E=E_{32}E_{21}
=
\begin{bmatrix}
1&0&0\\
-3&1&0\\
6&-2&1
\end{bmatrix}.
$$

整个消元过程可以写成一个式子：

$$
\boxed{EA=U}.
$$

## 十二、反向撤销消元：初等矩阵的逆

教授最后换一个方向思考：

- 刚才研究的是怎样从 $A$ 到 $U$；
- 现在考虑怎样从 $U$ 返回 $A$；
- 这就需要撤销消元步骤，也就是寻找逆矩阵。

### 12.1 第一步消元做了什么

第一步矩阵是：

$$
E_{21}=
\begin{bmatrix}
1&0&0\\
-3&1&0\\
0&0&1
\end{bmatrix}.
$$

它执行：

$$
R_2\leftarrow R_2-3R_1.
$$

例如，它把右侧向量：

$$
\begin{bmatrix}
2\\12\\2
\end{bmatrix}
$$

变成：

$$
\begin{bmatrix}
2\\6\\2
\end{bmatrix},
$$

因为：

$$
12-3\times2=12-6=6.
$$

### 12.2 怎样撤销这一步

要把第二行减去的内容加回来：

$$
R_2\leftarrow R_2+3R_1.
$$

检查右侧向量：

$$
6+3\times2=6+6=12.
$$

于是：

$$
\begin{bmatrix}
2\\6\\2
\end{bmatrix}
\longrightarrow
\begin{bmatrix}
2\\12\\2
\end{bmatrix}.
$$

原来的右侧向量被恢复了。

### 12.3 写出逆矩阵

执行“第二行加三倍第一行”的矩阵是：

$$
\boxed{
E_{21}^{-1}=
\begin{bmatrix}
1&0&0\\
3&1&0\\
0&0&1
\end{bmatrix}}.
$$

验证：

$$
E_{21}^{-1}E_{21}
=
\begin{bmatrix}
1&0&0\\
3&1&0\\
0&0&1
\end{bmatrix}
\begin{bmatrix}
1&0&0\\
-3&1&0\\
0&0&1
\end{bmatrix}.
$$

结果第一行为：

$$
\begin{bmatrix}1&0&0\end{bmatrix}.
$$

结果第二行为：

$$
\begin{aligned}
&3\begin{bmatrix}1&0&0\end{bmatrix}
+1\begin{bmatrix}-3&1&0\end{bmatrix}
+0\begin{bmatrix}0&0&1\end{bmatrix}\\
&=\begin{bmatrix}3&0&0\end{bmatrix}
+\begin{bmatrix}-3&1&0\end{bmatrix}\\
&=\begin{bmatrix}0&1&0\end{bmatrix}.
\end{aligned}
$$

结果第三行为：

$$
\begin{bmatrix}0&0&1\end{bmatrix}.
$$

所以：

$$
E_{21}^{-1}E_{21}
=
\begin{bmatrix}
1&0&0\\
0&1&0\\
0&0&1
\end{bmatrix}
=I.
$$

这说明 $E_{21}^{-1}$ 确实撤销了 $E_{21}$ 的作用。

之所以这里只需把 $-3$ 改成 $3$，是因为这个初等矩阵只执行了一次非常简单的行加法。不能把这个方法直接套到任意矩阵上。

## 十三、原课收尾

本讲按照教授的授课过程完成了两件事。

第一，使用消元与回代求解方程组：

$$
A\mathbf{x}=\mathbf{b}
\longrightarrow
U\mathbf{x}=\mathbf{c}
\longrightarrow
\mathbf{x}=
\begin{bmatrix}
2\\1\\-2
\end{bmatrix}.
$$

其中：

$$
A=
\begin{bmatrix}
1&2&1\\
3&8&1\\
0&4&1
\end{bmatrix},
\qquad
U=
\begin{bmatrix}
1&2&1\\
0&2&-2\\
0&0&5
\end{bmatrix},
\qquad
\mathbf{c}=
\begin{bmatrix}
2\\6\\-10
\end{bmatrix}.
$$

第二，把消元翻译成矩阵乘法：

$$
E_{21}A
\longrightarrow
E_{32}(E_{21}A)=U
\longrightarrow
(E_{32}E_{21})A=U.
$$

同时认识了：

- 主元与乘数；
- 行交换与消元失败；
- 上三角矩阵；
- 初等矩阵；
- 单位矩阵；
- 置换矩阵；
- 矩阵乘法结合律；
- 矩阵乘法通常不满足交换律；
- 初等消元矩阵的逆。

教授最后以“逆矩阵”结束本讲，为下一讲的矩阵乘法与逆矩阵做准备。

## 十四、课后练习

### 练习 1：完整进行消元和回代

求解：

$$
\begin{cases}
2x+4y-2z=2,\\
4x+9y-3z=8,\\
-2x-3y+7z=10.
\end{cases}
$$

#### 第一步：写出增广矩阵

$$
\left[
\begin{array}{ccc|c}
2&4&-2&2\\
4&9&-3&8\\
-2&-3&7&10
\end{array}
\right].
$$

第一个主元是 $2$。

第二行第一列的乘数为：

$$
\ell_{21}=\frac{4}{2}=2.
$$

第三行第一列的乘数为：

$$
\ell_{31}=\frac{-2}{2}=-1.
$$

因此要执行：

$$
R_2\leftarrow R_2-2R_1,
\qquad
R_3\leftarrow R_3-(-1)R_1=R_3+R_1.
$$

#### 第二步：消去第一列下方元素

计算第二行：

$$
\begin{aligned}
R_2-2R_1
&=
\begin{bmatrix}4&9&-3&8\end{bmatrix}
-2\begin{bmatrix}2&4&-2&2\end{bmatrix}\\
&=
\begin{bmatrix}4&9&-3&8\end{bmatrix}
-\begin{bmatrix}4&8&-4&4\end{bmatrix}\\
&=
\begin{bmatrix}0&1&1&4\end{bmatrix}.
\end{aligned}
$$

计算第三行：

$$
\begin{aligned}
R_3+R_1
&=
\begin{bmatrix}-2&-3&7&10\end{bmatrix}
+\begin{bmatrix}2&4&-2&2\end{bmatrix}\\
&=
\begin{bmatrix}0&1&5&12\end{bmatrix}.
\end{aligned}
$$

得到：

$$
\left[
\begin{array}{ccc|c}
2&4&-2&2\\
0&1&1&4\\
0&1&5&12
\end{array}
\right].
$$

#### 第三步：消去第二列下方元素

第二个主元是 $1$，乘数为：

$$
\ell_{32}=\frac{1}{1}=1.
$$

执行：

$$
R_3\leftarrow R_3-R_2.
$$

完整计算：

$$
\begin{aligned}
R_3-R_2
&=
\begin{bmatrix}0&1&5&12\end{bmatrix}
-\begin{bmatrix}0&1&1&4\end{bmatrix}\\
&=
\begin{bmatrix}0&0&4&8\end{bmatrix}.
\end{aligned}
$$

所以：

$$
\left[
\begin{array}{ccc|c}
2&4&-2&2\\
0&1&1&4\\
0&0&4&8
\end{array}
\right].
$$

三个主元为：

$$
\boxed{2,\qquad1,\qquad4}.
$$

#### 第四步：求 z

最后一个方程是：

$$
4z=8.
$$

两边同时除以 $4$：

$$
\frac{4z}{4}=\frac{8}{4}.
$$

得到：

$$
\boxed{z=2}.
$$

#### 第五步：求 y

第二个方程是：

$$
y+z=4.
$$

代入 $z=2$：

$$
y+2=4.
$$

两边同时减去 $2$：

$$
y+2-2=4-2.
$$

得到：

$$
\boxed{y=2}.
$$

#### 第六步：求 x

第一个方程是：

$$
2x+4y-2z=2.
$$

代入 $y=2,z=2$：

$$
2x+4(2)-2(2)=2.
$$

计算乘法：

$$
2x+8-4=2.
$$

合并常数：

$$
2x+4=2.
$$

两边同时减去 $4$：

$$
2x+4-4=2-4.
$$

得到：

$$
2x=-2.
$$

两边同时除以 $2$：

$$
\frac{2x}{2}=\frac{-2}{2}.
$$

所以：

$$
\boxed{x=-1}.
$$

#### 第七步：检验

$$
2(-1)+4(2)-2(2)=-2+8-4=2,
$$

$$
4(-1)+9(2)-3(2)=-4+18-6=8,
$$

$$
-2(-1)-3(2)+7(2)=2-6+14=10.
$$

所以最终答案为：

$$
\boxed{(x,y,z)=(-1,2,2)}.
$$

### 练习 2：处理零主元位置

矩阵：

$$
\begin{bmatrix}
0&2&1\\
1&3&0\\
0&1&4
\end{bmatrix}
$$

的第一个主元位置为零，但第二行第一列为 $1$。交换第一、第二行：

$$
R_1\leftrightarrow R_2.
$$

得到：

$$
\begin{bmatrix}
1&3&0\\
0&2&1\\
0&1&4
\end{bmatrix}.
$$

此时第一个主元为 $1$，第二个主元为 $2$，可以继续消元。

下一步乘数为：

$$
\ell_{32}=\frac{1}{2}.
$$

执行：

$$
R_3\leftarrow R_3-\frac12R_2.
$$

完整计算：

$$
\begin{aligned}
R_3-\frac12R_2
&=
\begin{bmatrix}0&1&4\end{bmatrix}
-\frac12\begin{bmatrix}0&2&1\end{bmatrix}\\
&=
\begin{bmatrix}0&1&4\end{bmatrix}
-\begin{bmatrix}0&1&\frac12\end{bmatrix}\\
&=
\begin{bmatrix}0&0&\frac72\end{bmatrix}.
\end{aligned}
$$

所以三个主元最终为：

$$
\boxed{1,\qquad2,\qquad\frac72}.
$$

### 练习 3：构造消元矩阵及其逆

要求左乘矩阵 $E$ 后执行：

$$
R_3\leftarrow R_3+4R_1.
$$

从单位矩阵出发：

$$
I=
\begin{bmatrix}
1&0&0\\
0&1&0\\
0&0&1
\end{bmatrix}.
$$

对单位矩阵执行同样的行操作：

$$
\begin{bmatrix}0&0&1\end{bmatrix}
+4\begin{bmatrix}1&0&0\end{bmatrix}
=
\begin{bmatrix}4&0&1\end{bmatrix}.
$$

所以：

$$
\boxed{
E=
\begin{bmatrix}
1&0&0\\
0&1&0\\
4&0&1
\end{bmatrix}}.
$$

逆操作是：

$$
R_3\leftarrow R_3-4R_1.
$$

因此：

$$
\boxed{
E^{-1}=
\begin{bmatrix}
1&0&0\\
0&1&0\\
-4&0&1
\end{bmatrix}}.
$$

检查第二、第三行组合中的关键元素：

$$
-4(1)+1(4)=0,
$$

而其他行保持不变，所以：

$$
E^{-1}E=I.
$$

### 练习 4：区分左乘与右乘

设：

$$
P=
\begin{bmatrix}
0&1\\
1&0
\end{bmatrix},
\qquad
A=
\begin{bmatrix}
1&2\\
3&4
\end{bmatrix}.
$$

计算左乘：

$$
PA
=
\begin{bmatrix}
0&1\\
1&0
\end{bmatrix}
\begin{bmatrix}
1&2\\
3&4
\end{bmatrix}
=
\begin{bmatrix}
3&4\\
1&2
\end{bmatrix}.
$$

这交换了两行。

计算右乘：

$$
AP
=
\begin{bmatrix}
1&2\\
3&4
\end{bmatrix}
\begin{bmatrix}
0&1\\
1&0
\end{bmatrix}
=
\begin{bmatrix}
2&1\\
4&3
\end{bmatrix}.
$$

这交换了两列。

并且：

$$
PA=
\begin{bmatrix}
3&4\\
1&2
\end{bmatrix}
\neq
\begin{bmatrix}
2&1\\
4&3
\end{bmatrix}
=AP.
$$

## 十五、视频时间索引

以下时间点依据本地下载版本的字幕整理，顺序与正文一致：

| 时间 | 教授的授课内容 |
|---|---|
| 00:00:25 | 介绍消元、回代、成功与失败 |
| 00:02:34 | 写出课堂方程组与矩阵 |
| 00:03:18 | 第一个主元与第一步消元 |
| 00:05:54 | 处理 $(3,1)$ 位置，乘数为零 |
| 00:06:56 | 第二个主元 |
| 00:07:28 | 第二步消元，得到主元 $5$ |
| 00:09:15 | 得到 $U$，主元为 $1,2,5$，行列式为 $10$ |
| 00:10:34 | 讨论消元失败 |
| 00:11:02 | 第一主元位置为零时交换行 |
| 00:11:51 | 把 $8$ 改为 $6$，通过换行解决 |
| 00:12:55 | 把 $1$ 改为 $-4$，消元彻底失败 |
| 00:14:34 | 回到成功情形，引入右侧向量 |
| 00:15:05 | 增广矩阵 |
| 00:15:46 | 右侧向量的第一步变化 |
| 00:16:09 | 右侧向量的第二步变化 |
| 00:17:14 | 写出 $U\mathbf{x}=\mathbf{c}$ 并回代 |
| 00:19:05 | 开始把消元翻译成矩阵 |
| 00:20:46 | 矩阵乘列向量：组合列 |
| 00:21:51 | 行向量乘矩阵：组合行 |
| 00:24:33 | 构造 $E_{21}$ |
| 00:27:50 | 用点积检查矩阵乘法中的一个元素 |
| 00:29:32 | 构造 $E_{32}$ |
| 00:32:21 | 合并消元步骤 |
| 00:33:33 | 结合律 |
| 00:36:34 | 置换矩阵与交换行 |
| 00:38:43 | 右乘置换矩阵以交换列 |
| 00:41:18 | 矩阵乘法通常不满足交换律 |
| 00:42:13 | 合并消元矩阵，反向思考 |
| 00:44:01 | 引入逆矩阵 |
| 00:44:57 | 撤销“第二行减三倍第一行” |
| 00:46:08 | 写出 $E_{21}^{-1}$ 并验证 |
| 00:47:13 | 原课结束，预告下一讲 |
