import ZhDrawer from './src/zh-drawer.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhDrawer', ZhDrawer)
  }
}

export { ZhDrawer }
