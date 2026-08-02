import { defineConfig } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3'

export default defineConfig({
  // 已绑定自定义域名 www.duoshuati.com，使用根路径
  base: '/',
  title: '多刷题',
  description: '小书装口袋，越刷越明白',
  markdown: {
    config: (md) => {
      md.use(mathjax3)
    }
  },
  themeConfig: {
    // 顶部导航等按需补充
  }
})
