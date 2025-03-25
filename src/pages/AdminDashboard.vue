<template>
  <div class="admin-dashboard q-pa-md">
    <h1>Dashboard Amministrativa</h1>

    <!-- Navigazione tra viste -->
    <div class="view-navigation q-mb-md">
      <q-tabs
        v-model="activeView"
        class="text-primary"
        dense
        indicator-color="primary"
        align="justify"
      >
        <q-tab name="calendar" icon="calendar_month" label="Calendario" />
        <q-tab name="daily" icon="today" label="Giornaliera" />
        <q-tab name="stats" icon="bar_chart" label="Statistiche" />
      </q-tabs>
    </div>

    <!-- Vista Calendario -->
    <div v-if="activeView === 'calendar'">
      <div class="row justify-between items-center q-mb-md">
        <h2 class="text-h5 q-my-none">Calendario Prenotazioni</h2>
        <div class="calendar-navigation">
          <q-btn flat round icon="chevron_left" @click="previousMonth" />
          <span class="text-h6 q-mx-md">{{ currentMonthName }} {{ currentYear }}</span>
          <q-btn flat round icon="chevron_right" @click="nextMonth" />
          <q-btn flat dense class="q-ml-sm" icon="today" label="Oggi" @click="goToToday" />
        </div>
      </div>

      <!-- Legenda -->
      <div class="row q-mb-sm justify-end">
        <div class="legend-item">
          <div class="color-box bg-green-2"></div>
          <span>0-6 persone</span>
        </div>
        <div class="legend-item">
          <div class="color-box bg-yellow-2"></div>
          <span>7-12 persone</span>
        </div>
        <div class="legend-item">
          <div class="color-box bg-orange-2"></div>
          <span>13-16 persone</span>
        </div>
        <div class="legend-item">
          <div class="color-box bg-red-2"></div>
          <span>>16 persone</span>
        </div>
      </div>

      <!-- Calendario Mensile -->
      <q-card flat bordered>
        <q-card-section class="q-pa-none">
          <div class="calendar-grid">
            <!-- Intestazione giorni della settimana -->
            <div class="calendar-header">
              <div v-for="day in daysOfWeek" :key="day" class="calendar-day-name">
                {{ day }}
              </div>
            </div>

            <!-- Griglia dei giorni -->
            <div class="calendar-body">
              <div
                v-for="(dayObj, index) in calendarDays"
                :key="index"
                class="calendar-day"
                :class="[
                  { 'other-month': !dayObj.currentMonth },
                  { today: isToday(dayObj.date) },
                  { selected: isSelected(dayObj.date) },
                  getBookingClass(dayObj.bookings),
                ]"
                @click="selectDate(dayObj.date)"
              >
                <div class="calendar-day-number">{{ dayObj.day }}</div>
                <div v-if="dayObj.bookings > 0" class="calendar-day-bookings">
                  <q-badge color="primary" text-color="white">
                    {{ dayObj.bookings }}
                  </q-badge>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Dettaglio giorno selezionato -->
      <q-card v-if="selectedDate" class="q-mt-md">
        <q-card-section class="row items-center">
          <div class="col-12 col-md-6">
            <h3 class="text-h5 q-my-none">Dettaglio {{ formatDate(selectedDate) }}</h3>
          </div>
          <div class="col-12 col-md-6 text-right">
            <q-chip icon="people" color="primary" text-color="white">
              Totale: {{ totalPeopleForSelectedDate }} persone
            </q-chip>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Vista Giornaliera (componente esistente) -->
    <div v-if="activeView === 'daily'">
      <q-card>
        <q-card-section class="row q-col-gutter-md items-center">
          <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <q-label class="text-h6">Seleziona una data:</q-label>
            <q-date
              v-model="selectedDate"
              mask="YYYY-MM-DD"
              :options="isValidDate"
              emit-immediately
              @update:model-value="onDateSelected"
            />
          </div>

          <q-card
            v-if="selectedDate"
            class="col-12 col-sm-6 col-md-4 col-lg-3 bg-primary-lighten-4"
          >
            <q-card-section>
              <div class="text-center">
                <q-icon name="people" size="lg" color="primary" />
                <div class="text-h4 q-mt-sm">
                  Totale persone prenotate il {{ formatDate(selectedDate) }}:
                  <strong class="text-primary">{{ totalPeopleForSelectedDate }}</strong>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-card-section>
      </q-card>

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
    </div>

    <!-- Vista Statistiche (nuova) -->
    <div v-if="activeView === 'stats'">
      <h2>Statistiche delle Prenotazioni</h2>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <h3 class="text-h6">Prenotazioni per Giorno della Settimana</h3>
              <!-- Qui inserire il grafico -->
              <div class="stats-placeholder q-pa-lg text-center">
                Grafico di distribuzione delle prenotazioni per giorno della settimana
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <h3 class="text-h6">Giochi Più Prenotati</h3>
              <!-- Qui inserire il grafico -->
              <div class="stats-placeholder q-pa-lg text-center">
                Grafico dei giochi più prenotati
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Sezione giochi prenotati per data selezionata -->
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
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import { date, useQuasar } from 'quasar'

