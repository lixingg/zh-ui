import ZhFileviewer from './src/zh-fileviewer.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhFileviewer', ZhFileviewer)
  }
}
export { ZhFileviewer }
