import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: 'Dashboard - FilmFlow' }
  },
  {
    path: '/productions',
    name: 'Productions', 
    component: () => import('@/views/Productions.vue'),
    meta: { title: 'Productions - FilmFlow' }
  },
  {
    path: '/productions/:id/dashboard',
    name: 'LiveDashboard',
    component: () => import('@/views/LiveDashboard.vue'),
    meta: { title: 'Live Dashboard - FilmFlow' }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('@/views/analytics/AnalyticsDashboard.vue'),
    meta: { title: 'Analytics - FilmFlow' }
  },
  {
    path: '/analytics/:productionId',
    name: 'ProductionAnalytics',
    component: () => import('@/views/analytics/AnalyticsDashboard.vue'),
    meta: { title: 'Production Analytics - FilmFlow' }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'FilmFlow'
  next()
})

export default router