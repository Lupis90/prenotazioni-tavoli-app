<template>
  <q-page padding class="bg-grey-1">
    <!-- Hero Section -->
    <div class="text-center q-mb-xl">
      <h2 class="text-gradient q-pb-md">Prenota il tuo gioco</h2>
    </div>

    <!-- Date Selection Card -->
    <div class="date-selector q-pa-md q-mb-lg shadow-3">
      <div class="row items-center q-gutter-md">
        <q-input
          v-model="selectedDate"
          label="Seleziona data"
          readonly
          class="col-grow"
          input-class="text-subtitle1 q-placeholder"
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
      <h4 class="text-h5 text-primary q-mb-md">Unisciti ad un tavolo già organizzato</h4>
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
      <h4 class="text-h5 q-mb-md">O crea un nuovo tavolo</h4>
      <div class="row q-col-gutter-md items-center">
        <!-- Game Selector Dropdown -->
        <div class="col-grow">
          <q-select
            v-model="selectedGameToAdd"
            :options="filteredGameOptions"
            label="Aggiungi un gioco da prenotare"
            outlined
            dense
            emit-value
            map-options
            clearable
            @update:model-value="onGameSelected"
          >
            <template v-slot:option="props">
              <q-item v-bind="props.itemProps" clickable class="game-option">
                <q-item-section avatar>
                  <q-avatar square>
                    <q-img :src="props.opt.copertina" :ratio="1" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ props.opt.label }}</q-item-label>
                  <q-item-label caption class="game-details">
                    <q-badge :color="getDifficultyColor(props.opt.difficulty)" class="q-mr-sm">
                      {{ props.opt.difficulty }}
                    </q-badge>
                    <q-icon name="people" size="xs" class="q-mr-xs" />
                    {{ props.opt.players }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
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
                  <q-input
                    v-model.number="filters.groupPlayers"
                    type="number"
                    label="Numero giocatori"
                    dense
                    outlined
                    style="width: 100px"
                  />
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
    <div v-if="newlySelectedGames.length" class="scroll-container q-px-md q-mt-lg">
      <div class="row no-wrap scroll-area">
        <div
          v-for="game in newlySelectedGames"
          :key="game.id"
          class="col-auto q-pr-md"
          style="width: 350px"
        >
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
              :rules="[(val) => validatePeopleCount(val, selectedGame.value)]"
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
import { defineComponent, ref, computed, onMounted, nextTick } from 'vue'
import { supabase } from 'src/supabase'
import { useQuasar } from 'quasar'
import quasarLang from 'quasar/lang/it'
import { generateSlots, validatePeopleCount } from 'src/composables/useBookings'
import { DEFAULT_GAME_COVER_URL, GAME_COVER_BUCKET } from 'src/utils/constants'

export default defineComponent({
  name: 'PrenotaPage',
  setup() {
    const $q = useQuasar()

    // Stato per la selezione della data e per l'apertura del QDate
    const selectedDate = ref('')
    const menu = ref(false)
    const availableDates = ref([])
    const availableTimeRanges = ref([])

    // Gli slot orari disponibili
    const availableTimeSlots = ref([])

    // Carica dal DB le disponibilità
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
      availableDates.value = data || []
    }

    // Verifica se una data è disponibile (per il QDate)
    const isDateAvailable = (dateStr) => {
      if (!dateStr || !availableDates.value.length) return false
      const normalizedDate = dateStr.replace(/\//g, '-')
      const found = availableDates.value.some((d) => d.data === normalizedDate)
      return found
    }

    // Quando una data viene selezionata, aggiorna gli slot
    const onDateSelected = (date) => {
      selectedDate.value = date
      menu.value = false

      // Filtro dei blocchi per la data selezionata
      const timeRanges = availableDates.value.filter((d) => d.data === date)
      availableTimeRanges.value = timeRanges

      // Genera gli slot orari dai blocchi
      const allSlots = []
      timeRanges.forEach((range) => {
        const slots = generateSlots(range.orario_inizio, range.orario_fine)
        allSlots.push(...slots)
      })
      availableTimeSlots.value = [...new Set(allSlots)].sort()

      // Carica la disponibilità per la data selezionata
      setTimeout(() => {
        loadAvailability()
      }, 100)
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
    // Modifichiamo i filtri: un campo per il numero di giocatori (groupPlayers) e uno per la difficoltà
    const filters = ref({
      groupPlayers: null,
      difficulty: [],
    })

    // Computed property per filtrare le opzioni dei giochi nel dropdown
    const filteredGameOptions = computed(() => {
      let options = availableGamesOptions.value
      // Se è impostato il numero di giocatori, il gioco deve supportare quel numero
      if (filters.value.groupPlayers) {
        options = options.filter(
          (opt) =>
            parseInt(opt.minPlayers) <= parseInt(filters.value.groupPlayers) &&
            parseInt(opt.maxPlayers) >= parseInt(filters.value.groupPlayers),
        )
      }
      if (filters.value.difficulty && filters.value.difficulty.length > 0) {
        options = options.filter((opt) => filters.value.difficulty.includes(opt.difficulty))
      }
      return options
    })

    const resetFilters = () => {
      filters.value = {
        groupPlayers: null,
        difficulty: [],
      }
    }

    // Nuove variabili per la selezione dei giochi
    const selectedGameToAdd = ref(null)
    const availableGamesOptions = ref([])
    const selectedGames = ref([])

    // Computed property per i giochi parzialmente occupati
    const partiallyOccupiedGames = computed(() => {
      if (!availableSlots.value?.length || !slotsMap.value) return []
      return availableSlots.value.filter((game) => {
        const gameSlots = slotsMap.value[game.id]
        if (!gameSlots) return false
        const hasActiveSlots = Object.values(gameSlots).some((slot) => slot.hasActiveBooking)
        const hasAvailableSeats = Object.values(gameSlots).some((slot) => slot.postiLiberi > 0)
        return hasActiveSlots && hasAvailableSeats
      })
    })

    // Computed property per i giochi appena selezionati
    const newlySelectedGames = computed(() => {
      return availableSlots.value.filter(
        (game) =>
          selectedGames.value.includes(game.id) &&
          !partiallyOccupiedGames.value.some((g) => g.id === game.id),
      )
    })

    // Computed property per i giochi visualizzati
    const displayedGames = computed(() => {
      return [...partiallyOccupiedGames.value, ...newlySelectedGames.value]
    })

    // Funzione helper per trovare un gioco dal suo ID
    const findGameById = (gameId) => {
      return availableSlots.value.find((game) => game.id === gameId)
    }

    // Funzione per gestire la selezione di un nuovo gioco
    const onGameSelected = (gameId) => {
      if (gameId) {
        const game = findGameById(gameId)
        if (game) {
          if (!selectedGames.value.includes(gameId)) {
            selectedGames.value.push(gameId)
            nextTick(() => {
              setTimeout(() => {
                const newCard = document.querySelector('.q-mt-lg .game-card:last-child')
                if (newCard) {
                  const cardRect = newCard.getBoundingClientRect()
                  const offset =
                    cardRect.top + window.pageYOffset - (window.innerHeight - cardRect.height) / 2
                  window.scrollTo({
                    top: offset,
                    behavior: 'smooth',
                  })
                }
              }, 100)
            })
          }
          selectedGameToAdd.value = null
        }
      }
    }

    // Funzione per caricare la disponibilità per la data selezionata
    async function loadAvailability() {
      menu.value = false
      if (!selectedDate.value) {
        $q.notify({ type: 'warning', message: 'Seleziona prima una data' })
        return
      }
      loading.value = true
      availableSlots.value = []
      slotsMap.value = {}
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

      let dynamicTimeSlots = []
      availabilityData.forEach((block) => {
        const slots = generateSlots(block.orario_inizio, block.orario_fine)
        dynamicTimeSlots = dynamicTimeSlots.concat(slots)
      })
      dynamicTimeSlots = [...new Set(dynamicTimeSlots)].sort()
      availableTimeSlots.value = dynamicTimeSlots

      const startOfDay = `${formattedDate}T00:00:00.000Z`
      const endOfDay = `${formattedDate}T23:59:59.999Z`

      const [{ data: giochi, error: giochiError }, { data: bookingsData, error: bookingsError }] =
        await Promise.all([
          supabase.from('giochi').select('*').eq('disponibile', true),
          supabase
            .from('prenotazioni')
            .select('gioco_id, numero_persone, data_inizio, data_fine')
            .gte('data_inizio', startOfDay)
            .lt('data_inizio', endOfDay),
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

      const activeGameIds = new Set(bookingsData?.map((b) => b.gioco_id) || [])

      availableGamesOptions.value = await Promise.all(
        giochi
          .filter((game) => !activeGameIds.has(game.id))
          .map(async (game) => {
            let imageUrl = DEFAULT_GAME_COVER_URL
            if (game.copertina) {
              const {
                data: { publicUrl },
              } = supabase.storage.from(GAME_COVER_BUCKET).getPublicUrl(game.copertina)
              imageUrl = publicUrl
            }
            return {
              label: game.nome,
              value: game.id,
              copertina: imageUrl,
              difficulty: game.difficolta,
              players: `${game.giocatori_min}-${game.giocatori_max} giocatori`,
              minPlayers: game.giocatori_min,
              maxPlayers: game.giocatori_max,
            }
          }),
      )

      const processedGames = await Promise.all(
        giochi.map(async (game) => {
          const hasActiveBookings = activeGameIds.has(game.id)
          if (game.copertina) {
            const {
              data: { publicUrl },
            } = supabase.storage.from(GAME_COVER_BUCKET).getPublicUrl(game.copertina)
            return {
              ...game,
              copertina: publicUrl,
              hasActiveBookings,
            }
          }
          return {
            ...game,
            copertina: DEFAULT_GAME_COVER_URL,
            hasActiveBookings,
          }
        }),
      )
      availableSlots.value = processedGames

      const bookingsByGame = {}
      if (bookingsData) {
        bookingsData.forEach((booking) => {
          if (!bookingsByGame[booking.gioco_id]) {
            bookingsByGame[booking.gioco_id] = []
          }
          bookingsByGame[booking.gioco_id].push(booking)
        })
      }

      for (const game of processedGames) {
        slotsMap.value[game.id] = {}
        const gameBookings = bookingsByGame[game.id] || []
        let hasAnyBooking = false

        for (const slot of availableTimeSlots.value) {
          const startIso = `${formattedDate}T${slot}:00Z`
          const slotStartTime = new Date(startIso).getTime()
          const durata = game.durata_media || 60
          const slotEndTime = slotStartTime + durata * 60 * 1000

          let seatsBookedExact = 0
          let disableSlot = false

          for (const booking of gameBookings) {
            const bookingStartTime = new Date(booking.data_inizio).getTime()
            const bookingEndTime = new Date(booking.data_fine).getTime()
            if (bookingStartTime === slotStartTime) {
              seatsBookedExact += booking.numero_persone
              hasAnyBooking = true
            } else if (bookingStartTime < slotEndTime && bookingEndTime > slotStartTime) {
              disableSlot = true
              hasAnyBooking = true
              break
            }
          }

          const freeSeats = disableSlot ? 0 : Math.max(0, game.giocatori_max - seatsBookedExact)
          slotsMap.value[game.id][slot] = {
            postiLiberi: freeSeats,
            hasActiveBooking: seatsBookedExact > 0,
          }
        }
        game.hasActiveBookings = hasAnyBooking
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

      const startIso = `${formattedDate}T${selectedSlot.value}:00`
      const startDateObj = new Date(startIso)
      const durata = selectedGame.value.durata_media || 60
      const endDateObj = new Date(startDateObj.getTime() + durata * 60000)
      const endIso =
        endDateObj.getFullYear() +
        '-' +
        String(endDateObj.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(endDateObj.getDate()).padStart(2, '0') +
        'T' +
        String(endDateObj.getHours()).padStart(2, '0') +
        ':' +
        String(endDateObj.getMinutes()).padStart(2, '0') +
        ':' +
        String(endDateObj.getSeconds()).padStart(2, '0')

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

    const getDifficultyColor = (difficulty) => {
      const colors = {
        facile: 'positive',
        medio: 'warning',
        difficile: 'negative',
      }
      return colors[difficulty] || 'grey'
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
      resetFilters,
      isDateAvailable,
      filteredGameOptions,
      displayedGames,
      onGameSelected,
      partiallyOccupiedGames,
      newlySelectedGames,
      getDifficultyColor,
      selectedGameToAdd,
      availableGamesOptions,
      onDateSelected,
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
}

.game-card.has-bookings {
  border-color: var(--q-primary);
}
.game-card.has-bookings::before {
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

.game-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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

.game-option {
  padding: 8px;
}

.game-option .q-avatar {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
}

.game-details {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: var(--q-secondary);
  margin-top: 4px;
}

.game-details .q-icon {
  margin-left: 8px;
}

.game-details .q-badge {
  font-size: 0.7rem;
  padding: 2px 6px;
}
.q-placeholder input::placeholder {
  text-align: center;
}
</style>
