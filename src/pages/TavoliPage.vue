<template>
  <q-page padding>
    <h6 class="q-mb-md">Tavoli</h6>
    <q-table
      :rows="tavoli"
      :columns="columnsTavoli"
      row-key="id"
      :loading="loadingTavoli"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="numero" :props="props">
            {{ props.row.numero }}
          </q-td>
          <q-td key="posti" :props="props">
            {{ props.row.posti }}
          </q-td>
          <q-td key="descrizione" :props="props">
            {{ props.row.descrizione }}
          </q-td>
          <q-td key="disponibile" :props="props">
            <q-badge :color="props.row.disponibile ? 'green' : 'red'">
              {{ props.row.disponibile ? 'Disponibile' : 'Non disponibile' }}
            </q-badge>
          </q-td>
        </q-tr>
      </template>
      <template v-slot:no-data>
        Nessun tavolo disponibile.
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

const columnsTavoli = [
  { name: 'numero', align: 'left', label: 'Numero', field: 'numero' },
  { name: 'posti', align: 'left', label: 'Posti', field: 'posti' },
  { name: 'descrizione', align: 'left', label: 'Descrizione', field: 'descrizione' },
  { name: 'disponibile', align: 'left', label: 'Disponibile', field: 'disponibile' },
];

export default defineComponent({
  name: 'TavoliPage',
  setup() {
    const tavoli = ref([]);
    const loadingTavoli = ref(false);

    onMounted(() => {
      (async () => { // <-- IIFE
        loadingTavoli.value = true;
        try {
          const { data, error } = await supabase
            .from('tavoli')
            .select('*');
          if (error) throw error;
          tavoli.value = data;
        } catch (error) {
          console.error('Errore nel caricamento dei tavoli:', error);
        } finally {
          loadingTavoli.value = false;
        }
      })(); // <-- Chiamata immediata della funzione
    });

    return {
      tavoli,
      columnsTavoli,
      loadingTavoli
    };
  },
});
</script>
