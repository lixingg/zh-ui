import ZhBadge from './src/zh-badge.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhBadge', ZhBadge)
  }
}

export { ZhBadge }
