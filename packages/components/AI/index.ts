import ZhAichat from './src/zh-aichat.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhAichat', ZhAichat)
  }
}

export { ZhAichat }
