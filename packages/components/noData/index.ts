import ZhNoData from './src/zh-nodata.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhNoData', ZhNoData)
  }
}
export { ZhNoData }
