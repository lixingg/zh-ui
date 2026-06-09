import {App} from 'vue'
import ElementPlus from 'element-plus'
import  'echarts-gl'
import 'echarts-liquidfill'
import * as echarts from 'echarts';
export { echarts };
import * as THREE from 'three'
export { THREE }
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
export * from '@element-plus/icons-vue'
export { default as dayjs } from 'dayjs'

// @ts-ignore
// export { default as echarts } from 'echarts';

// @ts-ignore
export * from 'element-plus'
export * from './button'
export * from './icon'
export * from './layout'
export * from './badge'
export * from './message'
export * from './container'
export * from './radio'
export * from './switch'
export * from './input'
export * from './noData'
export * from './upload'
export * from './image'
export * from './hideNumber'
export * from './operationColumn'
export * from './charts'
export * from './chat'
export * from './AI'
export * from './map'
export * from './table'
export * from './qrcode'
export * from './signature'
export * from './fileViewer'
export * from './form'
export * from './searchForm'
export * from './provider'
export * from './videoPlayer'
export * from '../utils/hooks'
export * from "./editor"
export * from './three'
import button from './button'
import icon from './icon'
import layout from './layout'
import badge from './badge'
import container from './container'
import radio from './radio'
import BlSwitch from './switch'
import input from './input'
import image from './image'
import hideNumber from "./hideNumber";
import upload from "./upload";
import noData from './noData';
import operationColumn from './operationColumn';
import charts from './charts';
import chat from './chat';
import AI from './AI';
import map from './map';
import table from './table';
import qrcode from './qrcode';
import signature from "./signature"
import fileViewer from "./fileViewer"
import directives from "./directive"
import form from "./form"
import searchForm from "./searchForm"
import provider from "./provider"
import videoPlayer from "./videoPlayer"
import editor from "./editor"
import threes from "./three"

import 'dayjs/locale/zh-cn'
import 'element-plus/dist/index.css'
import '../styles/index.scss'

const components = [
    button,
    icon,
    layout,
    badge,
    container,
    radio,
    BlSwitch,
    input,
    image,
    hideNumber,
    upload,
    noData,
    operationColumn,
    charts,
    map,
    table,
    chat,
    AI,
    qrcode,
    signature,
    fileViewer,
    form,
    searchForm,
    provider,
    videoPlayer,
    editor,
    threes
]

const install = (app: App, options?: any) => {
    if(options?.useGlobalIcons){
        for (const [key, component] of Object.entries<any>(ElementPlusIconsVue)) {
            app.component(key, component)
        }
    }
    ElementPlus.install(app, options);
    components.map((item) => {
        item.install(app)
    })
    app.use(directives)
}
export default install

