<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="99%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Variaciones"
        text="Resumen de Variaciones"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="variations"
          @page-count="pageCount = $event"
          :page.sync="page"
          :items-per-page="$store.state.itemsPerPage"
        >
          <template v-slot:top>
            <v-container>
              <span class="font-weight-bold">
                Filtrar por nombre: {{ search }}
              </span>
              <v-row>
                <v-col cols="12" sm="5">
                  <v-text-field
                    hide-details
                    v-model="search"
                    append-icon="search"
                    placeholder="Escribe el texto"
                    single-line
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row v-if="variationsSelected.length">
                <v-col>
                  <v-btn
                    color="primary"
                    depressed
                    @click="batchUpdate(true)"
                  >
                    On
                  </v-btn>
                  <v-btn
                    class="ml-2"
                    color="error"
                    depressed
                    @click="batchUpdate(false)"
                  >
                    OFF
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </template>

          <template v-slot:item.checkbox="{ item }">
            <span class="format-breaklines">
              <v-checkbox
                :value="getCheckboxValue(item)"
                @change="val => handleCheckboxChange(val, item)"
              />
            </span>
          </template>

          <template v-slot:item.switch="{ item }">
            <span class="format-breaklines">
              <v-switch
                :input-value="item.stock > 0"
                :loading="false"
                @change="val => handleSwitchChange(val, item)"
              />
            </span>
          </template>

          <template v-slot:item.source="{ item }">
            <span style="text-transform: capitalize;">
              {{ item.product ? item.product.source : '' }}
            </span>
          </template>
          
          <template v-slot:item.price="{ item }">
            {{ item.price | currency }}
          </template>

          <template v-slot:item.stock="{ item }">
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

          <template v-slot:no-data>
            <v-alert type="error" :value="true">
              Aún no cuentas con variaciones
            </v-alert>
          </template>
        </v-data-table>
        <v-col cols="12" sm="12">
          <span>
            <strong>Mostrando:</strong>
            {{
              $store.state.itemsPerPage > variations.length
                ? variations.length
                : $store.state.itemsPerPage
            }}
            de {{ variations.length }} registros
          </span>
        </v-col>
        <div class="text-center pt-2">
          <v-pagination v-model="page" :length="pageCount"></v-pagination>
        </div>
      </material-card>
    </v-row>
  </v-container>
</template>

<script>
import productsApi from '@/services/api/marketplaceProducts'
import MaterialCard from "@/components/material/Card";

export default {
  components: { MaterialCard },
  filters: {
    currency(val) {
      return new Intl.NumberFormat().format(val)
    },
    date(val) {
      const dateOptions = Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'medium' })
      return dateOptions.format(new Date(val))
    }
  },
  data: () => ({
    page: 1,
    pageCount: 0,
    loadingButton: false,
    search: "",
    detailsModal: false,
    currentStock: 0,
    variations: [],
    variationsSelected: [],
    stockRules: [
      val => /^[0-9]*$/.test(val) || "Debe ser un número",
      val => val >=0 || "No puede ser negativo",
      val => !!val || "El campo es requerido"
    ],
    headers: [
      {
        text: "",
        align: "left",
        sortable: false,
        value: "checkbox"
      },
      {
        text: "",
        align: "left",
        sortable: false,
        value: "switch",
      },
      {
        text: "Identificador",
        align: "left",
        value: "externalId",
      },
      {
        text: "Fuente",
        align: "left",
        value: "source",
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
  }),

  mounted() {
    this.initialize();
  },

  methods: {
    async initialize() {
      await Promise.all([this.$store.dispatch("marketplaceProductsModule/fetchVariations", { catalog: this.$route.params.id })]);
      this.variations = this.$deepCopy(this.$store.state.marketplaceProductsModule.variations)
    },
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
    },
    getCheckboxValue(item) {
      return this.variationsSelected.findIndex(variation => variation._id === item._id) !== -1
    },
    async handleCheckboxChange(value, item) {
      if(value === true) {
        this.variationsSelected.push(item)
        return;
      }

      const index = this.variationsSelected.findIndex(variation => variation._id === item._id)
      this.variationsSelected.splice(index, 1)
    },
    async batchUpdate(value) {
      if(value === true) {
        // Only turn on products that are off
        const variations = this.variationsSelected.filter(variation => variation.stock === 0)

        const changes = variations.map(variation => ({
          id: variation._id,
          stock: 1
        }))

        console.log(changes)
        return;
      }

      // Only turn off products that are on
        const variations = this.variationsSelected.filter(variation => variation.stock > 0)

        const changes = variations.map(variation => ({
          id: variation._id,
          stock: 0
        }))

        console.log(changes)
    }
  },
};
</script>

<style lang="scss" scoped></style>
