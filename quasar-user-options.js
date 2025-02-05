import { Notify } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'

// Import QCalendar styles and component
import '@quasar/quasar-ui-qcalendar/dist/index.css'
import { QCalendarDay } from '@quasar/quasar-ui-qcalendar'

export default {
  config: {},
  plugins: {
    Notify
  },
  components: {
    QCalendarDay
  }
}
