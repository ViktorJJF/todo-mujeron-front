<template>
  <v-app id="inspire">
    <catalog-mobile v-if="this.$vuetify.breakpoint.mobile" />
    
    <catalog-desktop v-else />
  </v-app>
</template>

<script>
import CatalogMobile from './mobile/index'
import CatalogDesktop from './desktop/index'


export default {
  components: { CatalogMobile, CatalogDesktop },
}
</script>

<style>
</style>