export default {
  name: 'AdminDashboard',
  setup() {
    const $q = useQuasar()

    // Gestione viste
    const activeView = ref('calendar')

    // Dati condivisi tra le viste
    const selectedDate = ref('')
    const gamesWithBookings = ref([])
    const selectedGameId = ref(null)
    const totalPeopleForSelectedDate = ref(0)
    const loading = ref(false)
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

    // Dati per il calendario
    const currentDate = ref(new Date())
    const calendarData = ref({}) // Mappa data -> numero prenotazioni

    // Giorni della settimana per l'intestazione del calendario
    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']

    // Calcola l'anno e il mese corrente per la visualizzazione
    const currentYear = computed(() => currentDate.value.getFullYear())
    const currentMonth = computed(() => currentDate.value.getMonth())
    const currentMonthName = computed(() => {
      const months = [
        'Gennaio',
        'Febbraio',
        'Marzo',
        'Aprile',
        'Maggio',
        'Giugno',
        'Luglio',
        'Agosto',
        'Settembre',
        'Ottobre',
        'Novembre',
        'Dicembre',
      ]
      return months[currentMonth.value]
    })

    // Calcola i giorni da visualizzare nel calendario
    const calendarDays = computed(() => {
      const year = currentYear.value
      const month = currentMonth.value

      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      const daysInMonth = lastDay.getDate()
      const firstDayOfWeek = firstDay.getDay() // 0 = domenica, 6 = sabato

      const days = []

      // Giorni del mese precedente
      const prevMonth = new Date(year, month, 0)
      const daysInPrevMonth = prevMonth.getDate()

      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i
        const dateObj = new Date(year, month - 1, day)
        const dateStr = formatDateForDB(dateObj)

        days.push({
          day: day,
          date: dateStr,
          currentMonth: false,
          bookings: calendarData.value[dateStr] || 0,
        })
      }

      // Giorni del mese corrente
      for (let i = 1; i <= daysInMonth; i++) {
        const dateObj = new Date(year, month, i)
        const dateStr = formatDateForDB(dateObj)

        days.push({
          day: i,
          date: dateStr,
          currentMonth: true,
          bookings: calendarData.value[dateStr] || 0,
        })
      }

      // Giorni del mese successivo per completare la griglia (6 righe * 7 colonne = 42 celle)
      const remainingCells = 42 - days.length
      for (let i = 1; i <= remainingCells; i++) {
        const dateObj = new Date(year, month + 1, i)
        const dateStr = formatDateForDB(dateObj)

        days.push({
          day: i,
          date: dateStr,
          currentMonth: false,
          bookings: calendarData.value[dateStr] || 0,
        })
      }

      return days
    })

    // Navigazione calendario
    const previousMonth = () => {
      currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
      fetchCalendarData()
    }

    const nextMonth = () => {
      currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
      fetchCalendarData()
    }

    const goToToday = () => {
      currentDate.value = new Date()
      fetchCalendarData()

      const today = formatDateForDB(new Date())
      if (today !== selectedDate.value) {
        selectedDate.value = today
        onDateSelected(today)
      }
    }

    // Formattazione delle date
    const formatDateForDB = (dateObj) => {
      const year = dateObj.getFullYear()
      const month = String(dateObj.getMonth() + 1).padStart(2, '0')
      const day = String(dateObj.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const formatDate = (dateStr) => {
      return date.formatDate(dateStr, 'DD/MM/YYYY')
    }

    const isToday = (dateStr) => {
      const today = formatDateForDB(new Date())
      return dateStr === today
    }

    const isSelected = (dateStr) => {
      return dateStr === selectedDate.value
    }

    const selectDate = (dateStr) => {
      selectedDate.value = dateStr
      onDateSelected(dateStr)
    }

    // Determina le classi di stile basate sul numero di prenotazioni
    const getBookingClass = (totalBookings) => {
      if (totalBookings === 0) return ''
      if (totalBookings >= 1 && totalBookings <= 6) {
        return 'bg-green-2'
      } else if (totalBookings >= 7 && totalBookings <= 12) {
        return 'bg-yellow-2'
      } else if (totalBookings >= 13 && totalBookings <= 16) {
        return 'bg-orange-2'
      } else if (totalBookings > 16) {
        return 'bg-red-2'
      }
      return ''
    }

    // Gli stessi metodi esistenti
    const getRowClass = (row) => {
      const total = row.totalBookings
      if (total >= 0 && total <= 6) {
        return 'bg-green-2'
      } else if (total >= 7 && total <= 12) {
        return 'bg-yellow-2'
      } else if (total >= 13 && total <= 16) {
        return 'bg-orange-2'
      } else if (total > 16) {
        return 'bg-red-2'
      }
      return ''
    }

    const isValidDate = (date) => {
      const today = new Date()
      const selected = new Date(date)
      return selected >= today
    }

    const fetchCalendarData = async () => {
      loading.value = true
      try {
        // Ottieni il primo e l'ultimo giorno del mese corrente visualizzato
        const year = currentYear.value
        const month = currentMonth.value
        

        // Query con range di date più ampio per includere giorni prima e dopo il mese corrente
        const prevMonth = new Date(year, month - 1, 1)
        const nextMonth = new Date(year, month + 2, 0)

        const rangeStart = formatDateForDB(prevMonth)
        const rangeEnd = formatDateForDB(nextMonth)

        // Carica tutti i dati per il range di date
        const { data } = await supabase
          .from('prenotazioni')
          .select('data_inizio, numero_persone')
          .gte('data_inizio', `${rangeStart}T00:00:00`)
          .lte('data_inizio', `${rangeEnd}T23:59:59`)

        // Organizza i dati per data
        const bookingsByDate = {}

        data.forEach((booking) => {
          const dateOnly = booking.data_inizio.split('T')[0]
          if (!bookingsByDate[dateOnly]) {
            bookingsByDate[dateOnly] = 0
          }
          bookingsByDate[dateOnly] += booking.numero_persone
        })

        calendarData.value = bookingsByDate
      } catch (err) {
        $q.notify({
          color: 'negative',
          message: 'Si è verificato un errore durante il caricamento dei dati del calendario.',
          caption: `Errore: ${err.message}`,
        })
      } finally {
        loading.value = false
      }
    }

    const fetchDailyBookings = async () => {
      loading.value = true
      try {
        const { data } = await supabase
          .from('prenotazioni')
          .select('data_inizio, numero_persone', { count: 'exact' })
          .order('data_inizio', { ascending: false })

        const bookingsByDate = {}
        data.forEach((booking) => {
          const dateOnly = booking.data_inizio.split('T')[0]
          if (!bookingsByDate[dateOnly]) {
            bookingsByDate[dateOnly] = 0
          }
          bookingsByDate[dateOnly] += booking.numero_persone
        })

        dailyBookings.value = Object.entries(bookingsByDate).map(([date, totalBookings]) => ({
          date,
          totalBookings,
        }))

        // Aggiorna anche i dati del calendario
        calendarData.value = bookingsByDate
      } catch (err) {
        $q.notify({
          color: 'negative',
          message: 'Si è verificato un errore durante il caricamento dei dati.',
          caption: `Errore: ${err.message}`,
        })
      } finally {
        loading.value = false
      }
    }

    const fetchGameBookings = async (dateStr) => {
      loading.value = true
      try {
        const startOfDay = `${dateStr}T00:00:00`
        const endOfDay = `${dateStr}T23:59:59`

        const { data } = await supabase
          .from('prenotazioni')
          .select(
            `id, numero_persone, data_inizio, gioco_id,
            giochi:gioco_id ( id, nome, copertina )`,
          )
          .gte('data_inizio', startOfDay)
          .lte('data_inizio', endOfDay)

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
      } catch (err) {
        $q.notify({
          color: 'negative',
          message: 'Si è verificato un errore nel caricamento dei giochi prenotati',
          caption: `Errore: ${err.message}`,
        })
      } finally {
        loading.value = false
      }
    }

    const onDateSelected = async (newDate) => {
      selectedDate.value = newDate
      selectedGameId.value = null
      await fetchGameBookings(newDate)
    }

    onMounted(async () => {
      const today = new Date().toISOString().split('T')[0]
      selectedDate.value = today
      await fetchDailyBookings()
      await fetchGameBookings(today)
      await fetchCalendarData()
    })

    return {
      // Proprietà condivise
      selectedDate,
      gamesWithBookings,
      selectedGameId,
      totalPeopleForSelectedDate,
      onDateSelected,
      loading,
      dailyBookings,
      dailyBookingsColumns,
      formatDate,
      isValidDate,
      getRowClass,

      // Proprietà per la navigazione tra viste
      activeView,

      // Proprietà per il calendario
      daysOfWeek,
      currentYear,
      currentMonth,
      currentMonthName,
      calendarDays,
      previousMonth,
      nextMonth,
      goToToday,
      isToday,
      isSelected,
      selectDate,
      getBookingClass,
    }
  },
}
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}

