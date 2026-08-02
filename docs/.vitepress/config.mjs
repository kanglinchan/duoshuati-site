import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "多刷题",
  description: "多刷题",
  markdown: { math: true },
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '专栏', link: '/columns' },
      { text: '课程', link: '/courses' },
      { text: '解答', link: '/answers' }
    ],
    sidebar: [{"text": "硬件电路基础", "collapsed": false, "items": [{"text": "01. 电学基础：电流、电压与基本定律", "link": "/chapters/2026-08-embedded-circuit-01-electricity-basics"}, {"text": "02. 三大被动元器件：电阻、电容、电感", "link": "/chapters/2026-08-embedded-circuit-02-passive-components"}]}, {"text": "英语语法精要", "collapsed": false, "items": [{"text": "01. 五种基本句型", "link": "/chapters/2026-08-english-grammar-01-five-basic-sentence-patterns"}]}],
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一章', next: '下一章' },
    search: { provider: 'local' },
    footer: { message: 'Powered by QuizCraft' }
  }
})
