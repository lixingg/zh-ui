import { RouteRecordRaw } from 'vue-router'

// 数据展示组件路由
export const formComponent: RouteRecordRaw[] = [
  {
    path: 'radio',
    meta: { title: 'Radio 单选框' },
    component: () => import('@/docs/radio/README.md')
  },
  {
    path: 'switch',
    meta: { title: 'Switch 开关' },
    component: () => import('@/docs/switch/README.md')
  },
  {
    path: 'input',
    meta: { title: 'Input 输入框' },
    component: () => import('@/docs/input/README.md')
  },
  {
    path: 'upload',
    meta: { title: 'upload 上传器' },
    component: () => import('@/docs/upload/README.md')
  },
  {
    path: 'form',
    meta: { title: 'form 表单' },
    component: () => import('@/docs/form/README.md')
  },
  {
    path: 'searchForm',
    meta: { title: 'searchForm 搜索栏' },
    component: () => import('@/docs/searchForm/README.md')
  },
  {
    path: 'editor',
    meta: { title: 'editor 编辑器' },
    component: () => import('@/docs/editor/README.md')
  },
]