/* Stili per il calendario */
.calendar-grid {
  display: flex;
  flex-direction: column;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.calendar-day-name {
  padding: 10px;
  text-align: center;
  font-weight: bold;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(80px, auto);
}

.calendar-day {
  position: relative;
  border: 1px solid #e0e0e0;
  padding: 5px;
  min-height: 80px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.calendar-day:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.calendar-day.other-month {
  color: #bdbdbd;
  background-color: #fafafa;
}

.calendar-day.today {
  border: 2px solid #1976d2;
}

.calendar-day.selected {
  background-color: rgba(25, 118, 210, 0.1);
}

.calendar-day-number {
  font-weight: 500;
  margin-bottom: 5px;
}

.calendar-day-bookings {
  position: absolute;
  bottom: 5px;
  right: 5px;
}

/* Legenda */
.legend-item {
  display: flex;
  align-items: center;
  margin-left: 20px;
}

.color-box {
  width: 20px;
  height: 20px;
  margin-right: 5px;
  border: 1px solid #e0e0e0;
}

/* Placeholder per grafici nella sezione statistiche */
.stats-placeholder {
  height: 200px;
  background-color: #f5f5f5;
  border: 1px dashed #bdbdbd;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Stili esistenti */
.date-filter {
  max-width: none;
  width: 100%;
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
  width: 100%;
  margin-top: 20px;
}
</style>
