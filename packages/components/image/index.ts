import ZhButton from './src/zh-button.vue'
import ZhButtonGroup from './src/zh-button-group.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhButton', ZhButton)
    app.component('ZhButtonGroup', ZhButtonGroup)
  }
}
export { ZhButtonGroup, ZhButton }
