<template>
  <q-page padding class="bg-grey-1">
    <!-- Hero Section -->
    <div class="text-center q-mb-xl">
      <h2 class="text-gradient">Prenota il tuo gioco</h2>
      <img
  src="/images/separator.svg"
  alt="Decorative separator"
  class="q-mt-md separator-image"
  style="width: 640px; height: 96px;"
/>
    </div>

    <!-- Date Selection Card -->
    <div class="date-selector q-pa-md q-mb-lg shadow-3">
      <div class="row items-center q-gutter-md">
        <q-input
          filled
          v-model="selectedDate"
          type="date"
          label="Seleziona data"
          class="col-grow"
          input-class="text-subtitle1"
        >
          <template v-slot:prepend>
            <q-icon name="event" color="primary" />
          </template>
        </q-input>
        <q-btn
          color="primary"
          label="Mostra disponibilità"
          @click="loadAvailability"
          icon="search"
          class="q-px-xl"
          unelevated
          rounded
        />
      </div>
    </div>

    <!-- Search and Filter Section - Mostra solo dopo aver caricato i giochi -->
    <div v-if="availableSlots.length" class="q-mb-md">
      <div class="row q-col-gutter-md items-center">
        <!-- Search Bar -->
        <div class="col-grow">
          <q-input
            v-model="searchQuery"
            dense
            outlined
            placeholder="Cerca gioco..."
            class="search-input"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- Filter Button -->
        <div class="col-auto">
          <q-btn-dropdown
            dense
            color="primary"
            icon="filter_list"
            label="Filtri"
          >
            <q-card style="min-width: 300px">
              <q-card-section>
                <!-- Players Filter -->
                <div class="q-mb-md">
                  <div class="text-subtitle2 q-mb-sm">Numero giocatori</div>
                  <div class="row q-gutter-sm">
                    <q-input
                      v-model.number="filters.minPlayers"
                      type="number"
                      label="Min"
                      dense
                      outlined
                      style="width: 100px"
                    />
                    <q-input
                      v-model.number="filters.maxPlayers"
                      type="number"
                      label="Max"
                      dense
                      outlined
                      style="width: 100px"
                    />
                  </div>
                </div>

                <!-- Difficulty Filter -->
                <div>
                  <div class="text-subtitle2 q-mb-sm">Difficoltà</div>
                  <q-option-group
                    v-model="filters.difficulty"
                    :options="[
                      { label: 'Facile', value: 'facile' },
                      { label: 'Medio', value: 'medio' },
                      { label: 'Difficile', value: 'difficile' }
                    ]"
                    type="checkbox"
                    dense
                  />
                </div>
              </q-card-section>

              <q-card-actions align="right" class="q-pa-sm">
                <q-btn flat label="Reset" color="grey" @click="resetFilters" />
              </q-card-actions>
            </q-card>
          </q-btn-dropdown>
        </div>
      </div>
    </div>

    <!-- Game Grid -->
    <div v-if="filteredGames.length" class="row q-col-gutter-xl q-mt-lg">
      <div
        v-for="game in filteredGames"
        :key="game.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card class="game-card shadow-6">
          <q-img
            :src="game.copertina"
            :ratio="16/9"
            class="game-image"
          >
            <div class="absolute-bottom image-overlay">
              <div class="text-h5 text-white">{{ game.nome }}</div>
              <div class="text-caption text-grey-3">
                {{ game.giocatori_min }}-{{ game.giocatori_max }} giocatori
              </div>
            </div>
          </q-img>

          <q-card-section class="time-slots-section">
            <div class="row q-gutter-sm justify-center">
              <q-btn
                v-for="slot in timeSlots"
                :key="slot"
                :label="getSlotLabel(game, slot)"
                :color="getSlotColor(game, slot)"
                :disable="getSlotInfo(game, slot).postiLiberi <= 0"
                @click="openBookingDialog(game, slot)"
                rounded
                outline
                class="slot-button"
                size="sm"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center q-pa-xl">
      <q-icon name="sports_esports" size="xl" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">
        Seleziona una data per vedere le disponibilità
      </div>
    </div>

    <!-- Booking Dialog -->
    <q-dialog v-model="showDialog">
  <q-card class="booking-dialog" style="width: 600px; max-width: 90vw;">
    <div class="dialog-header bg-primary text-white">
      <q-card-section class="q-pa-md">
        <div class="text-h5">Conferma prenotazione</div>
      </q-card-section>
    </div>

    <q-card-section class="q-pt-md">
      <div class="text-center q-mb-md">
        <div class="text-h6 text-primary">{{ selectedGame?.nome }}</div>
        <q-chip color="accent" text-color="white" class="q-mt-xs" size="sm">
          {{ selectedSlot }} • {{ selectedSlotInfo?.postiLiberi }} posti rimasti
        </q-chip>
      </div>

      <div class="q-gutter-y-md">
        <q-input
          filled
          v-model.number="peopleCount"
          type="number"
          label="Numero di persone"
          :rules="[val => validatePeopleCount(val)]"
          color="primary"
          dense
        >
          <template v-slot:prepend>
            <q-icon name="people" />
          </template>
        </q-input>

        <q-input
          filled
          v-model="nomeCliente"
          label="Nome completo"
          color="primary"
          dense
        >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <q-input
          filled
          v-model="emailCliente"
          type="email"
          label="Email"
          color="primary"
          dense
        >
          <template v-slot:prepend>
            <q-icon name="email" />
          </template>
        </q-input>
      </div>
    </q-card-section>

    <q-card-actions align="right" class="q-pa-md">
      <q-btn
        flat
        label="Annulla"
        color="grey"
        v-close-popup
        class="q-mr-sm"
      />
      <q-btn
        label="Prenota"
        color="primary"
        @click="confirmBooking"
        unelevated
      />
    </q-card-actions>
  </q-card>
