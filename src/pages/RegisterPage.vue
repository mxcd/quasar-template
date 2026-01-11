<template>
  <div class="flex flex-center bg-grey-2" style="min-height: 100vh;">
    <q-card class="q-pa-md" style="width: 400px; max-width: 90vw">
      <q-card-section>
        <div class="text-h5 text-center q-mb-md">Register</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="formData.username"
            label="Username (optional)"
            type="text"
            outlined
            :rules="[
              (val) => !val || (val.length >= 3 && val.length <= 50) ||
                'Username must be 3-50 characters',
            ]"
            hint="3-50 characters"
            :disable="authStore.loading"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            v-model="formData.email"
            label="Email (optional)"
            type="email"
            outlined
            :rules="[
              (val) => !val || /.+@.+\..+/.test(val) || 'Invalid email format',
            ]"
            hint="Valid email address"
            :disable="authStore.loading"
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-banner v-if="!formData.username && !formData.email"
                    class="bg-warning text-white">
            <template v-slot:avatar>
              <q-icon name="warning" />
            </template>
            At least one of username or email is required
          </q-banner>

          <q-input
            v-model="formData.password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            outlined
            :rules="[
              (val) => !!val || 'Password is required',
              (val) => val.length >= 8 || 'Password must be at least 8 characters',
            ]"
            hint="At least 8 characters"
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

          <q-input
            v-model="formData.passwordConfirm"
            label="Confirm Password"
            :type="showPasswordConfirm ? 'text' : 'password'"
            outlined
            :rules="[
              (val) => !!val || 'Please confirm your password',
              (val) => val === formData.password || 'Passwords do not match',
            ]"
            :disable="authStore.loading"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPasswordConfirm ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPasswordConfirm = !showPasswordConfirm"
              />
            </template>
          </q-input>

          <div class="q-mt-md">
            <q-btn
              label="Register"
              type="submit"
              color="primary"
              class="full-width"
              :loading="authStore.loading"
              :disable="authStore.loading || (!formData.username && !formData.email)"
            />
          </div>

          <div class="text-center q-mt-md">
            <span class="text-grey-7">Already have an account?</span>
            <router-link to="/login" class="q-ml-xs text-primary">
              Login
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
import type { RegisterRequest } from 'src/api/authentication';

const router = useRouter();
const authStore = useAuthStore();

const showPassword = ref(false);
const showPasswordConfirm = ref(false);

interface RegisterFormData extends RegisterRequest {
  passwordConfirm: string;
}

const formData = reactive<RegisterFormData>({
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
});

async function handleSubmit() {
  // Build request object (exclude passwordConfirm and empty fields)
  const requestData: RegisterRequest = {
    password: formData.password,
  };

  if (formData.username) {
    requestData.username = formData.username;
  }

  if (formData.email) {
    requestData.email = formData.email;
  }

  const result = await authStore.register(requestData);

  if (result.success) {
    // Redirect to login page after successful registration
    router.push('/login');
  }
}
</script>
