import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { title: 'Inicio' },
    },
    {
      path: '/evento/:id',
      name: 'event-detail',
      component: () => import('../views/EventDetailView.vue'),
      props: true,
      meta: { title: 'Evento' },
    },
    {
      path: '/reportes',
      name: 'reports',
      component: () => import('../views/ReportesView.vue'),
      meta: { title: 'Reportes' },
    },
    {
      path: '/comunidad',
      name: 'community',
      component: () => import('../views/ComunidadView.vue'),
      meta: { title: 'Comunidad FIM' },
    },
    {
      path: '/configuracion',
      name: 'settings',
      component: () => import('../views/ConfiguracionView.vue'),
      meta: { title: 'Configuración' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
