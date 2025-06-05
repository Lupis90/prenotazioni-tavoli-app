<template>
  <q-page padding class="add-game-page">
    <div class="q-mb-md">
      <q-select
        filled
        label="Seleziona gioco da modificare (lascia vuoto per aggiungere un nuovo gioco)"
        v-model="selectedGameId"
        :options="gamesList"
        @update:model-value="handleGameSelection"
        clearable
        emit-value
        map-options
      />
    </div>

    <div class="text-h4 text-center text-gradient q-mb-lg page-title">
      {{ isEditing ? 'Modifica Gioco' : 'Aggiungi Nuovo Gioco' }}
    </div>

    <q-form @submit.prevent="submitGame" class="row justify-center">
      <div class="col-12 col-md-8">
        <q-card class="q-pa-lg add-game-card">
          <q-card-section>
            <div class="q-gutter-md">
              <!-- Nome del gioco -->
              <q-input
                v-model="gameForm.nome"
                label="Nome del gioco *"
                :rules="[(val) => !!val || 'Il nome è obbligatorio']"
                filled
              />

              <!-- Descrizione -->
              <q-input
                v-model="gameForm.descrizione"
                label="Descrizione"
                type="textarea"
                filled
                autogrow
              />

              <!-- Numero giocatori -->
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-input
                    v-model.number="gameForm.giocatori_min"
                    label="Min giocatori *"
                    type="number"
                    :rules="[(val) => val > 0 || 'Inserire un numero valido']"
                    filled
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model.number="gameForm.giocatori_max"
                    label="Max giocatori *"
                    type="number"
                    :rules="[
                      (val) => val >= gameForm.giocatori_min || 'Deve essere maggiore del minimo',
                    ]"
                    filled
                  />
                </div>
              </div>

              <!-- Durata media -->
              <q-input
                v-model.number="gameForm.durata_media"
                label="Durata media (minuti) *"
                type="number"
                :rules="[(val) => val > 0 || 'Inserire una durata valida']"
                filled
              />

              <!-- Difficoltà -->
              <q-select
                v-model="gameForm.difficolta"
                :options="['facile', 'medio', 'difficile']"
                label="Difficoltà *"
                filled
              />

              <!-- Disponibilità -->
              <q-toggle v-model="gameForm.disponibile" label="Disponibile" />

              <!-- Copertina -->
              <div class="row items-center q-col-gutter-md">
                <div class="col-12">
                  <q-file
                    v-model="coverImage"
                    label="Copertina"
                    filled
                    accept="image/*"
                    @update:model-value="handleImageSelected"
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_file" />
                    </template>
                  </q-file>
                </div>

                <!-- Preview immagine -->
                <div v-if="imagePreview || existingImageUrl" class="col-12 text-center">
                  <q-img
                    :src="imagePreview || existingImageUrl"
                    style="max-width: 300px; max-height: 300px"
                    fit="contain"
                  >
                    <div class="absolute-top text-right">
                      <q-btn
                        round
                        color="negative"
                        icon="close"
                        size="sm"
                        @click="removeImage"
                        class="q-ma-xs"
                      />
                    </div>
                  </q-img>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat color="negative" label="Annulla" @click="resetForm" :disable="loading" />
            <q-btn
              type="submit"
              color="primary"
              :label="isEditing ? 'Salva Modifiche' : 'Salva Gioco'"
              :loading="loading"
            />
          </q-card-actions>
        </q-card>
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { supabase } from 'src/supabase'
import { useRouter } from 'vue-router'

