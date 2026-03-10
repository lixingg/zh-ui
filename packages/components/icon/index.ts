import ZhIcon from './src/zh-icon.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhIcon', ZhIcon)
  }
}

export { ZhIcon }
