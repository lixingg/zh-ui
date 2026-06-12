import { createApp } from 'vue'
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import ShowCode from './components/common/show-code.vue'
import App from './App.vue'
import './assets/style/index.scss'
import './assets/style/cyanosis.markdown.scss' // markdown主题 掘金
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'dayjs/locale/zh-cn'
import 'element-plus/dist/index.css'
import ZHUI from '../packages/components'

import router from './router'
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
const app = createApp(App).use(router).use(ZHUI,{
  locale: zhCn,
  useGlobalIcons:true
})
app.use(pinia)
// 注册全局预览组件
app.component('ShowCode', ShowCode)

// for (const [key, component] of Object.entries<any>(ElementPlusIconsVue)) {
//   app.component(key, component)
// }
app.use(ElementPlus, {
  locale: zhCn,
})

app.mount('#app')
