<template>
  <q-page padding>
    <!-- Hero Section -->
    <div class="hero-section text-center q-pa-xl">
      <h1 class="text-h2 text-weight-bold text-primary q-mb-md">
        Life of Gamers
      </h1>
      <p class="text-h5 text-grey-8 q-mb-xl">
        Il tuo posto ideale per giocare in compagnia
      </p>
      <q-btn
        to="/prenota"
        color="primary"
        label="Prenota Ora"
        class="q-px-xl q-py-sm text-weight-bold"
        size="lg"
        unelevated
      />
    </div>

    <!-- Stats Section -->
    <div class="row q-col-gutter-md q-mt-xl">
      <div class="col-12 col-sm-4">
        <q-card class="text-center q-pa-md">
          <q-icon name="sports_esports" size="3rem" color="primary" />
          <div class="text-h4 q-mt-sm text-weight-bold">50+</div>
          <div class="text-subtitle1">Giochi da Tavolo</div>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card class="text-center q-pa-md">
          <q-icon name="groups" size="3rem" color="primary" />
          <div class="text-h4 q-mt-sm text-weight-bold">1000+</div>
          <div class="text-subtitle1">Giocatori Felici</div>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card class="text-center q-pa-md">
          <q-icon name="event_available" size="3rem" color="primary" />
          <div class="text-h4 q-mt-sm text-weight-bold">24/7</div>
          <div class="text-subtitle1">Disponibilità</div>
        </q-card>
      </div>
    </div>

    <!-- Featured Games Section -->
    <div class="q-mt-xl">
      <h2 class="text-h4 text-center q-mb-lg">Giochi in Evidenza</h2>
      <div class="row q-col-gutter-lg">
        <div v-for="game in featuredGames" :key="game.id" class="col-12 col-sm-6 col-md-4">
          <q-card class="game-card">
            <q-img :src="game.copertina" :ratio="16/9" />
            <q-card-section>
              <div class="text-h6">{{ game.nome }}</div>
              <div class="text-subtitle2">{{ game.giocatori_min }}-{{ game.giocatori_max }} giocatori</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { supabase } from 'src/supabase';

export default defineComponent({
  name: 'HomePage',

  setup () {
    const featuredGames = ref([]);

    onMounted(async () => {
      try {
        const { data, error } = await supabase
          .from('giochi')
          .select('*')
          .limit(3);

        if (error) throw error;

        // Aggiungi URL delle copertine
        featuredGames.value = await Promise.all(data.map(async (game) => {
          if (game.copertina) {
            const { data: { publicUrl } } = supabase.storage
              .from('Copertine_giochi')
              .getPublicUrl(game.copertina);
            return { ...game, copertina: publicUrl };
          }
          return game;
        }));
      } catch (error) {
        console.error('Errore nel caricamento dei giochi:', error);
      }
    });

    return {
      featuredGames
    };
  }
});
</script>

<style lang="scss" scoped>
.hero-section {
  background: linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.7)),
              url('/images/hero-bg.jpg') center/cover;
  border-radius: 16px;
  margin-bottom: 48px;
}

.game-card {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
}

.q-card {
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  }
}
</style>
