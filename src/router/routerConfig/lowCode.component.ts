import { RouteRecordRaw } from 'vue-router'

// 数据展示组件路由
export const lowCodeComponent: RouteRecordRaw[] = [
    {
        path: 'designer',
        meta: { title: 'designer 设计器' },
        component: () => import('@/docs/designer/README.md')
    },
]
