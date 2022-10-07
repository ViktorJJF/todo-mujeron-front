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
      Crear nuevo producto
    </v-card-title>

    <v-tabs v-model="tab" class="pa-5">
      <v-tab>Información General</v-tab>
      <v-tab>Atributos</v-tab>
      <v-tab :disabled="product.type !== 'variation'">Variaciones</v-tab>
      <v-tab>Marketplaces</v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <general-tab :product="product" />
      </v-tab-item>

      <v-tab-item>
        <attributes-tab :product="product" />
      </v-tab-item>

      <v-tab-item>
        <variations-tab :product="product" />
      </v-tab-item>

      <v-tab-item>
        <v-container>
          <v-row>
            <v-col>
              <div>Woocommerce</div>
              <div>...</div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div>Mercadolibre</div>
              <div>...</div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div>Dafiti</div>
              <div>...</div>
            </v-col>
          </v-row>
        </v-container>
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import GeneralTab from "./tabs/General.vue";
import AttributesTab from "./tabs/Attributes.vue";
import VariationsTab from "./tabs/Variations.vue";

export default {
  components: { GeneralTab, AttributesTab, VariationsTab },
  data() {
    return {
      tab: 0,
      product: {
        type: "simple",
        name: "",
        shortName: "",
        description: "",
        shortDescription: "",
        sku: "",
        price: null,
      },
    };
  },
  methods: {},
};
</script>

<style>
</style>