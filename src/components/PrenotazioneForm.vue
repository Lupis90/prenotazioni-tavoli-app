<template>
  <q-form @submit.prevent="onSubmit" ref="form" class="q-gutter-md">
    <q-select
      filled
      v-model="tavoloSelezionato"
      :options="opzioniTavoli"
      label="Scegli un tavolo"
      emit-value
      map-options
      :rules="[val => !!val || 'Campo obbligatorio']"
    />

    <q-select
      filled
      v-model="giocoSelezionato"
      :options="opzioniGiochi"
      label="Scegli un gioco"
      emit-value
      map-options
      :rules="[val => !!val || 'Campo obbligatorio']"
    />

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

    <q-input
      filled
      type="time"
      v-model="oraInizio"
      label="Ora inizio"
      :rules="[val => !!val || 'Campo obbligatorio']"
      format24h
    >
      <template v-slot:append>
        <q-icon name="access_time" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-time v-model="oraInizio" mask="HH:mm" format24h :locale="quasarLang">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-time>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <q-input
      filled
      type="date"
      v-model="dataFine"
      label="Data fine"
      :rules="[val => !!val || 'Campo obbligatorio']"
    >
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="dataFine" mask="YYYY-MM-DD" :locale="quasarLang">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <q-input
      filled
      type="time"
      v-model="oraFine"
      label="Ora fine"
      :rules="[val => !!val || 'Campo obbligatorio']"
      format24h
    >
      <template v-slot:append>
        <q-icon name="access_time" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-time v-model="oraFine" mask="HH:mm" format24h :locale="quasarLang">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-time>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

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

    const tavoloSelezionato = ref(null);
    const giocoSelezionato = ref(null);
    const dataInizio = ref(null);
    const oraInizio = ref(null);
    const dataFine = ref(null);
    const oraFine = ref(null);
    const nomeCliente = ref(null);
    const emailCliente = ref(null);
    const telefonoCliente = ref(null);

    const opzioniTavoli = ref([]);
    const opzioniGiochi = ref([]);

    onMounted(async () => {
      try {
        const { data: tavoliData, error: tavoliError } = await supabase
          .from('tavoli')
          .select('id, numero, posti, descrizione')
          .eq('disponibile', true);

        if (tavoliError) throw tavoliError;
        opzioniTavoli.value = tavoliData.map(tavolo => ({
          label: `Tavolo ${tavolo.numero} (${tavolo.posti} posti) - ${tavolo.descrizione}`,
          value: tavolo.id
        }));
      } catch (error) {
        console.error('Errore nel caricamento dei tavoli:', error);
      }

      try {
        const { data: giochiData, error: giochiError } = await supabase
          .from('giochi')
          .select('id, nome, descrizione')
          .eq('disponibile', true)
          .gt('quantita', 0);

        if (giochiError) throw giochiError;
        opzioniGiochi.value = giochiData.map(gioco => ({
          label: `${gioco.nome} - ${gioco.descrizione}`,
          value: gioco.id
        }));
      } catch (error) {
        console.error('Errore nel caricamento dei giochi:', error);
      }
    });

    const onSubmit = async () => {
      // 1. Valida il form
      const isValid = await form.value.validate();
      if (!isValid) {
        // Se non è valido, interrompiamo
        return;
      }

      // 2. Prepara dataInizio e dataFine in formato ISO 8601
      const formattedDataOraInizio = `${dataInizio.value}T${oraInizio.value}:00+01:00`;
      const formattedDataOraFine = `${dataFine.value}T${oraFine.value}:00+01:00`;

      try {
        // 3. Invio a Supabase
        const { data, error } = await supabase
          .from('prenotazioni')
          .insert([
            {
              tavolo_id: tavoloSelezionato.value,
              gioco_id: giocoSelezionato.value,
              data_inizio: formattedDataOraInizio,
              data_fine: formattedDataOraFine,
              nome_cliente: nomeCliente.value,
              email_cliente: emailCliente.value,
              telefono_cliente: telefonoCliente.value,
            },
          ]).select();

        if (error) throw error;

        // 4. Mostra notifica di successo
        $q.notify({
          message: 'Prenotazione effettuata con successo!',
          color: 'positive',
        });
        console.log('Dati prenotazione:', data);

        // 5. Reset del form e redirect
        form.value.reset(); // Resetta campi e validazione

        setTimeout(() => {
          router.push('/');
        }, 1500);
      } catch (error) {
        console.error('Errore durante la prenotazione:', error);
        $q.notify({
          message: 'Errore durante la prenotazione. Riprova.',
          color: 'negative',
        });
      }
    };

    return {
      form,
      tavoloSelezionato,
      giocoSelezionato,
      dataInizio,
      oraInizio,
      dataFine,
      oraFine,
      nomeCliente,
      emailCliente,
      telefonoCliente,
      opzioniTavoli,
      opzioniGiochi,
      onSubmit,
      quasarLang
    };
  },
});
</script>
