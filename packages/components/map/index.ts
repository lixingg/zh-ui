import ZhAmap from './src/zh-amap.vue'
import ZhBmap from './src/zh-bmap.vue'
import ZhTmap from './src/zh-tmap.vue'
import ZhSmap from './src/zh-smap.vue'
import ZhOmap from './src/zh-omap.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhAmap', ZhAmap)
    app.component('ZhBmap', ZhBmap)
    app.component('ZhTmap', ZhTmap)
    app.component('ZhSmap', ZhSmap)
    app.component('ZhOmap', ZhOmap)
  }
}

export { ZhAmap,ZhBmap,ZhTmap,ZhSmap,ZhOmap }
