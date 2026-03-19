import ZhUpload from './src/zh-upload.vue'
import ZhUploadCard from "./src/zh-uploadCard.vue";
import zhUploadDialog from './src/zh-uploadFileDialog.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhUpload', ZhUpload)
    app.component('ZhUploadCard', ZhUploadCard)
    app.component('zhUploadDialog', zhUploadDialog)
  }
}
export { ZhUpload,ZhUploadCard,zhUploadDialog }
