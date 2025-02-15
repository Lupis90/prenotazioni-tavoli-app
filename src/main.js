import { createApp } from 'vue'
import App from './App.vue'
import Plugin from '@quasar/quasar-ui-qcalendar/src/QCalendarDay'
import '@quasar/quasar-ui-qcalendar/src/css/calendar-day.scss'
import QCalendarPlugin from '@quasar/quasar-ui-qcalendar'
import { plugin } from 'postcss'

const app = createApp(App)
app.use(QCalendarPlugin, Plugin)
app.mount('#app')
