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
              <div class="ml-1">{{order.OrderNumber}}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Estado:</div>
              <div class="ml-1">{{order.Status}}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Total:</div>
              <div class="ml-1">{{order.Price | currency}}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Fecha de creación:</div>
              <div class="ml-1">{{order.CreatedAt}}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Última actualización:</div>
              <div class="ml-1">{{order.UpdatedAt}}</div>
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
                {{order.CustomerFirstName}} {{order.CustomerLastName}}
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">País:</div>
              <div class="ml-1">{{order.AddressBilling.Country}}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Comúna:</div>
              <div class="ml-1">{{order.AddressBilling.City}}</div>
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
            <template v-slot:item.OrderNo>
              {{order.OrderNumber}}
            </template>

            <template v-slot:item.Customer>
              <div class="text-capitalize">
                {{order.CustomerFirstName}} {{order.CustomerLastName}}
              </div>
            </template>

            <template v-slot:item.ItemPrice="{ item }">
              {{item.ItemPrice | currency}}
            </template>

            <template v-slot:item.Status="{ item }">
              {{item.Status}}
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import scOrdersApi from '@/services/api/scOrders'

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
          value: "OrderNo",
        },
        {
          text: "Cliente",
          align: "left",
          value: "Customer",
        },
        {
          text: "Drafiti ID",
          align: "left",
          value: "ShopId",
        },
        {
          text: "SKU de Tienda",
          align: "left",
          value: "Sku",
        },
        {
          text: "Producto",
          align: "left",
          value: "Name",
        },
        {
          text: "Precio",
          align: "left",
          value: "ItemPrice",
        },
        {
          text: "Estado",
          align: "left",
          value: "Status",
        },
      ]
    }
  },
  methods: {
    async getItems() {
      let res = await scOrdersApi.listItems(this.order._id)
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