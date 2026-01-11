<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md">
      <q-btn
        flat
        icon="arrow_back"
        label="Back to Users"
        @click="router.push('/users')"
      />
    </div>

    <q-card>
      <q-card-section>
        <div class="text-h5 q-mb-md">
          <q-icon name="person_add" class="q-mr-sm" />
          Create User
        </div>

        <q-separator class="q-mb-md" />

        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="form.username"
            label="Username"
            outlined
            :rules="[val => !!val || 'Username is required']"
          />

          <q-input
            v-model="form.name"
            label="Name"
            outlined
            :rules="[val => !!val || 'Name is required']"
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
            label="Password"
            type="password"
            outlined
            :rules="[val => !!val || 'Password is required', val => val.length >= 8 || 'Password must be at least 8 characters']"
          />

          <q-select
            v-model="form.role"
            label="Role"
            outlined
            :options="roleOptions"
          />

          <q-toggle
            v-model="form.active"
            label="Active"
          />

          <div class="q-mt-lg">
            <q-btn
              type="submit"
              color="primary"
              label="Create User"
              :loading="loading"
            />
            <q-btn
              flat
              label="Cancel"
              class="q-ml-sm"
              @click="router.push('/users')"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import users from 'src/api/users';

const router = useRouter();
const $q = useQuasar();

const loading = ref(false);
const form = ref({
  username: '',
  name: '',
  email: '',
  password: '',
  role: 'user',
  active: true,
});

const roleOptions = ['user', 'admin'];

async function handleSubmit() {
  loading.value = true;
  try {
    await users.create({
      username: form.value.username,
      name: form.value.name,
      password: form.value.password,
      email: form.value.email || undefined,
      role: form.value.role,
      active: form.value.active,
    });
    $q.notify({
      type: 'positive',
      message: 'User created successfully',
    });
    router.push('/users');
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to create user',
    });
  } finally {
    loading.value = false;
  }
}
</script>
