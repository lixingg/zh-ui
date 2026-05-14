import ZhForm from './src/zh-form.vue'
import ZhFormItem from './src/zh-form-item.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhForm', ZhForm)
    app.component('ZhFormItem', ZhFormItem)
  }
}
export { ZhForm,ZhFormItem }
