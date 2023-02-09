<template>
  <v-card>
    <v-card-title class="text-h5 grey lighten-2">
      Detalles de la guía
    </v-card-title>
    <v-container class="pa-5">
      <v-row>
        <v-col cols="12" sm="4" md="4">
          <span class="font-weight-bold">Nro Guía</span>
          <v-text-field v-model="guideNumber" outlined dense></v-text-field>
        </v-col>
        <v-col cols="12" sm="8" md="8">
          <span class="font-weight-bold">Transportista</span>
          <v-text-field
            v-model="transportCompany"
            outlined
            dense
          ></v-text-field>
        </v-col>
      </v-row>
      <v-spacer></v-spacer>
      <v-btn color="success" :loading="loadingButton" @click="saveGuide"
        >Guardar</v-btn
      >
    </v-container>
  </v-card>
</template>

<script>
export default {
  props: {
    order: {
      type: Object,
      required: true,
    },
  },
  filters: {},
  data() {
    return {
      loadingButton: false,
      guideNumber: "",
      transportCompany: "",
    };
  },
  computed: {},
  methods: {
    async saveGuide() {
      console.log(this.order);
      try {
        this.loadingButton = true;
        await this.$store.dispatch("ecommercesOrdersModule/update", {
          id: this.order._id,
          data: {
            ...this.order,
            guideNumber: this.guideNumber,
            transportCompany: this.transportCompany,
          },
        });
        this.$emit("onClose");
      } catch (error) {
        console.log(error);
      } finally {
        this.loadingButton = false;
      }
    },
  },
};
</script>

<style></style>
