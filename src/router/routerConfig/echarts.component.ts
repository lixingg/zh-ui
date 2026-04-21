import { RouteRecordRaw } from 'vue-router'

// 数据展示组件路由
export const echartComponent: RouteRecordRaw[] = [
  {
    path: 'charts/linechart',
    meta: { title: '折线图' },
    component: () => import('../../docs/charts/linechart/README.md')
  },
  {
    path: 'charts/barchart',
    meta: { title: '柱状图' },
    component: () => import('../../docs/charts/barchart/README.md')
  },
  {
    path: 'charts/piechart',
    meta: { title: '饼图' },
    component: () => import('../../docs/charts/piechart/README.md')
  },
  {
    path: 'charts/linebarchart',
    meta: { title: '折线柱状图' },
    component: () => import('../../docs/charts/linebarchart/README.md')
  },
  {
    path: 'charts/mapchart',
    meta: { title: '地图' },
    component: () => import('../../docs/charts/mapchart/README.md')
  },
]
