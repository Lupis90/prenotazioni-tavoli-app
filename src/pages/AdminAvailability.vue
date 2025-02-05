<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="text-h4 q-mb-md">Gestione Disponibilità</div>

      <!-- Calendario con slot day personalizzato -->
      <q-date
        v-model="selectedDate"
        today-btn
        class="q-mb-md"
        @input="onDateSelected"
      >
        <!-- Slot per personalizzare il rendering di ogni giorno -->
        <template v-slot:day="props">
          <div
            :class="[
              'q-date__day',
              props.outside ? 'q-date__day--outside' : '',
              props.selected ? 'q-date__day--selected' : '',
              isAvailable(props.date) ? 'text-green' : 'text-black'
            ]"
          >
            {{ props.day }}
          </div>
        </template>
      </q-date>

      <!-- Form per la data selezionata -->
      <div v-if="selectedDate" class="q-mt-lg">
        <q-card>
          <q-card-section>
            <div class="text-h6">
              Disponibilità per il <strong>{{ formatDate(selectedDate) }}</strong>
            </div>
            <q-input
              v-model="timeRange.start"
              label="Dalle ore:"
              type="time"
              outlined
              class="q-mt-md"
            />
            <q-input
              v-model="timeRange.end"
              label="Alle ore:"
              type="time"
              outlined
              class="q-mt-md"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              label="Aggiungi Disponibilità"
              color="primary"
              @click="updateAvailability"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Lista delle disponibilità attuali -->
      <div class="q-mt-lg">
        <div class="text-h6">Disponibilità attuali</div>
        <q-list bordered>
          <q-item v-for="item in availabilityDates" :key="item.id">
            <q-item-section>
              {{ item.data }}: dalle {{ item.orario_inizio }} alle {{ item.orario_fine }}
            </q-item-section>
            <q-item-section side>
              <q-btn flat icon="delete" color="negative" @click="deleteAvailability(item)" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { supabase } from 'src/supabase'
import { useQuasar, date } from 'quasar'

export default {
  name: 'AdminAvailability',
  setup() {
    const $q = useQuasar()
    const selectedDate = ref(null)
    const timeRange = ref({
      start: '',
      end: ''
    })
    const availabilityDates = ref([])

    // Formatto la data per la visualizzazione (es. 14/02/2025)
    const formatDate = (dateStr) => date.formatDate(dateStr, 'DD/MM/YYYY')

    // Carica le disponibilità dal database
    const loadAvailability = async () => {
      const { data, error } = await supabase.from('booking_availability').select('*')
      if (error) {
        console.error(error)
        $q.notify({ type: 'negative', message: 'Errore nel caricamento delle disponibilità' })
      } else {
        availabilityDates.value = data || []
      }
    }

    // Computed per ottenere un array di date disponibili (in formato YYYY-MM-DD)
    const availableDates = computed(() =>
      availabilityDates.value.map(item => item.data)
    )

    // Funzione per verificare se una data è disponibile
    const isAvailable = (dateStr) => availableDates.value.includes(dateStr)

    // Quando viene selezionata una data, carica i relativi orari se esistono
    const onDateSelected = (value) => {
      selectedDate.value = value
      const existing = availabilityDates.value.find(item => item.data === value)
      if (existing) {
        timeRange.value.start = existing.orario_inizio
        timeRange.value.end = existing.orario_fine
      } else {
        timeRange.value.start = ''
        timeRange.value.end = ''
      }
    }

    // Aggiorna (o inserisce) la disponibilità nel database
    const updateAvailability = async () => {
      if (!selectedDate.value || !timeRange.value.start || !timeRange.value.end) {
        $q.notify({ type: 'warning', message: 'Completa tutti i campi orari' })
        return
      }
      if (timeRange.value.start >= timeRange.value.end) {
        $q.notify({
          type: 'warning',
          message: "L'orario di inizio deve essere inferiore a quello di fine"
        })
        return
      }

      const existing = availabilityDates.value.find(item => item.data === selectedDate.value)
      if (existing) {
        // Aggiornamento del record esistente
        const { error } = await supabase
          .from('booking_availability')
          .update({
            orario_inizio: timeRange.value.start,
            orario_fine: timeRange.value.end
          })
          .eq('id', existing.id)
        if (error) {
          $q.notify({ type: 'negative', message: "Errore durante l'aggiornamento" })
          console.error(error)
          return
        }
        $q.notify({ type: 'positive', message: 'Disponibilità aggiornata!' })
      } else {
        // Inserimento di un nuovo record
        const { error } = await supabase
          .from('booking_availability')
          .insert([{
            data: selectedDate.value,
            orario_inizio: timeRange.value.start,
            orario_fine: timeRange.value.end
          }])
        if (error) {
          $q.notify({ type: 'negative', message: "Errore durante l'inserimento" })
          console.error(error)
          return
        }
        $q.notify({ type: 'positive', message: 'Disponibilità aggiunta!' })
      }

      // Ricarica le disponibilità e resetta il form
      await loadAvailability()
      selectedDate.value = null
      timeRange.value.start = ''
      timeRange.value.end = ''
    }

    // Funzione per cancellare una disponibilità esistente
    const deleteAvailability = async (item) => {
      const { error } = await supabase.from('booking_availability').delete().eq('id', item.id)
      if (error) {
        $q.notify({ type: 'negative', message: 'Errore durante la cancellazione' })
        console.error(error)
      } else {
        $q.notify({ type: 'positive', message: 'Disponibilità cancellata!' })
        await loadAvailability()
      }
    }

    onMounted(() => {
      loadAvailability()
    })

    return {
      selectedDate,
      timeRange,
      availabilityDates,
      formatDate,
      updateAvailability,
      deleteAvailability,
      availableDates,
      isAvailable,
      onDateSelected
    }
  }
}
</script>

<style scoped>
/* Puoi personalizzare ulteriormente gli stili */
/* Assicurati che le classi text-green e text-black siano definite, ad esempio: */
.text-green {
  color: green !important;
}
.text-black {
  color: black !important;
}
</style>
