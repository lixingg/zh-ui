import ZhHideNumber from './src/zh-hide-number.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhHideNumber', ZhHideNumber)
  }
}
export { ZhHideNumber }
