<template>
  <ValidationObserver ref="obs" v-slot="{ passes }">
    <v-container class="pa-5">
      <v-row>
        <v-col cols="2">
          <div class="body-1 font-weight-bold">Tipo</div>
          <v-select
            :items="productTypeOptions"
            v-model="localProduct.type"
            hide-details
            outlined
            dense
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <div class="body-1 font-weight-bold">Nombre Corto</div>
          <VTextFieldWithValidation
            v-model="localProduct.shortName"
            label="Ingresa el nombre"
            rules="required"
          />
        </v-col>
        <v-col>
          <div class="body-1 font-weight-bold">Categorias</div>
          <CategoriesSelect value="outside"/>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="4">
          <div class="body-1 font-weight-bold">Marca</div>
          <VTextFieldWithValidation
            rules="required"
            v-model.number="localProduct.brand"
            label="Ingresa la marca"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="12" md="12">
          <div class="body-1 font-weight-bold">Nombre</div>
          <VTextFieldWithValidation
            v-model="localProduct.name"
            label="Ingresa el nombre"
            rules="required"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <div class="body-1 font-weight-bold">SKU</div>
          <VTextFieldWithValidation
            rules="required|alpha_dash"
            v-model="localProduct.sku"
            label="Ingresa el SKU"
          />
        </v-col>
        <v-col>
          <div class="body-1 font-weight-bold">Precio</div>
          <VTextFieldWithValidation
            rules="required|decimal"
            v-model.number="localProduct.price"
            label="Ingresa el precio"
          />
        </v-col>
      </v-row>
    </v-container>
    <v-card-actions rd-actions>
      <div class="flex-grow-1"></div>
      <v-btn color="success" @click="passes(handleSubmit)">
        Guardar
      </v-btn>
    </v-card-actions>
  </ValidationObserver>
</template>

<script>
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import CategoriesSelect from '@/components/CategoriesSelect.vue';
import marketplaceProductsApi from '@/services/api/marketplaceProductsV2';

export default {
  components: { VTextFieldWithValidation, CategoriesSelect },
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localProduct: null,
      productTypeOptions: [
        { text: 'Simple', value: 'simple' },
        { text: 'Variation', value: 'variation' },
      ],
      categoryOptions: []
    }
  },
  methods: {
    async handleSubmit() {
      let res;
      const isUpdate = this.localProduct._id
      if(isUpdate) {
        res = await marketplaceProductsApi.update(this.localProduct._id, this.localProduct)
      } else {
        res = await marketplaceProductsApi.create(this.localProduct)
      }

      if(res && res.data) {
        this.$emit('update', res.data.payload)
        // Should show a success message
      }
    }
  },
  watch: {
    product: {
      immediate: true,
      handler: function(val) {
        this.localProduct = { ...val }
      }
    }
  }
}
</script>

<style></style>
