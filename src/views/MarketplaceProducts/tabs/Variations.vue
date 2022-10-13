<template>
  <v-container class="pa-5">
    <v-row>
      <v-col>
        <v-btn @click="handleAdd">Añadir</v-btn>
      </v-col>
    </v-row>
    <v-row v-for="variation in variations" :key="variation._id">
      <v-col v-for="attribute in variation.attributes" :key="attribute._id" cols="3">
        <div class="body-1 font-weight-bold">{{ attribute.name }}</div>
        <v-select
          :items="attribute.options"
          hide-details
          clearable
          outlined
          dense
          :placeholder="`Cualquier ${attribute.name}`"
        />
      </v-col>
    </v-row>
    
    <v-divider class="my-5" />

    <v-card-actions rd-actions>
      <v-btn color="success">
        Guardar
      </v-btn>
    </v-card-actions>
  </v-container>
</template>

<script>
import marketplaceProductsAttributesApi from "@/services/api/marketplaceProductsV2Attributes";

export default {
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      atrributeOptions: [],
      variations: [],
    };
  },
  created() {
    this.fetchProductAttributes()
  },
  methods: {
    async fetchProductAttributes() {
      const res = await marketplaceProductsAttributesApi.listByProduct(
        this.product._id,
        { variation: true }
      );
      this.atrributeOptions = res.data.payload;
    },
    handleAdd() {
      const lastVariation = this.variations[0]
      let lastId = lastVariation ? lastVariation._id : 0;
      this.variations.unshift({
        _id: lastId + 1,
        sku: "",
        stock: 0,
        price: 0,
        product: this.product._id,
        attributes: this.atrributeOptions,
      });
    },
  },
};
</script>

<style></style>
