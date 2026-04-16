import zhAmap from './src/zh-amap.vue'
import zhBmap from './src/zh-bmap.vue'
import zhTmap from './src/zh-tmap.vue'
import zhSmap from './src/zh-smap.vue'
import zhOmap from './src/zh-omap.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('zh-amap', zhAmap)
    app.component('zh-bmap', zhBmap)
    app.component('zh-tmap', zhTmap)
    app.component('zh-smap', zhSmap)
    app.component('zh-omap', zhOmap)
  }
}

export { zhAmap,zhBmap,zhTmap,zhSmap,zhOmap }
