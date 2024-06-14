<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="98%"
        icon="mdi-cellphone-dock"
        color="primary"
        :title="$t('variations.TITLE')"
        :text="$t('variations.SUBTITLE')"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="filteredItems"
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
                <v-col cols="12" sm="4">
                  <v-text-field
                    dense
                    hide-details
                    v-model="search"
                    append-icon="search"
                    placeholder="Escriba el texto"
                    single-line
                    outlined
                  />
                </v-col>
                <v-col cols="12" sm="3">
                  <v-select
                    :items="sources"
                    v-model="currentSourceUrl"
                    dense
                    hide-details
                    single-line
                    outlined
                    clearable
                    placeholder="Selecciona la Fuente"
                  />
                </v-col>
                <v-col>
                  <v-btn color="primary" @click="handleProductsCrossover">
                    Sincronizar
                  </v-btn>
                  <div
                    class="controls-container"
                    v-if="productsCrossoverSku.length"
                  >
                    <div>
                      <v-btn
                        v-if="currentProductIndex > 0"
                        @click="
                          handleCurrentProductChange(currentProductIndex - 1)
                        "
                      >
                        Anterior
                      </v-btn>
                      <v-btn
                        v-if="
                          currentProductIndex < productsCrossoverSku.length - 1
                        "
                        class="ml-2"
                        @click="
                          handleCurrentProductChange(currentProductIndex + 1)
                        "
                      >
                        Siguiente
                      </v-btn>
                    </div>
                    <div class="mt-2">
                      {{ currentProductIndex + 1 }} /
                      {{ productsCrossoverSku.length }}
                    </div>
                  </div>
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

          <template v-slot:item.regular_price="{ item }">
            <span>
              {{ item.regular_price | money }}
            </span>
          </template>

          <template v-slot:item.discount="{ item }">
            <div v-if="item.isParent">
              <v-btn
                small
                color="secondary"
                icon
                @click="openDiscountDialog(item)"
              >
                <v-icon>mdi-sale</v-icon>
              </v-btn>
              <span class="format-breaklines" v-if="!!item.sale_price">
                {{ (item.regular_price - item.sale_price) | money }}
              </span>
            </div>
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
              {{
                item.attributesFormatted.talla
                  ? item.attributesFormatted.talla.options.join(", ")
                  : ""
              }}
            </span>
            <span class="format-breaklines" v-else>
              {{
                item.attributesFormatted.talla
                  ? item.attributesFormatted.talla.option
                  : ""
              }}
            </span>
          </template>
          <template v-slot:item.url="{ item }">
            <span v-if="item.url || item.woocommerceId">
              {{
                item.url ||
                  $store.state.woocommercesModule.woocommerces.find(
                    (el) => el._id === item.woocommerceId
                  ).domain
              }}
            </span>
          </template>
          <template v-slot:item.color="{ item }">
            <span class="format-breaklines" v-if="!item.isParent">
              {{
                item.attributesFormatted.color
                  ? item.attributesFormatted.color.option
                  : ""
              }}
            </span>
          </template>
          <template v-slot:item.sku="{ item }">
            <a v-if="item.permalink" :href="item.permalink" target="_blank">
              {{ item.sku }}
            </a>
            <span v-else>{{ item.sku }}</span>
          </template>
          <template v-slot:item.stock_quantity="{ item }">
            <v-edit-dialog
              v-if="!item.isParent"
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

          <template v-slot:item.actions="{ item }">
            <v-btn
              small
              color="secondary"
              icon
              @click="handleSyncVariation(item)"
            >
              <v-icon
                v-if="item.product"
                :class="switchLoading.includes(item.id) ? 'loading' : ''"
                >mdi-sync</v-icon
              >
            </v-btn>
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
    <v-dialog v-model="discountDialog" width="500">
      <v-card v-if="currentItem">
        <v-card-title class="text-h5 grey lighten-2">
          Descuento
        </v-card-title>

        <v-card-text>
          <v-row class="pt-5">
            <v-col cols="4">
              <div class="pa-3 mb-2 rounded-lg elevation-1">
                <div>Precio Regular</div>
                <div>{{ currentItem.regular_price }}</div>
              </div>
              <div class="pa-3 mb-2 rounded-lg elevation-1">
                <div>Precio de venta</div>
                <v-text-field
                  v-model="currentItemSalePrice"
                  type="number"
                  single-line
                  dense
                  outlined
                  hide-details
                  min="0"
                  @change="reCalculateDiscountRate"
                />
              </div>
              <div class="pa-3 rounded-lg elevation-1">
                <div>Descuento %</div>
                <v-text-field
                  v-model="currentItemDiscountRate"
                  type="number"
                  single-line
                  dense
                  outlined
                  hide-details
                  min="0"
                  @change="reCalculateSalePrice"
                />
              </div>
            </v-col>
            <v-col cols="8">
              <div class="d-flex justify-space-around mb-5" style="gap: 10px;">
                <div>
                  Fecha de inicio
                  <v-text-field
                    v-model="discountStartDate"
                    single-line
                    dense
                    outlined
                    hide-details
                  />
                </div>
                <div>
                  Fecha de fin
                  <v-text-field
                    v-model="discountEndDate"
                    single-line
                    dense
                    outlined
                    hide-details
                  />
                </div>
              </div>
              <div class="d-flex justify-center">
                <v-date-picker v-model="discountDates" range />
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click="clerDiscount">
            Borrar
          </v-btn>
          <v-btn text @click="discountDialog = false">
            Cancelar
          </v-btn>
          <v-btn color="secondary" text @click="handleSaveDiscount">
            Aceptar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
