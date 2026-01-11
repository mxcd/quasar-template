<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md">
      <q-btn
        flat
        icon="arrow_back"
        label="Back"
        @click="goBack"
      />
    </div>

    <q-card v-if="!pageLoading && user">
      <q-card-section>
        <div class="text-h5 q-mb-md">
          <q-icon name="edit" class="q-mr-sm" />
          Edit User
        </div>

        <q-separator class="q-mb-md" />

        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="form.username"
            label="Username"
            outlined
          />

          <q-input
            v-model="form.name"
            label="Name"
            outlined
          />

          <q-input
            v-model="form.email"
            label="Email"
            type="email"
            outlined
            :rules="[val => !val || /.+@.+\..+/.test(val) || 'Invalid email format']"
          />

          <q-input
            v-model="form.password"
            label="New Password"
            type="password"
            outlined
            hint="Leave empty to keep current password"
            :rules="[val => !val || val.length >= 8 || 'Password must be at least 8 characters']"
          />

          <q-select
            v-if="authStore.isAdmin"
            v-model="form.role"
            label="Role"
            outlined
            :options="roleOptions"
          />

          <q-toggle
            v-if="authStore.isAdmin"
            v-model="form.active"
            label="Active"
          />

          <q-banner v-if="!authStore.isAdmin" class="bg-grey-3 q-mt-md">
            <template v-slot:avatar>
              <q-icon name="info" color="primary" />
            </template>
            You can only edit your name and email. Contact an administrator to change your role.
          </q-banner>

          <div class="q-mt-lg">
            <q-btn
              type="submit"
              color="primary"
              label="Save Changes"
              :loading="loading"
            />
            <q-btn
              flat
              label="Cancel"
              class="q-ml-sm"
              @click="goBack"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <q-inner-loading :showing="pageLoading">
      <q-spinner size="50px" color="primary" />
    </q-inner-loading>

    <q-card v-if="!pageLoading && !user">
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

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore();

const user = ref<User | null>(null);
const pageLoading = ref(false);
const loading = ref(false);

const form = ref({
  username: '',
  name: '',
  email: '',
  password: '',
  role: '',
  active: true,
});

const roleOptions = ['user', 'admin'];

function goBack() {
  const userId = route.params.id as string;
  router.push(`/users/${userId}`);
}

onMounted(load);
async function load() {
  const userId = route.params.id as string;

  if (!userId) {
    router.push('/');
    return;
  }

  pageLoading.value = true;
  try {
    user.value = await users.id(userId);
    form.value.username = user.value.username;
    form.value.name = user.value.name;
    form.value.email = user.value.email || '';
    form.value.role = user.value.role;
    form.value.active = user.value.active;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to load user',
    });
    user.value = null;
  } finally {
    pageLoading.value = false;
  }
}

async function handleSubmit() {
  const userId = route.params.id as string;
  loading.value = true;

  try {
    const updateData: Record<string, string | boolean> = {};

    if (form.value.username !== user.value?.username) {
      updateData.username = form.value.username;
    }
    if (form.value.name !== user.value?.name) {
      updateData.name = form.value.name;
    }
    if (form.value.email !== (user.value?.email || '')) {
      updateData.email = form.value.email;
    }
    if (form.value.password) {
      updateData.password = form.value.password;
    }
    if (authStore.isAdmin && form.value.role !== user.value?.role) {
      updateData.role = form.value.role;
    }
    if (authStore.isAdmin && form.value.active !== user.value?.active) {
      updateData.active = form.value.active;
    }

    if (Object.keys(updateData).length === 0) {
      $q.notify({
        type: 'info',
        message: 'No changes to save',
      });
      return;
    }

    await users.update(userId, updateData);
    $q.notify({
      type: 'positive',
      message: 'User updated successfully',
    });
    router.push(`/users/${userId}`);
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to update user',
    });
  } finally {
    loading.value = false;
  }
}
</script>
