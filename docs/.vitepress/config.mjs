import { defineConfig } from 'vitepress'

export default defineConfig({
  // GitHub Pages 部署在子路径下；若日后绑定自定义域名 www.duoshuati.com，改回 '/' 并添加 CNAME 文件
  base: '/duoshuati-site/',
  title: '多刷题',
  description: '小书装口袋，越刷越明白',
  themeConfig: {
    // 顶部导航等按需补充
  }
})
