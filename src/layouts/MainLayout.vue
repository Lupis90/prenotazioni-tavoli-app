<template>
  <q-layout :class="$q.dark.isActive ? 'bg-dark' : 'bg-warm-gray-1'">
    <q-header elevated :class="$q.dark.isActive ? 'header-gradient-dark' : 'header-gradient'">
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
            <img src="~assets/logo.png" alt="Logo" />
          </q-avatar>
          <div>
            <div class="text-h5 text-weight-bold letter-spacing">LOG</div>
            <div class="text-caption">Life of Gamers</div>
          </div>
        </div>

        <q-space />

        <!-- Quick Actions -->
        <div v-if="isLoggedIn" class="row items-center q-gutter-sm">
          <div class="text-subtitle2 q-mr-sm">Ciao {{ userProfile?.user_name }},</div>
          <q-btn flat dense round icon="logout" @click="handleLogout" />
        </div>
        <q-btn v-else to="/login" flat dense label="Login" />
        <q-btn
          flat
          dense
          round
          :icon="$q.dark.isActive ? 'dark_mode' : 'light_mode'"
          @click="$q.dark.toggle()"
          aria-label="Toggle dark mode"
        />
      </q-toolbar>

      <!-- Breadcrumbs sotto la toolbar -->
      <q-toolbar class="bg-transparent text-white q-py-xs">
        <q-breadcrumbs>
          <q-breadcrumbs-el icon="home" to="/" />
          <q-breadcrumbs-el :label="currentRouteName" :to="$route.path" />
        </q-breadcrumbs>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :class="$q.dark.isActive ? 'bg-dark-drawer' : 'bg-white'"
      :width="280"
    >
      <q-list padding class="text-deep-orange-9">
        <q-item-label header class="text-weight-bold text-deep-orange-7 q-pb-none">
          NAVIGATION
        </q-item-label>

        <q-item
          v-for="link in filteredNavLinks"
          :key="link.title"
          :to="link.to"
          exact
          clickable
          class="q-my-xs rounded-borders"
          active-class="active-nav-item"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" size="sm" color="deep-orange-7" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-subtitle1 text-weight-medium">
              {{ link.title }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container :class="$q.dark.isActive ? 'bg-dark' : 'bg-warm-gray-1'">
      <router-view class="q-pa-md" />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { supabase } from '../supabase';

export default defineComponent({
  name: 'MainLayout',

  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();
    const leftDrawerOpen = ref(false);
    const isLoggedIn = ref(false);
    const userProfile = ref(null);
    const isAdmin = ref(false);

    const loadUserProfile = async (userId) => {
      if (!userId) {
        userProfile.value = null;
        isAdmin.value = false;
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_name, is_admin')
          .eq('id', userId)
          .single();

        if (error) throw error;

        userProfile.value = data;
        isAdmin.value = data?.is_admin || false;
      } catch (err) {
        console.error('Error loading user profile:', err);
        userProfile.value = null;
        isAdmin.value = false;
      }
    };

    const checkUserSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      isLoggedIn.value = !!session;
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        userProfile.value = null;
        isAdmin.value = false;
      }
    };

    onMounted(async () => {
      await checkUserSession();
    });

    // Fondamentale: Reagisci ai cambi di rotta e controlla la sessione.
    watch(
      () => route.path, // Osserva i cambiamenti nel percorso
      async () => {
        await checkUserSession(); // Controlla la sessione ad ogni cambio di rotta
      },
{ immediate: false }

    );


    const navLinks = [
      {
        title: 'Home',
        icon: 'home',
        to: '/',
      },
      {
        title: 'Giochi',
        icon: 'sports_esports',
        to: '/giochi',
      },
      {
        title: 'Prenota',
        icon: 'book_online',
        to: '/prenota',
      },
      {
        title: 'Dashboard',
        icon: 'dashboard',
        to: '/dashboard',
        adminOnly: true,
      },
      {
        title: 'Aggiungi Giochi',
        icon: 'add_circle',
        to: '/load-new-games',
        adminOnly: true,
      },
      {
        title: 'Gestione Disponibilità',
        icon: 'event_available',
        to: '/admin-availability',
        adminOnly: true,
      },
    ];

    const handleLogout = async () => {
      await checkUserSession(); // Aggiorna lo stato PRIMA del logout
      await supabase.auth.signOut();
      router.push('/login');
    };

    const currentRouteName = computed(() => {
      const name = route.name?.toString() || '';
      return name.charAt(0).toUpperCase() + name.slice(1);
    });

    const filteredNavLinks = computed(() => {
      return navLinks.filter((link) => {
        if (link.adminOnly) return isAdmin.value;
        return true;
      });
    });

    router.onError((error) => {
      console.error('Navigation error:', error);
      $q.notify({
        type: 'warning',
        message: 'Errore di navigazione, riprova',
      });
    });

    return {
      leftDrawerOpen,
      navLinks,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
        if (leftDrawerOpen.value && window.innerWidth < 1024) {
          const closeDrawer = (e) => {
            if (!e.target.closest('.q-drawer')) {
              leftDrawerOpen.value = false;
              document.removeEventListener('click', closeDrawer);
            }
          };
          setTimeout(() => {
            document.addEventListener('click', closeDrawer);
          }, 300);
        }
      },
      currentRouteName,
      isLoggedIn,
      userProfile,
      handleLogout,
      isAdmin,
      filteredNavLinks,
    };
  },
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
  background: linear-gradient(135deg, #ff8c69, #ff4081);

  .q-toolbar {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
  }

  .q-avatar {
    border: 2px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(255, 255, 255, 0.5);
      transform: scale(1.05);
    }
  }

  .q-breadcrumbs {
    font-size: 0.8rem;
    opacity: 0.8;

    &__separator {
      color: rgba(255, 255, 255, 0.5);
    }
  }
}

.header-gradient-dark {
  background: linear-gradient(135deg, #333, #555);

  .q-toolbar {
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
  }

  .q-avatar {
    border: 2px solid rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(0, 0, 0, 0.5);
      transform: scale(1.05);
    }
  }

  .q-breadcrumbs {
    font-size: 0.8rem;
    opacity: 0.8;

    &__separator {
      color: rgba(255, 255, 255, 0.5);
    }
  }
}

.bg-dark {
  background: #121212;
}

.bg-dark-drawer {
  background: #1e1e1e;
}

.q-btn-group .q-btn {
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}
.text-caption {
  opacity: 0.8;
  font-size: 0.7rem;
  letter-spacing: 0.5px;
}
</style>
