import ZhOperationColumn from './src/zh-operationColumn.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhOperationColumn', ZhOperationColumn)
  }
}
export { ZhOperationColumn }
