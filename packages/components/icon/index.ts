import ZhIcon from './src/zh-icon.vue'
import ZhIconBase from './src/zh-iconBase.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhIcon', ZhIcon)
    app.component('ZhIconBase', ZhIconBase)

  }
}

export { ZhIcon,ZhIconBase }
