const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/TavoliPage.vue') },
      { path: 'giochi', component: () => import('pages/GiochiPage.vue') },
      { path: 'prenota', component: () => import('pages/PrenotaPage.vue') },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
