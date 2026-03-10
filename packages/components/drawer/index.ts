import BlDrawer from './src/bl-drawer.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('BlDrawer', BlDrawer)
  }
}

export { BlDrawer }