const ENTITY = "ecommerces"; // nombre de la entidad en minusculas (se repite en services y modules del store)
import { format } from "date-fns";
import MaterialCard from "@/components/material/Card";
import { es } from "date-fns/locale";
import auth from "@/services/api/auth";
import EcommercesApi from "@/services/api/ecommerces";
import { getDatePartOnly } from "@/utils/dates-handle";

export default {
  components: {
    MaterialCard,
  },
  filters: {
    formatDate: function(value) {
      return format(new Date(value), "d 'de' MMMM 'del' yyyy", {
        locale: es,
      });
    },
    money: function(value) {
      return Intl.NumberFormat().format(value);
    },
  },
  data: () => ({
    page: 1,
    pagination: {},
    switchLoading: [],
    currentStock: 0,
    items: [],
    stockRules: [
      (val) => /^[0-9]*$/.test(val) || "Debe ser un número",
      (val) => val >= 0 || "No puede ser negativo",
      (val) => !!val || "El campo es requerido",
    ],
    fieldsToSearch: [
      "externalId",
      "name",
      "country",
      "permalink",
      "ref",
      "stock_status",
      "status",
      "sku",
      "url",
      "variations.sku",
      "variations.externalId",
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
        text: "Fuente",
        align: "left",
        sortable: false,
        value: "url",
      },
      {
        text: "SKU",
        align: "left",
        sortable: false,
        value: "sku",
      },
      {
        text: "Descuento",
        align: "center",
        sortable: false,
        value: "discount",
      },
      {
        text: "Precio Regular",
        align: "left",
        sortable: false,
        value: "regular_price",
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
      {
        text: "Acciones",
        value: "actions",
      },
    ],
    [ENTITY]: [],
    rolPermisos: {},
    discountDialog: false,
    discountDates: [],
    currentItem: null,
    currentItemSalePrice: 0,
    currentItemDiscountRate: 0,
    currentSourceUrl: null,
    productsCrossoverSku: [],
    currentProductSku: null,
    currentProductIndex: null,
    sources: [
      { text: "Mujeron Chile", value: "https://mujeron.cl" },
      { text: "Fajas Salome Chile", value: "https://fajassalome.cl" },
      { text: "Pushup Chile", value: "https://pushup.cl" },
      { text: "Mujeron Peru", value: "https://mujeron.pe" },
    ],
  }),
  computed: {
    discountStartDate: {
      get: function() {
        return this.discountDates[0];
      },
      set: function(value) {
        this.discountDates.splice(0, 1, value);
      },
    },
    discountEndDate: {
      get: function() {
        return this.discountDates[1];
      },
      set: function(value) {
        this.discountDates.splice(1, 1, value);
      },
    },
    totalItems() {
      return this.$store.state["ecommercesModule"].total;
    },
    totalPages() {
      return this.$store.state["ecommercesModule"].totalPages;
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
    filteredItems() {
      return this.search
        ? this.items.filter(
            (el) =>
              el.name?.toLowerCase().includes(this.search.toLowerCase()) ||
              el.sku?.toLowerCase().includes(this.search.toLowerCase())
          )
        : this.items;
    },
  },
  watch: {
    async search() {
      clearTimeout(this.delayTimer);
      this.delayTimer = setTimeout(() => {
        this.initialize(this.page);
      }, 600);
    },
    currentSourceUrl() {
      this.initialize(this.page);
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
          company: this.$store.getters["authModule/getCurrentCompany"].company
            ._id,
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
        sort: "updatedAt",
        order: -1,
        listType: "All",
        url: this.currentSourceUrl,
      };
      payload.companies = [
        this.$store.getters["authModule/getCurrentCompany"].company._id,
      ];
      await Promise.all([
        this.$store.dispatch("woocommercesModule/list", {
          companies: [
            this.$store.getters["authModule/getCurrentCompany"].company._id,
          ],
        }),
        this.$store.dispatch(ENTITY + "Module/list", payload),
      ]);
      //asignar al data del componente
      const products = this.$deepCopy(
        this.$store.state[ENTITY + "Module"][ENTITY]
      ).map((el) => ({ ...el, originalRef: el.ref }));

      this.items = products.flatMap((product) => {
        const firstVariation = product.variations[0];

        Object.assign(product, {
          isParent: true,
          regular_price: product.regular_price ?? firstVariation?.regular_price,
          sale_price: product.sale_price ?? firstVariation?.sale_price,
          dateOnSaleFrom:
            product.dateOnSaleFrom ?? firstVariation?.date_on_sale_from,
          dateOnSaleTo: product.dateOnSaleTo ?? firstVariation?.date_on_sale_to,
          attributesFormatted: this.getFormatAttributes(product.attributes),
        });

        const variations = product.variations.map((variation) => ({
          ...variation,
          permalink: variation.permalink ?? null,
          product: product,
          attributesFormatted: this.getFormatAttributes(variation.attributes),
          woocommerceId: product.woocommerceId,
          url: product.url,
          country: product.country,
        }));

        Object.assign(product, { variations });

        // in case product has no stock status, because its shopify
        if (!product.stock_status) {
          product.stock_status = product.variations.some(
            (el) => el.stock_status === "instock"
          )
            ? "instock"
            : "outofstock";
        }

        return [product, ...variations];
      });
    },
    getFormatAttributes(attributes) {
      if (!attributes) {
        return {};
      }
      return attributes.reduce(
        (attributes, current) => ({
          ...attributes,
          [current.name.toLowerCase()]: current,
        }),
        {}
      );
    },
    async changeItemStatus(active, item) {
      const id = item.id || item.idEcommerce;
      if (this.switchLoading.indexOf(id) !== -1) {
        return;
      }

      this.switchLoading.push(id);

      const stock_status = active === true ? "instock" : "outofstock";
      const stock_quantity = active === true ? 1 : 0;
      let changes = {
        stock_status,
        stock_quantity,
        status: active === true ? "publish" : "draft",
        woocommerceId: item.woocommerceId,
        inventory_item_id: item.inventory_item_id,
        old_inventory_quantity: item.old_inventory_quantity,
        inventory_quantity: item.inventory_quantity,
        externalId: item.externalId,
      };

      if (item.isParent) {
        let productChanges = {
          ...changes,
          catalog_visibility: active === true ? "visible" : "hidden",
        };

        await EcommercesApi.update(item._id, productChanges);

        Object.assign(item, {
          ...productChanges,
          stock_quantity: null,
        });

        this.switchLoading = this.switchLoading.filter((v) => v !== id);

        if (active === false) {
          this.switchLoading = item.variations.map((variation) => variation.id);

          // disable variations when product is being disabled
          let payload = item.variations.map((variation) => ({
            ...changes,
            id: variation.id,
            inventory_item_id: variation.inventory_item_id,
            old_inventory_quantity: variation.old_inventory_quantity,
            inventory_quantity: variation.inventory_quantity,
          }));

          await EcommercesApi.updateVariationBatch(item._id, payload);

          this.switchLoading = [];

          for (const variation of item.variations) {
            Object.assign(variation, { ...variation, ...changes });
          }
        }

        return;
      }
      // is a variation
      await EcommercesApi.updateVariation(item.product._id, item.id, changes);

      this.switchLoading = this.switchLoading.filter((v) => v !== id);

      Object.assign(item, changes);

      if (active === true) {
        if (item.product.stock_status === "outofstock") {
          // enable product when variations are being enable
          this.changeItemStatus(true, item.product);
        }
        return;
      }

      const hasStock = !!item.product.variations.find(
        (variation) => variation.stock_status === "instock"
      );
      if (!hasStock) {
        this.changeItemStatus(false, item.product);
      }
    },
    async handleStockSave(item) {
      console.log("🐞 LOG HERE item:", item);
      if (this.$refs.stockTextEdit.valid) {
        this.switchLoading.push(item.id);
        const changes = {
          stock_quantity: this.currentStock,
          stock_status: this.currentStock > 0 ? "instock" : "outofstock",
          status: this.currentStock > 0 ? "publish" : "draft",
          woocommerceId: item.woocommerceId,
        };
        Object.assign(item, changes);
        await EcommercesApi.updateVariation(item.product._id, item.id, changes);
        this.switchLoading = this.switchLoading.filter((v) => v !== item.id);
      }
    },
    async handleProductsCrossover() {
      const isAlreadyFetched = this.productsCrossoverSku.length > 0;
      if (isAlreadyFetched) {
        return (this.search = this.currentProductSku);
      }
      const company = this.$store.getters["authModule/getCurrentCompany"]
        .company;
      const res = await EcommercesApi.getProductsCrossover(company.country);
      if (res.data?.ok !== true) return;

      const productsSku = res.data.payload;
      this.productsCrossoverSku = productsSku;
      const sku = productsSku[0];
      this.currentProductSku = sku;
      this.currentProductIndex = 0;
      this.search = sku;
    },
    handleCurrentProductChange(index) {
      const sku = this.productsCrossoverSku[index];
      if (sku) {
        this.currentProductIndex = index;
        this.currentProductSku = sku;
        this.search = sku;
      }
    },

    async handleSyncVariation(variation) {
      const isLoading = this.switchLoading.includes(variation.id);
      if (isLoading) return;

      try {
        this.switchLoading.push(variation.id);
        const isShopify = variation.externalId.includes("shopify");
        const res = await EcommercesApi.syncVariation(
          variation.product._id,
          isShopify ? variation.id : variation.externalId
        );
        Object.assign(variation, {
          ...res.data,
          attributesFormatted: this.getFormatAttributes(res.data.attributes),
        });
      } catch (error) {
        console.error("An error occurred while tring to sync variation", error);
      } finally {
        const loadingIndex = this.switchLoading.indexOf(variation.id);
        this.switchLoading.splice(loadingIndex, 1);
      }
    },
    reCalculateDiscountRate() {
      const regularPrice = this.currentItem.regular_price;
      const salePrice = this.currentItemSalePrice;
      const rate = (regularPrice - salePrice) / regularPrice;
      this.currentItemDiscountRate = rate * 100;
    },
    reCalculateSalePrice() {
      const regularPrice = this.currentItem.regular_price;
      const discountRate = this.currentItemDiscountRate / 100;
      this.currentItemSalePrice =
        regularPrice - this.currentItem.regular_price * discountRate;
    },
    openDiscountDialog(item) {
      this.currentItem = item;
      this.discountDialog = true;
      this.currentItemSalePrice = item.sale_price ?? item.regular_price;
      this.discountStartDate = item.dateOnSaleFrom
        ? getDatePartOnly(item.dateOnSaleFrom)
        : "";
      this.discountEndDate = item.dateOnSaleTo
        ? getDatePartOnly(item.dateOnSaleTo)
        : "";
      this.reCalculateDiscountRate();
    },
    async handleSaveDiscount() {
      const [dateOnSaleFrom, dateOnSaleTo] = this.discountDates;
      const dateOnSaleFromLocal = dateOnSaleFrom
        ? new Date(`${dateOnSaleFrom}T00:00:00`)
        : undefined;
      const dateOnSaleToLocal = dateOnSaleTo
        ? new Date(`${dateOnSaleTo}T00:00:00`)
        : undefined;

      const changes = {
        sale_price: this.currentItemSalePrice,
        dateOnSaleFrom: dateOnSaleFrom ? dateOnSaleFromLocal : undefined,
        dateOnSaleTo: dateOnSaleTo ? dateOnSaleToLocal : undefined,
      };

      await EcommercesApi.updateProductV2(this.currentItem._id, changes);

      Object.assign(this.currentItem, changes);

      this.discountDialog = false;
    },
    clerDiscount() {
      this.discountDates = [];
      this.currentItemSalePrice = this.currentItem.regular_price;
      this.currentItemDiscountRate = 0;
    },
  },
};
</script>

<style lang="scss" scoped>
.controls-container {
  display: inline-flex;
  flex-direction: column;
  margin-left: 8px;
  align-items: center;
}

.loading {
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
