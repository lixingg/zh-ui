import { RouteRecordRaw } from 'vue-router'

// 数据展示组件路由
export const echartsShowComponent: RouteRecordRaw[] = [
  {
    path: 'linechart',
    meta: { title: '折线图' },
    component: () => import('../../docs/charts/linechart/README.md')
  },
  {
    path: 'barchart',
    meta: { title: '柱状图' },
    component: () => import('../../docs/charts/barchart/README.md')
  },
  {
    path: 'piechart',
    meta: { title: '饼图' },
    component: () => import('../../docs/charts/piechart/README.md')
  },
  {
    path: 'linebarchart',
    meta: { title: '折线柱状图' },
    component: () => import('../../docs/charts/linebarchart/README.md')
  },
  {
    path: 'mapchart',
    meta: { title: '地图' },
    component: () => import('../../docs/charts/mapchart/README.md')
  },
]
