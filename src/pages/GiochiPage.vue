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
  { name: 'nome', align: 'left', label: 'Nome', field: 'nome' },
  { name: 'descrizione', align: 'left', label: 'Descrizione', field: 'descrizione' },
  { name: 'quantita', align: 'left', label: 'Quantità', field: 'quantita' },
  { name: 'disponibile', align: 'left', label: 'Disponibile', field: 'disponibile' }
];

export default defineComponent({
  name: 'GiochiPage',
  setup() {
    const giochi = ref([]);
    const loadingGiochi = ref(false);

    onMounted(() => {
      (async () => { // <-- IIFE (Immediately Invoked Function Expression)
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
      })(); // <-- Chiamata immediata della funzione
    });

    return {
      giochi,
      columnsGiochi,
      loadingGiochi
    };
  },
});
</script>
