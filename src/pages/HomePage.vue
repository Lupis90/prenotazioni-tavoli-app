<template>
  <q-page :class="$q.dark.isActive ? 'bg-dark' : 'bg-warm-gray-1'">
    <!-- Hero Section -->
    <div class="hero-section text-center q-pa-xl" data-aos="fade-down">
      <h1 class="text-h2 text-weight-bold text-primary q-mb-md">Life of Gamers</h1>
      <p class="text-h5 text-grey-8 q-mb-xl">Il tuo posto ideale per giocare in compagnia</p>

      <div class="row justify-center q-gutter-md">
        <q-btn
          to="/prenota"
          color="primary"
          label="Prenota Ora"
          class="q-px-xl q-py-sm text-weight-bold"
          size="lg"
          unelevated
        />
        <q-btn
          href="https://www.instagram.com/log_life_of_gamers/"
          target="_blank"
          color="secondary"
          class="instagram-btn q-px-xl q-py-sm text-weight-bold"
          size="lg"
          unelevated
        >
          <div class="row items-center">
            Seguici su Instagram
          </div>
        </q-btn>
      </div>

      <p class="text-subtitle2 q-mt-md">
        <q-icon name="people" /> Unisciti alla nostra community!
      </p>
    </div>

  <!-- Welcome Section -->
    <div class="welcome-section q-mt-xl q-pa-lg" data-aos="fade-up">
      <q-card :class="$q.dark.isActive ? 'bg-dark-drawer text-white' : 'bg-white'" class="q-pa-xl">
        <div class="text-h4 text-primary text-center q-mb-lg">
          Benvenuto in LOG - Life Of Gamers! 🎲✨
        </div>
        <div class="text-body1 q-mb-md">
          Sei mai stato bloccato in una serata noiosa senza sapere cosa fare? O magari pensi che i giochi da tavolo siano solo Monopoli e Risiko? Beh, preparati a ricrederti! Serate piene di sfide epiche, risate e improbabili alleanze.
        </div>
        <div class="text-body1 q-mb-md">
          Qui non servono manuali di mille pagine o strategie da gran maestro: basta la voglia di divertirsi e di passare una serata diversa dal solito. Che tu sia un esperto di deck-building, un amante del lancio di dadi o un totale principiante, sei nel posto giusto!
        </div>
        <div class="text-body1 q-mb-md">
          Unisciti a noi e scopri nuovi giochi, nuove amicizie e nuove emozioni!
        </div>
        <div class="text-h5 text-primary q-my-md">🔥 Cosa troverai da noi?</div>
        <ul class="features-list q-mb-lg">
          <li>✅ Un gruppo di persone accoglienti e pronte a farti scoprire giochi nuovi.</li>
          <li>✅ Serate piene di sfide epiche, risate e improbabili alleanze.</li>
          <li>✅ Tornei per chi vuole mettersi alla prova e partite rilassate per chi vuole solo divertirsi.</li>
          <li>✅ La certezza di non dover mai più dire "Non so cosa fare stasera" 😎</li>
          <li>✅ Avventure su Instagram per restare sempre aggiornato sugli eventi!</li>
        </ul>
        <div class="text-body1 q-mb-md">
          Vieni a trovarci, prendi una sedia e unisciti alla partita! Non serve esperienza, non serve strategia… serve solo voglia di giocare!
        </div>
        <div class="text-h5 text-primary text-center q-mt-lg">🚀 Sei pronto? Noi sì!</div>
      </q-card>
    </div>

      <!-- Instagram Preview Section -->
      <div class="instagram-preview q-mt-xl q-pa-lg" data-aos="fade-up">
      <q-card :class="$q.dark.isActive ? 'bg-dark-drawer text-white' : 'bg-white'" class="q-pa-lg">
        <div class="text-h4 text-primary text-center q-mb-md">
          <q-icon name="fab fa-instagram" class="q-mr-sm" /> La nostra community su Instagram
        </div>
        <p class="text-center q-mb-lg">
          Segui
          <a
            href="https://www.instagram.com/log_life_of_gamers/"
            target="_blank"
            class="text-primary"
          >@log_life_of_gamers</a>
          per contenuti esclusivi, aggiornamenti in tempo reale e per farti ispirare dalla nostra community!
        </p>
        <!-- Sezione Embed di Instagram -->
        <div class="instagram-carousel row justify-center q-mb-lg">
          <div class="instagram-post-container">
            <div style="transform: none; height: auto;">
              <blockquote
                class="instagram-media"
                data-instgrm-permalink="https://www.instagram.com/p/DGilmortnna/"
                data-instgrm-version="14"
                style="background: #fff; border: 0; border-radius: 3px; box-shadow: 0 0 1px rgba(0,0,0,0.5), 0 1px 10px rgba(0,0,0,0.15); margin: 1px; max-width: 326px; max-height: 500px; padding: 0; width: calc(100% - 2px);"
              ></blockquote>
            </div>
          </div>
          <div class="instagram-post-container">
            <div style="transform: none; height: auto;">
              <blockquote
                class="instagram-media"
                data-instgrm-permalink="https://www.instagram.com/p/DGY42ZRNbH4/"
                data-instgrm-version="14"
                style="background: #fff; border: 0; border-radius: 3px; box-shadow: 0 0 1px rgba(0,0,0,0.5), 0 1px 10px rgba(0,0,0,0.15); margin: 1px; max-width: 326px; max-height: 500px; padding: 0; width: calc(100% - 2px);"
              ></blockquote>
            </div>
          </div>
          <div class="instagram-post-container">
            <div style="transform: none; height: auto;">
              <blockquote
                class="instagram-media"
                data-instgrm-permalink="https://www.instagram.com/p/DFA7WkYNWN2/"
                data-instgrm-version="14"
                style="background: #fff; border: 0; border-radius: 3px; box-shadow: 0 0 1px rgba(0,0,0,0.5), 0 1px 10px rgba(0,0,0,0.15); margin: 1px; max-width: 326px; max-height: 500px; padding: 0; width: calc(100% - 2px);"
              ></blockquote>
            </div>
          </div>
        </div>
        <div class="text-center q-mt-lg">
          <q-btn
            href="https://www.instagram.com/log_life_of_gamers/"
            target="_blank"
            color="secondary"
            icon="fab fa-instagram"
            label="Vedi tutti i post"
            unelevated
          />
        </div>
      </q-card>
    </div>

    <!-- Featured Games Section -->
    <div class="q-pa-lg">
      <h2 class="text-h4 text-center q-mb-lg" data-aos="fade-up">Giochi in Evidenza</h2>
      <div class="row q-col-gutter-md">
        <q-card
          v-for="(game, index) in featuredGames"
          :key="game.id"
          class="col-12 col-sm-6 col-md-4 game-card cursor-pointer"
          data-aos="fade-up"
          :data-aos-delay="index * 200"
        >
          <q-img
            :src="game.copertina"
            alt="Copertina gioco"
            style="max-height: 200px; object-fit: contain"
          />
          <q-card-section>
            <div class="text-h6">{{ game.nome }}</div>
            <div>{{ game.giocatori_min }} - {{ game.giocatori_max }} giocatori</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Floating Social Button -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab color="secondary" icon="fab fa-instagram" size="lg" @click="openInstagram">
        <q-tooltip>Seguici su Instagram</q-tooltip>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { supabase } from 'src/supabase'

