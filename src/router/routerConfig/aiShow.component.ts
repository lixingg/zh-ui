import { RouteRecordRaw } from 'vue-router'

// 数据展示组件路由
export const aiComponent: RouteRecordRaw[] = [
    {
        path: 'AiChat',
        meta: { title: 'AI 聊天窗' },
        component: () => import('@/docs/AI/README.md')
    },
]
