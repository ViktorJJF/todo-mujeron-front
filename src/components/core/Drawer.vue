<template>
  <v-navigation-drawer color="#040505" dark v-model="drawer" app width="260">
    <v-list>
      <v-list-item>
        <v-img
          aspect-ratio="1.7"
          contain
          src="https://scontent.faqp1-1.fna.fbcdn.net/v/t1.0-9/126168591_667903303784907_162111263870559860_o.jpg?_nc_cat=105&ccb=2&_nc_sid=09cbfe&_nc_eui2=AeGyU1V0XbYF5ovFmazdfP4wZWrnUXJNQellaudRck1B6S3b6VdOpihLB3Ei98sLxJxvKvB8WZok9X1KatKqdU49&_nc_ohc=19uYDoBF_NsAX9EMG5S&_nc_ht=scontent.faqp1-1.fna&oh=7d95a12ae4aec34c838ad66d3a4e965d&oe=600E46C2"
        ></v-img>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title">{{ user }}</v-list-item-title>
          <v-list-item-subtitle>{{ email }}</v-list-item-subtitle>
        </v-list-item-content>

        <!-- <v-list-item-action>
          <v-icon>mdi-menu-down</v-icon>
        </v-list-item-action>-->
      </v-list-item>
      <div class="text-center">
        <v-btn color="secondary" small :to="{ name: 'UserProfile' }"
          >Editar perfil</v-btn
        >
      </div>
    </v-list>

    <v-divider class="mx-3 mb-3"></v-divider>
    <v-list nav flat>
      <template v-for="(item, i) in items">
        <v-list-item active-class="primary" :key="i" :to="{ name: item.to }">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="item.text" />
          </v-list-item-content>
        </v-list-item>
      </template>
      <v-list-group
        color="white"
        v-for="item in expansionItems"
        :key="item.title"
        v-model="item.active"
        :prepend-icon="item.icon"
      >
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title v-text="item.title"></v-list-item-title>
          </v-list-item-content>
        </template>
        <v-list-item
          active-class="primary"
          :to="{ name: subItem.to }"
          v-for="subItem in item.items"
          :key="subItem.title"
        >
          <v-list-item-icon>
            <v-icon>{{ subItem.icon }}</v-icon>
          </v-list-item-icon>
          {{ subItem.title }}
        </v-list-item>
      </v-list-group>
      <v-divider class="mx-3 mb-3"></v-divider>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  data() {
    return {
      items: [
        // {
        //   icon: "mdi-format-list-checks",
        //   text: "Colores",
        //   to: "Colors",
        // },
        {
          icon: "mdi-format-list-bulleted",
          text: "Equipo De Ventas",
          to: "EquipoDeVentas",
        },
        {
          icon: "mdi-format-list-bulleted",
          text: "Locaciones",
          to: "Locaciones",
        },
        {
          icon: "mdi-format-list-bulleted",
          text: "Agentes",
          to: "Agentes",
        },
        {
          icon: "mdi-format-list-bulleted",
          text: "Teléfonos",
          to: "Telefonos",
        },
        {
          icon: "mdi-format-list-bulleted",
          text: "Contactos",
          to: "Contactos",
        },
        // { icon: "mdi-format-list-bulleted", text: "Tipos", to: "type" },
        // { icon: "mdi-cellphone-dock", text: "Marcas", to: "brand" },
        // { icon: "mdi-format-color-fill", text: "Colores", to: "colors" },
      ],
      expansionItems: [],
    };
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
      return this.$store.getters["authModule/getFullNameUser"];
    },
    email() {
      return this.$store.state.authModule.user
        ? this.$store.state.authModule.user.email
        : "example@gmail.com";
    },
  },
};
</script>

<style lang="scss" scoped></style>
