import { RouteRecordRaw } from 'vue-router'

// 数据展示组件路由
export const videoPlayerComponent: RouteRecordRaw[] = [
    {
        path: 'hlsPlayer',
        meta: { title: 'hls 播放器' },
        component: () => import('@/docs/videoPlayer/hlsPlayer/README.md')
    },
    {
        path: 'dhPlayer',
        meta: { title: '大华播放器' },
        component: () => import('@/docs/videoPlayer/dhPlayer/README.md')
    },
]
