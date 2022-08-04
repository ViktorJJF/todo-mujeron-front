<template>
  <v-card>
    <v-card-title class="text-h5 grey lighten-2">
      Detalles del producto
    </v-card-title>
    <v-container class="pa-5">
      <v-row dense class="mb-4">
        <v-col>
          <div class="text-h5">Datos del producto</div>
        </v-col>
      </v-row>
      <div class="ml-4">
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Identificador:</div>
              <div class="ml-1">{{product.externalId}}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Fuente:</div>
              <div class="ml-1" style="text-transform: capitalize;">
                {{product.source}}
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Nombre:</div>
              <div class="ml-1">{{product.name}}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Fecha de creación:</div>
              <div class="ml-1">{{product.createdAt | date}}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <div class="body-1 font-weight-bold">Última actualización:</div>
              <div class="ml-1">{{product.updatedAt | date}}</div>
            </div>
          </v-col>
        </v-row>
      </div>

      <v-row dense class="my-4">
        <v-col>
          <div class="text-h5">Variaciones</div>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-data-table
            no-results-text="No se encontraron resultados"
            hide-default-footer
            :headers="headers"
            :items="product.variations"
          >
            <template v-slot:item.price="{ item }">
              {{item.price | currency}}
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  filters: {
    currency(val) {
      return new Intl.NumberFormat().format(val)
    },
    date(val) {
      const dateOptions = Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'medium' })
      return dateOptions.format(new Date(val))
    }
  },
  data() {
    return {
      headers: [
        {
          text: "Identificador",
          align: "left",
          value: "externalId",
        },
        {
          text: "SKU",
          align: "left",
          value: "sku",
        },
        {
          text: "Stock",
          align: "left",
          value: "stock",
        },
        {
          text: "Precio",
          align: "left",
          value: "price",
        },
      ]
    }
  }
}
</script>

<style>

</style>