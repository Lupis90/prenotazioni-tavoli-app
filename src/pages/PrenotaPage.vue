<template>
  <q-page padding class="bg-grey-1">
    <!-- Hero Section -->
    <div class="text-center q-mb-xl">
      <h2 class="text-gradient">Prenota il tuo gioco</h2>
      <img
        src="/images/separator.svg"
        alt="Decorative separator"
        class="q-mt-md separator-image"
        style="width: 640px; height: 96px"
      />
    </div>

    <!-- Date Selection Card -->
    <div class="date-selector q-pa-md q-mb-lg shadow-3">
      <div class="row items-center q-gutter-md">
        <!-- Utilizziamo un QInput con QDate in QMenu -->
        <q-input
          v-model="selectedDate"
          label="Seleziona data"
          readonly
          class="col-grow"
          input-class="text-subtitle1"
          :disable="loading"
          @click.prevent
          style="pointer-events: none"
        >
          <template v-slot:prepend>
            <q-icon
              name="event"
              color="primary"
              @click.stop="menu = true"
              class="cursor-pointer"
              style="pointer-events: auto"
            />
          </template>
        </q-input>
        <q-menu v-model="menu" cover transition-show="scale" transition-hide="scale">
          <q-date
            v-model="selectedDate"
            :options="isDateAvailable"
            mask="YYYY-MM-DD"
            @input="onDateSelected"
          />
        </q-menu>

        <q-btn
          color="primary"
          label="Mostra disponibilità"
          @click="loadAvailability"
          icon="search"
          class="q-px-xl"
          unelevated
          rounded
          :disable="!selectedDate"
        />
      </div>
    </div>

    <!-- Sezione per ricerca e filtri -->
    <div v-if="availableSlots.length" class="q-mb-md">
      <div class="row q-col-gutter-md items-center">
        <!-- Game Selector Dropdown -->
        <div class="col-grow">
          <q-select
            v-model="selectedGameToAdd"
            :options="availableGamesOptions"
            label="Aggiungi un gioco da prenotare"
            outlined
            dense
            emit-value
            map-options
            clearable
            @update:model-value="onGameSelected"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> Nessun gioco disponibile </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Bottone per i filtri -->
        <div class="col-auto">
          <q-btn-dropdown dense color="primary" icon="filter_list" label="Filtri">
            <q-card style="min-width: 300px">
              <q-card-section>
                <!-- Filtro per numero giocatori -->
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

                <!-- Filtro per difficoltà -->
                <div>
                  <div class="text-subtitle2 q-mb-sm">Difficoltà</div>
                  <q-option-group
                    v-model="filters.difficulty"
                    :options="[
                      { label: 'Facile', value: 'facile' },
                      { label: 'Medio', value: 'medio' },
                      { label: 'Difficile', value: 'difficile' },
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

    <!-- Loader -->
    <div
      v-if="loading"
      class="fullscreen flex flex-center"
      style="background: rgba(255, 255, 255, 0.8); z-index: 2"
    >
      <q-spinner-gears color="primary" size="4em" />
      <div class="text-primary text-h6 q-mt-md">Caricamento giochi...</div>
    </div>

    <!-- Sezione giochi con prenotazioni parziali -->
    <div v-if="!loading && partiallyOccupiedGames.length" class="q-mt-xl">
      <h4 class="text-h5 text-primary q-mb-md">Aggiungiti ad un tavolo già organizzato</h4>
      <div class="scroll-container q-px-md">
        <div class="row no-wrap scroll-area">
          <div
            v-for="game in partiallyOccupiedGames"
            :key="game.id"
            class="col-auto q-pr-md"
            style="width: 350px"
          >
            <q-card
              :class="[
                'game-card shadow-6',
                'has-bookings',
                $q.dark.isActive ? 'bg-dark' : 'bg-white',
              ]"
            >
              <q-img :src="game.copertina" :ratio="16 / 9" class="game-image">
                <div class="absolute-bottom image-overlay">
                  <div class="text-h5 text-white">{{ game.nome }}</div>
                  <div class="text-caption text-grey-3">
                    {{ game.giocatori_min }}-{{ game.giocatori_max }} giocatori
                  </div>
                  <q-badge v-if="game.hasActiveBookings" color="primary" class="q-mt-xs">
                    Prenotazioni attive
                  </q-badge>
                </div>
              </q-img>

              <q-card-section class="time-slots-section">
                <div class="row q-gutter-sm justify-center">
                  <q-btn
                    v-for="slot in availableTimeSlots"
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
      </div>
    </div>

    <!-- Sezione per aggiungere nuovi giochi -->
    <div v-if="!loading && availableGamesOptions.length" class="q-mt-xl">
      <h4 class="text-h5 q-mb-md">Organizza un nuovo tavolo</h4>
      <div class="row q-col-gutter-md items-center">
        <!-- Game Selector Dropdown -->
        <div class="col-grow">
          <q-select
            v-model="selectedGameToAdd"
            :options="availableGamesOptions"
            label="Aggiungi un gioco da prenotare"
            outlined
            dense
            emit-value
            map-options
            clearable
            @update:model-value="onGameSelected"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> Nessun gioco disponibile </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Bottone per i filtri -->
        <div class="col-auto">
          <q-btn-dropdown dense color="primary" icon="filter_list" label="Filtri">
            <q-card style="min-width: 300px">
              <q-card-section>
                <!-- Filtro per numero giocatori -->
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

                <!-- Filtro per difficoltà -->
                <div>
                  <div class="text-subtitle2 q-mb-sm">Difficoltà</div>
                  <q-option-group
                    v-model="filters.difficulty"
                    :options="[
                      { label: 'Facile', value: 'facile' },
                      { label: 'Medio', value: 'medio' },
                      { label: 'Difficile', value: 'difficile' },
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

    <!-- Game Grid (for newly selected games) -->
    <div v-if="newlySelectedGames.length" class="row q-col-gutter-xl q-mt-lg">
      <div v-for="game in newlySelectedGames" :key="game.id" class="col-12 col-sm-6 col-md-4">
        <q-card
          :class="[
            'game-card shadow-6',
            game.hasActiveBookings ? 'has-bookings' : '',
            $q.dark.isActive ? 'bg-dark' : 'bg-white',
          ]"
        >
          <q-img :src="game.copertina" :ratio="16 / 9" class="game-image">
            <div class="absolute-bottom image-overlay">
              <div class="text-h5 text-white">{{ game.nome }}</div>
              <div class="text-caption text-grey-3">
                {{ game.giocatori_min }}-{{ game.giocatori_max }} giocatori
              </div>
              <q-badge v-if="game.hasActiveBookings" color="primary" class="q-mt-xs">
                Prenotazioni attive
              </q-badge>
            </div>
          </q-img>

          <q-card-section class="time-slots-section">
            <div class="row q-gutter-sm justify-center">
              <q-btn
                v-for="slot in availableTimeSlots"
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

    <!-- Stato vuoto -->
    <div v-if="!loading && !availableSlots.length" class="text-center q-pa-xl">
      <q-icon name="sports_esports" size="xl" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">Seleziona una data per vedere le disponibilità</div>
    </div>

    <!-- Dialog per la prenotazione -->
    <q-dialog v-model="showDialog">
      <q-card class="booking-dialog" style="width: 600px; max-width: 90vw">
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
              :rules="[(val) => validatePeopleCount(val)]"
              color="primary"
              dense
            >
              <template v-slot:prepend>
                <q-icon name="people" />
              </template>
            </q-input>

            <q-input filled v-model="nomeCliente" label="Nome completo" color="primary" dense>
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input filled v-model="emailCliente" type="email" label="Email" color="primary" dense>
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Annulla" color="grey" v-close-popup class="q-mr-sm" />
          <q-btn label="Prenota" color="primary" @click="confirmBooking" unelevated />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { supabase } from 'src/supabase'
