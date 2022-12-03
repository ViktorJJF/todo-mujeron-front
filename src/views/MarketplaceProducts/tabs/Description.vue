<template>
  <ValidationObserver ref="obs" v-slot="{ passes }">
    <v-container>
      <v-row>
        <v-col cols="12" sm="12" md="12">
          <div class="body-1 font-weight-bold">Descripción</div>
          <v-textarea outlined hide-details v-model="form.description" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="12" md="12">
          <div class="body-1 font-weight-bold">Descripción Corta</div>
          <VTextFieldWithValidation
            v-model="form.shortDescription"
            label="Ingresa la descripción"
          />
        </v-col>
      </v-row>
      <v-card-actions rd-actions>
        <div class="flex-grow-1"></div>
        <v-btn color="success" @click="passes(handleSubmit)">
          Guardar
        </v-btn>
      </v-card-actions>
    </v-container>
  </ValidationObserver>
</template>

<script>
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import marketplaceProductsApi from "@/services/api/marketplaceProductsV2";
import { buildSuccess } from "@/utils/utils";

export default {
  components: { VTextFieldWithValidation },
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      form: {
        description: '',
        shortDescription: '',
      }
    }
  },
  methods: {
    async handleSubmit() {
      this.$store.commit("loadingModule/showLoading", true);

      const res = await marketplaceProductsApi.update(this.product._id, this.form);

      this.$store.commit("loadingModule/showLoading", false);
      
      if (res && res.data) {
        this.$emit("update", res.data.payload);
        buildSuccess('Se guardó correctamente', this.$store.commit)
      }
    },
  },
  watch: {
    product: {
      immediate: true,
      handler: function(val) {
        Object.assign(this.form, {
          description: val.description,
          shortDescription: val.shortDescription
        })
      },
    },
  },
};
</script>

<style></style>
