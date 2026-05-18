import ZhAuthControl from './src/zh-authControl.vue'
import ZhAuthProvider from './src/zh-authProvider.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhAuthControl', ZhAuthControl)
    app.component('ZhAuthProvider', ZhAuthProvider)
  }
}
export { ZhAuthControl,ZhAuthProvider }
