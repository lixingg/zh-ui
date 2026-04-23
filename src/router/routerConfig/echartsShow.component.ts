import { RouteRecordRaw } from 'vue-router'

// 数据展示组件路由
export const echartsShowComponent: RouteRecordRaw[] = [
  {
    path: 'image',
    meta: { title: 'Image 图片' },
    component: () => import('@/docs/image/README.md')
  },
  {
    path: 'linechart',
    meta: { title: '折线图' },
    component: () => import('@/docs/charts/linechart/README.md')
  },
  /*{
    path: 'bar-chart',
    meta: { title: '柱状图' },
    component: () => import('@/docs/charts/barchart/README.md')
  },
  {
    path: 'pie-chart',
    meta: { title: '饼图' },
    component: () => import('@/docs/charts/piechart/README.md')
  },
  {
    path: 'line-bar-chart',
    meta: { title: '折线柱状图' },
    component: () => import('@/docs/charts/linebarchart/README.md')
  },
  {
    path: 'map-chart',
    meta: { title: '地图' },
    component: () => import('@/docs/charts/mapchart/README.md')
  },*/
]
