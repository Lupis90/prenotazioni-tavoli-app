<template>
  <div class="admin-dashboard">
    <h1>Dashboard Amministrativa</h1>

    <!-- Calendario per selezionare la data -->
    <section class="date-filter q-mb-lg">
      <div class="row items-center q-gutter-md">
        <q-input
          v-model="selectedDate"
          label="Seleziona data"
          readonly
          class="col-grow"
          input-class="text-subtitle1"
          :disable="loading"
        >
          <template v-slot:prepend>
            <q-icon name="event" color="primary" @click.stop="menu = true" class="cursor-pointer" />
          </template>
        </q-input>
        <q-menu v-model="menu" cover transition-show="scale" transition-hide="scale">
          <q-date v-model="selectedDate" mask="YYYY-MM-DD" @update:model-value="onDateSelected" />
        </q-menu>
      </div>
    </section>

    <!-- Totale persone prenotate per la data selezionata -->
    <section v-if="selectedDate" class="total-people q-mt-lg">
      <q-card>
        <q-card-section>
          <div class="text-h6">
            Totale persone prenotate il {{ selectedDate }}:
            <strong>{{ totalPeopleForSelectedDate }}</strong>
          </div>
        </q-card-section>
      </q-card>
    </section>

    <!-- Sezione Giochi Prenotati -->
    <section v-if="selectedDate" class="games-bookings q-mt-lg">
      <h2>Giochi Prenotati per {{ selectedDate }}</h2>
      <q-list bordered separator class="full-width">
        <template v-for="game in gamesWithBookings" :key="game.id">
          <q-expansion-item group="games" :class="{ 'bg-blue-1': selectedGameId === game.id }">
            <template v-slot:header>
              <q-item-section avatar>
                <q-img
                  :src="game.copertina"
                  alt="Copertina gioco"
                  style="width: 80px; height: 80px; object-fit: cover"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-h6">{{ game.nome }}</q-item-label>
                <q-item-label caption>
                  <div class="row q-gutter-sm q-mt-sm">
                    <q-chip
                      v-for="slot in game.slots"
                      :key="slot.time"
                      color="primary"
                      text-color="white"
                      size="sm"
                    >
                      {{ slot.time }} - {{ slot.persone }} persone
                    </q-chip>
                  </div>
                </q-item-label>
              </q-item-section>
            </template>

            <!-- Contenuto espanso -->
            <q-card>
              <q-card-section>
                <div class="text-h6">Dettaglio Prenotazioni</div>
                <q-list dense>
                  <q-item v-for="slot in game.slots" :key="slot.time">
                    <q-item-section>
                      <q-item-label>
                        <div class="row items-center justify-between">
                          <div class="text-weight-medium">Orario: {{ slot.time }}</div>
                          <div>
                            <q-icon name="people" size="sm" class="q-mr-xs" />
                            {{ slot.persone }} persone
                          </div>
                        </div>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </template>
      </q-list>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useQuasar } from 'quasar'

export default {
  name: 'AdminDashboard',
  setup() {
    const $q = useQuasar()
    const reservations = ref([])
    const selectedDate = ref('')
    const menu = ref(false)
    const gamesWithBookings = ref([])
    const selectedGameId = ref(null)
    const totalPeopleForSelectedDate = ref(0)
    const loading = ref(false)

    // Funzione per recuperare le prenotazioni della data selezionata
    const fetchGameBookings = async (dateStr) => {
      const startOfDay = `${dateStr}T00:00:00`
      const endOfDay = `${dateStr}T23:59:59`

      const { data, error } = await supabase
        .from('prenotazioni')
        .select(
          `id, numero_persone, data_inizio, gioco_id,
          giochi:gioco_id ( id, nome, copertina )`,
        )
        .gte('data_inizio', startOfDay)
        .lte('data_inizio', endOfDay)

      if (error) {
        console.error('Errore nel recupero delle prenotazioni:', error)
        return
      }

      // Calcola il totale delle persone prenotate in questa data
      totalPeopleForSelectedDate.value = data.reduce(
        (acc, booking) => acc + booking.numero_persone,
        0,
      )

      // Organizza le prenotazioni per gioco
      const gameBookings = {}
      for (const booking of data) {
        const gameId = booking.gioco_id
        if (!gameBookings[gameId]) {
          gameBookings[gameId] = {
            id: gameId,
            nome: booking.giochi.nome,
            copertina: booking.giochi.copertina
              ? supabase.storage.from('Copertine_giochi').getPublicUrl(booking.giochi.copertina)
                  .data.publicUrl
              : 'default-game-cover.png',
            slots: [],
          }
        }

        const timeSlot = booking.data_inizio.split('T')[1].substring(0, 5)
        const existingSlot = gameBookings[gameId].slots.find((s) => s.time === timeSlot)
        if (existingSlot) {
          existingSlot.persone += booking.numero_persone
        } else {
          gameBookings[gameId].slots.push({ time: timeSlot, persone: booking.numero_persone })
        }
      }

      for (const game of Object.values(gameBookings)) {
        game.slots.sort((a, b) => a.time.localeCompare(b.time))
      }

      gamesWithBookings.value = Object.values(gameBookings)
    }

    // Quando l'utente seleziona una nuova data dal calendario
    const onDateSelected = async (newDate) => {
      selectedDate.value = newDate
      selectedGameId.value = null
      menu.value = false // Chiude il menu del calendario
      await fetchGameBookings(newDate)
    }

    // Seleziona un gioco per visualizzare i dettagli
    const selectGame = (gameId) => {
      selectedGameId.value = gameId === selectedGameId.value ? null : gameId
    }

    onMounted(() => {
      selectedDate.value = new Date().toISOString().split('T')[0] // Imposta la data di oggi come default
      fetchGameBookings(selectedDate.value)
    })

    return {
      selectedDate,
      menu,
      gamesWithBookings,
      selectedGameId,
      totalPeopleForSelectedDate,
      onDateSelected,
      selectGame,
      loading,
    }
  },
}
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}

.date-filter {
  max-width: 300px;
}

.total-people q-card {
  background: #f5f5f5;
  text-align: center;
  padding: 10px;
}

.q-expansion-item {
  margin-bottom: 4px;
}

.q-expansion-item__content {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>
