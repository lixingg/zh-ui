import BlInput from './src/bl-input.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('BlInput', BlInput)
  }
}

export { BlInput }
