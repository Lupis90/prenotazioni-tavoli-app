<template>
  <div class="admin-dashboard">
    <h1>Dashboard Amministrativa</h1>

    <div class="row q-col-gutter-md">
      <section class="date-filter col-auto q-mb-lg">
        <q-date
          v-model="selectedDate"
          mask="YYYY-MM-DD"
          :options="isValidDate"
          emit-immediately
          @update:model-value="onDateSelected"
        />
      </section>

      <section v-if="selectedDate" class="total-people col-auto q-mb-lg">
        <q-card>
          <q-card-section>
            <div class="text-h6">
              Totale persone prenotate il {{ formatDate(selectedDate) }}:
              <strong>{{ totalPeopleForSelectedDate }}</strong>
            </div>
          </q-card-section>
        </q-card>
      </section>
    </div>

    <div class="row q-col-gutter-md">
      <section class="daily-bookings col q-mt-lg">
        <h2>Prenotazioni Giornaliere</h2>
        <q-table
          :rows="dailyBookings"
          :columns="dailyBookingsColumns"
          row-key="date"
          :loading="loading"
        >
          <template v-slot:body="props">
            <q-tr :props="props" :class="getRowClass(props.row)">
              <q-td key="date" :props="props">
                {{ formatDate(props.row.date) }}
              </q-td>
              <q-td key="totalBookings" :props="props">
                {{ props.row.totalBookings }}
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </section>
    </div>

    <section v-if="selectedDate" class="games-bookings q-mt-lg">
      <h2>Giochi Prenotati per {{ formatDate(selectedDate) }}</h2>
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
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { date } from 'quasar' // Importa date utilities da Quasar

export default {
  name: 'AdminDashboard',
  setup() {
    const selectedDate = ref('')
    const gamesWithBookings = ref([])
    const selectedGameId = ref(null)
    const totalPeopleForSelectedDate = ref(0)
    const loading = ref(false)

    // Prenotazioni giornaliere
    const dailyBookings = ref([])
    const dailyBookingsColumns = [
      { name: 'date', label: 'Data', field: 'date', align: 'left' },
      {
        name: 'totalBookings',
        label: 'Totale Prenotazioni',
        field: 'totalBookings',
        align: 'center',
      },
    ]

    const isValidDate = (date) => {
      const today = new Date()
      const selected = new Date(date)
      return selected >= today
    }

    // Funzione per formattare la data
    const formatDate = (dateStr) => {
      return date.formatDate(dateStr, 'DD/MM/YYYY') // Usa Quasar date utilities
    }

    const fetchDailyBookings = async () => {
      loading.value = true
      const { data, error } = await supabase
        .from('prenotazioni')
        .select('data_inizio, numero_persone', { count: 'exact' })
        .order('data_inizio', { ascending: false }) // Ordina per data

      if (error) {
        console.error('Errore nel recupero delle prenotazioni giornaliere:', error)
        loading.value = false
        return
      }

      const bookingsByDate = {}

      // Itera attraverso i dati e raggruppa per data
      data.forEach((booking) => {
        const dateOnly = booking.data_inizio.split('T')[0] // Estrai solo la data (YYYY-MM-DD)
        if (!bookingsByDate[dateOnly]) {
          bookingsByDate[dateOnly] = 0
        }
        bookingsByDate[dateOnly] += booking.numero_persone
      })

      // Trasforma l'oggetto in un array per la tabella
      dailyBookings.value = Object.entries(bookingsByDate).map(([date, totalBookings]) => ({
        date,
        totalBookings,
      }))
      loading.value = false
    }

    const fetchGameBookings = async (dateStr) => {
      loading.value = true // Mostra il loader
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
        loading.value = false // Nascondi il loader in caso di errore
        return
      }

      totalPeopleForSelectedDate.value = data.reduce(
        (acc, booking) => acc + booking.numero_persone,
        0,
      )

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
      loading.value = false // Nascondi il loader dopo aver caricato i dati
    }

    const onDateSelected = async (newDate) => {
      selectedDate.value = newDate
      selectedGameId.value = null
      // menu.value = false // Non più necessario
      await fetchGameBookings(newDate)
    }

    const selectGame = (gameId) => {
      selectedGameId.value = gameId === selectedGameId.value ? null : gameId
    }
    // Funzione per la formattazione condizionale delle righe
    const getRowClass = (row) => {
      const total = row.totalBookings
      if (total >= 0 && total <= 6) {
        return 'bg-green-2' // Verde chiaro
      } else if (total >= 7 && total <= 12) {
        return 'bg-yellow-2' // Giallo chiaro
      } else if (total >= 13 && total <= 16) {
        return 'bg-orange-2' //Arancione
      } else if (total > 16) {
        return 'bg-red-2' // Rosso chiaro
      }
      return '' // Nessuna classe aggiuntiva
    }

    onMounted(async () => {
      const today = new Date().toISOString().split('T')[0]
      selectedDate.value = today
      await fetchDailyBookings() // Carica le prenotazioni giornaliere
      await fetchGameBookings(today)
    })

    return {
      selectedDate,
      gamesWithBookings,
      selectedGameId,
      totalPeopleForSelectedDate,
      onDateSelected,
      selectGame,
      loading,
      dailyBookings, // Per la tabella
      dailyBookingsColumns, // Colonne della tabella
      formatDate, // Funzione per formattare
      isValidDate,
      getRowClass, // Aggiungi la funzione per le classi
    }
  },
}
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}

.date-filter {
  max-width: none; /* Rimuovi la larghezza massima per il calendario */
  width: 100%; /* Occupa l'intera larghezza disponibile */
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

.daily-bookings {
  /* Aggiunto stile per la tabella */
  width: 100%;
  /* max-width: 600px;  Rimuovi la larghezza massima */
  margin-top: 20px;
}
</style>
