import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'src/stores/auth.store';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Global navigation guard for authentication
  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
    const allowOwnProfile = to.matched.some(record => record.meta.allowOwnProfile);

    // Only verify session with API if:
    // 1. Route requires auth
    // 2. Not already authenticated in memory
    // 3. There's a hint that user might have a session (was previously logged in)
    // This avoids 401 errors when user has never logged in
    if (requiresAuth && !authStore.isAuthenticated && !authStore.loading && authStore.mayHaveSession) {
      await authStore.initialize();
    }

    // Route requires authentication
    if (requiresAuth && !authStore.isAuthenticated) {
      next('/login');
      return;
    }

    // Route requires guest (redirect authenticated users away from login/register)
    if (requiresGuest && authStore.isAuthenticated) {
      next('/');
      return;
    }

    // Route requires admin role
    if (requiresAdmin && !authStore.isAdmin) {
      next('/');
      return;
    }

    // Route allows own profile access - check if user is admin or viewing own profile
    if (allowOwnProfile && !authStore.isAdmin) {
      const userId = to.params.id as string;
      if (userId !== authStore.user?.id) {
        next('/');
        return;
      }
    }

    next();
  });

  return Router;
});
