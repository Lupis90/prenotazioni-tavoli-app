<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="text-h3 text-weight-bold q-mr-auto text-gradient">La nostra libreria</div>
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
      <div class="row items-center q-gutter-x-md">
        <div class="col-grow">
          <q-input v-model="searchText" size="sm" outlined placeholder="Cerca gioco...">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-auto">
          <q-btn-dropdown color="primary" icon="filter_list" label="Filtri" size="sm" class="search-filter-btn">
            <q-card style="min-width: 300px">
              <q-card-section>
                <div class="q-mb-md">
                  <div class="text-subtitle2 q-mb-sm">Numero giocatori</div>
                  <q-input
                    v-model.number="filters.groupPlayers"
                    type="number"
                    label="Numero giocatori"
                    dense
                    outlined
                    style="width: 100px"
                  />
                </div>
                <div class="q-mb-md">
                  <div class="text-subtitle2 q-mb-sm">Difficoltà</div>
                  <q-option-group
                    v-model="filters.difficulty"
                    :options="[
                      { label: 'Facile', value: 'facile' },
                      { label: 'Medio', value: 'medio' },
                      { label: 'Difficile', value: 'difficile' }
                    ]"
                    type="checkbox"
                    dense
                  />
                </div>
                <div>
                  <q-chip v-model="filterAvailable" icon="check_circle" clickable>
                    Solo disponibili
                  </q-chip>
                </div>
              </q-card-section>
              <q-card-actions align="right" class="q-pa-sm">
                <q-btn flat label="Reset" color="grey" @click="resetFilters" />
              </q-card-actions>
            </q-card>
          </q-btn-dropdown>
        </div>
      </div>
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
    const filterAvailable = ref(false)
    const filters = ref({
      groupPlayers: null,
      difficulty: [],
    })

    const resetFilters = () => {
      filters.value = {
        groupPlayers: null,
        difficulty: [],
      }
      filterAvailable.value = false
    }

    const filteredGiochi = computed(() => {
      let filtered = giochi.value

      // Filter by search text
      const search = searchText.value.toLowerCase().trim()
      if (search) {
        filtered = filtered.filter(gioco => gioco.nome.toLowerCase().includes(search))
      }

      // Filter by availability
      if (filterAvailable.value) {
        filtered = filtered.filter(gioco => gioco.disponibile)
      }

      // Filter by number of players
      if (filters.value.groupPlayers) {
        filtered = filtered.filter(gioco =>
          filters.value.groupPlayers >= gioco.giocatori_min &&
          filters.value.groupPlayers <= gioco.giocatori_max
        )
      }

      // Filter by difficulty
      if (filters.value.difficulty.length > 0) {
        filtered = filtered.filter(gioco =>
          filters.value.difficulty.includes(gioco.difficolta)
        )
      }

      return filtered
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
      filterAvailable,
      filters,
      resetFilters,
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

.search-filter-btn {
  height: 32px;
}

.search-filters {
  .q-field--outlined {
    .q-field__control {
      height: 32px;
      min-height: 32px;
      padding: 0 8px;
    }
    .q-field__append {
      height: 32px;
      min-height: 32px;
      padding: 0;
    }
    .q-icon {
      font-size: 20px;
      height: 32px;
      line-height: 32px;
    }
  }
}
</style>
