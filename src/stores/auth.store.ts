import { ref, computed } from 'vue';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { useStorage } from '@vueuse/core';
import { Notify } from 'quasar';
import authentication from 'src/api/authentication';
import type { RegisterRequest, LoginRequest, User } from 'src/api/authentication';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const sessionHint = useStorage<boolean>('auth_session_hint', false);

  const displayName = computed(() => {
    if (!user.value) return 'Guest';
    return user.value.username || user.value.email || 'User';
  });

  const isUserLoaded = computed(() => user.value !== null);

  const mayHaveSession = computed(() => sessionHint.value === true);

  const isAdmin = computed(() => user.value?.role === 'admin');

  // Actions
  async function initialize() {
    loading.value = true;
    error.value = null;
    try {
      const userData = await authentication.getCurrentUser();
      user.value = userData;
      isAuthenticated.value = true;
    } catch (e) {
      user.value = null;
      isAuthenticated.value = false;
      sessionHint.value = false;
    } finally {
      loading.value = false;
    }
  }

  async function register(data: RegisterRequest) {
    loading.value = true;
    error.value = null;
    try {
      await authentication.register(data);

      Notify.create({
        type: 'positive',
        message: 'Registration successful! Please log in.',
        position: 'top',
      });

      return { success: true };
    } catch (e: any) {
      const errorMessage = e.response?.data?.message ||
                          e.response?.data?.error ||
                          'Registration failed';
      error.value = errorMessage;

      Notify.create({
        type: 'negative',
        message: errorMessage,
        position: 'top',
      });

      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function login(data: LoginRequest) {
    loading.value = true;
    error.value = null;
    try {
      await authentication.login(data);

      const userData = await authentication.getCurrentUser();
      user.value = userData;
      isAuthenticated.value = true;
      sessionHint.value = true;

      Notify.create({
        type: 'positive',
        message: 'Login successful!',
        position: 'top',
      });

      return { success: true };
    } catch (e: any) {
      const errorMessage = e.response?.data?.message ||
                          e.response?.data?.error ||
                          'Login failed';
      error.value = errorMessage;

      Notify.create({
        type: 'negative',
        message: errorMessage,
        position: 'top',
      });

      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;
    try {
      await authentication.logout();
      user.value = null;
      isAuthenticated.value = false;
      error.value = null;
      sessionHint.value = false;

      Notify.create({
        type: 'info',
        message: 'Logged out successfully',
        position: 'top',
      });

      return { success: true };
    } catch (e: any) {
      user.value = null;
      isAuthenticated.value = false;
      sessionHint.value = false;

      const errorMessage = e.response?.data?.message || 'Logout failed';
      Notify.create({
        type: 'warning',
        message: errorMessage,
        position: 'top',
      });

      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    user,
    isAuthenticated,
    loading,
    error,
    // Getters
    displayName,
    isUserLoaded,
    mayHaveSession,
    isAdmin,
    // Actions
    initialize,
    register,
    login,
    logout,
    clearError,
  };
});

// Enable HMR
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
