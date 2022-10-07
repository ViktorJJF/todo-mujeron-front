<template>
  <ValidationObserver ref="obs" v-slot="{ passes }">
    <v-container class="pa-5">
      <v-row>
        <v-col cols="2">
          <div class="body-1 font-weight-bold">Tipo</div>
          <v-select
            :items="productTypeOptions"
            v-model="product.type"
            hide-details
            outlined
            dense
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="12" md="12">
          <div class="body-1 font-weight-bold">Nombre</div>
          <VTextFieldWithValidation
            rules="required"
            v-model="product.name"
            label="Ingresa el nombre"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <div class="body-1 font-weight-bold">Nombre Corto</div>
          <VTextFieldWithValidation
            v-model="product.shortname"
            label="Ingresa el nombre"
          />
        </v-col>
        <v-col>
          <div class="body-1 font-weight-bold">Categorias</div>
          <v-select
            :items="categoryOptions"
            item-text="name"
            return-object
            hide-details
            multiple
            outlined
            dense
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="12" md="12">
          <div class="body-1 font-weight-bold">Descripción</div>
          <v-textarea
            outlined
            hide-details
            v-model="product.description"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="12" md="12">
          <div class="body-1 font-weight-bold">Descripción Corta</div>
          <VTextFieldWithValidation
            v-model="product.shortDescription"
            label="Ingresa la descripción"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <div class="body-1 font-weight-bold">SKU</div>
          <VTextFieldWithValidation
            rules="required"
            v-model="product.sku"
            label="Ingresa el SKU"
          />
        </v-col>
        <v-col>
        <div class="body-1 font-weight-bold">Precio</div>
          <VTextFieldWithValidation
            rules="required|decimal"
            v-model.number="product.price"
            label="Ingresa el precio"
          />
        </v-col>
      </v-row>
    </v-container>
    <v-card-actions rd-actions>
      <div class="flex-grow-1"></div>
      <v-btn
        color="success"
        @click="passes(handleSubmit)">
          Guardar
        </v-btn>
    </v-card-actions>
  </ValidationObserver>
</template>

<script>
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import marketplaceCategoriesApi from '@/services/api/marketplaceCategories'

export default {
  components: { VTextFieldWithValidation },
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      productTypeOptions: [
        { text: 'Simple', value: 'simple' },
        { text: 'Variation', value: 'variation' },
      ],
      categoryOptions: []
    }
  },
  created() {
    marketplaceCategoriesApi.list().then(res => {
      this.categoryOptions = res.data.payload
    })
  },
  methods: {
    handleSubmit() {

    }
  }
}
</script>

<style>

</style>