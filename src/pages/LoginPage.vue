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
              <q-btn type="submit" label="Login" color="primary" unelevated />
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

    const handleLogin = async () => {
      try {
        // Sign in user
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email.value,
          password: password.value,
        });

        if (authError) throw authError;

        // Check if user exists in profiles table and is admin
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          // If profile doesn't exist, create one
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: authData.user.id,
                email: email.value,
                is_admin: false // Default to non-admin
              }
            ]);

          if (insertError) throw insertError;
        }

        Notify.create({
          type: 'positive',
          message: 'Login riuscito!' + (profileData?.is_admin ? ' (Admin)' : '')
        });

        router.push({ name: 'Prenota' });
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.message || 'Errore durante il login. Riprova più tardi.'
        });
      }
    };

    const goToRegister = () => {
      router.push({ name: 'Register' });
    };

    return {
      email,
      password,
      handleLogin,
      goToRegister,
    };
  },
};
</script>

<style scoped>
.q-page {
  background-color: #f5f5f5;
}
</style>
