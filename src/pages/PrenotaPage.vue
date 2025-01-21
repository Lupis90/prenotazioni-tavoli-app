<template>
  <q-page padding>
    <h2>Prenota</h2>

    <div class="q-mb-lg">
      <q-input
        filled
        v-model="selectedDate"
        type="date"
        label="Data"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="selectedDate" mask="YYYY-MM-DD" :locale="quasarLang">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Chiudi" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-btn color="primary" label="Carica disponibilità" @click="loadAvailability" class="q-ml-md" />
    </div>

    <q-table
      title="Giochi disponibili per la data selezionata"
      :columns="columns"
      :rows="availableSlots"
      row-key="id"
      :loading="loading"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="nome" :props="props">
            <q-expansion-item
                expand-separator
                :label="props.row.nome"
                header-class="text-weight-bold"
            >
              <q-list dense>
                <q-item
                  v-for="slot in timeSlots"
                  :key="slot"
                  clickable
                  v-ripple
                  @click="openBookingDialog(props.row, slot)"
                  :class="getSlotInfo(props.row, slot).postiLiberi > 0 ? '' : 'text-grey-8'"
                >
                  <q-item-section>
                    {{ slot }}
                  </q-item-section>
                  <q-item-section side>
                    <span v-if="getSlotInfo(props.row, slot).postiLiberi > 0">
                      {{ getSlotInfo(props.row, slot).postiLiberi }} posti liberi
                    </span>
                    <span v-else>Completo</span>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </q-td>

          </q-tr>
      </template>
      <template v-slot:no-data>
        Nessun dato disponibile (seleziona prima una data).
      </template>
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
    </q-table>

    <q-dialog v-model="showDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Completa Prenotazione</div>
        </q-card-section>

        <q-card-section>
          <p>
            <strong>Gioco:</strong> {{ selectedGame?.nome }}<br />
            <strong>Fascia oraria:</strong> {{ selectedSlot }}<br />
            <strong>Posti liberi:</strong> {{ selectedSlotInfo?.postiLiberi }}
          </p>

          <q-input
            filled
            type="number"
            v-model.number="peopleCount"
            label="Numero di persone"
            :rules="[val => validatePeopleCount(val)]"
          />

          <q-input
            filled
            v-model="nomeCliente"
            label="Nome Cliente"
            class="q-mt-md"
          />
          <q-input
            filled
            v-model="emailCliente"
            type="email"
            label="Email Cliente"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" color="negative" v-close-popup />
          <q-btn label="Conferma" color="primary" @click="confirmBooking" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { supabase } from 'src/supabase'
import { useQuasar } from 'quasar'
import quasarLang from 'quasar/lang/it'

