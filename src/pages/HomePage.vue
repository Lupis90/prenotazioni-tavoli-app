<template>
  <q-page :class="$q.dark.isActive ? 'bg-dark' : 'bg-warm-gray-1'">
    <!-- Hero Section -->
    <div class="hero-section text-center q-pa-xl" data-aos="fade-down">
      <h1 class="text-h2 text-weight-bold text-primary q-mb-md">Life of Gamers</h1>
      <p class="text-h5 text-grey-8 q-mb-xl">Il tuo posto ideale per giocare in compagnia</p>
      <q-btn
        to="/prenota"
        color="primary"
        label="Prenota Ora"
        class="q-px-xl q-py-sm text-weight-bold"
        size="lg"
        unelevated
      />
    </div>

    <!-- Welcome Section -->
    <div class="welcome-section q-mt-xl q-pa-lg" data-aos="fade-up">
      <q-card :class="$q.dark.isActive ? 'bg-dark-drawer text-white' : 'bg-white'" class="q-pa-xl">
        <div class="text-h4 text-primary text-center q-mb-lg">
          Benvenuto in LOG - Life Of Gamers! 🎲✨
        </div>

        <div class="text-body1 q-mb-md">
          Sei mai stato bloccato in una serata noiosa senza sapere cosa fare? O magari pensi che i
          giochi da tavolo siano solo Monopoli e Risiko? Beh, preparati a ricrederti!
        </div>

        <div class="text-body1 q-mb-md">
          LOG - Life Of Gamers è l'associazione perfetta per chi ama i giochi da tavolo… e per chi
          non sa ancora di amarli! 😏
        </div>

        <div class="text-body1 q-mb-md">
          Qui non servono manuali di mille pagine o strategie da gran maestro: basta la voglia di
          divertirsi e di passare una serata diversa dal solito. Che tu sia un esperto di
          deck-building, un amante del lancio di dadi o un totale principiante che non ha mai
          toccato una pedina in vita sua, sei nel posto giusto!
        </div>

        <div class="text-h5 text-primary q-my-md">🔥 Cosa troverai da noi?</div>

        <ul class="features-list q-mb-lg">
          <li>✅ Un gruppo di persone accoglienti e pronte a farti scoprire giochi nuovi.</li>
          <li>✅ Serate piene di sfide epiche, risate e improbabili alleanze.</li>
          <li>
            ✅ Tornei per chi vuole mettersi alla prova e partite rilassate per chi vuole solo
            divertirsi.
          </li>
          <li>✅ La certezza di non dover mai più dire "Non so cosa fare stasera" 😎</li>
        </ul>

        <div class="text-body1 q-mb-md">
          Vieni a trovarci, prendi una sedia e unisciti alla partita! Non serve esperienza, non
          serve strategia… serve solo voglia di giocare!
        </div>

        <div class="text-h5 text-primary text-center q-mt-lg">🚀 Sei pronto? Noi sì!</div>
      </q-card>
    </div>

    <!-- Stats Section -->
    <div class="row q-col-gutter-md q-mt-xl">
      <div class="col-12 col-sm-4" data-aos="zoom-in" data-aos-delay="0">
        <q-card
          :class="$q.dark.isActive ? 'bg-dark-drawer text-white' : 'bg-white'"
          class="text-center q-pa-md"
        >
          <q-icon name="sports_esports" size="3rem" color="primary" />
          <div class="text-h4 q-mt-sm text-weight-bold">50+</div>
          <div class="text-subtitle1">Giochi da Tavolo</div>
        </q-card>
      </div>
      <div class="col-12 col-sm-4" data-aos="zoom-in" data-aos-delay="200">
        <q-card
          :class="$q.dark.isActive ? 'bg-dark-drawer text-white' : 'bg-white'"
          class="text-center q-pa-md"
        >
          <q-icon name="groups" size="3rem" color="primary" />
          <div class="text-h4 q-mt-sm text-weight-bold">1000+</div>
          <div class="text-subtitle1">Giocatori Felici</div>
        </q-card>
      </div>
      <div class="col-12 col-sm-4" data-aos="zoom-in" data-aos-delay="400">
        <q-card
          :class="$q.dark.isActive ? 'bg-dark-drawer text-white' : 'bg-white'"
          class="text-center q-pa-md"
        >
          <q-icon name="event_available" size="3rem" color="primary" />
          <div class="text-h4 q-mt-sm text-weight-bold">24/7</div>
          <div class="text-subtitle1">Disponibilità</div>
        </q-card>
      </div>
    </div>

    <!-- Featured Games Section -->
    <div class="q-mt-xl">
      <h2 class="text-h4 text-center q-mb-lg" data-aos="fade-up">Giochi in Evidenza</h2>
      <div class="row q-col-gutter-lg">
        <div
          v-for="(game, index) in featuredGames"
          :key="game.id"
          class="col-12 col-sm-6 col-md-4"
          data-aos="fade-up"
          :data-aos-delay="index * 200"
        >
          <q-card
            :class="$q.dark.isActive ? 'bg-dark-drawer text-white' : 'bg-white'"
            class="game-card"
          >
            <q-img :src="game.copertina" :ratio="16 / 9" />
            <q-card-section>
              <div class="text-h6">{{ game.nome }}</div>
              <div class="text-subtitle2">
                {{ game.giocatori_min }}-{{ game.giocatori_max }} giocatori
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { supabase } from 'src/supabase'

export default defineComponent({
  name: 'HomePage',

  setup() {
    const featuredGames = ref([])

    onMounted(async () => {
      try {
        const { data, error } = await supabase.from('giochi').select('*').limit(3)

        if (error) throw error

        // Aggiungi URL delle copertine
        featuredGames.value = await Promise.all(
          data.map(async (game) => {
            if (game.copertina) {
              const {
                data: { publicUrl },
              } = supabase.storage.from('Copertine_giochi').getPublicUrl(game.copertina)
              return { ...game, copertina: publicUrl }
            }
            return game
          }),
        )
      } catch (error) {
        console.error('Errore nel caricamento dei giochi:', error)
      }
    })

    return {
      featuredGames,
    }
  },
})
</script>

<style lang="scss" scoped>
.hero-section {
  background:
    linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7)),
    url('/images/hero-bg.jpg') center/cover;
  border-radius: 16px;
  margin-bottom: 48px;
  transform-origin: top center;
}

.game-card {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

.q-card {
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  &.bg-dark-drawer {
    .text-subtitle1,
    .text-subtitle2,
    .text-caption {
      color: rgba(255, 255, 255, 0.7);
    }

    .q-separator {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.welcome-section {
  .q-card {
    border-radius: 16px;
  }

  .features-list {
    list-style: none;
    padding-left: 0;

    li {
      margin-bottom: 12px;
    }
  }
}

// Aggiungi queste nuove regole per migliorare le transizioni
[data-aos] {
  transition-timing-function: ease-out;
}
</style>
