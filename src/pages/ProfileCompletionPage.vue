<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md" style="width: 400px;">
      <q-card>
        <q-card-section>
          <div class="text-h6">Completa il tuo profilo</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleProfileCompletion">
            <div class="q-gutter-y-md">
              <q-input
                v-model="userName"
                label="Nome utente"
                required
                autofocus
              />
              <q-input
                v-model="name"
                label="Nome"
                required
              />
              <q-input
                v-model="surname"
                label="Cognome"
                required
              />
              <q-input
                v-model="telephoneNumber"
                label="Cellulare"
                type="tel"
                required
              />
              <div class="q-mt-md">
                <q-btn type="submit" label="Completa profilo" color="primary" unelevated />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { Notify } from 'quasar'

export default {
  name: 'ProfileCompletionPage',
  setup() {
    const router = useRouter()
    const userName = ref('')
    const name = ref('')
    const surname = ref('')
    const telephoneNumber = ref('')

    const handleProfileCompletion = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error('Utente non autenticato')

        const { error } = await supabase
          .from('profiles')
          .upsert([
            {
              id: user.id,
              user_name: userName.value,
              name: name.value,
              surname: surname.value,
              telephone_number: telephoneNumber.value
            }
          ], {
            onConflict: 'id'
          })

        if (error) throw error

        Notify.create({
          type: 'positive',
          message: 'Profilo completato con successo!'
        })

        router.push('/prenota')
      } catch (error) {
        console.error(error)
        Notify.create({
          type: 'negative',
          message: error.message || 'Errore durante il completamento del profilo'
        })
      }
    }

    return {
      userName,
      name,
      surname,
      telephoneNumber,
      handleProfileCompletion
    }
  }
}
</script>

<style scoped>
.q-page {
  background-color: #f5f5f5;
}
</style>
