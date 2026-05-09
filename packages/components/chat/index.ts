import ZhChat from './src/zh-chat.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhChat', ZhChat)
  }
}

export { ZhChat }
