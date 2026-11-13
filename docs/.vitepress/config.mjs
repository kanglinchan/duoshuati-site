import { defineConfig } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3'
import nceSidebar from './nce-sidebar.json'
import wpmeSidebar from './wpme-sidebar.json'

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
      // mermaid 代码块 → <Mermaid> 组件（theme/Mermaid.vue 客户端渲染 UML）
      const defaultFence = md.renderer.rules.fence
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        if (token.info.trim().split(/\s+/)[0] === 'mermaid') {
          const code = encodeURIComponent(token.content)
          return `<Mermaid diagram="${code}" />`
        }
        return defaultFence(tokens, idx, options, env, self)
      }
      // 章节插图多为大体积 GIF：正文先渲染，图片滚动到视口再下载
      const defaultImage = md.renderer.rules.image
      md.renderer.rules.image = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        if (token.attrIndex('loading') < 0) {
          token.attrSet('loading', 'lazy')
          token.attrSet('decoding', 'async')
        }
        return defaultImage(tokens, idx, options, env, self)
      }
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
        // 《C++ 新经典：设计模式》OCR 整理，共 24 章 + 总目录
        text: 'C++ 设计模式',
        collapsed: false,
        items: [
          { text: '00. 总目录与学习指引', link: '/chapters/2026-11-cpp-design-patterns-00-overview' },
          { text: '01. 设计模式与软件开发思想', link: '/chapters/2026-11-cpp-design-patterns-01-design-patterns-overview' },
          { text: '02. 模板方法模式', link: '/chapters/2026-11-cpp-design-patterns-02-template-method' },
          { text: '03. 工厂、原型、建造者模式', link: '/chapters/2026-11-cpp-design-patterns-03-factory-prototype-builder' },
          { text: '04. 策略模式', link: '/chapters/2026-11-cpp-design-patterns-04-strategy' },
          { text: '05. 观察者模式', link: '/chapters/2026-11-cpp-design-patterns-05-observer' },
          { text: '06. 装饰模式', link: '/chapters/2026-11-cpp-design-patterns-06-decorator' },
          { text: '07. 单件模式', link: '/chapters/2026-11-cpp-design-patterns-07-singleton' },
          { text: '08. 外观模式', link: '/chapters/2026-11-cpp-design-patterns-08-facade' },
          { text: '09. 命令模式', link: '/chapters/2026-11-cpp-design-patterns-09-command' },
          { text: '10. 迭代器模式', link: '/chapters/2026-11-cpp-design-patterns-10-iterator' },
          { text: '11. 组合模式', link: '/chapters/2026-11-cpp-design-patterns-11-composite' },
          { text: '12. 状态模式', link: '/chapters/2026-11-cpp-design-patterns-12-state' },
          { text: '13. 享元模式', link: '/chapters/2026-11-cpp-design-patterns-13-flyweight' },
          { text: '14. 代理模式', link: '/chapters/2026-11-cpp-design-patterns-14-proxy' },
          { text: '15. 适配器模式', link: '/chapters/2026-11-cpp-design-patterns-15-adapter' },
          { text: '16. 桥接模式', link: '/chapters/2026-11-cpp-design-patterns-16-bridge' },
          { text: '17. 中介者模式', link: '/chapters/2026-11-cpp-design-patterns-17-mediator' },
          { text: '18. 备忘录模式', link: '/chapters/2026-11-cpp-design-patterns-18-memento' },
          { text: '19. 职责链模式', link: '/chapters/2026-11-cpp-design-patterns-19-chain-of-responsibility' },
          { text: '20. 访问者模式', link: '/chapters/2026-11-cpp-design-patterns-20-visitor' },
          { text: '21. 解释器模式', link: '/chapters/2026-11-cpp-design-patterns-21-interpreter' },
          { text: '22. 设计模式总结', link: '/chapters/2026-11-cpp-design-patterns-22-design-patterns-summary' },
          { text: '23. 附录 A · 类和对象', link: '/chapters/2026-11-cpp-design-patterns-23-appendix-a-classes-and-objects' },
          { text: '24. 附录 B · 引用计数', link: '/chapters/2026-11-cpp-design-patterns-24-appendix-b-reference-counting' }
        ]
      },
      {
        // 《征服C指针（第2版）》重点提炼，配图由 scripts/gen-c-pointers-figs.js 生成
        text: '征服 C 指针',
        collapsed: false,
        items: [
          { text: '00. 导读：为什么前端要懂 C 指针', link: '/chapters/2026-11-c-pointers-00-overview' },
          { text: '01. 指针是什么：内存与地址', link: '/chapters/2026-11-c-pointers-01-memory-and-address' },
          { text: '02. 指针运算与数组：a[i] 底层就是指针', link: '/chapters/2026-11-c-pointers-02-pointer-arith-and-array' },
          { text: '03. C 的内存布局：变量到底住在哪里', link: '/chapters/2026-11-c-pointers-03-memory-layout' },
          { text: '04. 堆与动态内存：malloc / free', link: '/chapters/2026-11-c-pointers-04-heap-malloc' },
          { text: '05. 读懂 C 声明：类型派生与阅读法', link: '/chapters/2026-11-c-pointers-05-declarations' },
          { text: '06. 数组与指针的本质区别', link: '/chapters/2026-11-c-pointers-06-array-vs-pointer' },
          { text: '07. 实战：数组、指针与函数参数', link: '/chapters/2026-11-c-pointers-07-practice' },
          { text: '08. 指针的真正用法：链表与函数指针', link: '/chapters/2026-11-c-pointers-08-data-structures' },
          { text: '09. 陷阱与惯用写法速查', link: '/chapters/2026-11-c-pointers-09-pitfalls' }
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
      },
      {
        // Word Power Made Easy：OCR 整理，共 19 章 47 节
        text: 'Word Power Made Easy',
        collapsed: false,
        items: [
          { text: '总目录', link: '/wpme/' },
          ...wpmeSidebar
        ]
      }
    ],
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一章', next: '下一章' },
    search: { provider: 'local' }
  }
})
