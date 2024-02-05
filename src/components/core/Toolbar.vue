<template>
  <v-app-bar dark app color="primary">
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    <span class="title ml-3 mr-5">TO DO MUJERON</span>
    <v-spacer></v-spacer>
    <v-menu v-if="$store.state.authModule.user" offset-y>
      <v-list v-for="(alertMessage, i) in $store.state.stockAlert" :key="i">
        <v-list-item>
          Tu producto {{ alertMessage.productName }} está por agortarse. (
          <strong>Stock:</strong>
          {{ alertMessage.stock }})
        </v-list-item>
      </v-list>
    </v-menu>
    <v-btn
      v-if="!$store.state.authModule.user"
      dark
      outlined
      :to="{ name: 'login' }"
      >Iniciar Sesión</v-btn
    >
    <v-menu v-if="$store.state.authModule.user" offset-y>
      <template v-slot:activator="{ on }">
        <v-btn text color="white" dark v-on="on">
          {{ selectedCompany.company.alias }}
          <v-icon>mdi-menu-down</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item v-for="element in companies" :key="element.company._id" @click="setCurrentCompany(element.company._id)">
          <v-list-item-title>{{ element.company.alias }} - {{ element.selected }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-menu v-if="$store.state.authModule.user" offset-y>
      <template v-slot:activator="{ on }">
        <v-btn text color="white" dark v-on="on">
          {{ user }}
          <v-icon>mdi-menu-down</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item :to="{ name: 'Profile' }">
          <v-list-item-title>Perfil</v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout">
          <v-list-item-title>Cerrar sesión</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
export default {
  data() {
    return {};
  },
  computed: {
    drawer: {
      get() {
        return this.$store.state.toolbar.drawerIcon;
      },
      set(newValue) {
        this.$store.state.toolbar.drawerIcon = newValue;
      },
    },
    user() {
      return (
        this.$store.state.facebookName ||
        this.$store.state.authModule.user.email
      );
    },
    companies() {
      return this.$store.state.authModule.companies;
    },
    selectedCompany() {
      console.log(this.$store.getters["authModule/getCurrentCompany"])
      return this.$store.getters["authModule/getCurrentCompany"];
    }
  },
  methods: {
    logout() {
      this.$store
        .dispatch("authModule/logout")
        .then(() => {})
        .catch((err) => {
          console.log("algo salio mal en logout:", err);
        });
    },
    setCurrentCompany(id) {
      this.$store.dispatch("authModule/setCurrentCompany", id)
    }
  },
};
</script>

<style lang="scss" scoped></style>
