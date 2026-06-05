import ZhEditor from './src/zh-editor.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhEditor', ZhEditor)
  }
}

export { ZhEditor }
