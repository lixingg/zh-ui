import ZhRadio from './src/zh-radio.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhRadio', ZhRadio)
  }
}

export { ZhRadio }
