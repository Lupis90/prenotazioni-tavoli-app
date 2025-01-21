<template>
  <q-form @submit.prevent="onSubmit" ref="form" class="q-gutter-md">

    <!-- Scegli un gioco -->
    <q-select
      filled
      v-model="giocoSelezionato"
      :options="opzioniGiochi"
      label="Scegli un gioco"
      emit-value
      map-options
      :rules="[val => !!val || 'Campo obbligatorio']"
    />

    <!-- Data inizio -->
    <q-input
      filled
      type="date"
      v-model="dataInizio"
      label="Data inizio"
      :rules="[val => !!val || 'Campo obbligatorio']"
    >
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="dataInizio" mask="YYYY-MM-DD" :locale="quasarLang">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <!-- Ora inizio (radio button group) -->
    <q-option-group
      v-model="oraInizio"
      :options="opzioniOrari"
      type="radio"
      label="Seleziona ora di inizio"
      :rules="[val => !!val || 'Campo obbligatorio']"
    />

    <!-- Numero di persone -->
    <q-input
      filled
      type="number"
      v-model.number="numeroPersone"
      label="Numero di persone"
      :rules="[val => validateNumPersone(val)]"
    />

    <!-- Dati del cliente -->
    <q-input
      filled
      v-model="nomeCliente"
      label="Nome Cliente"
      :rules="[val => !!val || 'Campo obbligatorio']"
    />
    <q-input
      filled
      type="email"
      v-model="emailCliente"
      label="Email Cliente"
      :rules="[val => !!val || 'Campo obbligatorio']"
    />
    <q-input
      filled
      type="tel"
      v-model="telefonoCliente"
      label="Telefono Cliente"
      :rules="[val => !!val || 'Campo obbligatorio']"
    />

    <div>
      <q-btn label="Prenota" type="submit" color="primary" />
    </div>

  </q-form>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from 'src/supabase';
import quasarLang from 'quasar/lang/it';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'PrenotazioneForm',
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const form = ref(null);

    // Campi del form
    const giocoSelezionato = ref(null);
    const dataInizio = ref(null);
    const oraInizio = ref(null);
    const numeroPersone = ref(1);
    const nomeCliente = ref(null);
    const emailCliente = ref(null);
    const telefonoCliente = ref(null);

    // Opzioni giochi (caricate da Supabase)
    const opzioniGiochi = ref([]);
    const opzioniOrari = ref([
      { label: '18:00', value: '18:00' },
      { label: '19:00', value: '19:00' },
      { label: '20:00', value: '20:00' },
      { label: '21:00', value: '21:00' },
      { label: '22:00', value: '22:00' },
    ]);

    // Carichiamo i giochi disponibili
    onMounted(async () => {
      try {
        const { data: giochiData, error: giochiError } = await supabase
          .from('giochi')
          .select('*')
          .eq('disponibile', true);

        if (giochiError) throw giochiError;

        // Mappiamo i giochi come opzioni per il select
        opzioniGiochi.value = giochiData.map((gioco) => ({
          label: `${gioco.nome} (${gioco.giocatori_min}-${gioco.giocatori_max} giocatori)`,
          value: gioco.id,
          // intero oggetto se vuoi recuperare subito i dati:
          giocoCompleto: gioco
        }));
      } catch (error) {
        console.error('Errore nel caricamento dei giochi:', error);
      }
    });

    // Funzione di validazione del numero di persone
    function validateNumPersone(val) {
      // Se non abbiamo selezionato il gioco, per ora non validiamo
      if (!giocoSelezionato.value) return true;

      // Troviamo il gioco corrispondente
      const found = opzioniGiochi.value.find(
        (g) => g.value === giocoSelezionato.value
      );
      if (!found) return true;
      const { giocatori_min, giocatori_max } = found.giocoCompleto || {};

      if (val < giocatori_min || val > giocatori_max) {
        return `Numero di persone deve essere tra ${giocatori_min} e ${giocatori_max}`;
      }
      return true;
    }

    // Al submit facciamo la prenotazione
    const onSubmit = async () => {
      // 1. Valida il form
      const isValid = await form.value.validate();
      if (!isValid) return;

      // 2. Recuperiamo i dati del gioco selezionato (per durata, min, max, ecc.)
      const selected = opzioniGiochi.value.find(
        (opt) => opt.value === giocoSelezionato.value
      );
      if (!selected) {
        $q.notify({ type: 'warning', message: 'Gioco non trovato' });
        return;
      }
      const gameData = selected.giocoCompleto;
      const durata = gameData.durata_media || 60; // default 60 min se manca
      const giocMax = gameData.giocatori_max;

      // 3. Calcoliamo data_inizio e data_fine in ISO 8601
      const startIso = `${dataInizio.value}T${oraInizio.value}:00+01:00`;
      const startDateObj = new Date(startIso);
      const endDateObj = new Date(startDateObj.getTime() + durata * 60000); // durata in minuti
      const endIso = endDateObj.toISOString(); // data_fine

      // 4. Verifica Overlap:
      //    Cerchiamo tutte le prenotazioni che si sovrappongono all'intervallo [startIso, endIso)
      //    e sommiamo numero_persone già prenotate
      try {
        const { data: overlapping, error } = await supabase
          .from('prenotazioni')
          .select('numero_persone, data_inizio, data_fine')
          .eq('gioco_id', giocoSelezionato.value)
          // condizione overlap: (prenotazione.data_inizio < endIso) AND (prenotazione.data_fine > startIso)
          .lt('data_inizio', endIso)
          .gt('data_fine', startIso);

        if (error) throw error;

        const totalAlreadyBooked = overlapping.reduce((sum, row) => {
          return sum + (row.numero_persone || 0);
        }, 0);

        const newSum = totalAlreadyBooked + numeroPersone.value;

        if (newSum > giocMax) {
          // Non c'è spazio sufficiente!
          $q.notify({
            type: 'negative',
            message:
              'Non ci sono abbastanza posti disponibili in questa fascia oraria!'
          });
          return;
        }
      } catch (err) {
        console.error('Errore durante il check overlap:', err);
        $q.notify({
          type: 'negative',
          message:
            'Errore durante la verifica della disponibilità. Riprova più tardi.'
        });
        return;
      }

      // 5. Se tutto ok, inseriamo la prenotazione (senza toccare quantita)
      try {
        const { data, error } = await supabase
          .from('prenotazioni')
          .insert([
            {
              gioco_id: giocoSelezionato.value,
              data_inizio: startIso,
              data_fine: endIso, // se vuoi memorizzarla
              nome_cliente: nomeCliente.value,
              email_cliente: emailCliente.value,
              telefono_cliente: telefonoCliente.value,
              numero_persone: numeroPersone.value
            }
          ])
          .select();

        if (error) throw error;

        // Notifica
        $q.notify({
          message: 'Prenotazione effettuata con successo!',
          color: 'positive'
        });
        console.log('Dati prenotazione inseriti:', data);

        // Reset del form e redirect
        form.value.reset();
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } catch (error) {
        console.error('Errore durante la prenotazione:', error);
        $q.notify({
          message: 'Errore durante la prenotazione. Riprova.',
          color: 'negative'
        });
      }
    };

    return {
      form,
      giocoSelezionato,
      dataInizio,
      oraInizio,
      numeroPersone,
      nomeCliente,
      emailCliente,
      telefonoCliente,
      opzioniGiochi,
      opzioniOrari,
      onSubmit,
      validateNumPersone,
      quasarLang
    };
  }
});
</script>
