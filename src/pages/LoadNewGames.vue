<template>
  <q-page padding>
    <div class="text-h4 text-center q-mb-lg">Aggiungi Nuovo Gioco</div>

    <q-form @submit.prevent="submitGame" class="row justify-center">
      <div class="col-12 col-md-6">
        <q-card class="q-pa-md">
          <q-card-section>
            <div class="q-gutter-md">
              <!-- Nome del gioco -->
              <q-input
                v-model="gameForm.nome"
                label="Nome del gioco *"
                :rules="[val => !!val || 'Il nome è obbligatorio']"
                filled
              />

              <!-- Descrizione -->
              <q-input
                v-model="gameForm.descrizione"
                label="Descrizione"
                type="textarea"
                filled
              />

              <!-- Numero giocatori -->
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-input
                    v-model.number="gameForm.giocatori_min"
                    label="Min giocatori *"
                    type="number"
                    :rules="[val => val > 0 || 'Inserire un numero valido']"
                    filled
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model.number="gameForm.giocatori_max"
                    label="Max giocatori *"
                    type="number"
                    :rules="[val => val >= gameForm.giocatori_min || 'Deve essere maggiore del minimo']"
                    filled
                  />
                </div>
              </div>

              <!-- Durata media -->
              <q-input
                v-model.number="gameForm.durata_media"
                label="Durata media (minuti) *"
                type="number"
                :rules="[val => val > 0 || 'Inserire una durata valida']"
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
              <q-toggle
                v-model="gameForm.disponibile"
                label="Disponibile"
              />

              <!-- Copertina -->
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

              <!-- Preview immagine -->
              <div v-if="imagePreview" class="q-mt-md">
                <img :src="imagePreview" style="max-width: 200px; max-height: 200px;">
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              type="submit"
              color="primary"
              label="Salva Gioco"
              :loading="loading"
            />
          </q-card-actions>
        </q-card>
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { supabase } from 'src/supabase'

export default {
  name: 'LoadNewGames',

  setup() {
    const $q = useQuasar()
    const loading = ref(false)
    const coverImage = ref(null)
    const imagePreview = ref(null)

    const gameForm = ref({
      nome: '',
      descrizione: '',
      giocatori_min: 1,
      giocatori_max: 2,
      durata_media: 30,
      difficolta: 'medio',
      disponibile: true,
      copertina: null
    })

    const handleImageSelected = (file) => {
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreview.value = e.target.result
        }
        reader.readAsDataURL(file)
      } else {
        imagePreview.value = null
      }
    }

    const submitGame = async () => {
      loading.value = true
      try {
        let fileName = null

        // Upload immagine se presente
        if (coverImage.value) {
          const fileExt = coverImage.value.name.split('.').pop()
          fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`

          // Carica l'immagine nel bucket 'Copertine_giochi'
          const { error: uploadError } = await supabase.storage
            .from('Copertine_giochi')
            .upload(fileName, coverImage.value)

          if (uploadError) throw uploadError
        }

        // Inserisci il gioco nel database con solo il nome del file
        const { error: insertError } = await supabase
          .from('giochi')
          .insert([{
            ...gameForm.value,
            copertina: fileName // Salva solo il nome del file
          }])

        if (insertError) throw insertError

        $q.notify({
          type: 'positive',
          message: 'Gioco aggiunto con successo!'
        })

        // Reset form
        gameForm.value = {
          nome: '',
          descrizione: '',
          giocatori_min: 1,
          giocatori_max: 2,
          durata_media: 30,
          difficolta: 'medio',
          disponibile: true,
          copertina: null
        }
        coverImage.value = null
        imagePreview.value = null

      } catch (error) {
        console.error('Errore:', error)
        $q.notify({
          type: 'negative',
          message: 'Errore durante il salvataggio del gioco'
        })
      } finally {
        loading.value = false
      }
    }

    return {
      gameForm,
      loading,
      coverImage,
      imagePreview,
      handleImageSelected,
      submitGame
    }
  }
}
</script>
