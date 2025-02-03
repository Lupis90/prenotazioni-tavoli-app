<template>
  <q-layout view="lHh Lpr lFf" class="bg-warm-gray-1">
    <q-header elevated class="header-gradient">
      <q-toolbar class="q-py-md">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="q-mr-sm"
        />

        <!-- Logo e Titolo -->
        <div class="row items-center no-wrap">
          <q-avatar size="40px" class="q-mr-sm">
            <img src="~assets/logo.png" alt="Logo">
          </q-avatar>
          <div>
            <div class="text-h5 text-weight-bold letter-spacing">LOG</div>
            <div class="text-caption">Life of Gamers</div>
          </div>
        </div>

        <q-space />

        <!-- Quick Actions -->
        <div class="gt-xs">
          <q-btn-group flat>
            <q-btn flat round>
              <q-avatar size="26px">
                <img src="https://cdn.quasar.dev/img/boy-avatar.png">
              </q-avatar>
              <q-tooltip>Il mio profilo</q-tooltip>
            </q-btn>
            <q-btn flat round icon="notifications">
              <q-badge color="red" floating>2</q-badge>
              <q-tooltip>Notifiche</q-tooltip>
            </q-btn>
            <q-btn flat round icon="help">
              <q-tooltip>Aiuto</q-tooltip>
            </q-btn>
          </q-btn-group>
        </div>
      </q-toolbar>

      <!-- Breadcrumbs sotto la toolbar -->
      <q-toolbar class="bg-transparent text-white q-py-xs">
        <q-breadcrumbs>
          <q-breadcrumbs-el icon="home" to="/" />
          <q-breadcrumbs-el
            :label="currentRouteName"
            :to="$route.path"
          />
        </q-breadcrumbs>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-white shadow-2"
      :width="280"
    >
      <q-list padding class="text-deep-orange-9">
        <q-item-label header class="text-weight-bold text-deep-orange-7 q-pb-none">
          NAVIGATION
        </q-item-label>

        <q-item
          v-for="link in navLinks"
          :key="link.title"
          :to="link.to"
          clickable
          exact
          class="q-my-xs rounded-borders"
          active-class="active-nav-item"
        >
          <q-item-section avatar>
            <q-icon
              :name="link.icon"
              size="sm"
              color="deep-orange-7"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-subtitle1 text-weight-medium">
              {{ link.title }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container class="bg-warm-gray-1">
      <router-view class="q-pa-md" />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'MainLayout',

  setup() {
    const route = useRoute();
    const leftDrawerOpen = ref(false)
    const navLinks = [
      {
        title: 'Home',
        icon: 'home',
        to: '/'
      },
      {
        title: 'Giochi',
        icon: 'sports_esports',
        to: '/giochi'
      },
      {
        title: 'Prenota',
        icon: 'book_online',
        to: '/prenota'
      }
    ]

    const currentRouteName = computed(() => {
      const name = route.name?.toString() || '';
      return name.charAt(0).toUpperCase() + name.slice(1);
    });

    return {
      leftDrawerOpen,
      navLinks,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      currentRouteName
    }
  }
});
</script>

<style lang="scss">
.letter-spacing {
  letter-spacing: 0.5px;
}

.active-nav-item {
  background: rgba(255, 171, 145, 0.15) !important;
  border-left: 4px solid #b47664;
  color: #af6852 !important;

  .q-icon {
    color: #bf360c !important;
  }
}

.q-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover:not(.active-nav-item) {
    background: rgba(255, 171, 145, 0.08);
    transform: translateX(4px);
  }
}

.bg-warm-gray-1 {
  background: #f5f5f5;
}

.header-gradient {
  background: linear-gradient(135deg, #FF8C69, #FF4081);

  .q-toolbar {
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(5px);
  }

  .q-avatar {
    border: 2px solid rgba(255,255,255,0.2);
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(255,255,255,0.5);
      transform: scale(1.05);
    }
  }

  .q-breadcrumbs {
    font-size: 0.8rem;
    opacity: 0.8;

    &__separator {
      color: rgba(255,255,255,0.5);
    }
  }
}

.q-btn-group .q-btn {
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255,255,255,0.1);
  }
}

.text-caption {
  opacity: 0.8;
  font-size: 0.7rem;
  letter-spacing: 0.5px;
}
</style>
