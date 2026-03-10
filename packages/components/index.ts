import { App } from 'vue'
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

import '../../src/assets/style/index.scss'

const components = [button, icon, layout, badge, container, drawer, radio, BlSwitch, input]

export default {
  install(app: App) {
    components.map((item) => item.install(app))
  }
}
