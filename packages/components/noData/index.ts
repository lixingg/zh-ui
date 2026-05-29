import ZhNoData from './src/zh-no-data.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhNoData', ZhNoData)
  }
}
export { ZhNoData }
