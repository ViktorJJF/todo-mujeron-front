<template>
  <v-container class="pa-5">
    <v-row>
      <v-col cols="3">
        <v-select
          :items="attributesOptions"
          v-model="selectedAttribute"
          hide-details
          return-object
          item-text="name"
          outlined
          dense
          placeholder="Selecciona el atributo"
        />
      </v-col>
      <v-col cols="1">
        <v-btn @click="handleAddAttribute">Añadir</v-btn>
      </v-col>
    </v-row>

    <v-divider class="my-5" />

    <template v-for="attribute of productAttributes">
      <v-row :key="attribute._id">
        <v-col cols="4">
          <div class="body-1 font-weight-bold">{{ attribute.name }}</div>
          <v-select
            :items="attribute.terms"
            v-model="attribute.options"
            hide-details
            outlined
            dense
            chips
            multiple
            clearable
          />
          <div class="mt-2">
            <v-btn @click="attribute.options = [...attribute.terms]"
              >Seleccionar Todos</v-btn
            >
          </div>
          <div>
            <v-checkbox
              label="Visible en la pagina de productos"
              v-model="attribute.visible"
              hide-details
            />
          </div>
          <div>
            <v-checkbox
              label="Utilizado para variaciones"
              v-model="attribute.variation"
              hide-details
            />
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-5" :key="'d-' + attribute._id" />
    </template>

    <v-card-actions rd-actions>
      <v-btn color="success" @click="handleSubmit">
        Guardar
      </v-btn>
    </v-card-actions>
  </v-container>
</template>

<script>
import marketplaceAttributesApi from "@/services/api/marketplaceAttributes";
import marketplaceProductsAttributesApi from "@/services/api/marketplaceProductsV2Attributes";
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
      productAttributes: [],
      attributesOptions: [],
      selectedAttribute: null,
    };
  },
  async created() {
    await this.fetchAttributes(), await this.fetchProductAttributes();
  },
  methods: {
    async fetchAttributes() {
      const res = await marketplaceAttributesApi.list();
      this.attributesOptions = res.data.payload;
    },
    async fetchProductAttributes() {
      const res = await marketplaceProductsAttributesApi.listByProduct(
        this.product._id
      );
      this.productAttributes = res.data.payload.map((attribute) => {
        return {
          ...attribute,
          terms: this.getTerms(attribute),
        };
      });
    },
    handleAddAttribute() {
      const alreadyAdded = this.productAttributes.find(
        (attr) => attr._id === this.selectedAttribute._id
      );
      if (!alreadyAdded) {
        this.productAttributes.unshift({
          options: [],
          variation: false,
          visible: true,
          product: this.product._id,
          name: this.selectedAttribute.name,
          // Terms from global attributes
          terms: this.getTerms(this.selectedAttribute),
        });
      }
      this.selectedAttribute = null;
    },

    getTerms(attribute) {
      const attributeOption = this.attributesOptions.find(
        (opt) => opt.name === attribute.name
      );
      if (attributeOption) {
        return attributeOption.terms.map((term) => term.name);
      }

      return [];
    },

    async handleSubmit() {
      this.$store.commit("loadingModule/showLoading", true);
      for (const [index, attribute] of this.productAttributes.entries()) {
        let res;
        const isUpdate = attribute._id;
        if (isUpdate) {
          res = await marketplaceProductsAttributesApi.update(
            attribute._id,
            attribute
          );
        } else {
          res = await marketplaceProductsAttributesApi.create(attribute);
        }

        if (res && res.data) {
          this.productAttributes.splice(index, 1, {
            ...res.data.payload,
            terms: this.getTerms(attribute),
          });
        }
      }
      this.$store.commit("loadingModule/showLoading", false);
      buildSuccess('Se guardó correctamente', this.$store.commit)
    },
  },
};
</script>

<style></style>
