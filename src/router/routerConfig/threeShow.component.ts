import { RouteRecordRaw } from 'vue-router'

// 数据展示组件路由
export const threeShowComponent: RouteRecordRaw[] = [
    {
        path: 'torusKnot',
        meta: { title: 'torusKnot 动画' },
        component: () => import('@/docs/three/README.md')
    },
]
