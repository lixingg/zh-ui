import ZhMediaSwiper from './src/zh-mediaSwiper.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhMediaSwiper', ZhMediaSwiper)
  }
}
export { ZhMediaSwiper }
