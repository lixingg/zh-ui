import { RouteRecordRaw } from 'vue-router'

// 数据展示组件路由
export const formComponent: RouteRecordRaw[] = [
  {
    path: 'radio',
    meta: { title: 'Radio 单选框' },
    component: () => import('../../docs/radio/README.md')
  },
  {
    path: 'switch',
    meta: { title: 'Switch 开关' },
    component: () => import('../../docs/switch/README.md')
  },
  {
    path: 'input',
    meta: { title: 'Input 输入框' },
    component: () => import('../../docs/input/README.md')
  },
  {
    path: 'upload',
    meta: { title: 'upload 上传器' },
    component: () => import('../../docs/upload/README.md')
  },
]
