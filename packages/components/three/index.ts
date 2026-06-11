import ZhTorusKnot from './src/zh-torusKnot.vue'
import ZhPhotoWall from './src/zh-photoWall.vue'
import ZhSign3d from './src/zh-sign3d.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhTorusKnot', ZhTorusKnot)
    app.component('ZhPhotoWall', ZhPhotoWall)
    app.component('ZhSign3d', ZhSign3d)
  }
}

export { ZhTorusKnot,ZhPhotoWall,ZhSign3d }
