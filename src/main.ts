import { createApp } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ShowCode from './components/common/show-code.vue'
import App from './App.vue'
import './assets/style/index.scss'
import './assets/style/cyanosis.markdown.scss' // markdown主题 掘金
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'dayjs/locale/zh-cn'
import 'element-plus/dist/index.css'
import ZHUI from '../packages/components'

import router from './router'

const app = createApp(App).use(router).use(ZHUI)

// 注册全局预览组件
app.component('ShowCode', ShowCode)

for (const [key, component] of Object.entries<any>(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus, {
  locale: zhCn,
})
app.mount('#app')
