import { RouteRecordRaw } from 'vue-router'

// 数据展示组件路由
export const dataShowComponent: RouteRecordRaw[] = [
  {
    path: 'badge',
    meta: { title: 'Badge 角标' },
    component: () => import('../../docs/badge/README.md')
  },
  {
    path: 'image',
    meta: { title: 'Image 图片' },
    component: () => import('../../docs/image/README.md')
  },
  {
    path: 'hideNumber',
    meta: { title: 'hideNumber 脱敏' },
    component: () => import('../../docs/hideNumber/README.md')
  },
  {
    path: 'operationColumn',
    meta: { title: 'operationColumn 自适应操作栏' },
    component: () => import('../../docs/operationColumn/README.md')
  }
]
