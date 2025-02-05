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
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/LoginPage.vue')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('pages/RegisterPage.vue')
      },
      {
        path: 'complete-profile',
        name: 'complete-profile',
        component: () => import('pages/ProfileCompletionPage.vue')
      },
      {
        path: 'load-new-games',
        name: 'load-new-games',
        component: () => import('pages/LoadNewGames.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'admin-availability',
        name: 'admin-availability',
        component: () => import('pages/AdminAvailability.vue'),
        meta: { requiresAdmin: true }
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
