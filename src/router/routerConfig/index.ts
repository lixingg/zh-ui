import { baseComponent } from './base.component'
import { RouteRecordRaw } from 'vue-router'
import { dataShowComponent } from './dataShow.component'
import { feedBackComponent } from './feedBack.component'
import { formComponent } from './form.component'
import { beforeComponent } from './before.component'
import { echartsComponent } from './echarts.component'
import { mapComponent } from './map.component'
import {directiveComponent} from "./directive.component";
export interface routerType {
  title: string
  routerData: RouteRecordRaw[]
}

interface routerConfigType {
  [key: string]: routerType
}

export const routerDocsComponentConfig = {
  index: {
    title: '前言',
    routerData: beforeComponent
  },
  baseComponents: {
    title: 'Basic 基础组件',
    routerData: baseComponent
  },
  dataShowComponents: {
    title: 'Data 数据展示',
    routerData: dataShowComponent
  },
  echartsComponents: {
    title: 'echarts 图表',
    routerData: echartsComponent
  },
 directivesComponents: {
    title: 'directive 指令',
    routerData: directiveComponent
 },
  mapComponents: {
    title: 'map 地图',
    routerData: mapComponent
  },
  feedBackComponents: {
    title: 'Feedback 反馈组件',
    routerData: feedBackComponent
  },
  formComponents: {
    title: 'Form 表单组件',
    routerData: formComponent
  }
} as routerConfigType

export const routerDocsComponent = Object.values(routerDocsComponentConfig).flatMap(
  (item) => item.routerData
)
