import { RouteRecordRaw } from 'vue-router'

// 数据展示组件路由
export const chatComponent: RouteRecordRaw[] = [
    {
        path: 'chat',
        meta: { title: 'chat 聊天窗' },
        component: () => import('@/docs/chat/README.md')
    },
]
