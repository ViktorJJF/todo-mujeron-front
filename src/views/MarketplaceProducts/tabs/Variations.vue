<template>
  <v-container class="pa-5">
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
          rules="required"
          v-model="product.price"
          label="Ingresa el precio"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";

export default {
  components: { VTextFieldWithValidation },
  props: {
    product: {
      type: Object,
      required: true
    }
  },  
}
</script>

<style>

</style>