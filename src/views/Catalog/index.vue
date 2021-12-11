<template>
  <v-app id="inspire">
    <template v-if="catalog">
      <catalog-mobile v-if="this.$vuetify.breakpoint.mobile" :catalog="catalog" />

      <catalog-desktop v-else :catalog="catalog" />
    </template>
    
  </v-app>
</template>

<script>
import CatalogMobile from './mobile/index'
import CatalogDesktop from './desktop/index'
import CatalogsApi from "@/services/api/catalogs";

export default {
  components: { CatalogMobile, CatalogDesktop },
  data() {
    return {
      catalog: null
    }
  },
  created() {
    CatalogsApi.find(this.$route.params.id).then(res => {
      this.catalog = res.data.payload
    })
  }
}
</script>

<style>
</style>