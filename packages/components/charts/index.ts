import ZhLinechart from './src/zh-linechart.vue'

import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhLinechart', ZhLinechart)
  }
}
export { ZhLinechart,  }
