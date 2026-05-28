import ZhFileViewer from './src/zh-fileviewer.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhFileViewer', ZhFileViewer)
  }
}
export { ZhFileViewer }
