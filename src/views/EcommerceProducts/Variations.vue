<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="98%"
        icon="mdi-cellphone-dock"
        color="primary"
        :title="$t(entity + '.TITLE')"
        :text="$t(entity + '.SUBTITLE')"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="items"
          sort-by="calories"
          @page-count="pageCount = $event"
          :page.sync="page"
          :items-per-page="$store.state.itemsPerPage"
          :options.sync="pagination"
          :server-items-length="totalItems"
        >
          <template v-slot:top>
            <v-container>
              <span class="font-weight-bold"> Filtrar: {{ search }} </span>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    dense
                    hide-details
                    v-model="search"
                    append-icon="search"
                    placeholder="Escribe el nombre de producto"
                    single-line
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="12">
                  <span>
                    <strong>Mostrando:</strong>
                    {{
                      $store.state.itemsPerPage > items.length
                        ? items.length
                        : $store.state.itemsPerPage
                    }}
                    de {{ $store.state.ecommercesModule.total }} registros
                  </span>
                </v-col>
              </v-row>
            </v-container>
          </template>

          <template v-slot:item.switch="{ item }">
            <span class="format-breaklines">
              <v-switch
                :input-value="item.stock_status === 'instock'"
                :loading="switchLoading.includes(item.id || item.idEcommerce)"
                @change="(val) => changeItemStatus(val, item)"
              />
            </span>
          </template>
          <template v-slot:item.id="{ item }">
            <span class="format-breaklines">
              {{ item.isParent ? item.idEcommerce : item.id }}
            </span>
          </template>
          <template v-slot:item.title="{ item }">
            <span class="format-breaklines" v-if="item.isParent">
              {{ item.name }}
            </span>
          </template>
          <template v-slot:item.talla="{ item }">
            <span class="format-breaklines" v-if="item.isParent">
              {{ item.attributesFormatted.talla ? item.attributesFormatted.talla.options.join(', ') : '' }}
            </span>
            <span class="format-breaklines" v-else>
              {{ item.attributesFormatted.talla ? item.attributesFormatted.talla.option : '' }}
            </span>
          </template>
          <template v-slot:item.color="{ item }">
            <span class="format-breaklines" v-if="!item.isParent">
              {{ item.attributesFormatted.color ? item.attributesFormatted.color.option : '' }}
            </span>
          </template>
          <template v-slot:item.stock_quantity="{ item }">
            <v-edit-dialog v-if="!item.isParent"
              large
              persistent
              @save="handleStockSave(item)"
              @open="currentStock = item.stock_quantity"
            >
              <div>{{ item.stock_quantity }}</div>
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
        <v-col cols="12" sm="12">
          <span>
            <strong>Mostrando:</strong>
            {{
              $store.state.itemsPerPage > items.length
                ? items.length
                : $store.state.itemsPerPage
            }}
            de {{ $store.state.ecommercesModule.total }} registros
          </span>
        </v-col>
        <div class="text-center pt-2">
          <v-pagination
            @input="initialize(page)"
            v-model="page"
            :length="pageCount"
            :total-visible="$store.state.maxPaginationButtons"
          ></v-pagination>
        </div>
      </material-card>
    </v-row>
  </v-container>
</template>

<script>
const ENTITY = "ecommerces"; // nombre de la entidad en minusculas (se repite en services y modules del store)
import { format } from "date-fns";
import MaterialCard from "@/components/material/Card";
import { es } from "date-fns/locale";
import auth from "@/services/api/auth";
import EcommercesApi from '@/services/api/ecommerces'

