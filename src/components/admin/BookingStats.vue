<template>
  <div>
    <h2>Statistiche delle Prenotazioni</h2>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <h3 class="text-h6">Prenotazioni per Giorno della Settimana</h3>
            <div class="stats-placeholder q-pa-lg text-center">
              Grafico di distribuzione delle prenotazioni per giorno della settimana
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <h3 class="text-h6">Giochi Più Prenotati</h3>
            <div class="stats-placeholder q-pa-lg text-center">
              Grafico dei giochi più prenotati
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.stats-placeholder {
  height: 200px;
  background-color: #f5f5f5;
  border: 1px dashed #bdbdbd;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
