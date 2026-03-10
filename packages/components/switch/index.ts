import ZhSwitch from './src/zh-switch.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhSwitch', ZhSwitch)
  }
}

export { ZhSwitch }
