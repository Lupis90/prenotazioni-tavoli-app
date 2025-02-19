<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="text-h5 text-weight-bold q-mr-auto">Catalogo Giochi</div>
      <q-btn-toggle
        v-model="viewType"
        flat
        :options="[
          { label: 'Griglia', value: 'grid', icon: 'grid_view' },
          { label: 'Lista', value: 'list', icon: 'view_list' },
        ]"
      />
    </div>

    <div class="search-filters q-mb-md">
      <q-input v-model="searchText" dense outlined placeholder="Cerca gioco..." class="q-mb-md">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-slide-transition>
        <div v-show="showFilters" class="filters-container q-mt-sm">
          <q-chip v-model="filterAvailable" icon="check_circle" clickable>
            Solo disponibili
          </q-chip>
        </div>
      </q-slide-transition>
    </div>

    <transition-group name="q-transition--fade" class="row q-col-gutter-md" tag="div" appear>
      <template v-if="viewType === 'grid'">
        <div v-for="game in filteredGiochi" :key="game.id" class="col-12 col-sm-6 col-md-4">
          <q-card
            :class="$q.dark.isActive ? 'bg-dark-drawer text-white' : 'bg-white'"
            class="game-card cursor-pointer"
            @click="openGameDetails(game)"
          >
            <q-img
              :src="getImageUrl(game.copertina)"
              alt="Copertina gioco"
              style="width: 100%; height: 200px; object-fit: cover"
            />
            <q-card-section>
              <div class="text-h6">{{ game.nome }}</div>
              <q-badge :color="game.disponibile ? 'green' : 'red'">
                {{ game.disponibile ? 'Disponibile' : 'Non disponibile' }}
              </q-badge>
              <div>{{ game.giocatori_min }} - {{ game.giocatori_max }} giocatori</div>
              <div>{{ game.durata_media }} min</div>
            </q-card-section>
          </q-card>
        </div>
      </template>
      <template v-else>
        <q-list bordered separator class="full-width">
          <q-item
            v-for="game in filteredGiochi"
            :key="game.id"
            clickable
            @click="showGameDetails(game)"
          >
            <q-item-section avatar>
              <q-img
                :src="getImageUrl(game.copertina)"
                alt="Copertina gioco"
                style="width: 50px; height: 50px; object-fit: cover"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ game.nome }}</q-item-label>
              <q-item-label caption>
                <q-badge :color="game.disponibile ? 'green' : 'red'">
                  {{ game.disponibile ? 'Disponibile' : 'Non disponibile' }}
                </q-badge>
                <div>{{ game.giocatori_min }} - {{ game.giocatori_max }} giocatori</div>
                <div>{{ game.durata_media }} min</div>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </template>
    </transition-group>

    <q-dialog v-model="showDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ selectedGame?.nome }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-img
            :src="selectedGame?.copertina ? getImageUrl(selectedGame.copertina) : ''"
            style="max-height: 200px; object-fit: contain"
            class="q-mb-md"
          />
          <p>{{ selectedGame?.descrizione }}</p>

          <div class="row q-mt-md">
            <div class="col-6">
              <div class="text-caption">Giocatori:</div>
              <div>{{ selectedGame?.giocatori_min }} - {{ selectedGame?.giocatori_max }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption">Durata media:</div>
              <div>{{ selectedGame?.durata_media }} min</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Chiudi" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import { supabase } from 'src/supabase'

const columnsGiochi = [
  {
    name: 'copertina',
    label: 'Copertina',
    field: 'copertina',
    align: 'left',
    style: 'width: 50px;',
  },
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' },
  { name: 'disponibile', label: 'Disponibile', field: 'disponibile', align: 'left' },
  { name: 'giocatori_min', label: 'Min', field: 'giocatori_min', align: 'left' },
  { name: 'giocatori_max', label: 'Max', field: 'giocatori_max', align: 'left' },
  { name: 'durata_media', label: 'Durata (min)', field: 'durata_media', align: 'left' },
]

export default defineComponent({
  name: 'GiochiPage',
  setup() {
    const giochi = ref([])
    const loadingGiochi = ref(false)
    const searchText = ref('')
    const viewType = ref('grid')
    const showFilters = ref(false)
    const filterAvailable = ref(false)

    const filteredGiochi = computed(() => {
      const search = searchText.value.toLowerCase().trim()
      if (!search) return giochi.value

      return giochi.value.filter(
        (gioco) =>
          gioco.nome.toLowerCase().includes(search) &&
          (!filterAvailable.value || gioco.disponibile),
      )
    })

    const getImageUrl = (fileName) => {
      if (!fileName) return ''
      return supabase.storage.from('Copertine_giochi').getPublicUrl(fileName).data.publicUrl
    }

    const showDialog = ref(false)
    const selectedGame = ref(null)

    const showGameDetails = (game) => {
      selectedGame.value = game
      showDialog.value = true
    }

    const openGameDetails = (game) => {
      selectedGame.value = game
      showDialog.value = true
    }

    onMounted(async () => {
      loadingGiochi.value = true
      try {
        const { data, error } = await supabase.from('giochi').select('*')
        if (error) throw error
        giochi.value = data
      } catch (error) {
        console.error('Errore nel caricamento dei giochi:', error)
      } finally {
        loadingGiochi.value = false
      }
    })

    return {
      giochi,
      columnsGiochi,
      loadingGiochi,
      getImageUrl,
      searchText,
      filteredGiochi,
      showDialog,
      selectedGame,
      showGameDetails,
      viewType,
      showFilters,
      filterAvailable,
      openGameDetails,
    }
  },
})
</script>

<style lang="scss">
.cursor-pointer {
  cursor: pointer;
}

.game-card {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

.search-filters {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 16px;
}

.q-transition--fade {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.3s ease;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
  }
}
</style>
