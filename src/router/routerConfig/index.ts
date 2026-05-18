import {RouteRecordRaw} from 'vue-router'
import {baseComponent} from './base.component'
import {dataShowComponent} from './dataShow.component'
import {feedBackComponent} from './feedBack.component'
import {formComponent} from './form.component'
import {beforeComponent} from './before.component'
import {echartsShowComponent} from './echartsShow.component'
import {mapShowComponent} from './mapShow.component'
import {directiveComponent} from "./directive.component";
import {chatComponent} from "./chatShow.component";
import {aiComponent} from "./aiShow.component";
import {providerShowComponent} from "./providerShow.component";

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
    echartsShowComponents: {
        title: 'echarts 图表',
        routerData: echartsShowComponent
    },
    directiveComponents: {
        title: 'directive 指令',
        routerData: directiveComponent
    },
    providerShowComponents: {
        title: 'provider 组件',
        routerData: providerShowComponent
    },
    mapShowComponents: {
        title: 'map 地图',
        routerData: mapShowComponent
    },
    feedBackComponents: {
        title: 'Feedback 反馈组件',
        routerData: feedBackComponent
    },
    formComponents: {
        title: 'Form 表单组件',
        routerData: formComponent
    },
    chatComponents: {
        title: '即时通讯',
        routerData: chatComponent
    },
    aiComponents: {
        title: 'AI通讯',
        routerData: aiComponent
    }
} as routerConfigType

export const routerDocsComponent = Object.values(routerDocsComponentConfig).flatMap(
    (item) => item.routerData
)
