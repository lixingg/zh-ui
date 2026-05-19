import ZhHlsPlayer from './src/zh-hlsPlayer.vue'
import ZhDhPlayer from './src/zh-dhPlayer.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhHlsPlayer', ZhHlsPlayer)
    app.component('ZhDhPlayer', ZhDhPlayer)
  }
}

export { ZhHlsPlayer,ZhDhPlayer }
