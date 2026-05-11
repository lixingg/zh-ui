import ZhSignature from './src/zh- signature.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhSignature', ZhSignature)
  }
}

export { ZhSignature }
