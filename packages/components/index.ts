import { App } from 'vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

export * from 'echarts'
export * from 'echarts-gl'
export * from 'element-plus'
export * from './button'
export * from './icon'
export * from './layout'
export * from './badge'
export * from './message'
export * from './container'
export * from './message-box'
export * from './drawer'
export * from './radio'
export * from './switch'
export * from './input'
export * from './noData'
export * from './upload'
export * from './image'
export * from './hideNumber'
export * from './operationColumn'

import button from './button'
import icon from './icon'
import layout from './layout'
import badge from './badge'
import container from './container'
import drawer from './drawer'
import radio from './radio'
import BlSwitch from './switch'
import input from './input'
import image from './image'
import hideNumber from "./hideNumber";
import upload from "./upload";
import noData from './noData';
import operationColumn from './operationColumn';

import 'dayjs/locale/zh-cn'
import 'element-plus/dist/index.css'
import '../../src/assets/style/index.scss'
const components = [
  button,
  icon,
  layout,
  badge,
  container,
  drawer,
  radio,
  BlSwitch,
  input,
  image,
  hideNumber,
  upload,
  noData,
  operationColumn
]

export default {
  install(app: App, options?: any) {
    for (const [key, component] of Object.entries<any>(ElementPlusIconsVue)) {
      app.component(key, component)
    }
    ElementPlus.install(app, options);
    components.map((item) => item.install(app))
  }
}
