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
          <div class="d-flex">
            <div class="text-h5">Variaciones</div>
            <div class="ml-2">
              <v-btn icon @click="editing=!editing">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-data-table
            no-results-text="No se encontraron resultados"
            hide-default-footer
            :headers="headersSource"
            :items="variations"
          >
            <template v-slot:item.switch="{ item }">
              <span class="format-breaklines">
                <v-switch
                  :input-value="item.stock > 0"
                  :loading="false"
                  @change="val => handleSwitchChange(val, item)"
                />
              </span>
            </template>

            <template v-slot:item.price="{ item }">
              {{item.price | currency}}
            </template>

            <template v-slot:item.stock="{ item }" v-if="editing">
              <v-edit-dialog
                large
                persistent
                @save="handleStockSave(item)"
                @open="currentStock = item.stock"
              >
                <div>{{ item.stock }}</div>
                <template v-slot:input>
                  <div class="mt-4 text-h6">
                    Modificar Stock
                  </div>
                  <v-text-field
                    ref="stockTextEdit"
                    v-model="currentStock"
                    label="Edit"
                    type="number"
                    min="0"
                    :rules="stockRules" 
                    single-line
                    autofocus
                  ></v-text-field>
                </template>
              </v-edit-dialog>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import productsApi from '@/services/api/marketplaceProducts'

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
      editing: false,
      currentStock: 0,
      variations: [],
      stockRules: [
        val => /^[0-9]*$/.test(val) || "Debe ser un número",
        val => val >=0 || "No puede ser negativo",
        val => !!val || "El campo es requerido"
      ],
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
  },
  computed: {
    headersSource() {
      if(this.editing) {
        return [
          {
            text: "",
            align: "left",
            sortable: false,
            value: "switch",
          },
          ...this.headers
        ]
      }

      return this.headers;
    }
  },
  methods: {
    async handleStockSave(item) {
      if(this.$refs.stockTextEdit.valid) {
        const changes = {
          stock: this.currentStock
        }

        await productsApi.updateVariation(item._id, changes)

        Object.assign(item, changes)
      }
    },
    async handleSwitchChange(value, item) {
      const changes = {
        stock: value === true ? item.stock + 1 : 0
      }

      await productsApi.updateVariation(item._id, changes)

      Object.assign(item, changes)
    }
  },
  watch: {
    product: {
      immediate: true,
      handler: function(product) {
        productsApi.listProductVariations(product._id).then(res => {
          this.variations = res.data.payload
        })
      }
    }
  }
}
</script>

<style>

</style>