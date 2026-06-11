import { RouteRecordRaw } from 'vue-router'

// 数据展示组件路由
export const threeShowComponent: RouteRecordRaw[] = [
    {
        path: 'torusKnot',
        meta: { title: 'torusKnot 动画' },
        component: () => import('@/docs/three/torusKnot/README.md')
    },
    {
        path: 'photoWall',
        meta: { title: 'photoWall 照片墙' },
        component: () => import('@/docs/three/photoWall/README.md')
    },
    {
        path: 'sign3d',
        meta: { title: 'sign3d 签到' },
        component: () => import('@/docs/three/sign3d/README.md')
    },
]
