import BlIcon from './src/bl-icon.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('BlIcon', BlIcon)
  }
}

export { BlIcon }
