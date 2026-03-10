import BlButton from './src/bl-button.vue'
import BlButtonGroup from './src/bl-button-group.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('BlButton', BlButton)
    app.component('BlButtonGroup', BlButtonGroup)
  }
}
export { BlButtonGroup, BlButton }
