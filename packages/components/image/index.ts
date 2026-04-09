import ZhImage from './src/zh-image.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhImage', ZhImage)
  }
}
export { ZhImage }
