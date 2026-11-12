import DefaultTheme from 'vitepress/theme'
import QuizBlock from './QuizBlock.vue'
import CopyArticle from './CopyArticle.vue'
import NcePair from './NcePair.vue'
import NceTranslateBar from './NceTranslateBar.vue'
import WpmeText from './WpmeText.vue'
import WpmeBar from './WpmeBar.vue'
import Mermaid from './Mermaid.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('QuizBlock', QuizBlock)
    app.component('CopyArticle', CopyArticle)
    app.component('NcePair', NcePair)
    app.component('NceTranslateBar', NceTranslateBar)
    app.component('WpmeText', WpmeText)
    app.component('WpmeBar', WpmeBar)
    app.component('Mermaid', Mermaid)
  }
}
