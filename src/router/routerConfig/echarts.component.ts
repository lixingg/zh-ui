import { RouteRecordRaw } from 'vue-router'

// 数据展示组件路由
export const echartsComponent: RouteRecordRaw[] = [
  {
    path: 'charts',
    meta: { title: '折线图' },
    component: () => import('../../docs/charts/README.md')
  },
]
