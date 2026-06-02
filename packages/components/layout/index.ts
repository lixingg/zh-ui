import ZhRow from './src/zh-row'
import ZhCol from './src/zh-col'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component(<string>ZhRow.name, ZhRow)
    app.component(<string>ZhCol.name, ZhCol)
  }
}

export { ZhRow, ZhCol }
