import ZhTorusKnot from './src/zh-torusKnot.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhTorusKnot', ZhTorusKnot)
  }
}

export { ZhTorusKnot }
