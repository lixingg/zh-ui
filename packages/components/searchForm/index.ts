import ZhSearchForm from './src/zh-search-form.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhSearchForm', ZhSearchForm)
  }
}
export { ZhSearchForm }
