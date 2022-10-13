<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="12" md="12">
        <div class="body-1 font-weight-bold">Descripción</div>
        <v-textarea outlined hide-details v-model="description" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="12" md="12">
        <div class="body-1 font-weight-bold">Descripción Corta</div>
        <VTextFieldWithValidation
          v-model="shortDescription"
          label="Ingresa la descripción"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";

export default {
  components: { VTextFieldWithValidation },
  data() {
    return {
      description: '',
      shortDescription: '',
    }
  }
};
</script>

<style></style>