</q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import { supabase } from 'src/supabase'
import { useQuasar } from 'quasar'
import quasarLang from 'quasar/lang/it'

export default defineComponent({
  name: 'PrenotaPage',
  setup() {
    const $q = useQuasar()

    const selectedDate = ref(null)
    const timeSlots = ['18:00', '19:00', '20:00', '21:00', '22:00']
    const availableSlots = ref([])
    const loading = ref(false)
    const slotsMap = ref({})

    // Dialog state
    const showDialog = ref(false)
    const selectedGame = ref(null)
    const selectedSlot = ref(null)
    const selectedSlotInfo = ref(null)
    const peopleCount = ref(1)
    const nomeCliente = ref('')
    const emailCliente = ref('')

    // Add new reactive references for search and filters
    const searchQuery = ref('')
    const filters = ref({
      minPlayers: null,
      maxPlayers: null,
      difficulty: []
    })

    // Computed property for filtered games
    const filteredGames = computed(() => {
      let result = availableSlots.value

      // Apply search filter
      if (searchQuery.value) {
        const search = searchQuery.value.toLowerCase()
        result = result.filter(game =>
          game.nome.toLowerCase().includes(search)
        )
      }

      // Apply number of players filter - CORRETTO
      if (filters.value.minPlayers && filters.value.minPlayers > 0) {
        result = result.filter(game =>
          parseInt(game.giocatori_min) <= parseInt(filters.value.minPlayers)
        )
      }
      if (filters.value.maxPlayers && filters.value.maxPlayers > 0) {
        result = result.filter(game =>
          parseInt(game.giocatori_max) >= parseInt(filters.value.maxPlayers)
        )
      }

      // Apply difficulty filter
      if (filters.value.difficulty.length > 0) {
        result = result.filter(game =>
          filters.value.difficulty.includes(game.difficolta)
        )
      }

      return result
    })

    // Reset filters function
    const resetFilters = () => {
      filters.value = {
        minPlayers: null,
        maxPlayers: null,
        difficulty: []
      }
    }

    async function loadAvailability() {
      if (!selectedDate.value) {
        $q.notify({ type: 'warning', message: 'Seleziona prima una data' })
        return
      }

      loading.value = true
      availableSlots.value = []
      slotsMap.value = {}

      try {
        const { data: giochi, error } = await supabase
          .from('giochi')
          .select('*')
          .eq('disponibile', true)

        if (error) throw error

        const processedGames = await Promise.all(giochi.map(async (game) => {
          if (game.copertina) {
            const { data: { publicUrl } } = supabase.storage
              .from('Copertine_giochi')
              .getPublicUrl(game.copertina)
            return { ...game, copertina: publicUrl }
          }
          return {
            ...game,
            copertina: 'https://aggrozltszxsqqgkyykh.supabase.co/storage/v1/object/public/Copertine_giochi/default-game-cover.png'
          }
        }))

        availableSlots.value = processedGames

        for (const game of processedGames) {
          slotsMap.value[game.id] = {}
          for (const slot of timeSlots) {
            const startIso = `${selectedDate.value}T${slot}:00+01:00`
            const startDateObj = new Date(startIso)
            const durata = game.durata_media || 60
            const endDateObj = new Date(startDateObj.getTime() + durata * 60000)
            const endIso = endDateObj.toISOString()

            const { data: bookings, error: errBookings } = await supabase
              .from('prenotazioni')
              .select('numero_persone, data_inizio, data_fine')
              .eq('gioco_id', game.id)
              .lt('data_inizio', endIso)
              .gt('data_fine', startIso)

            if (errBookings) throw errBookings

            let postiLiberi = 0
            if (bookings.length > 0) {
              const [slotHourStr, slotMinuteStr] = slot.split(':')
              const slotHour = parseInt(slotHourStr, 10)
              const slotMinute = parseInt(slotMinuteStr, 10)

              const sameSlotBookings = bookings.filter(b => {
                const bStart = new Date(b.data_inizio)
                return bStart.getHours() === slotHour && bStart.getMinutes() === slotMinute
              })

              if (sameSlotBookings.length > 0) {
                const alreadyBookedExact = sameSlotBookings.reduce((acc, b) => acc + b.numero_persone, 0)
                postiLiberi = game.giocatori_max - alreadyBookedExact
              } else {
                postiLiberi = 0
              }
            } else {
              postiLiberi = game.giocatori_max
            }

            slotsMap.value[game.id][slot] = { postiLiberi }
          }
        }
      } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Errore nel calcolo disponibilità' })
      } finally {
        loading.value = false
      }
    }

    function getSlotInfo(game, slot) {
      return slotsMap.value[game.id]?.[slot] || { postiLiberi: 0 }
    }

    function getSlotLabel(game, slot) {
      const info = getSlotInfo(game, slot)
      return info.postiLiberi > 0 ? `${slot} (${info.postiLiberi})` : slot
    }

    function getSlotColor(game, slot) {
      return getSlotInfo(game, slot).postiLiberi > 0 ? 'primary' : 'grey'
    }

    function openBookingDialog(game, slot) {
      selectedGame.value = game
      selectedSlot.value = slot
      selectedSlotInfo.value = getSlotInfo(game, slot)
      peopleCount.value = 1
      nomeCliente.value = ''
      emailCliente.value = ''
      showDialog.value = true
    }

    function validatePeopleCount(val) {
      if (selectedGame.value) {
        const min = selectedGame.value.giocatori_min
        const max = selectedGame.value.giocatori_max
        if (val < min || val > max) {
          return `Inserisci un numero tra ${min} e ${max}`
        }
      }
      return true
    }

    async function confirmBooking() {
      if (!selectedGame.value || !selectedSlot.value) return

      if (peopleCount.value > selectedSlotInfo.value.postiLiberi) {
        $q.notify({ type: 'negative', message: 'Posti insufficienti!' })
        return
      }

      const startIso = `${selectedDate.value}T${selectedSlot.value}:00+01:00`
      const startDateObj = new Date(startIso)
      const durata = selectedGame.value.durata_media || 60
      const endDateObj = new Date(startDateObj.getTime() + durata * 60000)
      const endIso = endDateObj.toISOString()

      try {
        const { error } = await supabase
          .from('prenotazioni')
          .insert([{
            gioco_id: selectedGame.value.id,
            data_inizio: startIso,
            data_fine: endIso,
            nome_cliente: nomeCliente.value,
            email_cliente: emailCliente.value,
            numero_persone: peopleCount.value
          }])

        if (error) throw error

        $q.notify({ type: 'positive', message: 'Prenotazione effettuata!' })
        showDialog.value = false
        loadAvailability()
      } catch (error) {
        console.error(error)
        $q.notify({ type: 'negative', message: 'Errore durante la prenotazione' })
      }
    }

    return {
      quasarLang,
      selectedDate,
      timeSlots,
      availableSlots,
      showDialog,
      selectedGame,
      selectedSlot,
      selectedSlotInfo,
      peopleCount,
      nomeCliente,
      emailCliente,
      loadAvailability,
      getSlotInfo,
      getSlotLabel,
      getSlotColor,
      openBookingDialog,
      confirmBooking,
      validatePeopleCount,
      searchQuery,
      filters,
      filteredGames,
      resetFilters
    }
  }
})
</script>

<style scoped>
.filter-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

.search-input {
  max-width: 300px;
}

/* Media query per schermi più piccoli */
@media (max-width: 600px) {
  .search-input {
    max-width: 100%;
  }
}
</style>
