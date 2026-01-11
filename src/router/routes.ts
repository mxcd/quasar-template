import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/users',
        component: () => import('pages/UsersPage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: '/users/new',
        component: () => import('pages/UserCreatePage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: '/users/:id',
        component: () => import('pages/UserDetailPage.vue'),
        meta: { requiresAuth: true, allowOwnProfile: true },
      },
      {
        path: '/users/:id/edit',
        component: () => import('pages/UserEditPage.vue'),
        meta: { requiresAuth: true, allowOwnProfile: true },
      },
    ],
  },

  // Authentication routes (no layout)
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    component: () => import('pages/RegisterPage.vue'),
    meta: { requiresGuest: true },
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
