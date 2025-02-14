<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md" style="width: 400px;">
      <q-card>
        <q-card-section>
          <div class="text-h6">Login</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleLogin">
            <q-input
              v-model="email"
              label="Email"
              type="email"
              required
              autofocus
            />
            <q-input
              v-model="password"
              label="Password"
              type="password"
              required
            />
            <div class="q-mt-md">
              <q-btn type="submit" label="Login" color="primary" unelevated :loading="loading" />
            </div>
          </q-form>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle2">
            Non hai un account?
            <q-btn flat label="Registrati" @click="goToRegister" />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { Notify } from 'quasar';

export default {
  name: 'LoginPage',
  setup() {
    const email = ref('');
    const password = ref('');
    const router = useRouter();
    const loading = ref(false); // Add loading state

    const handleLogin = async () => {
      loading.value = true; // Set loading to true
      try {
        // Sign in user
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.value,
          password: password.value,
        });

        if (authError) {
            loading.value = false; // Set loading to false in case of error
            throw authError
        };

        Notify.create({
          type: 'positive',
          message: 'Login riuscito!'
        });

        // After successful login, reload the page
        window.location.href = "/";

      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.message || 'Errore durante il login. Riprova più tardi.'
        });
          loading.value = false;//set loading to false when an error shows up

      }
    };

    const goToRegister = () => {
      router.push('register');  // Changed from { name: 'Register' } to 'register'
    };

    return {
      email,
      password,
      handleLogin,
      goToRegister,
        loading
    };
  },
};
</script>

<style scoped>
.q-page {
  background-color: #f5f5f5;
}
</style>
