import { RouteRecordRaw } from 'vue-router'

// 数据展示组件路由
export const mapComponent: RouteRecordRaw[] = [
  {
    path: 'amap',
    meta: { title: 'amap 高的地图' },
    component: () => import('../../docs/map/README.md')
  },
]
