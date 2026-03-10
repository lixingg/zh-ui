import BlContainer from './src/bl-container.vue'
import BlHeader from './src/bl-header.vue'
import BlMain from './src/bl-main.vue'
import BlFooter from './src/bl-footer.vue'
import BlAside from './src/bl-aside.vue'
import { App } from 'vue'

export default {
  install(app: App) {
    app.component('BlContainer', BlContainer)
    app.component('BlHeader', BlHeader)
    app.component('BlMain', BlMain)
    app.component('BlFooter', BlFooter)
    app.component('BlAside', BlAside)
  }
}
export { BlContainer, BlHeader, BlMain, BlFooter, BlAside }
