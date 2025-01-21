<template>
  <q-page padding>
    <h6 class="q-mb-md">Giochi</h6>
    <q-table
      :rows="giochi"
      :columns="columnsGiochi"
      row-key="id"
      :loading="loadingGiochi"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="nome" :props="props">
            {{ props.row.nome }}
          </q-td>
          <q-td key="descrizione" :props="props">
            {{ props.row.descrizione }}
          </q-td>
          <q-td key="quantita" :props="props">
            {{ props.row.quantita }}
          </q-td>
          <q-td key="disponibile" :props="props">
            <q-badge :color="props.row.disponibile ? 'green' : 'red'">
              {{ props.row.disponibile ? 'Disponibile' : 'Non disponibile' }}
            </q-badge>
          </q-td>
          <!-- Nuove colonne -->
          <q-td key="giocatori_min" :props="props">
            {{ props.row.giocatori_min }}
          </q-td>
          <q-td key="giocatori_max" :props="props">
            {{ props.row.giocatori_max }}
          </q-td>
          <q-td key="durata_media" :props="props">
            {{ props.row.durata_media }} min
          </q-td>
        </q-tr>
      </template>

      <template v-slot:no-data>
        Nessun gioco disponibile.
      </template>
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { supabase } from 'src/supabase';

const columnsGiochi = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' },
  { name: 'descrizione', label: 'Descrizione', field: 'descrizione', align: 'left' },
  { name: 'quantita', label: 'Quantità', field: 'quantita', align: 'left' },
  { name: 'disponibile', label: 'Disponibile', field: 'disponibile', align: 'left' },
  { name: 'giocatori_min', label: 'Min', field: 'giocatori_min', align: 'left' },
  { name: 'giocatori_max', label: 'Max', field: 'giocatori_max', align: 'left' },
  { name: 'durata_media', label: 'Durata (min)', field: 'durata_media', align: 'left' }
];

export default defineComponent({
  name: 'GiochiPage',
  setup() {
    const giochi = ref([]);
    const loadingGiochi = ref(false);

    onMounted(async () => {
      loadingGiochi.value = true;
      try {
        const { data, error } = await supabase
          .from('giochi')
          .select('*');
        if (error) throw error;
        giochi.value = data;
      } catch (error) {
        console.error('Errore nel caricamento dei giochi:', error);
      } finally {
        loadingGiochi.value = false;
      }
    });

    return {
      giochi,
      columnsGiochi,
      loadingGiochi
    };
  },
});
</script>