export default {
  components: {
    MaterialCard,
  },
  filters: {
    formatDate: function (value) {
      return format(new Date(value), "d 'de' MMMM 'del' yyyy", {
        locale: es,
      });
    },
  },
  data: () => ({
    page: 1,
    pagination: {},
    switchLoading: [],
    currentStock: 0,
    items: [],
    stockRules: [
      val => /^[0-9]*$/.test(val) || "Debe ser un número",
      val => val >=0 || "No puede ser negativo",
      val => !!val || "El campo es requerido"
    ],
    fieldsToSearch: [
      "name",
      "permalink",
      "ref",
      "stock_status",
      "status",
      "sku",
      "url",
    ],
    pageCount: 0,
    search: "",
    headers: [
      {
        text: "",
        align: "left",
        sortable: false,
        value: "switch",
      },
      {
        text: "ID",
        align: "left",
        sortable: false,
        value: "id",
      },
      {
        text: "Título",
        align: "left",
        sortable: false,
        value: "title",
      },
      {
        text: "SKU",
        align: "left",
        sortable: false,
        value: "sku",
      },
      {
        text: "Stock ",
        align: "left",
        sortable: false,
        value: "stock_quantity",
      },
      {
        text: "Talla",
        align: "left",
        sortable: false,
        value: "talla",
      },
      {
        text: "Color",
        align: "left",
        sortable: false,
        value: "color",
      },
      {
        text: "Stock",
        align: "left",
        sortable: false,
        value: "",
      },
      {
        text: "Stock Estado",
        align: "left",
        sortable: false,
        value: "stock_status",
      },
      {
        text: "Estado",
        align: "left",
        sortable: false,
        value: "status",
      },
      {
        text: "Visibilidad",
        align: "left",
        sortable: false,
        value: "catalog_visibility",
      },
    ],
    [ENTITY]: [],
    rolPermisos: {},
  }),
  computed: {
    totalItems() {
      return this.$store.state["ecommercesModule"].total;
    },
    totalPages() {
      return this.$store.state["ecommercesModule"].totalPages;
    },
    formTitle() {
      return this.editedIndex === -1
        ? this.$t(this.entity + ".NEW_ITEM")
        : this.$t(this.entity + ".EDIT_ITEM");
    },
    entity() {
      return ENTITY;
    },
    countProductSyncPercentage() {
      return (this.countProductSync / this.items.length) * 100;
    },
    countProductSyncPercentageSelected() {
      return (this.countProductSyncSelected / this.selectedProductsSize) * 100;
    },
  },
  watch: {
    async search() {
      clearTimeout(this.delayTimer);
      this.delayTimer = setTimeout(() => {
        this.initialize(this.page);
      }, 600);
    },
  },
  mounted() {
    this.$store.commit("loadingModule/showLoading");
    this.initialize();
    this.rolAuth();
  },
  methods: {
    rolAuth() {
      auth
        .roleAuthorization({
          id: this.$store.state.authModule.user._id,
          menu: "Configuracion/Propiedades/Woocommerces",
          model: "Productos",
        })
        .then((res) => {
          this.rolPermisos = res.data;
        })
        .finally(() => this.$store.commit("loadingModule/showLoading", false));
    },
    async initialize(page = 1) {
      //llamada asincrona de items
      let payload = {
        page,
        search: this.search,
        fieldsToSearch: this.fieldsToSearch,
        sort: "date_modified",
        order: -1,
        listType: "All",
      };
      await Promise.all([
        this.$store.dispatch(ENTITY + "Module/list", payload),
      ]);
      //asignar al data del componente
      const products = this.$deepCopy(
        this.$store.state[ENTITY + "Module"][ENTITY]
      ).map((el) => ({ ...el, originalRef: el.ref }));

      this.items = products.flatMap(product => {
        Object.assign(product, {
          isParent: true,
          attributesFormatted: this.getFormatAttributes(product.attributes)
        })


        const variations = product.variations.map(variation => ({
          ...variation,
          product: product,
          attributesFormatted: this.getFormatAttributes(variation.attributes)
        }))
        
        Object.assign(product, { variations })

        return  [product, ...variations]
      })
    },
    getFormatAttributes(attributes) {
      return attributes.reduce((attributes, current) => ({
        ...attributes,
        [current.name.toLowerCase()]: current
      }), {})
    },
    async changeItemStatus(active, item) {
      const id = item.id || item.idEcommerce
      if(this.switchLoading.indexOf(id) !== -1) {
        return;
      }

      this.switchLoading.push(id)

      const stock_status = active === true ? 'instock' : 'outofstock'
      const stock_quantity = active === true ? 1 : 0
      let changes = { stock_status, stock_quantity, status: active === true ? 'publish' : 'draft', }

      if(item.isParent) {
        let productChanges = {
          ...changes,
          catalog_visibility: active === true ? 'visible' : 'hidden',
        }

        await EcommercesApi.update(item._id, productChanges)

        Object.assign(item, {
          ...productChanges,
          stock_quantity: null,
        })
        
        this.switchLoading = this.switchLoading.filter(v => v !== id)

        if(active === false) {
          this.switchLoading = item.variations.map(variation => variation.id)

          // disable variations when product is being disabled
          let payload = item.variations.map(variation => ({
            id: variation.id,
            ...changes
          }))

          await EcommercesApi.updateVariationBatch(item._id, payload)

          this.switchLoading = []
          
          for(const variation of item.variations) {
            Object.assign(variation, { ...variation, ...changes })
          }
        }

        return;
      }

      // is a variation
      await EcommercesApi.updateVariation(item.product._id, item.id, changes)

      this.switchLoading = this.switchLoading.filter(v => v !== id)

      Object.assign(item, changes)

      if(active === true) {
        if(item.product.stock_status === 'outofstock') {
          // enable product when variations are being enable
          this.changeItemStatus(true, item.product)
        }
        return;
      }

      const hasStock = !!item.product.variations.find(variation => variation.stock_status === 'instock')
      if(!hasStock) {
        this.changeItemStatus(false, item.product)
      }
    },
    async handleStockSave(item) {
      if(this.$refs.stockTextEdit.valid) {
        this.switchLoading.push(item.id)
        const changes = {
          stock_quantity: this.currentStock,
          stock_status: this.currentStock > 0 ? 'instock' : 'outofstock',
          status: this.currentStock > 0 ? 'publish' : 'draft'
        }
        Object.assign(item, changes)
        await EcommercesApi.updateVariation(item.product._id, item.id, changes)
        this.switchLoading = this.switchLoading.filter(v => v !== item.id)
      }
    }
  },
};
</script>

<style lang="scss" scoped></style>
