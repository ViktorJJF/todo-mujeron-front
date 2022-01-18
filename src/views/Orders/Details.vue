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
              <div class="body-1 font-weight-bold">Estado:</div>
              <div class="ml-1">{{$t(`orders.status.${order.status}`)}}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Total:</div>
              <div class="ml-1">{{order.total | currency}}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Fecha de creación:</div>
              <div class="ml-1">{{order.createdAt | formatDate}}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Última actualización:</div>
              <div class="ml-1">{{order.updatedAt | formatDate}}</div>
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
              <div class="ml-1">{{order.customer.name}}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Teléfono:</div>
              <div class="ml-1">{{order.customer.phone}}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Correo Electrónico:</div>
              <div class="ml-1">{{order.customer.email}}</div>
            </div>
          </v-col>
        </v-row>
      </div>

      <template v-if="order.shippment">
        <v-row dense class="my-4">
          <v-col>
            <div class="text-h5">Datos de envío</div>
          </v-col>
        </v-row>
        <div class="ml-4">
          <v-row>
            <v-col>
              <div class="d-flex">
                <div class="body-1 font-weight-bold">Dirección:</div>
                <div class="ml-1">{{order.shippment.address}}</div>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="d-flex">
                <div class="body-1 font-weight-bold">Comuna:</div>
                <div class="ml-1">{{order.shippment.comuna}}</div>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="d-flex">
                <div class="body-1 font-weight-bold">Ciudad:</div>
                <div class="ml-1">{{order.shippment.city}}</div>
              </div>
            </v-col>
          </v-row>
        </div>
      </template>
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
            :items="order.items"
          >
            <template v-slot:item.product="{ item }">
              {{item.product.ref}}
            </template>

            <template v-slot:item.price="{ item }">
              {{getPrice(item) | currency}}
            </template>

            <template v-slot:item.tallas="{ item }">
              {{item.tallas ? item.tallas.join(', ') : ''}}
            </template>

            <template v-slot:item.total="{ item }">
              {{calcTotal(item) | currency}}
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import { format } from "date-fns";

export default {
  props: {
    order: {
      type: Object,
      required: true
    }
  },
  filters: {
    formatDate: function(value) {
      return format(new Date(value), "dd/MM/yyyy");
    },
    currency(val) {
      return new Intl.NumberFormat().format(val)
    }
  },
  data() {
    return {
      headers: [
        {
          text: "Producto",
          align: "left",
          value: "product",
        },
        {
          text: "Precio",
          align: "left",
          value: "price",
        },
        {
          text: "Tallas",
          align: "left",
          value: "tallas",
        },
        {
          text: "Cantidad",
          align: "left",
          value: "quantity",
        },
        {
          text: "Total",
          align: "left",
          value: "total",
        },
      ]
    }
  },
  methods: {
    calcTotal (item) {
      return this.getPrice(item) * item.quantity;
    },
    getPrice(item) {
      return item.product.regular_price || item.product.variations[0].regular_price
    }
  }
}
</script>

<style>

</style>