import { useQuasar } from 'quasar'
import quasarLang from 'quasar/lang/it'

export default defineComponent({
  name: 'PrenotaPage',
  setup() {
    const $q = useQuasar()

    // Stato per la selezione della data e per l'apertura del QDate
    const selectedDate = ref('')
    const menu = ref(false)
    const availableDates = ref([])
    const availableTimeRanges = ref([])

    // Gli slot orari disponibili (dinamici, calcolati dalla disponibilità nel DB)
    const availableTimeSlots = ref([])

    // Carica dal DB le disponibilità (booking_availability)
    const loadAvailableDatesAndTimes = async () => {
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
    }

    // Verifica se una data è disponibile (usata dal QDate)
    const isDateAvailable = (dateStr) => {
      if (!dateStr || !availableDates.value.length) return false
      const normalizedDate = dateStr.replace(/\//g, '-')
      console.log(
        `Checking date ${normalizedDate}, database dates:`,
        availableDates.value.map((d) => d.data)
      )
      const found = availableDates.value.some((d) => d.data === normalizedDate)
      console.log(`Date ${normalizedDate} available: ${found}`)
      return found
    }

    // Quando una data viene selezionata, aggiorna gli slot in base ai blocchi orari disponibili
    const onDateSelected = (date) => {
      console.log('Date selected:', date)
      selectedDate.value = date
      menu.value = false

      // Filtro dei blocchi per la data selezionata
      const timeRanges = availableDates.value.filter((d) => d.data === date)
      console.log('Time ranges found:', timeRanges)
      availableTimeRanges.value = timeRanges

      // Genera gli slot orari dai blocchi e li accumula
      const allSlots = []
      timeRanges.forEach((range) => {
        const slots = generateSlots(range.orario_inizio, range.orario_fine)
        allSlots.push(...slots)
      })
      availableTimeSlots.value = [...new Set(allSlots)].sort()

      // Carica la disponibilità per la data selezionata
      loadAvailability()
    }

    onMounted(() => {
      loadAvailableDatesAndTimes()
    })

    // Stato per i giochi e per la prenotazione
    const availableSlots = ref([])
    const loading = ref(false)
    const slotsMap = ref({})

    // Stato per il dialog di prenotazione
    const showDialog = ref(false)
    const selectedGame = ref(null)
    const selectedSlot = ref(null)
    const selectedSlotInfo = ref(null)
    const peopleCount = ref(1)
    const nomeCliente = ref('')
    const emailCliente = ref('')

    // Filtri e ricerca
    const searchQuery = ref('')
    const filters = ref({
      minPlayers: null,
      maxPlayers: null,
      difficulty: [],
    })

    const filteredGames = computed(() => {
      let result = availableSlots.value
      if (searchQuery.value) {
        const search = searchQuery.value.toLowerCase()
        result = result.filter((game) => game.nome.toLowerCase().includes(search))
      }
      if (filters.value.minPlayers && filters.value.minPlayers > 0) {
        result = result.filter(
          (game) => parseInt(game.giocatori_min) <= parseInt(filters.value.minPlayers)
        )
      }
      if (filters.value.maxPlayers && filters.value.maxPlayers > 0) {
        result = result.filter(
          (game) => parseInt(game.giocatori_max) >= parseInt(filters.value.maxPlayers)
        )
      }
      if (filters.value.difficulty.length > 0) {
        result = result.filter((game) => filters.value.difficulty.includes(game.difficolta))
      }
      return result
    })

    const resetFilters = () => {
      filters.value = {
        minPlayers: null,
        maxPlayers: null,
        difficulty: [],
      }
    }

    // Funzione helper per generare slot orari (step di 1 ora)
    const generateSlots = (startTime, endTime) => {
      let slots = []
      const [startHour, startMin] = startTime.split(':').map(Number)
      const [endHour, endMin] = endTime.split(':').map(Number)
      let startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin
      while (startMinutes + 60 <= endMinutes) {
        const h = Math.floor(startMinutes / 60)
        const m = startMinutes % 60
        const slotTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        slots.push(slotTime)
        startMinutes += 60
      }
      return slots
    }

    // Nuove variabili per la selezione dei giochi
    const selectedGameToAdd = ref(null)
    const availableGamesOptions = ref([])
    const selectedGames = ref(new Set())

    // Computed property per i giochi parzialmente occupati
    const partiallyOccupiedGames = computed(() => {
      return availableSlots.value.filter((game) => {
        const gameSlots = slotsMap.value[game.id] || {}
        return Object.values(gameSlots).some(
          (slot) => slot.postiLiberi > 0 && slot.postiLiberi < game.giocatori_max
        )
      })
    })

    // Computed property per i giochi appena selezionati
    const newlySelectedGames = computed(() => {
      return availableSlots.value.filter(
        (game) =>
          selectedGames.value.has(game.id) &&
          !partiallyOccupiedGames.value.some((g) => g.id === game.id)
      )
    })

    // Modifica displayedGames per escludere i giochi mostrati in altre sezioni
    const displayedGames = computed(() => {
      return [...partiallyOccupiedGames.value, ...newlySelectedGames.value]
    })

    // Funzione per gestire la selezione di un nuovo gioco
    const onGameSelected = (gameId) => {
      if (gameId) {
        selectedGames.value.add(gameId)
        selectedGameToAdd.value = null
      }
    }

    // Funzione per caricare la disponibilità per la data selezionata
    async function loadAvailability() {
      if (!selectedDate.value) {
        $q.notify({ type: 'warning', message: 'Seleziona prima una data' })
        return
      }
      loading.value = true
      availableSlots.value = []
      slotsMap.value = {}
      // Assicuriamoci che la data sia nel formato YYYY-MM-DD
      const formattedDate = selectedDate.value.split('T')[0]
      if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
        console.error('Invalid date format:', selectedDate.value)
        $q.notify({
          type: 'negative',
          message: 'Formato data non valido',
        })
        loading.value = false
        return
      }

      // Carica i blocchi di disponibilità per la data selezionata
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('booking_availability')
        .select('*')
        .eq('data', formattedDate)

      if (availabilityError) {
        console.error('Error loading availability:', availabilityError)
        $q.notify({
          type: 'negative',
          message: 'Errore nel caricamento delle disponibilità',
        })
        loading.value = false
        return
      }

      // Genera dinamicamente gli slot orari dai blocchi
      let dynamicTimeSlots = []
      availabilityData.forEach((block) => {
        const slots = generateSlots(block.orario_inizio, block.orario_fine)
        dynamicTimeSlots = dynamicTimeSlots.concat(slots)
      })
      dynamicTimeSlots = [...new Set(dynamicTimeSlots)].sort()
      availableTimeSlots.value = dynamicTimeSlots

      const startOfDay = `${formattedDate}T00:00:00+01:00`
      const endOfDay = `${formattedDate}T23:59:59+01:00`

      // Esegui in parallelo la query per i giochi e per le prenotazioni della giornata
      const [{ data: giochi, error: giochiError }, { data: bookingsData, error: bookingsError }] =
        await Promise.all([
          supabase.from('giochi').select('*').eq('disponibile', true),
          supabase
            .from('prenotazioni')
            .select('gioco_id, numero_persone, data_inizio, data_fine')
            .gte('data_inizio', startOfDay)
            .lte('data_inizio', endOfDay),
        ])

      if (giochiError) {
        console.error(giochiError)
        $q.notify({ type: 'negative', message: 'Errore nel caricamento dei giochi' })
        loading.value = false
        return
      }
      if (bookingsError) {
        console.error(bookingsError)
        $q.notify({ type: 'negative', message: 'Errore nel caricamento delle prenotazioni' })
        loading.value = false
        return
      }

      // Crea un Set di ID dei giochi con prenotazioni attive
      const activeGameIds = new Set(bookingsData?.map((b) => b.gioco_id) || [])

      // Prepara le opzioni per il menu a tendina (solo giochi senza prenotazioni attive)
      availableGamesOptions.value = giochi
        .filter((game) => !activeGameIds.has(game.id))
        .map((game) => ({
          label: `${game.nome} (${game.giocatori_min}-${game.giocatori_max} giocatori)`,
          value: game.id,
        }))

      // Processa i giochi: aggiungi l'URL della copertina e il flag di prenotazioni attive
      const processedGames = await Promise.all(
        giochi.map(async (game) => {
          const hasActiveBookings = activeGameIds.has(game.id)
          if (game.copertina) {
            const {
              data: { publicUrl },
            } = supabase.storage.from('Copertine_giochi').getPublicUrl(game.copertina)
            return {
              ...game,
              copertina: publicUrl,
              hasActiveBookings,
            }
          }
          return {
            ...game,
            copertina:
              'https://aggrozltszxsqqgkyykh.supabase.co/storage/v1/object/public/Copertine_giochi/default-game-cover.png',
            hasActiveBookings,
          }
        })
      )
      availableSlots.value = processedGames

      // Costruisci una mappa delle prenotazioni per ID gioco per una ricerca più veloce
      const bookingsByGame = {}
      if (bookingsData) {
        bookingsData.forEach((booking) => {
          if (!bookingsByGame[booking.gioco_id]) {
            bookingsByGame[booking.gioco_id] = []
          }
          bookingsByGame[booking.gioco_id].push(booking)
        })
      }

      // Per ogni gioco e per ogni slot, calcola i posti liberi
      for (const game of processedGames) {
        slotsMap.value[game.id] = {}
        for (const slot of availableTimeSlots.value) {
          const startIso = `${formattedDate}T${slot}:00+01:00`
          const slotStart = new Date(startIso)
          const durata = game.durata_media || 60
          const slotEnd = new Date(slotStart.getTime() + durata * 60000)
          const gameBookings = bookingsByGame[game.id] || []

          // Prenotazioni che iniziano esattamente nello slot
          const exactBookings = gameBookings.filter((b) => {
            const bStart = new Date(b.data_inizio)
            return bStart.toISOString() === slotStart.toISOString()
          })
          const seatsBookedExact = exactBookings.reduce((acc, b) => acc + b.numero_persone, 0)
          let freeSeats = game.giocatori_max - seatsBookedExact

          // Verifica se ci sono prenotazioni che si sovrappongono (diverse da quelle esatte)
          const overlappingBookings = gameBookings.filter((b) => {
            const bStart = new Date(b.data_inizio)
            const bEnd = new Date(b.data_fine)
            return (bStart < slotEnd && bEnd > slotStart) && (bStart.toISOString() !== slotStart.toISOString())
          })
          if (overlappingBookings.length > 0) {
            freeSeats = 0
          }

          slotsMap.value[game.id][slot] = {
            postiLiberi: freeSeats,
            hasActiveBooking: game.hasActiveBookings,
          }
        }
      }
      loading.value = false
    }

    function getSlotInfo(game, slot) {
      return slotsMap.value[game.id]?.[slot] || { postiLiberi: 0 }
    }

    function getSlotLabel(game, slot) {
      const info = getSlotInfo(game, slot)
      return info.postiLiberi > 0 ? `${slot} (${info.postiLiberi})` : slot
    }

    function getSlotColor(game, slot) {
      const info = getSlotInfo(game, slot)
      if (info.postiLiberi <= 0) return 'grey'
      if (info.postiLiberi < game.giocatori_max) return 'green-9'
      return 'green-5'
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
      if (!selectedGame.value || !selectedSlot.value || !selectedDate.value) return

      if (peopleCount.value > selectedSlotInfo.value.postiLiberi) {
        $q.notify({ type: 'negative', message: 'Posti insufficienti!' })
        return
      }

      const formattedDate = selectedDate.value.split('T')[0]
      if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
        console.error('Invalid date format:', selectedDate.value)
        $q.notify({
          type: 'negative',
          message: 'Formato data non valido',
        })
        return
      }

      const startIso = `${formattedDate}T${selectedSlot.value}:00+01:00`
      const startDateObj = new Date(startIso)
      const durata = selectedGame.value.durata_media || 60
      const endDateObj = new Date(startDateObj.getTime() + durata * 60000)
      const endIso = endDateObj.toISOString()

      try {
        const { error } = await supabase.from('prenotazioni').insert([
          {
            gioco_id: selectedGame.value.id,
            data_inizio: startIso,
            data_fine: endIso,
            nome_cliente: nomeCliente.value,
            email_cliente: emailCliente.value,
            numero_persone: peopleCount.value,
          },
        ])
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
      menu,
      availableTimeSlots,
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
      resetFilters,
      isDateAvailable,
      onDateSelected,
      availableTimeRanges,
      loading,
      selectedGameToAdd,
      availableGamesOptions,
      displayedGames,
      onGameSelected,
      partiallyOccupiedGames,
      newlySelectedGames,
    }
  },
})
</script>

<style scoped>
.game-card {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  border: 2px solid transparent;

  &.has-bookings {
    border-color: var(--q-primary);
    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 0 40px 40px 0;
      border-color: transparent var(--q-primary) transparent transparent;
      z-index: 1;
    }
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

.filter-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

.search-input {
  max-width: 300px;
}

@media (max-width: 600px) {
  .search-input {
    max-width: 100%;
  }
}

.scroll-container {
  position: relative;
  overflow: hidden;
  margin: 0 -16px;
}

.scroll-area {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  padding: 8px 0;
  margin: -8px 0;
}

.scroll-area::-webkit-scrollbar {
  display: none;
}

.scroll-area {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
