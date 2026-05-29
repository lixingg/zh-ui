import ZhFileViewer from './src/zh-fileViewer.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhFileViewer', ZhFileViewer)
  }
}
export { ZhFileViewer }
