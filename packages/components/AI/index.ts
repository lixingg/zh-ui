import ZhAiChat from './src/zh-aiChat.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhAiChat', ZhAiChat)
  }
}

export { ZhAiChat }
