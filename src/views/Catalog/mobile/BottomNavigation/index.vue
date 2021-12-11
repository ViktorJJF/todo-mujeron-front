<template>
  <v-bottom-navigation
    dark
    :background-color="color"
    app
  >
    <div class="navigation-action d-flex align-center">
      <v-hover>
        <template v-slot:default="{ hover }">
          <div :class="['action-item', `elevation-${hover ? 24 : 6}`]" @click="$emit('menuClick')">
            <v-icon :color="color">mdi-menu</v-icon>
          </div>
        </template>
      </v-hover>
    </div>
    <v-row no-gutters>
      <v-col
        :class="[index===items.length-1 ? '' : 'borders', 'd-flex align-center justify-center']"
        v-for="(item, index) of items"
        @click="$emit('itemClick', item.categoryId)"
        :key="index"
      >
        <navigation-item style="height: 100%" v-bind="item" />
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
  props: {
    color: {
      type: String,
      default: 'purple'
    }
  },
  data() {
    return {
      items: [
        {icon: IconPantalonR, label: 'Jeans', categoryId: 1054},
        {icon: IconFajaR, label: 'Fajas', categoryId: 476},
        {icon: IconVestidoR, label: 'Vestuario', categoryId: 787},
        {icon: IconPijamaR, label: 'Pijamas', categoryId: 3727},
      ]
    }
  },
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