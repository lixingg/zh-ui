# 快速开始

本节将介绍如何在项目中使用 ZHUI。

## 用法
#### 该组件库在ElementPlus基础上进行二次封装，如使用elementPlus组件，请前往elementPlus官网查看用法
#### [elementPlus](https://element-plus.org/zh-CN/component/overview)
## 完整引入

如果你对打包后的文件大小不是很在乎，那么使用完整导入会更方便。

```js
import {createApp} from 'vue'
import App from './App.vue'
// 引入组件
import ZHUI from 'zh-ui'
// 引入图标 没有下载需要npm下载
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 引入样式
import 'zh-ui/ZHUI/style.css'
// 注册组件
const app = createApp(App).use(ZHUI)
// 注册图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.mount('#app')

```
> **Tip**<br>
> 注意：umd版本无法正常工作，es版本才可以，请使用es版本，即 `zh-ui.es.js`。

> **Tip**<br>
> 如果你使用的是直接在代码仓库下载的方式，直接引入对应文件即可(`es.js`和`css`)

