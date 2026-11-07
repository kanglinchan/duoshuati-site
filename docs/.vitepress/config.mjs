import { defineConfig } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3'
import nceSidebar from './nce-sidebar.json'

export default defineConfig({
  // IDE 环境的 safe-delete shim 会拦截 vite 清空 dist 导致 build 失败，关闭 emptyOutDir 绕过（见 quizCraft SKILL.md 踩坑实录）
  vite: { build: { emptyOutDir: false } },
  // 已绑定自定义域名 www.duoshuati.com，使用根路径
  base: '/',
  title: '多刷题',
  description: '小书装口袋，越刷越明白',
  vue: {
    template: {
      compilerOptions: {
        // MathJax 输出的自定义标签，Vue 不认识会清空，需要声明为自定义元素
        isCustomElement: (tag) => tag.startsWith('mjx-')
      }
    }
  },
  markdown: {
    config: (md) => {
      md.use(mathjax3)
    }
  },
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '课程', link: '/courses' },
      { text: '专栏问答', link: '/answers' },
      { text: '专栏', link: '/columns' }
    ],
    sidebar: [
      {
        text: '硬件电路基础',
        collapsed: false,
        items: [
          { text: '01. 电学基础：电流、电压与基本定律', link: '/chapters/2026-08-embedded-circuit-01-electricity-basics' },
          { text: '02. 三大被动元器件：电阻、电容、电感', link: '/chapters/2026-08-embedded-circuit-02-passive-components' },
          { text: '03. 其他常用元器件与测量工具', link: '/chapters/2026-08-embedded-circuit-03-other-components-tools' },
          { text: '04. 模拟电路基础：半导体器件入门', link: '/chapters/2026-08-embedded-circuit-04-analog-circuit-basics' },
          { text: '05. 典型电路实践：电阻电容的实战用法', link: '/chapters/2026-08-embedded-circuit-05-circuit-practice' },
          { text: '06. 工具实操：符号、稳压电源与示波器', link: '/chapters/2026-08-embedded-circuit-06-instruments-appendix' }
        ]
      },
      {
        text: '英语语法精要',
        collapsed: false,
        items: [
          { text: '01. 五种基本句型', link: '/chapters/2026-08-english-grammar-01-five-basic-sentence-patterns' }
        ]
      },
      {
        text: '图解 ARM 汇编',
        collapsed: false,
        items: [
          { text: '01. MOV 指令与 exit 系统调用', link: '/chapters/2026-08-arm-assembly-01-mov-exit-syscall' },
          { text: '02. ADD、SUB、MUL 与 CPSR 状态标志', link: '/chapters/2026-08-arm-assembly-02-add-sub-mul-cpsr' },
          { text: '03. LDR、STR 与内存访问', link: '/chapters/2026-08-arm-assembly-03-ldr-str-memory' },
          { text: '04. 逻辑运算：AND、ORR、EOR 与 MVN', link: '/chapters/2026-08-arm-assembly-04-logical-operators' },
          { text: '05. 有符号数与补码转换', link: '/chapters/2026-08-arm-assembly-05-signed-numbers' },
          { text: '06. LSL、LSR、ASR 与 ROR：移位与旋转', link: '/chapters/2026-08-arm-assembly-06-shift-rotate' },
          { text: '07. CMP 比较指令与 CPSR 标志', link: '/chapters/2026-08-arm-assembly-07-cmp-compare' },
          { text: '08. B 指令与条件后缀：分支跳转', link: '/chapters/2026-08-arm-assembly-08-branch-conditions' },
          { text: '09. 循环：让代码重复执行', link: '/chapters/2026-08-arm-assembly-09-while-loops' },
          { text: '10. 函数调用：让代码学会复用', link: '/chapters/2026-08-arm-assembly-10-function-calls' },
          { text: '11. 栈上传参：寄存器不够用怎么办', link: '/chapters/2026-08-arm-assembly-11-stack-args' }
        ]
      },
      {
        text: 'MIT 18.06 线性代数',
        collapsed: false,
        items: [
          {
            text: '第一部分 · 线性方程组与矩阵消元',
            collapsed: false,
            items: [
              { text: '01. 线性方程的几何意义', link: '/chapters/2026-11-mit-linear-algebra-01-geometry-of-linear-equations' },
              { text: '02. 矩阵消元', link: '/chapters/2026-11-mit-linear-algebra-02-elimination-with-matrices' },
              { text: '03. 矩阵乘法和逆矩阵', link: '/chapters/2026-11-mit-linear-algebra-03-multiplication-and-inverse-matrices' },
              { text: '04. 矩阵的 LU 分解', link: '/chapters/2026-11-mit-linear-algebra-04-factorization-into-lu' }
            ]
          },
          {
            text: '第二部分 · 向量空间与四个基本子空间',
            collapsed: false,
            items: [
              { text: '05. 转置、置换和向量空间', link: '/chapters/2026-11-mit-linear-algebra-05-transposes-permutations-spaces-rn' },
              { text: '06. 列空间和零空间', link: '/chapters/2026-11-mit-linear-algebra-06-column-space-and-nullspace' },
              { text: '07. 解 Ax=0：主元和特解', link: '/chapters/2026-11-mit-linear-algebra-07-solving-ax0-pivots-and-special-solutions' },
              { text: '08. 解 Ax=b：行最简形 R', link: '/chapters/2026-11-mit-linear-algebra-08-solving-axb-row-reduced-form' },
              { text: '09. 线性相关性、基和维数', link: '/chapters/2026-11-mit-linear-algebra-09-independence-basis-and-dimension' },
              { text: '10. 四个基本子空间', link: '/chapters/2026-11-mit-linear-algebra-10-four-fundamental-subspaces' },
              { text: '11. 矩阵空间、秩 1 矩阵和小世界图', link: '/chapters/2026-11-mit-linear-algebra-11-matrix-spaces-rank1-small-world-graphs' },
              { text: '12. 图、网络和关联矩阵', link: '/chapters/2026-11-mit-linear-algebra-12-graphs-networks-incidence-matrices' },
              { text: '13. 小测 1 评讲', link: '/chapters/2026-11-mit-linear-algebra-13-quiz-1-review' }
            ]
          },
          {
            text: '第三部分 · 正交、投影与最小二乘',
            collapsed: false,
            items: [
              { text: '14. 正交向量和正交子空间', link: '/chapters/2026-11-mit-linear-algebra-14-orthogonal-vectors-and-subspaces' },
              { text: '15. 子空间投影', link: '/chapters/2026-11-mit-linear-algebra-15-projections-onto-subspaces' },
              { text: '16. 投影矩阵和最小二乘法', link: '/chapters/2026-11-mit-linear-algebra-16-projection-matrices-and-least-squares' },
              { text: '17. 正交矩阵和施密特正交化', link: '/chapters/2026-11-mit-linear-algebra-17-orthogonal-matrices-and-gram-schmidt' }
            ]
          },
          {
            text: '第四部分 · 行列式',
            collapsed: false,
            items: [
              { text: '18. 行列式及其性质', link: '/chapters/2026-11-mit-linear-algebra-18-properties-of-determinants' },
              { text: '19. 行列式公式和代数余子式', link: '/chapters/2026-11-mit-linear-algebra-19-determinant-formulas-and-cofactors' },
              { text: '20. 克莱默法则、逆矩阵和体积', link: '/chapters/2026-11-mit-linear-algebra-20-cramers-rule-inverse-and-volume' }
            ]
          },
          {
            text: '第五部分 · 特征值与矩阵分解',
            collapsed: false,
            items: [
              { text: '21. 特征值和特征向量', link: '/chapters/2026-11-mit-linear-algebra-21-eigenvalues-and-eigenvectors' },
              { text: '22. 对角化和矩阵的幂', link: '/chapters/2026-11-mit-linear-algebra-22-diagonalization-and-powers-of-a' },
              { text: '23. 微分方程和矩阵指数 exp(At)', link: '/chapters/2026-11-mit-linear-algebra-23-differential-equations-and-exp-at' },
              { text: '24. 马尔可夫矩阵和傅里叶级数', link: '/chapters/2026-11-mit-linear-algebra-24-markov-matrices-and-fourier-series' },
              { text: '24b. 小测 2 评讲', link: '/chapters/2026-11-mit-linear-algebra-24b-quiz-2-review' },
              { text: '25. 对称矩阵和正定性', link: '/chapters/2026-11-mit-linear-algebra-25-symmetric-matrices-and-positive-definiteness' },
              { text: '26. 复矩阵和快速傅里叶变换', link: '/chapters/2026-11-mit-linear-algebra-26-complex-matrices-and-fast-fourier-transform' },
              { text: '27. 正定矩阵和最小值', link: '/chapters/2026-11-mit-linear-algebra-27-positive-definite-matrices-and-minima' },
              { text: '28. 相似矩阵和若尔当标准型', link: '/chapters/2026-11-mit-linear-algebra-28-similar-matrices-and-jordan-form' }
            ]
          },
          {
            text: '第六部分 · 奇异值分解与线性变换',
            collapsed: false,
            items: [
              { text: '29. 奇异值分解', link: '/chapters/2026-11-mit-linear-algebra-29-singular-value-decomposition' },
              { text: '30. 线性变换及其矩阵', link: '/chapters/2026-11-mit-linear-algebra-30-linear-transformations-and-their-matrices' },
              { text: '31. 基变换和图像压缩', link: '/chapters/2026-11-mit-linear-algebra-31-change-of-basis-image-compression' },
              { text: '32. 小测 3 评讲', link: '/chapters/2026-11-mit-linear-algebra-32-quiz-3-review' },
              { text: '33. 左右逆和伪逆', link: '/chapters/2026-11-mit-linear-algebra-33-left-and-right-inverses-pseudoinverse' },
              { text: '34. 总复习', link: '/chapters/2026-11-mit-linear-algebra-34-final-course-review' }
            ]
          },
          {
            text: '附录',
            collapsed: false,
            items: [
              { text: '斯特朗教授谈线性代数教学（访谈）', link: '/chapters/2026-11-mit-linear-algebra-36-appendix-strang-interview' }
            ]
          }
        ]
      },
      {
        // 由 scripts/gen-nce-pages.js 生成，共 276 课
        text: '新概念英语',
        collapsed: false,
        items: [
          { text: '四册总目录', link: '/nce/' },
          ...nceSidebar
        ]
      }
    ],
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一章', next: '下一章' },
    search: { provider: 'local' }
  }
})
