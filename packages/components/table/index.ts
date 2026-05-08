import ZhTable from './src/zh-table.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhTable', ZhTable)
  }
}

export { ZhTable }
