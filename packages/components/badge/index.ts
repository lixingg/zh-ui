import BlBadge from './src/bl-badge.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('BlBadge', BlBadge)
  }
}

export { BlBadge }
