import BlRadio from './src/bl-radio.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('BlRadio', BlRadio)
  }
}

export { BlRadio }
