const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/HomePage.vue')
      },
      {
        path: 'giochi',
        name: 'giochi',
        component: () => import('pages/GiochiPage.vue')
      },
      {
        path: 'prenota',
        name: 'prenota',
        component: () => import('pages/PrenotaPage.vue')
      }
    ]
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
