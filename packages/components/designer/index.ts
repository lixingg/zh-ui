import ZhBigScreenDesigner from './src/zh-bigScreenDesigner.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhBigScreenDesigner', ZhBigScreenDesigner)
  }
}
export { ZhBigScreenDesigner }
