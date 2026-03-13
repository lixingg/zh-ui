import { App } from 'vue'
import ElementPlus from 'element-plus'
export * from 'element-plus'
export * from 'element-plus/dist/locale/zh-cn.mjs'
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

import button from './button'
import icon from './icon'
import layout from './layout'
import badge from './badge'
import container from './container'
import drawer from './drawer'
import radio from './radio'
import BlSwitch from './switch'
import input from './input'

import 'dayjs/locale/zh-cn';
import 'element-plus/dist/index.css'
import '../../src/assets/style/index.scss'
const components = [button, icon, layout, badge, container, drawer, radio, BlSwitch, input]

export default {
  install(app: App, options?: any) {
    ElementPlus.install(app, options);
    components.map((item) => item.install(app))
  }
}
