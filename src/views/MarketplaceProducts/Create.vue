<template>
  <v-container>
    <v-btn
      :to="{ name: 'MarketplaceProductos' }"
      text
      plain
      color="blue darken-4"
    >
      <v-icon>mdi-arrow-left</v-icon>
      Voler
    </v-btn>
    <v-card-title class="text-h5 grey lighten-2 my-3">
      {{title }}
    </v-card-title>

    <v-tabs v-model="tab" class="pa-5">
      <v-tab>Información General</v-tab>
      <v-tab :disabled="!product._id">Atributos</v-tab>
      <v-tab :disabled="!product._id">Descripción</v-tab>
      <v-tab :disabled="!product._id || product.type !== 'variation'">Variaciones</v-tab>
      <v-tab :disabled="!product._id">Marketplaces</v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <general-tab :product="product" @update="handleGeneralUpdate"/>
      </v-tab-item>

      <v-tab-item>
        <attributes-tab :product="product" />
      </v-tab-item>

      <v-tab-item>
        <descrition-tab :product="product"/>
      </v-tab-item>

      <v-tab-item>
        <variations-tab :product="product" />
      </v-tab-item>

      <v-tab-item>
        <marketplaces-tab />
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import GeneralTab from "./tabs/General.vue";
import AttributesTab from "./tabs/Attributes.vue";
import DescritionTab from "./tabs/Description.vue";
import VariationsTab from "./tabs/Variations.vue";
import MarketplacesTab from "./tabs/Marketplaces.vue";
import marketplaceProductsApi from '@/services/api/marketplaceProductsV2';

export default {
  components: { GeneralTab, AttributesTab, DescritionTab, VariationsTab, MarketplacesTab },
  data() {
    return {
      tab: 0,
      product: {
        type: "variation",
        name: "",
        shortName: "",
        categories: [],
        description: "",
        shortDescription: "",
        sku: "",
        price: 1,
        brand: "",
      },
    };
  },
  created() {
    const { id: productId, product } = this.$route.params
    if(productId) {
      if(product) {
        this.product = product
        return;
      }
      
      marketplaceProductsApi.listOne(productId).then((res) => {
        this.product = res.data.payload
      })
    }
  },
  computed: {
    title() {
      return this.product._id ? 'Modificar producto' : 'Crear nuevo producto'
    },
  },
  methods: {
    handleGeneralUpdate(product) {
      this.product = product;
    }
  },
};
</script>

<style></style>
