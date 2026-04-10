import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { routerDocsComponent } from './routerConfig'

const indexRouters: RouteRecordRaw[] = [
  { path: '/', redirect: '/doc/component' },
  {
    path: '/doc/component/',
    component: () => import('../components/doc-component-page.vue'),
    redirect: '/doc/component/index',
    children: routerDocsComponent
  },
  {
    path: '/home',
    component: () => import('../components/home-page.vue')
  },
  {
    path: '/error',
    component: () => import('../components/error-page.vue')
  },
  { path: '/:pathMatch(.*)', redirect: '/error' }
]

const router = createRouter({
  history: createWebHistory(),
  routes: indexRouters
})

export default router
