<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title>
          Prenotazione Tavoli
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>
          Menu
        </q-item-label>

        <q-item to="/" clickable tag="a">
          <q-item-section avatar>
            <q-icon name="table_restaurant" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Tavoli</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/giochi" clickable tag="a">
          <q-item-section avatar>
            <q-icon name="sports_esports" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Giochi</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/prenota" clickable tag="a">
          <q-item-section avatar>
            <q-icon name="book_online" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Prenota</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'MainLayout',

  setup () {
    const leftDrawerOpen = ref(false)

    return {
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
});
</script>
