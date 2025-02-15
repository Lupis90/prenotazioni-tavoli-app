<template>
  <div class="admin-dashboard">
    <h1>Dashboard Amministrativa</h1>

    <!-- Calendario per filtrare -->
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
          <q-date
            v-model="selectedDate"
            :options="isDateAvailable"
            mask="YYYY-MM-DD"
            @update:model-value="onDateSelected"
          />
        </q-menu>
      </div>
    </section>

    <!-- Sezione Giochi Prenotati -->
    <section v-if="selectedDate" class="games-bookings q-mt-lg">
      <h2>Giochi Prenotati per {{ selectedDate }}</h2>
      <div class="row q-col-gutter-md">
        <div v-for="game in gamesWithBookings" :key="game.id" class="col-12 col-md-6 col-lg-4">
          <q-card
            class="game-card cursor-pointer"
            :class="{ selected: selectedGameId === game.id }"
            @click="selectGame(game.id)"
          >
            <q-img :src="game.copertina" :ratio="16 / 9">
              <div class="absolute-bottom text-subtitle2 text-center bg-black-6">
                {{ game.nome }}
              </div>
            </q-img>
            <q-card-section>
              <div class="text-h6">Prenotazioni</div>
              <div class="q-gutter-sm">
                <q-chip
                  v-for="slot in game.slots"
                  :key="slot.time"
                  color="primary"
                  text-color="white"
                >
                  {{ slot.time }} - {{ slot.persone }} persone
                </q-chip>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </section>

    <!-- Lista Prenotazioni -->
    <section v-if="selectedGameBookings.length" class="reservations q-mt-xl">
      <h2>Dettagli Prenotazioni per {{ selectedGameName }}</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Data Inizio</th>
            <th>Nome Cliente</th>
            <th>Email Cliente</th>
            <th>Numero Persone</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reservation in selectedGameBookings" :key="reservation.id">
            <td>{{ reservation.id }}</td>
            <td>{{ formatDateTime(reservation.data_inizio) }}</td>
            <td>
              <div v-if="editingReservation?.id === reservation.id">
                <q-input v-model="editingReservation.nome_cliente" dense outlined />
              </div>
              <div v-else>{{ reservation.nome_cliente }}</div>
            </td>
            <td>
              <div v-if="editingReservation?.id === reservation.id">
                <q-input v-model="editingReservation.email_cliente" dense outlined type="email" />
              </div>
              <div v-else>{{ reservation.email_cliente }}</div>
            </td>
            <td>
              <div v-if="editingReservation?.id === reservation.id">
                <q-input
                  v-model.number="editingReservation.numero_persone"
                  dense
                  outlined
                  type="number"
                />
              </div>
              <div v-else>{{ reservation.numero_persone }}</div>
            </td>
            <td>
              <div v-if="editingReservation?.id === reservation.id">
                <q-btn flat color="positive" icon="check" @click="saveReservation">Salva</q-btn>
                <q-btn flat color="negative" icon="close" @click="cancelEdit">Annulla</q-btn>
              </div>
              <div v-else>
                <q-btn flat color="primary" icon="edit" @click="startEdit(reservation)"
                  >Modifica</q-btn
                >
                <q-btn flat color="negative" icon="delete" @click="confirmDelete(reservation)"
                  >Cancella</q-btn
                >
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Dialog di conferma eliminazione -->
    <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">Conferma eliminazione</div>
        </q-card-section>

        <q-card-section> Sei sicuro di voler eliminare questa prenotazione? </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" color="primary" v-close-popup />
          <q-btn flat label="Elimina" color="negative" @click="deleteReservation" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
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
    const editingReservation = ref(null)
    const showDeleteDialog = ref(false)
    const reservationToDelete = ref(null)
    const availableDates = ref([])
    const loading = ref(false)

    // Computed property per ottenere le prenotazioni del gioco selezionato
    const selectedGameBookings = computed(() => {
      if (!selectedGameId.value) return []
      return reservations.value.filter(
        (r) =>
          r.gioco_id === selectedGameId.value && r.data_inizio.split('T')[0] === selectedDate.value,
      )
    })

    const selectedGameName = computed(() => {
      const game = gamesWithBookings.value.find((g) => g.id === selectedGameId.value)
      return game ? game.nome : ''
    })

    const fetchReservations = async () => {
      let { data, error } = await supabase.from('prenotazioni').select('*, giochi:gioco_id(nome)')
      if (error) {
        console.error('Error fetching prenotazioni:', error)
      } else {
        reservations.value = data
      }
    }

    const fetchGameBookings = async (dateStr) => {
      const startOfDay = `${dateStr}T00:00:00`
      const endOfDay = `${dateStr}T23:59:59`

      const { data, error } = await supabase
        .from('prenotazioni')
        .select(
          `
          *,
          giochi:gioco_id (
            id,
            nome,
            copertina
          )
        `,
        )
        .gte('data_inizio', startOfDay)
        .lte('data_inizio', endOfDay)

      if (error) {
        console.error('Error fetching game bookings:', error)
        return
      }

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
          gameBookings[gameId].slots.push({
            time: timeSlot,
            persone: booking.numero_persone,
          })
        }
      }

      for (const game of Object.values(gameBookings)) {
        game.slots.sort((a, b) => a.time.localeCompare(b.time))
      }

      gamesWithBookings.value = Object.values(gameBookings)
    }

    const selectGame = (gameId) => {
      selectedGameId.value = gameId === selectedGameId.value ? null : gameId
    }

    const startEdit = (reservation) => {
      editingReservation.value = { ...reservation }
    }

    const cancelEdit = () => {
      editingReservation.value = null
    }

    const saveReservation = async () => {
      try {
        const { error } = await supabase
          .from('prenotazioni')
          .update({
            nome_cliente: editingReservation.value.nome_cliente,
            email_cliente: editingReservation.value.email_cliente,
            numero_persone: editingReservation.value.numero_persone,
          })
          .eq('id', editingReservation.value.id)

        if (error) throw error

        // Aggiorna i dati
        await fetchReservations()
        await fetchGameBookings(selectedDate.value)

        editingReservation.value = null
        $q.notify({
          type: 'positive',
          message: 'Prenotazione aggiornata con successo',
        })
      } catch (error) {
        console.error('Error updating reservation:', error)
        $q.notify({
          type: 'negative',
          message: "Errore durante l'aggiornamento della prenotazione",
        })
      }
    }

    const confirmDelete = (reservation) => {
      reservationToDelete.value = reservation
      showDeleteDialog.value = true
    }

    const deleteReservation = async () => {
      try {
        const { error } = await supabase
          .from('prenotazioni')
          .delete()
          .eq('id', reservationToDelete.value.id)

        if (error) throw error

        // Aggiorna i dati
        await fetchReservations()
        await fetchGameBookings(selectedDate.value)

        $q.notify({
          type: 'positive',
          message: 'Prenotazione eliminata con successo',
        })
      } catch (error) {
        console.error('Error deleting reservation:', error)
        $q.notify({
          type: 'negative',
          message: "Errore durante l'eliminazione della prenotazione",
        })
      }
    }

    const loadAvailableDatesAndTimes = async () => {
      loading.value = true
      const { data, error } = await supabase.from('booking_availability').select('*')
      if (error) {
        console.error(error)
        $q.notify({
          type: 'negative',
          message: 'Errore nel caricamento delle disponibilità',
        })
        return
      }
      console.log('Loaded availability data:', data)
      availableDates.value = data || []
      loading.value = false
    }

    const isDateAvailable = (dateStr) => {
      if (!dateStr || !availableDates.value.length) return false
      const normalizedDate = dateStr.replace(/\//g, '-')
      console.log(
        `Checking date ${normalizedDate}, database dates:`,
        availableDates.value.map((d) => d.data),
      )
      const found = availableDates.value.some((d) => d.data === normalizedDate)
      console.log(`Date ${normalizedDate} available: ${found}`)
      return found
    }

    const onDateSelected = async (newDate) => {
      selectedDate.value = newDate
      selectedGameId.value = null
      menu.value = false // Chiude il menu del calendario
      await fetchGameBookings(newDate)
    }

    const formatDateTime = (dateTime) => {
      const date = new Date(dateTime)
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
    }

    onMounted(() => {
      loadAvailableDatesAndTimes()
      fetchReservations()
    })

    return {
      reservations,
      selectedDate,
      menu,
      gamesWithBookings,
      selectedGameId,
      selectedGameBookings,
      selectedGameName,
      editingReservation,
      showDeleteDialog,
      onDateSelected,
      selectGame,
      startEdit,
      cancelEdit,
      saveReservation,
      confirmDelete,
      deleteReservation,
      formatDateTime,
      isDateAvailable,
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

.game-card {
  height: 100%;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.game-card.selected {
  border-color: var(--q-primary);
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.game-card:hover {
  transform: translateY(-4px);
}

.game-card .q-chip {
  font-size: 0.9em;
  align-items: center;
  display: flex;
  min-height: 32px;
}

.reservations td > div {
  text-align: left;
  padding: 8px;
  border: 1px solid #ccc;
}

.reservations td,
.reservations th {
  margin-bottom: 20px;
}

.reservations table {
  border-collapse: collapse;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
