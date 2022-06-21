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
              <div class="ml-1">{{order.externalNumber || order.externalId}}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Estado:</div>
              <div class="ml-1">{{order.status}}</div>
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
              <div class="ml-1">{{order.createdAt}}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Última actualización:</div>
              <div class="ml-1">{{order.updatedAt}}</div>
            </div>
          </v-col>
        </v-row>
        <v-row v-if="order.closedAtSource">
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Fecha de cierre:</div>
              <div class="ml-1">{{order.closedAtSource}}</div>
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
                {{order.customer.firstname}} {{order.customer.lastname}}
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">País:</div>
              <div class="ml-1">{{order.customer.country}}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Comúna:</div>
              <div class="ml-1">{{order.customer.city}}</div>
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
            :items="items"
          >
            <template v-slot:item.orderNo>
              {{order.externalNumber}}
            </template>

            <template v-slot:item.customer>
              <div class="text-capitalize">
                {{order.customer.firstname}} {{order.customer.lastname}}
              </div>
            </template>

            <template v-slot:item.price="{ item }">
              {{item.price | currency}}
            </template>

            <template v-slot:item.status="{ item }">
              {{item.status}}
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import marketplaceOrdersApi from '@/services/api/marketplaceOrders'

export default {
  props: {
    order: {
      type: Object,
      required: true
    }
  },
  filters: {
    currency(val) {
      return new Intl.NumberFormat().format(val)
    }
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
          text: "Drafiti ID",
          align: "left",
          value: "shopId",
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
          text: "Precio",
          align: "left",
          value: "price",
        },
        {
          text: "Estado",
          align: "left",
          value: "status",
        },
      ]
    }
  },
  methods: {
    async getItems() {
      let res = await marketplaceOrdersApi.listItems(this.order._id)
      this.items = res.data.payload
    }
  },
  watch: {
    'order': {
      immediate: true,
      handler: function() {
        this.items = []
        this.getItems()
      }
    }
  }
}
</script>

<style>

</style>