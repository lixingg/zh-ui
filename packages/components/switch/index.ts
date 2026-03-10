import BlSwitch from './src/bl-switch.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('BlSwitch', BlSwitch)
  }
}

export { BlSwitch }
