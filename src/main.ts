import { createApp } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ShowCode from './components/common/show-code.vue'
import App from './App.vue'
import './assets/style/index.scss'
import './assets/style/cyanosis.markdown.scss' // markdown主题 掘金
// import 'github-markdown-css'
import BlUi from '../packages/components'

import router from './router'

const app = createApp(App).use(router).use(BlUi)

// 注册全局预览组件
app.component('ShowCode', ShowCode)

for (const [key, component] of Object.entries<any>(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
