<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md row justify-between items-center">
      <q-btn
        flat
        icon="arrow_back"
        :label="authStore.isAdmin ? 'Back to Users' : 'Back'"
        @click="goBack"
      />
      <div v-if="user" class="q-gutter-sm">
        <q-btn
          color="primary"
          icon="edit"
          label="Edit"
          @click="router.push(`/users/${user.id}/edit`)"
        />
        <q-btn
          v-if="authStore.isAdmin && user.id !== authStore.user?.id"
          color="negative"
          icon="delete"
          label="Delete"
          @click="confirmDelete"
        />
      </div>
    </div>

    <q-card v-if="!loading && user">
      <q-card-section>
        <div class="text-h5 q-mb-md">
          <q-icon name="person" class="q-mr-sm" />
          User Details
        </div>

        <q-separator class="q-mb-md" />

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-list bordered separator>
              <q-item>
                <q-item-section>
                  <q-item-label caption>ID</q-item-label>
                  <q-item-label>
                    <span class="text-mono">{{ user.id }}</span>
                    <q-btn
                      flat
                      dense
                      round
                      size="xs"
                      icon="content_copy"
                      @click="copyToClipboard(user.id)"
                    >
                      <q-tooltip>Copy ID</q-tooltip>
                    </q-btn>
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label caption>Username</q-item-label>
                  <q-item-label>{{ user.username }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label caption>Name</q-item-label>
                  <q-item-label>{{ user.name }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label caption>Email</q-item-label>
                  <q-item-label>{{ user.email || 'N/A' }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div class="col-12 col-md-6">
            <q-list bordered separator>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Role</q-item-label>
                  <q-item-label>{{ user.role }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label caption>Active</q-item-label>
                  <q-item-label>
                    <q-badge :color="user.active ? 'positive' : 'negative'">
                      {{ user.active ? 'Yes' : 'No' }}
                    </q-badge>
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label caption>Created At</q-item-label>
                  <q-item-label>{{ formatDate(user.createdAt) }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label caption>Updated At</q-item-label>
                  <q-item-label>{{ formatDate(user.updatedAt) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-inner-loading :showing="loading">
      <q-spinner size="50px" color="primary" />
    </q-inner-loading>

    <q-card v-if="!loading && !user">
      <q-card-section>
        <div class="text-center text-h6">User not found</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth.store';
import users from 'src/api/users';
import type { User } from 'src/api/authentication';
import { formatISODateToLocal } from 'src/api/util';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore();

const user = ref<User | null>(null);
const loading = ref(false);

function formatDate(dateString: string): string {
  return formatISODateToLocal(dateString);
}

function goBack() {
  if (authStore.isAdmin) {
    router.push('/users');
  } else {
    router.push('/');
  }
}

function confirmDelete() {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete user "${user.value?.username || user.value?.email}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await users.remove(user.value!.id);
      $q.notify({
        type: 'positive',
        message: 'User deleted successfully',
      });
      router.push('/users');
    } catch (error: any) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Failed to delete user',
      });
    }
  });
}

onMounted(load);
async function load() {
  const userId = route.params.id as string;

  if (!userId) {
    router.push('/users');
    return;
  }

  loading.value = true;
  try {
    user.value = await users.id(userId);
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to load user',
    });
    user.value = null;
  } finally {
    loading.value = false;
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  $q.notify({
    type: 'positive',
    message: 'Copied to clipboard',
    timeout: 1000,
  });
}
</script>

<style scoped>
.text-mono {
  font-family: monospace;
  font-size: 0.85em;
}
</style>
