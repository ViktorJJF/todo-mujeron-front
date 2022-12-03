<template>
  <v-container class="pa-5">
    <v-row>
      <v-col>
        <v-btn @click="handleAdd">Añadir</v-btn>
      </v-col>
    </v-row>
    <v-row v-for="variation in variations" :key="variation._id">
      <v-col
        v-for="attribute in variation.attributes"
        :key="attribute._id"
        cols="3"
      >
        <div class="body-1 font-weight-bold">{{ attribute.name }}</div>
        <v-select
          :items="attribute.options"
          v-model="attribute.option"
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
      <v-btn color="success" @click="handleSubmit">
        Guardar
      </v-btn>
    </v-card-actions>
  </v-container>
</template>

<script>
import marketplaceProductsAttributesApi from "@/services/api/marketplaceProductsV2Attributes";
import marketplaceProductsVariationsApi from "@/services/api/marketplaceProductsV2Variations";
import { buildSuccess } from "@/utils/utils";

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
    this.fetchProductAttributes().then(() => {
      this.fetchProductVariations();
    });
  },
  methods: {
    async fetchProductAttributes() {
      const res = await marketplaceProductsAttributesApi.listByProduct(
        this.product._id,
        { variation: true }
      );
      this.atrributeOptions = res.data.payload;
    },
    async fetchProductVariations() {
      const res = await marketplaceProductsVariationsApi.listByProduct(
        this.product._id
      );

      this.variations = res.data.payload.map((variation) => {
        const attributes = variation.attributes.map((attribute) => {
          const options = this.atrributeOptions.find(
            ({ _id }) => attribute._id === _id
          ).options;
          return { ...attribute, options };
        });

        return { ...variation, attributes };
      });
    },
    handleAdd() {
      this.variations.unshift({
        sku: "",
        stock: 0,
        price: 0,
        product: this.product._id,
        attributes: this.atrributeOptions.map((attribute) => ({
          ...attribute,
          option: null,
        })),
      });
    },
    async handleSubmit() {
      this.$store.commit("loadingModule/showLoading", true);
      for (const variation of this.variations) {
        let res;
        const isUpdate = variation._id;
        if (isUpdate) {
          res = await marketplaceProductsVariationsApi.update(
            variation._id,
            variation
          );
        } else {
          res = await marketplaceProductsVariationsApi.create(variation);
        }
        console.log(res.data.payload);
      }
      this.$store.commit("loadingModule/showLoading", false);
      buildSuccess("Se guardó correctamente", this.$store.commit);
    },
  },
};
</script>

<style></style>
