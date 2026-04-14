import zhAmap from './src/zh-amap.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('zh-amap', zhAmap)
  }
}

export { zhAmap }
