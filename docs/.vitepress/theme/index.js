import DefaultTheme from 'vitepress/theme'
import QuizBlock from './QuizBlock.vue'
import CopyArticle from './CopyArticle.vue'
import NcePair from './NcePair.vue'
import NceTranslateBar from './NceTranslateBar.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('QuizBlock', QuizBlock)
    app.component('CopyArticle', CopyArticle)
    app.component('NcePair', NcePair)
    app.component('NceTranslateBar', NceTranslateBar)
  }
}
