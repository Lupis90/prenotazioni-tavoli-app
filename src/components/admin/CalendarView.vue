<template>
  <div>
    <div class="row justify-between items-center q-mb-md">
      <h2 class="text-h5 q-my-none">Calendario Prenotazioni</h2>
      <div class="calendar-navigation">
        <q-btn flat round icon="chevron_left" @click="previousMonth" />
        <span class="text-h6 q-mx-md">{{ currentMonthName }} {{ currentYear }}</span>
        <q-btn flat round icon="chevron_right" @click="nextMonth" />
        <q-btn flat dense class="q-ml-sm" icon="today" label="Oggi" @click="goToToday" />
      </div>
    </div>

    <!-- Legenda -->
    <div class="row q-mb-sm justify-end">
      <div class="legend-item">
        <div class="color-box bg-green-2"></div>
        <span>0-6 persone</span>
      </div>
      <div class="legend-item">
        <div class="color-box bg-yellow-2"></div>
        <span>7-12 persone</span>
      </div>
      <div class="legend-item">
        <div class="color-box bg-orange-2"></div>
        <span>13-16 persone</span>
      </div>
      <div class="legend-item">
        <div class="color-box bg-red-2"></div>
        <span>>16 persone</span>
      </div>
    </div>

    <!-- Calendario Mensile -->
    <q-card flat bordered>
      <q-card-section class="q-pa-none">
        <div class="calendar-grid">
          <!-- Intestazione giorni della settimana -->
          <div class="calendar-header">
            <div v-for="day in daysOfWeek" :key="day" class="calendar-day-name">
              {{ day }}
            </div>
          </div>

          <!-- Griglia dei giorni -->
          <div class="calendar-body">
            <div
              v-for="(dayObj, index) in calendarDays"
              :key="index"
              class="calendar-day"
              :class="[
                { 'other-month': !dayObj.currentMonth },
                { 'today': isToday(dayObj.date) },
                { 'selected': isSelected(dayObj.date) },
                getBookingClass(dayObj.bookings)
              ]"
              @click="selectDate(dayObj.date)"
            >
              <div class="calendar-day-number">{{ dayObj.day }}</div>
              <div v-if="dayObj.bookings > 0" class="calendar-day-bookings">
                <q-badge color="primary" text-color="white">
                  {{ dayObj.bookings }}
                </q-badge>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Dettaglio giorno selezionato -->
    <q-card v-if="selectedDate" class="q-mt-md">
      <q-card-section class="row items-center">
        <div class="col-12 col-md-6">
          <h3 class="text-h5 q-my-none">Dettaglio {{ formatDate(selectedDate) }}</h3>
        </div>
        <div class="col-12 col-md-6 text-right">
          <q-chip icon="people" color="primary" text-color="white">
            Totale: {{ totalPeopleForSelectedDate }} persone
          </q-chip>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
const props = defineProps({
  selectedDate: String,
  totalPeopleForSelectedDate: Number,
  daysOfWeek: Array,
  currentMonthName: String,
  currentYear: Number,
  calendarDays: Array,
  previousMonth: Function,
  nextMonth: Function,
  goToToday: Function,
  isToday: Function,
  isSelected: Function,
  selectDate: Function,
  getBookingClass: Function,
  formatDate: Function
})
</script>

<style scoped>
.calendar-grid {
  display: flex;
  flex-direction: column;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.calendar-day-name {
  padding: 10px;
  text-align: center;
  font-weight: bold;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(80px, auto);
}

.calendar-day {
  position: relative;
  border: 1px solid #e0e0e0;
  padding: 5px;
  min-height: 80px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.calendar-day:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.calendar-day.other-month {
  color: #bdbdbd;
  background-color: #fafafa;
}

.calendar-day.today {
  border: 2px solid #1976d2;
}

.calendar-day.selected {
  background-color: rgba(25, 118, 210, 0.1);
}

.calendar-day-number {
  font-weight: 500;
  margin-bottom: 5px;
}

.calendar-day-bookings {
  position: absolute;
  bottom: 5px;
  right: 5px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-left: 20px;
}

.color-box {
  width: 20px;
  height: 20px;
  margin-right: 5px;
  border: 1px solid #e0e0e0;
}
</style>
