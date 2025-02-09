<template>
  <router-view />
</template>

<script>
import { defineComponent, onMounted } from 'vue'
import AOS from 'aos'
import 'aos/dist/aos.css'

export default defineComponent({
  name: 'App',
  setup() {
    onMounted(() => {
      AOS.init({
        duration: 1000,
        once: true,
        offset: 50,
      })
    })
  },
})
</script>
