import ZhEditor from './src/zh-editor.vue'
import ZhCEditor from "./src/zh-cEditor.vue";
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhEditor', ZhEditor)
    app.component('ZhCEditor', ZhCEditor)
  }
}

export { ZhEditor,ZhCEditor }
