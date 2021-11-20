<template>
  <v-bottom-navigation
    dark
    background-color="purple"
    app
  >
    <div class="navigation-action d-flex align-center">
      <v-hover>
        <template v-slot:default="{ hover }">
          <div :class="['action-item', `elevation-${hover ? 24 : 6}`]" @click="$emit('action')">
            <v-icon color="purple">mdi-menu</v-icon>
          </div>
        </template>
      </v-hover>
    </div>
    <v-row no-gutters>
      <v-col :class="[index===items.length-1 ? '' : 'borders']" v-for="(item, index) of items" :key="index">
        <navigation-item class="mt-n4" v-bind="item" />
      </v-col>
    </v-row>
  </v-bottom-navigation>
</template>

<script>
import NavigationItem from './Item'
import IconPantalonR from './images/iconopantalon.png'
import IconFajaR from './images/iconofaja.png'
import IconVestidoR from './images/iconovestido.png'
import IconPijamaR from './images/iconopijama.png'

export default {
  components: { NavigationItem },
  data() {
    return {
      items: [
        {icon: IconPantalonR, label: 'Jeans'},
        {icon: IconFajaR, label: 'Fajas'},
        {icon: IconVestidoR, label: 'Vestuario'},
        {icon: IconPijamaR, label: 'Pijamas'},
      ]
    }
  }
}
</script>

<style scpoed>
  .borders {
    border-right: .5px solid #ccc;
  }

  .navigation-action {
    position: absolute;
    height: 100%;
  }

  .action-item {
    background-color: white;
    border-radius: 50%;
    padding: 7px;
    cursor: pointer;
  }
</style>