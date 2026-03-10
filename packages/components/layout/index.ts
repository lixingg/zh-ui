import BlRow from './src/bl-row'
import BlCol from './src/bl-col'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component(BlRow.name, BlRow)
    app.component(BlCol.name, BlCol)
  }
}

export { BlRow, BlCol }
