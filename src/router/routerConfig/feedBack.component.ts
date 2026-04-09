import { RouteRecordRaw } from 'vue-router'

// 反馈组件路由
export const feedBackComponent: RouteRecordRaw[] = [
  {
    path: 'message',
    meta: { title: 'Message 消息提示' },
    component: () => import('../../docs/message/README.md')
  },
  {
    path: 'messagebox',
    meta: { title: 'Message Box 消息弹出框' },
    component: () => import('../../docs/messagebox/README-box.md')
  },
  {
    path: 'drawer',
    meta: { title: 'Drawer 抽屉' },
    component: () => import('../../docs/drawer/README.md')
  },
  {
    path: 'nodata',
    meta: { title: 'nodata 暂无数据' },
    component: () => import('../../docs/noData/README.md')
  }
]
