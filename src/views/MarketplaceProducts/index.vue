<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="99%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Productos"
        text="Resumen de Products"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="products"
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
                <v-col>
                  <v-btn :to="{name: 'MarketplaceProductosCrear'}" color="primary">
                    Agregar Producto
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </template>

          <template v-slot:item.updatedAt="{ item }">
            {{ item.updatedAt | date }}
          </template>

          <template v-slot:item.source="{ item }">
            <span style="text-transform: capitalize;">
              {{ item.source }}
            </span>
          </template>

          <template v-slot:item.sku="{ item }">
            <span>
              {{ item.sku }}
            </span>
          </template>
          
          <template v-slot:item.price="{ item }">
            {{ item.price | currency }}
          </template>

          <template v-slot:item.action="{ item }">
            <v-btn small color="secondary" @click="openDetails(item)">
              Detalles
            </v-btn>
            <v-btn class="ml-2" small color="primary" @click="updateProduct(item)">
              Modificar
            </v-btn>
          </template>

          <template v-slot:no-data>
            <v-alert type="error" :value="true">
              Aún no cuentas con productos
            </v-alert>
          </template>
        </v-data-table>
        <v-col cols="12" sm="12">
          <span>
            <strong>Mostrando:</strong>
            {{
              $store.state.itemsPerPage > products.length
                ? products.length
                : $store.state.itemsPerPage
            }}
            de {{ products.length }} registros
          </span>
        </v-col>
        <div class="text-center pt-2">
          <v-pagination v-model="page" :length="pageCount"></v-pagination>
        </div>
      </material-card>
    </v-row>
    <v-dialog
      v-model="detailsModal"
      width="800"
    >
      <product-details :product="currentProduct" />
    </v-dialog>
  </v-container>
</template>

<script>
import MaterialCard from "@/components/material/Card";
import ProductDetails from './Details.vue'
import marketplaceProductsV2Api from '@/services/api/marketplaceProductsV2'

export default {
  components: { MaterialCard, ProductDetails },
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
    currentProduct: null,
    products: [],
    headers: [
      {
        text: "Última Actualización",
        align: "left",
        sortable: false,
        value: "updatedAt",
      },
      {
        text: "Tipo",
        align: "left",
        value: "type",
      },
      {
        text: "Nombre",
        align: "left",
        value: "name",
      },
      {
        text: "Sku",
        value: "sku"
      },
      {
        text: "Precio",
        align: "center",
        sortable: false,
        value: 'price',
      },
      { text: "Acciones", value: "action", align: 'center', sortable: false },
    ]
  }),

  mounted() {
    this.initialize();
  },

  methods: {
    async initialize() {
      marketplaceProductsV2Api.listAll().then((res) => {
        this.products = res.data.payload
      })
    },

    updateProduct(product) {
      this.$router.replace({
        name: 'MarketplaceProductosCrear',
        params: {
          id: product._id
        }
      })
    },

    openDetails(product) {
      this.currentProduct = product
      this.detailsModal = true
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    }
  },
};
</script>

<style lang="scss" scoped></style>
