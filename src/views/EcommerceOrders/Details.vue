<template>
  <v-card>
    <v-card-title class="text-h5 grey lighten-2">
      Detalles de la orden
    </v-card-title>
    <v-container class="pa-5">
      <v-row dense class="mb-4">
        <v-col>
          <div class="text-h5">Datos generales</div>
        </v-col>
      </v-row>
      <div class="ml-4">
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">N°Orden:</div>
              <div class="ml-1">{{ order.idOrder }}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Estado:</div>
              <div class="ml-1">{{ order.status }}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Total:</div>
              <div class="ml-1">{{ total | currency }}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Fecha de creación:</div>
              <div class="ml-1">{{ order.date_created | formatDate }}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Última actualización:</div>
              <div class="ml-1">{{ order.date_modified | formatDate }}</div>
            </div>
          </v-col>
        </v-row>
      </div>

      <v-row dense class="my-4">
        <v-col>
          <div class="text-h5">Datos del cliente</div>
        </v-col>
      </v-row>
      <div class="ml-4">
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Nombre:</div>
              <div class="ml-1 text-capitalize">
                {{ order.ecommercesContactId.first_name }}
                {{ order.ecommercesContactId.last_name }}
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">País:</div>
              <div class="ml-1">{{ order.ecommercesContactId.country }}</div>
            </div>
          </v-col>
        </v-row>
        <v-row v-if="order.ecommercesContactId.city">
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Comúna:</div>
              <div class="ml-1">{{ order.ecommercesContactId.city }}</div>
            </div>
          </v-col>
        </v-row>
        <v-row v-if="order.rut">
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Rut:</div>
              <div class="ml-1">{{ order.rut }}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Teléfono:</div>
              <div class="ml-1">{{ order.ecommercesContactId.phone }}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Email:</div>
              <div class="ml-1">{{ order.ecommercesContactId.email }}</div>
            </div>
          </v-col>
        </v-row>
      </div>

      <v-row dense class="my-4">
        <v-col>
          <div class="text-h5">Artículos</div>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-data-table
            no-results-text="No se encontraron resultados"
            hide-default-footer
            :headers="headers"
            :items="order.line_items"
          >
            <template v-slot:item.orderNo>
              {{ order.idOrder }}
            </template>

            <template v-slot:item.customer>
              <div class="text-capitalize">
                {{ order.ecommercesContactId.first_name }}
                {{ order.ecommercesContactId.last_name }}
              </div>
            </template>

            <template v-slot:item.sku="{ item }">
              {{ getSku(item) }}
            </template>

            <template v-slot:item.name="{ item }">
              {{ item.ecommerceId.name }}
            </template>

            <template v-slot:item.price="{ item }">
              {{ item.total | currency }}
            </template>

            <template v-slot:item.status="{ item }">
              {{ item.ecommerceId.status }}
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import { format } from "date-fns";
import { getSku } from "@/utils/utils.js";

export default {
  props: {
    order: {
      type: Object,
      required: true,
    },
  },
  filters: {
    formatDate: function (value) {
      return format(new Date(value), "dd/MM/yyyy");
    },
    currency(val) {
      return new Intl.NumberFormat().format(val);
    },
  },
  data() {
    return {
      items: [],
      headers: [
        {
          text: "N°Orden:",
          align: "left",
          value: "orderNo",
        },
        {
          text: "Cliente",
          align: "left",
          value: "customer",
        },
        {
          text: "SKU de Tienda",
          align: "left",
          value: "sku",
        },
        {
          text: "Producto",
          align: "left",
          value: "name",
        },
        {
          text: "Cantidad",
          align: "center",
          value: "quantity",
        },
        {
          text: "Precio",
          align: "left",
          value: "price",
        },
        {
          text: "Estado",
          align: "left",
          value: "status",
        },
      ],
    };
  },
  computed: {
    total() {
      return this.order.line_items.reduce((a, b) => a + parseFloat(b.total), 0);
    },
  },
  methods: {
    getSku(item) {
      return getSku(item);
    },
  },
};
</script>

<style>
</style>