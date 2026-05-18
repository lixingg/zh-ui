import { RouteRecordRaw } from 'vue-router'

// 数据展示组件路由
export const providerShowComponent: RouteRecordRaw[] = [
    {
        path: 'provider',
        meta: { title: 'provider 高阶组件' },
        component: () => import('@/docs/provider/README.md')
    },
]
