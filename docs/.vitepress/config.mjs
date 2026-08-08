import { defineConfig } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3'

export default defineConfig({
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
          { text: '08. B 指令与条件后缀：分支跳转', link: '/chapters/2026-08-arm-assembly-08-branch-conditions' }
        ]
      }
    ],
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一章', next: '下一章' },
    search: { provider: 'local' }
  }
})
