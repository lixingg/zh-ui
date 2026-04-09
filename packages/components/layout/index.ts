import ZhRow from './src/zh-row'
import ZhCol from './src/zh-col'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component(ZhRow.name, ZhRow)
    app.component(ZhCol.name, ZhCol)
  }
}

export { ZhRow, ZhCol }
