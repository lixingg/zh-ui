import ZhContainer from './src/zh-container.vue'
import ZhHeader from './src/zh-header.vue'
import ZhMain from './src/zh-main.vue'
import ZhFooter from './src/zh-footer.vue'
import ZhAside from './src/zh-aside.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhContainer', ZhContainer)
    app.component('ZhHeader', ZhHeader)
    app.component('ZhMain', ZhMain)
    app.component('ZhFooter', ZhFooter)
    app.component('ZhAside', ZhAside)
  }
}
export { ZhContainer, ZhHeader, ZhMain, ZhFooter, ZhAside }
