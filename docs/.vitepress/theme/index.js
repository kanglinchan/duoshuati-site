import DefaultTheme from 'vitepress/theme'
import QuizBlock from './QuizBlock.vue'
import CopyArticle from './CopyArticle.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('QuizBlock', QuizBlock)
    app.component('CopyArticle', CopyArticle)
  }
}
