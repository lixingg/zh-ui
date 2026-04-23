import { RouteRecordRaw } from 'vue-router'

// 数据展示组件路由
export const mapShowComponent: RouteRecordRaw[] = [
  {
    path: 'amap',
    meta: { title: '高德地图' },
    component: () => import('@/docs/map/amap/README.md')
  },
  {
    path: 'bmap',
    meta: { title: '百度地图' },
    component: () => import('@/docs/map/bmap/README.md')
  },
  {
    path: 'tmap',
    meta: { title: '腾讯地图' },
    component: () => import('@/docs/map/tmap/README.md')
  },
  {
    path: 'smap',
    meta: { title: '天地图' },
    component: () => import('@/docs/map/smap/README.md')
  },
  {
    path: 'map/omap',
    meta: { title: 'openlayer地图' },
    component: () => import('@/docs/map/omap/README.md')
  },
]
