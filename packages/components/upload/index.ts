import ZhUpload from './src/zh-upload.vue'
import ZhUploadCard from "./src/zh-uploadCard.vue";
import ZhUploadDialog from './src/zh-uploadDialog.vue'
import ZhCupload from './src/zh-cupload.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('ZhUpload', ZhUpload)
    app.component('ZhUploadCard', ZhUploadCard)
    app.component('ZhUploadDialog', ZhUploadDialog)
    app.component('ZhCupload', ZhCupload)
  }
}
export { ZhUpload,ZhUploadCard,ZhUploadDialog,ZhCupload }
