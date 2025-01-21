<template>
  <q-page padding>
    <h6 class="q-mb-md">Prenota</h6>
    <PrenotazioneForm/>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import PrenotazioneForm from 'components/PrenotazioneForm.vue'

export default defineComponent({
  name: 'PrenotaPage',
  components: {
    PrenotazioneForm
  }
});
</script>
