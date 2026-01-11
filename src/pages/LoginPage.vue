<template>
  <div class="flex flex-center bg-grey-2" style="min-height: 100vh;">
    <q-card class="q-pa-md" style="width: 400px; max-width: 90vw">
      <q-card-section>
        <div class="text-h5 text-center q-mb-md">Login</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="formData.identifier"
            label="Username or Email"
            type="text"
            outlined
            :rules="[
              (val) => !!val || 'Identifier is required',
            ]"
            :disable="authStore.loading"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            v-model="formData.password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            outlined
            :rules="[
              (val) => !!val || 'Password is required',
            ]"
            :disable="authStore.loading"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <div class="q-mt-md">
            <q-btn
              label="Login"
              type="submit"
              color="primary"
              class="full-width"
              :loading="authStore.loading"
              :disable="authStore.loading"
            />
          </div>

          <div class="text-center q-mt-md">
            <span class="text-grey-7">Don't have an account?</span>
            <router-link to="/register" class="q-ml-xs text-primary">
              Register
            </router-link>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth.store';
import type { LoginRequest } from 'src/api/authentication';

const router = useRouter();
const authStore = useAuthStore();

const showPassword = ref(false);

const formData = reactive<LoginRequest>({
  identifier: '',
  password: '',
});

async function handleSubmit() {
  const result = await authStore.login({
    identifier: formData.identifier,
    password: formData.password,
  });

  if (result.success) {
    router.push('/');
  }
}
</script>
