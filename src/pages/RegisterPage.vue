<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md" style="width: 400px;">
      <q-card>
        <q-card-section>
          <div class="text-h6">Registrati</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleRegister">
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
            <q-input
              v-model="confirmPassword"
              label="Conferma Password"
              type="password"
              required
            />
            <div class="q-mt-md">
              <q-btn type="submit" label="Registrati" color="primary" unelevated />
            </div>
          </q-form>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle2">
            Hai già un account?
            <q-btn flat label="Login" @click="goToLogin" />
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
  name: 'RegisterPage',
  setup() {
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const router = useRouter();

    const handleRegister = async () => {
      if (password.value !== confirmPassword.value) {
        Notify.create({
          type: 'negative',
          message: 'Le password non coincidono.'
        });
        return;
      }

      try {
        const { error: authError } = await supabase.auth.signUp({
          email: email.value,
          password: password.value,
        });

        if (authError) throw authError;

        Notify.create({
          type: 'positive',
          message: 'Registrazione riuscita! Completa il tuo profilo.'
        });

        router.push('/complete-profile');
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.message || 'Errore durante la registrazione. Riprova più tardi.'
        });
      }
    };

    const goToLogin = () => {
      router.push('login');  // Changed from { name: 'login' } to 'login'
    };

    return {
      email,
      password,
      confirmPassword,
      handleRegister,
      goToLogin,
    };
  },
};
</script>

<style scoped>
.q-page {
  background-color: #f5f5f5;
}
</style>
