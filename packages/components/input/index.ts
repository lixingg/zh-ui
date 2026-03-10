import ZhInput from './src/zh-input.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhInput', ZhInput)
  }
}

export { ZhInput }