export default defineComponent({
  name: 'HomePage',
  setup() {
    const featuredGames = ref([])

    const openInstagram = () => {
      window.open('https://www.instagram.com/log_life_of_gamers/', '_blank')
    }

    onMounted(async () => {
      try {
        // Carica i giochi dalla tabella 'giochi'
        const { data, error } = await supabase.from('giochi').select('*').limit(3)
        if (error) throw error

        // Elaborazione dei dati e ottenimento dell'URL pubblico per ogni copertina
        featuredGames.value = await Promise.all(
          data.map(async (game) => {
            if (game.copertina) {
              const { data: storageData } = await supabase
                .storage
                .from('Copertine_giochi')
                .getPublicUrl(game.copertina)
              return { ...game, copertina: storageData.publicUrl }
            }
            return game
          })
        )

        // Carica lo script di Instagram per gli embed
        const instagramScript = document.createElement('script')
        instagramScript.async = true
        instagramScript.src = '//www.instagram.com/embed.js'
        document.body.appendChild(instagramScript)

        // Re-initialize Instagram embeds
        if (window.instgrm) {
          window.instgrm.Embeds.process()
        }
      } catch (error) {
        console.error('Errore nel caricamento dei giochi:', error)
      }
    })

    return {
      featuredGames,
      openInstagram
    }
  }
})
</script>

<style lang="scss" scoped>
.instagram-carousel {
  overflow-x: auto;
  white-space: nowrap;

  .instagram-post-container {
    display: inline-block;
    margin-right: 10px; // Add some spacing between posts
  }
}

.game-card {
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

.welcome-section {
  .q-card {
    border-radius: 16px;
    transition: all 0.3s ease;
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }
  }
}

.instagram-btn {
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.05);
  }
}

.features-list {
  list-style: none;
  padding-left: 0;
  li {
    margin-bottom: 12px;
  }
}

/* Stili per l'embed di Instagram */
.instagram-media {
  margin: 0 auto;
}
</style>
