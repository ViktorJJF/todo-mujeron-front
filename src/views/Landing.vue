<template>
  <v-container fluid class="landing pa-0">
    <v-row no-gutters align="center" justify="center" class="landing__hero">
      <v-col cols="12" sm="10" md="8" lg="6" class="text-center px-6 py-12">
        <v-img
          src="/images/logo/todofull.jpg"
          alt="Todofull"
          max-width="120"
          class="landing__logo mx-auto mb-6"
        />

        <h1 class="landing__brand white--text mb-4">Todofull</h1>

        <p class="landing__tagline white--text mb-8">
          La plataforma que centraliza las integraciones de tu ecommerce y
          descubre patrones en los datos de tus clientes.
        </p>

        <v-btn
          color="warning"
          x-large
          rounded
          :to="{ name: 'login' }"
          class="font-weight-bold px-8"
        >
          Ingresar
        </v-btn>

        <div class="mt-10">
          <router-link
            :to="{ name: 'PrivacyPolicy' }"
            class="landing__link white--text"
          >
            Política de Privacidad
          </router-link>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "Landing",
};
</script>

<style scoped>
.landing {
  min-height: 100vh;
}

.landing__hero {
  min-height: 100vh;
  background: linear-gradient(135deg, #28156c 0%, #3a1f96 100%);
}

.landing__brand {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -1px;
}

.landing__tagline {
  font-size: 1.25rem;
  line-height: 1.7rem;
  opacity: 0.92;
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
}

.landing__logo {
  border-radius: 16px;
}

.landing__link {
  text-decoration: underline;
  opacity: 0.85;
  font-size: 0.95rem;
}

.landing__link:hover {
  opacity: 1;
}

@media (max-width: 600px) {
  .landing__brand {
    font-size: 2.25rem;
  }

  .landing__tagline {
    font-size: 1.05rem;
  }
}
</style>