export default {
  name: 'LoadNewGames',

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const loading = ref(false)
    const coverImage = ref(null)
    const imagePreview = ref(null)
    const existingImageUrl = ref(null)
    const isEditing = ref(false)
    const selectedGameId = ref(null)
    const gamesList = ref([])

    const initialFormState = {
      nome: '',
      descrizione: '',
      giocatori_min: 1,
      giocatori_max: 2,
      durata_media: 30,
      difficolta: 'medio',
      disponibile: true,
      copertina: null,
    }

    const gameForm = ref({ ...initialFormState })

    const resetForm = () => {
      gameForm.value = { ...initialFormState }
      coverImage.value = null
      imagePreview.value = null
      existingImageUrl.value = null
      selectedGameId.value = null
      isEditing.value = false
    }

    const handleImageSelected = (file) => {
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreview.value = e.target.result
          existingImageUrl.value = null // Reset existing image when new one is selected
        }
        reader.readAsDataURL(file)
      } else {
        imagePreview.value = null
      }
    }

    const removeImage = () => {
      coverImage.value = null
      imagePreview.value = null
      existingImageUrl.value = null
      if (isEditing.value) {
        gameForm.value.copertina = null
      }
    }

    // Carica la lista dei giochi per il menu a tendina
    const loadGamesList = async () => {
      const { data: games, error } = await supabase.from('giochi').select('id, nome')
      if (!error && games) {
        gamesList.value = games.map((game) => ({
          label: game.nome,
          value: game.id,
        }))
      }
    }

    // Carica i dati del gioco esistente
    const loadExistingGame = async (gameId) => {
      try {
        const { data: game, error } = await supabase
          .from('giochi')
          .select('*')
          .eq('id', gameId)
          .single()
        if (error) throw error
        if (game) {
          gameForm.value = {
            nome: game.nome,
            descrizione: game.descrizione || '',
            giocatori_min: game.giocatori_min,
            giocatori_max: game.giocatori_max,
            durata_media: game.durata_media,
            difficolta: game.difficolta,
            disponibile: game.disponibile,
            copertina: game.copertina,
          }
          if (game.copertina) {
            const { data } = supabase.storage.from('Copertine_giochi').getPublicUrl(game.copertina)
            existingImageUrl.value = data.publicUrl
            imagePreview.value = null
          } else {
            existingImageUrl.value = null
          }
        }
      } catch (error) {
        console.error('Error loading game:', error)
        $q.notify({
          type: 'negative',
          message: 'Errore nel caricamento del gioco',
        })
      }
    }

    // Gestisce la selezione del gioco dal menu a tendina
    const handleGameSelection = async (val) => {
      if (val) {
        isEditing.value = true
        await loadExistingGame(val)
      } else {
        resetForm()
      }
    }

    const submitGame = async () => {
      loading.value = true
      try {
        let fileName = gameForm.value.copertina

        // Gestione dell'immagine
        if (coverImage.value) {
          // Se stiamo modificando e c'era già un'immagine, la eliminiamo
          if (isEditing.value && gameForm.value.copertina) {
            await supabase.storage.from('Copertine_giochi').remove([gameForm.value.copertina])
          }

          // Upload della nuova immagine
          const fileExt = coverImage.value.name.split('.').pop()
          fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
          const { error: uploadError } = await supabase.storage
            .from('Copertine_giochi')
            .upload(fileName, coverImage.value)

          if (uploadError) throw uploadError
        }

        const payload = {
          ...gameForm.value,
          copertina: fileName,
        }

        let error
        if (isEditing.value) {
          const { error: updateError } = await supabase
            .from('giochi')
            .update(payload)
            .eq('id', selectedGameId.value)
          error = updateError
        } else {
          const { error: insertError } = await supabase.from('giochi').insert([payload])
          error = insertError
        }

        if (error) throw error

        $q.notify({
          type: 'positive',
          message: isEditing.value
            ? 'Gioco modificato con successo!'
            : 'Gioco aggiunto con successo!',
        })

        resetForm()
        await loadGamesList() // Ricarica la lista dei giochi dopo il salvataggio
      } catch (error) {
        console.error('Error:', error)
        $q.notify({
          type: 'negative',
          message: 'Errore durante il salvataggio del gioco',
        })
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        if (error || !profile?.is_admin) {
          router.push('/')
          $q.notify({
            type: 'negative',
            message: 'Accesso non autorizzato',
          })
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        router.push('/')
      }

      await loadGamesList()
    })

    return {
      loading,
      coverImage,
      imagePreview,
      existingImageUrl,
      isEditing,
      selectedGameId,
      gamesList,
      gameForm,
      handleGameSelection,
      handleImageSelected,
      removeImage,
      submitGame,
      resetForm,
    }
  },
}
</script>

<style scoped>
.add-game-page {
  background: linear-gradient(135deg, #fff4ec, #ffe8d6);
  min-height: 100vh;
}

.add-game-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-weight: 700;
}

.game-preview {
  position: relative;
  display: inline-block;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}
</style>
