import ZhAiChat from './src/zh-aichat.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhAiChat', ZhAiChat)
  }
}

export { ZhAiChat }