export default defineComponent({
  name: 'PrenotaPage',
  setup() {
    const $q = useQuasar()

    // Data scelta
    const selectedDate = ref(null)

    // Tabella orari che vogliamo considerare
    const timeSlots = ['18:00', '19:00', '20:00', '21:00', '22:00']

    // Colonne tabella
    const columns = [
      { name: 'nome', label: 'Gioco', field: 'nome', align: 'left' },
      //{ name: 'azione', label: 'Prenota', field: 'azione', align: 'left' } // Rimuovi se non serve
    ]

    // Risultato del calcolo (ora solo giochi univoci)
    const availableSlots = ref([])

    // Loading
    const loading = ref(false)

    // DIALOG E DATI DI PRENOTAZIONE
    const showDialog = ref(false)
    const selectedGame = ref(null) // Non più selectedRow, ma selectedGame
    const selectedSlot = ref(null) // Aggiunto per memorizzare lo slot selezionato
    const selectedSlotInfo = ref(null) // Aggiunto per memorizzare le info dello slot
    const peopleCount = ref(1)
    const nomeCliente = ref('')
    const emailCliente = ref('')

    // Mappa per memorizzare i posti disponibili per ogni gioco e slot
    const slotsMap = ref({}) // { gameId: { slot: { postiLiberi: number } } }

    // Al click su "Carica disponibilità" carichiamo i giochi e costruiamo le righe
    async function loadAvailability() {
      if (!selectedDate.value) {
        $q.notify({ type: 'warning', message: 'Seleziona prima una data' })
        return
      }
      loading.value = true
      availableSlots.value = []
      slotsMap.value = {}
      try {
        // 1) Carichiamo tutti i giochi (disponibili)
        const { data: giochi, error } = await supabase
          .from('giochi')
          .select('*')
          .eq('disponibile', true)
        if (error) throw error

        // 2) Per ogni gioco, per ogni timeslot => calcoliamo "quante persone" già prenotate
        availableSlots.value = giochi; // Aggiungiamo direttamente tutti i giochi

        for (const game of giochi) {
          slotsMap.value[game.id] = {} // Inizializza la mappa per il gioco
          for (const slot of timeSlots) {
            // Costruiamo un Date start e end
            const startIso = `${selectedDate.value}T${slot}:00+01:00`
            const startDateObj = new Date(startIso)
            // calcoliamo data_fine = data_inizio + game.durata_media
            const endDateObj = new Date(startDateObj.getTime() + (game.durata_media || 60) * 60000)
            const endIso = endDateObj.toISOString()

            // Query su prenotazioni: overlap
            // data_inizio < endIso AND data_fine > startIso
            const { data: bookings, error: errBookings } = await supabase
              .from('prenotazioni')
              .select('numero_persone')
              .eq('gioco_id', game.id)
              .lt('data_inizio', endIso)
              .gt('data_fine', startIso)

            if (errBookings) throw errBookings

            const alreadyBooked = bookings.reduce((acc, b) => acc + b.numero_persone, 0)
            const postiLiberi = game.giocatori_max - alreadyBooked

            // Memorizza le informazioni dello slot nella mappa
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

    // Funzione per ottenere le informazioni sui posti disponibili per un dato gioco e orario
    function getSlotInfo(game, slot) {
      return slotsMap.value[game.id]?.[slot] || { postiLiberi: 0 }
    }

    // Apertura dialog prenotazione
    function openBookingDialog(game, slot) {
      selectedGame.value = game
      selectedSlot.value = slot
      selectedSlotInfo.value = getSlotInfo(game, slot)
      peopleCount.value = 1
      nomeCliente.value = ''
      emailCliente.value = ''
      showDialog.value = true
    }

    // Validazione numero di persone
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

    // Conferma prenotazione (inserimento in Supabase)
    async function confirmBooking() {
      if (!selectedGame.value || !selectedSlot.value) {
        showDialog.value = false
        return
      }
      if (peopleCount.value > selectedSlotInfo.value.postiLiberi) {
        $q.notify({ type: 'negative', message: 'Posti insufficienti per questo orario!' })
        return
      }
      // Calcoliamo data_inizio e data_fine
      const startIso = `${selectedDate.value}T${selectedSlot.value}:00+01:00`
      const startDateObj = new Date(startIso)
      const durata = selectedGame.value.durata_media || 60
      const endDateObj = new Date(startDateObj.getTime() + durata * 60000)
      const endIso = endDateObj.toISOString()

      try {
        // Inseriamo su prenotazioni
        const { error: insErr } = await supabase
          .from('prenotazioni')
          .insert([{
            gioco_id: selectedGame.value.id,
            data_inizio: startIso,
            data_fine: endIso,
            nome_cliente: nomeCliente.value,
            email_cliente: emailCliente.value,
            telefono_cliente: '', // se vuoi chiedere
            numero_persone: peopleCount.value
          }])
          .select()

        if (insErr) throw insErr

        $q.notify({ type: 'positive', message: 'Prenotazione effettuata con successo!' })
        showDialog.value = false

        // Aggiorniamo la tabella dei posti disponibili
        // (ricarichiamo i dati o solo aggiorniamo la riga corrispondente)
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
      columns,
      availableSlots,
      loading,
      loadAvailability,
      getSlotInfo,

      showDialog,
      selectedGame,
      selectedSlot,
      selectedSlotInfo,
      peopleCount,
      nomeCliente,
      emailCliente,

      openBookingDialog,
      confirmBooking,
      validatePeopleCount
    }
  }
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
