<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="authStore.isAuthenticated"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Template Application
        </q-toolbar-title>

        <!-- User section when authenticated -->
        <div v-if="authStore.isAuthenticated" class="row items-center q-gutter-sm">
          <q-chip
            square
            color="primary"
            text-color="white"
            icon="person"
            clickable
            @click="navigateToOwnProfile"
          >
            {{ authStore.displayName }}
            <q-tooltip>View profile</q-tooltip>
          </q-chip>

          <q-btn
            flat
            round
            dense
            icon="logout"
            @click="handleLogout"
            :loading="authStore.loading"
          >
            <q-tooltip>Logout</q-tooltip>
          </q-btn>
        </div>

        <!-- Login/Register links when not authenticated -->
        <div v-else class="row items-center q-gutter-sm">
          <q-btn
            flat
            label="Login"
            icon="login"
            to="/login"
          />
          <q-btn
            flat
            label="Register"
            icon="person_add"
            to="/register"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="authStore.isAuthenticated"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item
          clickable
          to="/"
          exact
        >
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Home</q-item-label>
          </q-item-section>
        </q-item>

        <template v-if="authStore.isAdmin">
          <q-item-label header>
            Administration
          </q-item-label>

          <q-item
            clickable
            to="/users"
            exact
          >
            <q-item-section avatar>
              <q-icon name="people" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Users</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();
const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

async function handleLogout() {
  const result = await authStore.logout();
  if (result.success) {
    router.push('/login');
  }
}

function navigateToOwnProfile() {
  if (authStore.user?.id) {
    router.push(`/users/${authStore.user.id}`);
  }
}
</script>
