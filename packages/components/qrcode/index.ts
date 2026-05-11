import ZhQrcode from './src/zh-qrcode.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhQrcode', ZhQrcode)
  }
}
export { ZhQrcode }
