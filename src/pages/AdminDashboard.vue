<template>
  <div class="admin-dashboard q-pa-md">
    <h1>Dashboard Amministrativa</h1>

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

        <q-card v-if="selectedDate" class="col-12 col-sm-6 col-md-4 col-lg-3 bg-primary-lighten-4">
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
import { date, useQuasar } from 'quasar'

export default {
  name: 'AdminDashboard',
  setup() {
    const $q = useQuasar();
    const selectedDate = ref('')
    const gamesWithBookings = ref([])
    const selectedGameId = ref(null)
    const totalPeopleForSelectedDate = ref(0)
    const loading = ref(false)
    const dailyBookings = ref([])
    const dailyBookingsColumns = [
      { name: 'date', label: 'Data', field: 'date', align: 'left' },
      { name: 'totalBookings', label: 'Totale Prenotazioni', field: 'totalBookings', align: 'center' },
    ]

    const isValidDate = (date) => {
      const today = new Date()
      const selected = new Date(date)
      return selected >= today
    }

    const formatDate = (dateStr) => {
      return date.formatDate(dateStr, 'DD/MM/YYYY')
    }

    const getRowClass = (row) => {
      const total = row.totalBookings
      if (total >= 0 && total <= 6) {
        return 'bg-green-2' // Verde chiaro
      } else if (total >= 7 && total <= 12) {
        return 'bg-yellow-2' // Giallo chiaro
      } else if (total >= 13 && total <= 16) {
        return 'bg-orange-2' // Arancione
      } else if (total > 16) {
        return 'bg-red-2' // Rosso chiaro
      }
      return '' // Nessuna classe aggiuntiva
    }


    const fetchDailyBookings = async () => {
      loading.value = true;
      try {
        const { data } = await supabase
          .from('prenotazioni')
          .select('data_inizio, numero_persone', { count: 'exact' })
          .order('data_inizio', { ascending: false });

        const bookingsByDate = {};
        data.forEach((booking) => {
          const dateOnly = booking.data_inizio.split('T')[0];
          if (!bookingsByDate[dateOnly]) {
            bookingsByDate[dateOnly] = 0;
          }
          bookingsByDate[dateOnly] += booking.numero_persone;
        });

        dailyBookings.value = Object.entries(bookingsByDate).map(([date, totalBookings]) => ({
          date,
          totalBookings,
        }));

      } catch {
            $q.notify({
                color: 'negative',
                message: 'Si è verificato un errore durante il caricamento dei dati.',
                icon: 'error'
            });
      } finally {
        loading.value = false;
      }
    };

    const fetchGameBookings = async (dateStr) => {
        loading.value = true
        try {
            const startOfDay = `${dateStr}T00:00:00`;
            const endOfDay = `${dateStr}T23:59:59`;

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
            );

            const gameBookings = {};

            for (const booking of data) {
                const gameId = booking.gioco_id;
                if (!gameBookings[gameId]) {
                    gameBookings[gameId] = {
                    id: gameId,
                    nome: booking.giochi.nome,
                    copertina: booking.giochi.copertina
                    ? supabase.storage.from('Copertine_giochi').getPublicUrl(booking.giochi.copertina).data.publicUrl
                    : 'default-game-cover.png',
                    slots: [],
                    };
                }

                const timeSlot = booking.data_inizio.split('T')[1].substring(0, 5);
                const existingSlot = gameBookings[gameId].slots.find((s) => s.time === timeSlot);

                if (existingSlot) {
                    existingSlot.persone += booking.numero_persone;
                } else {
                    gameBookings[gameId].slots.push({ time: timeSlot, persone: booking.numero_persone });
                }
            }

            for (const game of Object.values(gameBookings)) {
                 game.slots.sort((a, b) => a.time.localeCompare(b.time));
            }

            gamesWithBookings.value = Object.values(gameBookings);
        } catch {
            $q.notify({
                color: 'negative',
                message: "Si è verificato un errore nel caricamento dei giochi prenotati",
                icon: 'error'
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
    })

    return {
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
      getRowClass
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
