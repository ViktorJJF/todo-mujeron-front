<template>
  <v-card>
    <v-card-title class="text-h5 grey lighten-2">
      Confirmación de Talla
    </v-card-title>
    <v-container class="pa-5">
      <v-row>
        <v-col cols="12" sm="12" md="12">
          <span class="font-weight-bold">Teléfono WhatsApp</span>
          <v-text-field
            v-model="whatsappPhone"
            outlined
            dense
            hide-details="auto"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="12" md="12">
          <span class="font-weight-bold">SKU Productos</span>
          <v-text-field
            disabled
            v-model="skuProducts"
            outlined
            dense
            hide-details="auto"
          ></v-text-field>
        </v-col>
      </v-row> </v-container
    ><v-divider></v-divider
    ><v-card-actions rd-actions>
      <v-spacer></v-spacer>
      <v-btn color="success" :loading="loadingButton" @click="saveGuide"
        >Guardar</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import { buildSuccess, getSku } from "@/utils/utils.js";
import graphApiService from "@/services/api/graphApi";

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
      whatsappPhone: "",
      loadingButton: false,
      skuProducts: "",
    };
  },
  computed: {},
  mounted() {
    this.whatsappPhone = this.order.ecommercesContactId.cleanLeadId
      ? this.order.ecommercesContactId.cleanLeadId.telefono
      : this.order.ecommercesContactId.phone;
    this.skuProducts = this.order.line_items.map((el) => getSku(el)).join(", ");
  },
  methods: {
    async saveGuide() {
      let phone = this.whatsappPhone
        ? this.whatsappPhone
        : this.order.ecommercesContactId.cleanLeadId
        ? this.order.ecommercesContactId.cleanLeadId.telefono
        : this.order.ecommercesContactId.phone;
      try {
        // sending template message
        let response = await graphApiService.sendWhatsappMessageTemplates(
          phone,
          "confirmacion_talla",
          {
            body: [
              this.order.ecommercesContactId.first_name,
              this.skuProducts,
              this.order.idOrder,
            ],
          },
          "639df6124427e2337b8112e7", // TODO change this to select bot dynamically
          this.order.ecommercesContactId.cleanLeadId._id
        );
        let data = response.data;
        this.loadingButton = true;
        await this.$store.dispatch("ecommercesOrdersModule/update", {
          id: this.order._id,
          data: {
            ...this.order,
            templateMessageLogId: data.payload.templateMessageLogId,
          },
        });
        buildSuccess(
          `Mensaje de plantilla enviado con éxito`,
          this.$store.commit
        );
        this.$emit("onClose");
      } catch (error) {
        console.log(error);
        this.$swal({
          icon: "error",
          title: `Error enviando mensaje de plantilla`,
          html: `<p>Es probable que el teléfono ${phone} de ${this.order.ecommercesContactId.first_name} no tenga WhatsApp o sea incorrecto</p>`,
        });
      } finally {
        this.loadingButton = false;
      }
    },
  },
};
</script>

<style></style>
