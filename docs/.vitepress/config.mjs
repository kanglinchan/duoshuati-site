import { defineConfig } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3'
import nceSidebar from './nce-sidebar.json'
import wpmeSidebar from './wpme-sidebar.json'

export default defineConfig({
  // IDE 环境的 safe-delete shim 会拦截 vite 清空 dist 导致 build 失败，关闭 emptyOutDir 绕过（见 quizCraft SKILL.md 踩坑实录）
  vite: { build: { emptyOutDir: false } },
  // 已绑定自定义域名 www.duoshuati.com，使用根路径
  base: '/',
  // MIT 18.06 线性代数系列：整体隐藏重写中（tech-tutorial-writing 新文风）。
  // 入口已从 courses / index / columns / 侧边栏移除；未重写的 34 讲不参与构建，
  // 仅保留已重写的第 1、2 讲（URL 不变）。重写一篇，从这里恢复一篇。
  srcExclude: [
    'chapters/2026-11-mit-linear-algebra-06-*.md',
    'chapters/2026-11-mit-linear-algebra-07-*.md',
    'chapters/2026-11-mit-linear-algebra-08-*.md',
    'chapters/2026-11-mit-linear-algebra-09-*.md',
    'chapters/2026-11-mit-linear-algebra-10-*.md',
    'chapters/2026-11-mit-linear-algebra-11-*.md',
    'chapters/2026-11-mit-linear-algebra-12-*.md',
    'chapters/2026-11-mit-linear-algebra-13-*.md',
    'chapters/2026-11-mit-linear-algebra-14-*.md',
    'chapters/2026-11-mit-linear-algebra-15-*.md',
    'chapters/2026-11-mit-linear-algebra-16-*.md',
    'chapters/2026-11-mit-linear-algebra-17-*.md',
    'chapters/2026-11-mit-linear-algebra-18-*.md',
    'chapters/2026-11-mit-linear-algebra-19-*.md',
    'chapters/2026-11-mit-linear-algebra-20-*.md',
    'chapters/2026-11-mit-linear-algebra-21-*.md',
    'chapters/2026-11-mit-linear-algebra-22-*.md',
    'chapters/2026-11-mit-linear-algebra-23-*.md',
    'chapters/2026-11-mit-linear-algebra-24-*.md',
    'chapters/2026-11-mit-linear-algebra-24b-*.md',
    'chapters/2026-11-mit-linear-algebra-25-*.md',
    'chapters/2026-11-mit-linear-algebra-26-*.md',
    'chapters/2026-11-mit-linear-algebra-27-*.md',
    'chapters/2026-11-mit-linear-algebra-28-*.md',
    'chapters/2026-11-mit-linear-algebra-29-*.md',
    'chapters/2026-11-mit-linear-algebra-30-*.md',
    'chapters/2026-11-mit-linear-algebra-31-*.md',
    'chapters/2026-11-mit-linear-algebra-32-*.md',
    'chapters/2026-11-mit-linear-algebra-33-*.md',
    'chapters/2026-11-mit-linear-algebra-34-*.md',
    'chapters/2026-11-mit-linear-algebra-36-*.md'
  ],
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
              { text: '05. 转置、置换和向量空间', link: '/chapters/2026-11-mit-linear-algebra-05-transposes-permutations-spaces-rn' }
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
        // 视频课《夯实 C++ 基础核心内容》字幕整理，先上线第一大章（4 讲）
        text: 'C++ 基础进阶',
        collapsed: false,
        items: [
          { text: '01. 函数调用堆栈', link: '/chapters/2026-11-cpp-core-01-stack-frame' },
          { text: '02. 编译与链接（上）：从 .cpp 到 .o', link: '/chapters/2026-11-cpp-core-02-compile-stages' },
          { text: '03. 编译与链接（下）：链接器在做什么', link: '/chapters/2026-11-cpp-core-03-linker' },
          { text: '04. 进程虚拟地址空间', link: '/chapters/2026-11-cpp-core-04-virtual-address-space' },
          { text: '05. const 修饰谁', link: '/chapters/2026-11-cpp-core-05-const-modifies' },
          { text: '06. const 与一、二级指针', link: '/chapters/2026-11-cpp-core-06-const-pointers' },
          { text: '07. 引用', link: '/chapters/2026-11-cpp-core-07-references' },
          { text: '08. inline 与形参默认值', link: '/chapters/2026-11-cpp-core-08-inline-default-args' },
          { text: '09. 函数重载与名字改编', link: '/chapters/2026-11-cpp-core-09-overloading' },
          { text: '10. 类和对象、this 指针', link: '/chapters/2026-11-cpp-core-10-class-object-this' },
          { text: '11. 构造函数与析构函数', link: '/chapters/2026-11-cpp-core-11-ctor-dtor' },
          { text: '12. 构造函数的初始化列表', link: '/chapters/2026-11-cpp-core-12-init-list' },
          { text: '13. 三种成员方法', link: '/chapters/2026-11-cpp-core-13-member-methods' },
          { text: '14. 深拷贝与浅拷贝', link: '/chapters/2026-11-cpp-core-14-deep-copy' },
          { text: '15. 指向类成员的指针', link: '/chapters/2026-11-cpp-core-15-member-pointers' },
          { text: '16. 类与对象综合实践', link: '/chapters/2026-11-cpp-core-16-class-practice' },
          { text: '17. 函数模板', link: '/chapters/2026-11-cpp-core-17-function-template' },
          { text: '18. 类模板', link: '/chapters/2026-11-cpp-core-18-class-template' },
          { text: '19. 空间配置器 allocator', link: '/chapters/2026-11-cpp-core-19-allocator' },
          { text: '20. 手写 vector', link: '/chapters/2026-11-cpp-core-20-handmade-vector' },
          { text: '21. new 与 delete 的一生', link: '/chapters/2026-11-cpp-core-21-new-delete-lifetime' },
          { text: '22. 对象池', link: '/chapters/2026-11-cpp-core-22-object-pool' },
          { text: '23. 迭代器', link: '/chapters/2026-11-cpp-core-23-iterators' },
          { text: '24. 迭代器失效', link: '/chapters/2026-11-cpp-core-24-iterator-invalidation' },
          { text: '25. 运算符重载', link: '/chapters/2026-11-cpp-core-25-complex-operator-overloading' },
          { text: '26. 继承的基本意义', link: '/chapters/2026-11-cpp-core-26-inheritance-basics' },
          { text: '27. 派生类的构造过程', link: '/chapters/2026-11-cpp-core-27-derived-ctor' },
          { text: '28. 重载、隐藏、覆盖', link: '/chapters/2026-11-cpp-core-28-overload-hide-override' },
          { text: '29. 虚函数与动态绑定', link: '/chapters/2026-11-cpp-core-29-virtual-dynamic-binding' },
          { text: '30. 多态的本质', link: '/chapters/2026-11-cpp-core-30-polymorphism' },
          { text: '31. 抽象类', link: '/chapters/2026-11-cpp-core-31-abstract-class' },
          { text: '32. 菱形继承与虚基类', link: '/chapters/2026-11-cpp-core-32-diamond-virtual-base' },
          { text: '33. 四种类型转换', link: '/chapters/2026-11-cpp-core-33-four-casts' },
          { text: '34. STL 六大组件', link: '/chapters/2026-11-cpp-core-34-stl-overview' },
          { text: '35. 顺序容器三兄弟', link: '/chapters/2026-11-cpp-core-35-sequence-containers' },
          { text: '36. 容器适配器', link: '/chapters/2026-11-cpp-core-36-container-adapters' },
          { text: '37. 有序关联容器', link: '/chapters/2026-11-cpp-core-37-ordered-containers' },
          { text: '38. 无序关联容器', link: '/chapters/2026-11-cpp-core-38-unordered-containers' },
          { text: '39. 函数对象', link: '/chapters/2026-11-cpp-core-39-function-objects' },
          { text: '40. 泛型算法与绑定器', link: '/chapters/2026-11-cpp-core-40-algorithms-binders' },
          { text: '41. 继承多态笔试题实战', link: '/chapters/2026-11-cpp-core-41-polymorphism-quiz' },
          { text: '42. 对象内存布局与对齐', link: '/chapters/2026-11-cpp-core-42-memory-layout' },
          { text: '43. 类大小与虚表大小', link: '/chapters/2026-11-cpp-core-43-class-size-vtable' },
        ]
      },
      {
        text: 'C++ 进阶与面试',
        items: [
          { text: '01. 对象背后调用了哪些函数', link: '/chapters/2026-12-cpp-advanced-01-object-lifecycle' },
          { text: '02. 移动构造与移动赋值', link: '/chapters/2026-12-cpp-advanced-02-move-ctor-assign' },
          { text: '03. move 与 forward', link: '/chapters/2026-12-cpp-advanced-03-move-forward' },
          { text: '04. 三条对象优化规则', link: '/chapters/2026-12-cpp-advanced-04-three-rules' },
          { text: '05. 智能指针基础', link: '/chapters/2026-12-cpp-advanced-05-smart-pointer-raii' },
          { text: '06. 不带引用计数的智能指针', link: '/chapters/2026-12-cpp-advanced-06-unique-ptr' },
          { text: '07. shared_ptr 与引用计数', link: '/chapters/2026-12-cpp-advanced-07-shared-ptr-refcount' },
          { text: '08. weak_ptr 与自定义删除器', link: '/chapters/2026-12-cpp-advanced-08-weak-ptr-deleter' },
          { text: '09. 绑定器底层原理', link: '/chapters/2026-12-cpp-advanced-09-binder-internals' },
          { text: '10. function 的实现原理', link: '/chapters/2026-12-cpp-advanced-10-function-internals' },
          { text: '11. lambda 的实现原理', link: '/chapters/2026-12-cpp-advanced-11-lambda-internals' },
          { text: '12. bind + function 实战', link: '/chapters/2026-12-cpp-advanced-12-thread-pool' },
          { text: '13. C++11 新特性全景', link: '/chapters/2026-12-cpp-advanced-13-cpp11-overview' },
          { text: '14. thread 与 mutex', link: '/chapters/2026-12-cpp-advanced-14-thread-mutex' },
          { text: '15. 条件变量与 atomic', link: '/chapters/2026-12-cpp-advanced-15-condition-atomic' },
          { text: '16. 单例模式', link: '/chapters/2026-12-cpp-advanced-16-singleton' },
          { text: '17. 工厂三兄弟', link: '/chapters/2026-12-cpp-advanced-17-factory-patterns' },
          { text: '18. 代理、装饰器、适配器与观察者', link: '/chapters/2026-12-cpp-advanced-18-structural-behavioral' },
          { text: '19. emplace 的原理剖析', link: '/chapters/2026-12-cpp-advanced-19-emplace-internals' },
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
      },
      {
        // 数学笔记：按「先定顺序，再选方法」组织的中学数学专题
        text: '数学笔记',
        collapsed: false,
        items: [
          { text: '00. 导读：这门笔记怎么写', link: '/chapters/2026-11-math-notes-00-overview' },
          { text: '01. 因式分解：先定顺序，再选方法', link: '/chapters/2026-11-math-notes-01-factorization' }
        ]
      }
    ],
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一章', next: '下一章' },
    search: { provider: 'local' }
  }
})
