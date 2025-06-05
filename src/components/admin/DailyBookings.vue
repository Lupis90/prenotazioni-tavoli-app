<template>
  <div>
    <q-card>
      <q-card-section class="row q-col-gutter-md items-center">
        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
          <q-label class="text-h6">Seleziona una data:</q-label>
          <q-date
            v-model="selectedDate"
            mask="YYYY-MM-DD"
            :options="isValidDate"
            emit-immediately
            @update:model-value="onDateSelected"
          />
        </div>

        <q-card v-if="selectedDate" class="col-12 col-sm-6 col-md-4 col-lg-3 bg-primary-lighten-4">
          <q-card-section>
            <div class="text-center">
              <q-icon name="people" size="lg" color="primary" />
              <div class="text-h4 q-mt-sm">
                Totale persone prenotate il {{ formatDate(selectedDate) }}:
                <strong class="text-primary">{{ totalPeopleForSelectedDate }}</strong>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md">
      <section class="daily-bookings col q-mt-lg">
        <h2>Prenotazioni Giornaliere</h2>
        <q-table
          :rows="dailyBookings"
          :columns="dailyBookingsColumns"
          row-key="date"
          :loading="loading"
        >
          <template v-slot:body="props">
            <q-tr :props="props" :class="getRowClass(props.row)">
              <q-td key="date" :props="props">
                {{ formatDate(props.row.date) }}
              </q-td>
              <q-td key="totalBookings" :props="props">
                {{ props.row.totalBookings }}
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </section>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  selectedDate: String,
  totalPeopleForSelectedDate: Number,
  isValidDate: Function,
  onDateSelected: Function,
  dailyBookings: Array,
  dailyBookingsColumns: Array,
  loading: Boolean,
  getRowClass: Function,
  formatDate: Function
})
</script>

<style scoped>
.daily-bookings {
  width: 100%;
  margin-top: 20px;
}
</style>
