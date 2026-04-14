import { RouteRecordRaw } from 'vue-router'

// 数据展示组件路由
export const directiveComponent: RouteRecordRaw[] = [
  {
    path: 'directives',
    meta: { title: 'directive' },
    component: () => import('../../docs/directives/README.md')
  },
]
