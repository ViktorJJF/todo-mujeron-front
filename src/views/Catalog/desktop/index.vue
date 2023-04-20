<template>
  <div>
    <v-navigation-drawer
      v-model="drawerFilter"
      app
      clipped
      touchless
      width="350"
    >
      <v-btn icon absolute right class="mt-1" @click="drawerFilter = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>

      <v-list flat>
        <v-subheader>Filtrar por categorias</v-subheader>
        <v-list-item>
          <v-treeview
            v-model="filter.categories"
            :items="categoriesTree"
            item-key="idCategory"
            selectable
          >
            <template v-slot:label="{ item }">
              {{ item.name }}
              <span v-if="item.products" class="caption"
                >({{ item.products }})</span
              >
            </template>
          </v-treeview>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-navigation-drawer
      v-model="drawerCart"
      app
      right
      temporary
      touchless
      width="500"
    >
      <v-btn icon absolute right @click="drawerCart = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>

      <v-list flat subheader>
        <v-subheader>Tus Artículos</v-subheader>

        <v-list-item
          v-for="(item, index) in cartItems"
          three-line
          :key="item.product._id"
        >
          <v-list-item-avatar tile height="63" width="63">
            <img :src="item.product.images && item.product.images[0].src" />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ item.product.name }}</v-list-item-title>
            <div>
              <div>{{ item.product.ref }}</div>
              <div v-if="item.color" style="text-transform: capitalize">
                Color: {{ item.color }}
              </div>
              <div>Talla: {{ item.tallas.join(", ") }}</div>
              <strong>{{ (item.price * item.quantity) | currency }}</strong>
            </div>
          </v-list-item-content>
          <div class="d-flex align-center">
            <v-text-field
              v-model="item.quantity"
              style="max-width: 65px"
              type="number"
              min="1"
              hide-details
              dense
              outlined
            />
            <v-btn icon @click="cartRemoveItem(index)">
              <v-icon color="grey lighten-1">mdi-delete</v-icon>
            </v-btn>
          </div>
        </v-list-item>
      </v-list>
      <div class="cart-bottom">
        <div class="text-h4 text-center font-weight-bold mb-1">
          Total: {{ cartTotal | currency }}
        </div>
        <div
          class="pa-3 d-flex align-center"
          :style="`background-color: ${mainColor}`"
        >
          <v-icon size="50" dark class="mr-1"> mdi-whatsapp </v-icon>
          <v-btn
            class="send-ws"
            :style="`color: ${mainColor}`"
            block
            depressed
            @click="handleSendWs"
            :disabled="!cartItems.length"
          >
            <span> Enviar pedido a mi asesor por Whatsapp </span>
          </v-btn>
        </div>
        <template v-if="mercadopagoAvailable">
          <div class="my-1 text-h6 text-center">O</div>
          <div class="pa-3" :style="`background-color: ${mainColor}`">
            <v-btn
              :style="`color: ${mainColor}`"
              block
              depressed
              @click="
                drawerCart = false;
                buyModal = true;
              "
              :disabled="!cartItems.length"
            >
              Pagar
            </v-btn>
          </div>
        </template>
      </div>
    </v-navigation-drawer>

    <v-app-bar app color="white" flat clipped-left>
      <country-select
        v-if="!hideCountrySelect"
        class="mr-2 d-flex"
        v-model="country"
        style="max-width: 200px"
      />
      <v-autocomplete
        class="d-flex"
        style="max-width: 400px"
        v-model="productsSelected"
        :items="productsSearch"
        :loading="searchLoading"
        :search-input.sync="search"
        cache-items
        prepend-inner-icon="mdi-magnify"
        append-icon=""
        hide-details
        hide-no-data
        outlined
        rounded
        dense
        multiple
        return-object
        item-text="name"
        clearable
      >
        <template v-slot:selection="data">
          <v-chip
            v-bind="data.attrs"
            :input-value="data.selected"
            close
            @click="data.select"
            @click:close="removeSelectedProduct(data.item)"
          >
            {{ data.item.ref }}
          </v-chip>
        </template>
        <template v-slot:item="{ item }">
          <template>
            <v-list-item-avatar tile height="63" width="63">
              <img :src="item.images && item.images[0].src" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item-content>
          </template>
        </template>
      </v-autocomplete>
      <v-spacer />
      <div class="d-flex align-center">
        <v-btn
          class="mr-1"
          icon
          :color="drawerFilter ? 'grey-darken-4' : 'grey'"
          @click="drawerFilter = !drawerFilter"
        >
          <v-icon>mdi-filter-outline</v-icon>
        </v-btn>
        <v-btn
          class="d-flex"
          v-if="filtersActive"
          icon
          color="grey-darken-4"
          @click="clearFilters"
        >
          <v-icon>mdi-filter-remove-outline</v-icon>
        </v-btn>
        <v-menu open-on-hover close-delay="200" offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="mr-1"
              icon
              color="grey-darken-4"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>mdi-arrow-collapse-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="handleDownloadPdf()">
              <v-list-item-title>Descargar normal</v-list-item-title>
            </v-list-item>
            <v-list-item @click="handleDownloadPdf(13)">
              <v-list-item-title>Descargar para whatsapp</v-list-item-title>
            </v-list-item>
            <v-list-item @click="handleDownloadPdf(undefined, true)">
              <v-list-item-title>Descargar con precio</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn class="mr-1" icon color="grey" @click="flipPage('Left')">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <div style="min-width: 50px" class="d-flex justify-center">
          {{ pages.length ? currentPageIndex + 1 : 0 }} /
          {{ productsDocsSource.total }}
        </div>
        <v-btn class="ml-1" icon color="grey" @click="flipPage('Right')">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <v-btn
          :disabled="!cartItems.length"
          icon
          color="blue darken-3"
          @click="drawerCart = true"
        >
          <v-icon>mdi-cart-variant</v-icon>
        </v-btn>
      </div>
      <v-spacer />

      <div class="d-flex">
        <tallas-select
          style="max-width: 200px"
          v-model="filter.tallas"
          :tallas="tallas"
        />

        <v-select
          class="ml-2"
          style="max-width: 250px"
          v-model="filter.brands"
          :items="brands"
          label="Marcas"
          no-data-text="No hay datos disponibles"
          multiple
          hide-details
          solo
          dense
          outlined
          flat
          clearable
        />
      </div>
    </v-app-bar>

    <v-main class="grey lighten-3">
      <v-container>
        <v-row>
          <v-col cols="12">
            <flipbook
              class="flipbook"
              ref="flipbook"
              :pages="pages"
              :clickToZoom="false"
              @flip-left-end="onFlipLeftEnd"
              @flip-right-end="onFlipRightEnd"
            >
              <div class="buy-button button-left" v-if="leftPageProduct">
                <v-menu top offset-y>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      rounded
                      class="white--text"
                      color="green"
                      v-bind="attrs"
                      v-on="on"
                    >
                      <v-icon dark> mdi-whatsapp </v-icon>
                      <span class="ml-1"> Comprar </span>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item
                      v-for="variation of leftPageProduct.variations"
                      link
                      :key="variation.id"
                      @click="cartAddItem(leftPageProduct, variation)"
                    >
                      <div style="text-transform: capitalize">
                        {{ variation.label }}
                      </div>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>

              <div
                v-if="rightPageProduct"
                class="buy-button button-right d-flex"
              >
                <v-menu top offset-y>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      rounded
                      class="white--text"
                      color="green"
                      v-bind="attrs"
                      v-on="on"
                    >
                      <v-icon dark> mdi-whatsapp </v-icon>
                      <span class="ml-1"> Comprar </span>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item
                      v-for="variation of rightPageProduct.variations"
                      :key="variation.id"
                      @click="cartAddItem(rightPageProduct, variation)"
                    >
                      <div style="text-transform: capitalize">
                        {{ variation.label }}
                      </div>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </flipbook>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <v-dialog v-model="buyModal" width="500">
      <buy-form :items="cartItems" :catalog="catalog" />
    </v-dialog>
    <v-dialog v-model="downloadLoading" persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          Descargando productos
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Flipbook from "flipbook-vue";
import EcommercesApi from "@/services/api/ecommerces";
import CountrySelect from "@/components/catalog/CountrySelect";
import TallasSelect from "@/components/catalog/TallasSelect";
import BuyForm from "../BuyForm.vue";
import { jsPDF } from "jspdf";

const COUNTRIES = ["Chile", "Peru"];
const DEFAULT_COUNTRY = "Chile";
const ITEMS_PER_PAGE = 30;

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default {
  components: { Flipbook, CountrySelect, TallasSelect, BuyForm },
  props: {
    catalog: {
      type: Object,
    },
  },
  data() {
    return {
      buyModal: false,
      downloadLoading: false,
      country: this.catalog.country || DEFAULT_COUNTRY,
      hideCountrySelect: true,
      drawerFilter: true,
      drawerCart: false,
      products: [],
      productsSearch: [],
      search: null,
      searchLoading: false,
      categories: [],
      tallas: [],
      brands: [],
      cartItems: [],
      productsDocs: {
        total: 0,
        nextPage: 1,
      },
      productsSelected: [],
      filterInitialized: false, // when true allows watching for filter changes
      filter: {
        categories: [],
        tallas: [],
        brands: [],
      },
      currentPageIndex: 0,
      mainColor: "purple",
    };
  },
  created() {
    if (this.catalog.mainColor) {
      this.mainColor = this.catalog.mainColor;
    }

    this.hideCountrySelect = "hide_country" in this.$route.query ? true : false;

    const country = this.$route.query.country;

    if (country && COUNTRIES.includes(country)) {
      this.country = country;
    }

    this.setFilterFromQuery()
      .then(() => this.fetchAll())
      .then(() => this.setFilterFromQuery())
      .then(() => (this.filterInitialized = true));
  },
  filters: {
    currency(val) {
      return new Intl.NumberFormat().format(val);
    },
  },
  computed: {
    pages() {
      return this.productsSource.map(this.getProductImageUrl);
    },
    leftPageProduct() {
      const index = this.currentPageIndex > 0 ? this.currentPageIndex - 1 : 0;
      return this.productsSource[index];
    },
    rightPageProduct() {
      return this.productsSource[this.currentPageIndex];
    },
    currencyCode() {
      if (this.country === COUNTRIES[0]) {
        return "CLP";
      }

      return "PEN";
    },
    mercadopagoAvailable() {
      return (
        this.catalog.mercadopagoAccessToken &&
        this.catalog.mercadopagoAccessToken.trim().length > 0
      );
    },
    filtersActive() {
      return (
        this.filter.categories.length ||
        this.filter.tallas.length ||
        this.filter.brands.length ||
        this.productsSelected.length
      );
    },
    productsSource() {
      return this.productsSelected.length
        ? this.productsSelected
        : this.products;
    },
    productsDocsSource() {
      if (this.productsSelected.length) {
        return {
          total: this.productsSelected.length,
          nextPage: null,
        };
      }

      return this.productsDocs;
    },
    categoriesTree() {
      const rootCategories = this.categories.filter((cat) => cat.parent === 0);

      return rootCategories.map((category) => ({
        ...category,
        children: this.categories.filter(
          (cat) => cat.parent === category.idCategory
        ),
      }));
    },
    cartTotal() {
      return this.cartItems.reduce((total, item) => {
        const price =
          item.product.regular_price ||
          item.product.variations[0].regular_price;
        return total + price * item.quantity;
      }, 0);
    },
  },
  watch: {
    country: function () {
      this.filterInitialized = false;

      this.filter = {
        tallas: [],
        brands: [],
        categories: [],
      };

      const query = {
        ...this.$route.query,
        country: this.country,
      };

      this.$router.replace({ query });

      this.fetchAll().then(() => {
        this.filterInitialized = true;
      });
    },
    search: function (val) {
      this.handleSearchInputChange(val);
    },
    "filter.categories": function () {
      if (!this.filterInitialized) return;
      Object.assign(this.filter, { tallas: [], brands: [] });
      this.fetchAttributes();
    },
    filter: {
      deep: true,
      handler: function (val) {
        if (!this.filterInitialized) return;

        this.fetchProducts();

        const query = {
          ...this.$route.query,
          categories: val.categories.join(","),
          tallas: val.tallas.join(","),
          brands: val.brands.join(","),
        };

        this.$router.replace({ query });
      },
    },
    currentPageIndex: function (val) {
      // fetch products 2 pages before last
      if (val === this.productsSource.length - 3) {
        if (this.productsDocsSource.nextPage) {
          this.fetchProducts(this.productsDocs.nextPage);
        }
      }
    },
  },
  methods: {
    async downloadPdf(maxSize, price) {
      if (!this.productsSource.length) {
        return;
      }

      let doc = new jsPDF();

      const [x, y] = [30, 7];
      let width = doc.internal.pageSize.getWidth() - x * 2;
      let height = doc.internal.pageSize.getHeight() - y * 2;

      for (const [index, product] of this.productsSource.entries()) {
        let leftText = `Rerefencia: ${
          product.ref
        } - Tallas disponibles: ${this.getTallas(product).join(", ")}`;
        doc.text(leftText, x - 3, height + y, { angle: 90 });

        let rightText = `Actualizado al ${this.getDate()} - Pais: ${
          this.country
        }`;
        doc.text(rightText, width + x + 6, height + y, { angle: 90 });

        if (price) {
          let productPrice =
            product.regular_price || product.variations[0].regular_price;

          productPrice = new Intl.NumberFormat().format(productPrice);

          const priceText = `Precio: ${productPrice}`;

          doc
            .setFontSize(doc.getFontSize() + 2)
            .setFont(undefined, "bold")
            .text(
              priceText,
              width + x + 6,
              height + y - rightText.length * 2.65,
              { angle: 90 }
            );

          // return font to normal
          doc.setFontSize(doc.getFontSize() - 2).setFont(undefined, "normal");
        }

        let image = this.getProductImageUrl(product);
        doc.addImage(image, "JPEG", x, y, width, height);

        const filename = `${Date.now()}.pdf`;

        const isLast = index === this.productsSource.length - 1;
        if (isLast) {
          doc.save(filename);
          return await this.delay(500);
        }

        if (maxSize) {
          let size = doc.output().length;
          let sizeMb = size / (1024 * 1024);
          if (sizeMb >= maxSize) {
            doc.save(filename);
            await this.delay(500);
            doc = new jsPDF(); // reset pdf
            continue;
          }
        }

        doc.addPage();
      }
    },
    async handleDownloadPdf(...args) {
      this.downloadLoading = true;

      while (this.productsDocsSource.nextPage) {
        await this.fetchProducts(this.productsDocsSource.nextPage, false);
      }

      await this.downloadPdf(...args);

      this.downloadLoading = false;
    },
    async handleSearchInputChange(val) {
      if (!val) return;
      if (this.searchLoading === true) return;

      this.loading = true;

      await this.fetchSearchProducts(val);

      this.loading = false;
    },
    delay(time = 1000) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, time);
      });
    },
    clearFilters() {
      this.filter.categories = [];
      this.productsSelected = [];
    },
    getTallas(product) {
      const tallas = [];
      for (const variation of product.variations) {
        if (variation.attributes.talla) {
          const talla = variation.attributes.talla.option;
          const isDuplicated = tallas.includes(talla);
          if (!isDuplicated) {
            tallas.push(talla);
          }
        }
      }

      return tallas;
    },
    getAvailableVariations(product) {
      const variations = [];

      for (const variation of product.variations) {
        const available =
          variation.status === "publish" &&
          variation.stock_status === "instock" &&
          variation.attributes;

        if (available) {
          const variationFormatted = {
            ...variation,
            attributes: this.getFormatAttributes(variation.attributes),
          };

          Object.assign(variationFormatted, {
            label: this.getVariationLabel(variationFormatted),
          });

          variations.push(variationFormatted);
        }
      }

      return variations;
    },
    getVariationLabel(variation) {
      const talla = variation.attributes.talla?.option || "";
      const color = variation.attributes.color?.option;

      if (color) {
        return `${talla} - ${color}`;
      }

      return talla;
    },
    getFormatAttributes(attributes) {
      return attributes.reduce(
        (attributes, current) => ({
          ...attributes,
          [current.name.toLowerCase()]: current,
        }),
        {}
      );
    },
    getFormatProduct(product) {
      Object.assign(product, {
        variations: this.getAvailableVariations(product),
      });
      return product;
    },
    async fetchAll() {
      const query = { country: this.country, products_available: true };

      const [categoriesRes] = await Promise.all([
        EcommercesApi.listCategories(query),
        this.fetchAttributes(),
        this.fetchProducts(),
      ]);

      this.categories = categoriesRes.data.payload;
    },
    async fetchProducts(page = 1, setInitialPage = true) {
      const query = {
        country: this.country,
        products_available: true,
        categories: this.filter.categories.join(","),
        tallas: this.filter.tallas.join(","),
        brands: this.filter.brands.join(","),
        limit: ITEMS_PER_PAGE,
        page,
      };

      const productsRes = await EcommercesApi.list(query);

      const products = productsRes.data.payload
        .filter((el) => el.customImages && el.customImages[0])
        .map(this.getFormatProduct);
      if (page === 1) {
        this.products = products;
      } else {
        this.products.push(...products);
      }

      this.productsDocs = {
        total: productsRes.data.totalDocs,
        nextPage: productsRes.data.nextPage,
      };

      if (setInitialPage) {
        this.setInitialPage();
      }
    },
    async fetchAttributes() {
      const query = {
        country: this.country,
        products_available: true,
        categories: this.filter.categories.join(","),
      };

      const [sizesRes, attributesRes] = await Promise.all([
        EcommercesApi.listSizes(query),
        EcommercesApi.listAttributes({ ...query, name: "marca" }),
      ]);

      const tallas = sizesRes.data.payload.map((talla) => talla.option);
      this.tallas = tallas.sort(this.sortSizesFn);
      this.brands = attributesRes.data.payload.map((attr) => attr.options);
    },
    async fetchSearchProducts(val) {
      const query = {
        limit: ITEMS_PER_PAGE,
        country: this.country,
        products_available: true,
        filter: val,
        fields: ["name", "ref", "sku"].join(","),
      };

      const productsRes = await EcommercesApi.list(query);

      const products = productsRes.data.payload
        .filter((el) => el.customImages && el.customImages[0])
        .map(this.getFormatProduct);

      this.productsSearch = products;
    },
    sortSizesFn(a, b) {
      a.toLowerCase();
      b = b.toLowerCase();

      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    },
    removeSelectedProduct(item) {
      const index = this.productsSelected.findIndex((p) => p._id === item._id);
      if (index >= 0) this.productsSelected.splice(index, 1);
    },
    handleSendWs() {
      let message = "Hola, estos son los productos que me gustaría pedir\n";

      let total = 0;
      let items = [];
      for (const item of this.cartItems) {
        const tallas = item.tallas.join(", ");
        const price =
          item.product.regular_price ||
          item.product.variations[0].regular_price;
        const productTotal = price * item.quantity;
        const totalFormat = new Intl.NumberFormat().format(productTotal);
        total += productTotal;
        message += `\n${item.product.name} | Talla: ${tallas} - ${totalFormat}`;
        if (item.color) {
          message += ` | Color: ${item.color}`;
        }

        // Google Analytics items
        items.push({
          item_id: item.product.idEcommerce,
          item_name: item.product.name,
          item_variant: tallas,
          price,
          quantity: item.quantity,
        });
      }

      message += `\n\nTotal: ${new Intl.NumberFormat().format(total)}`;

      this.$gtag.event("begin_checkout", {
        currency: this.currencyCode,
        value: total,
        items,
      });

      let url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        message
      )}`;

      window.open(url, "_blank");
    },
    cartAddItem(product, variation) {
      const talla = variation.attributes.talla?.option || "";
      const color = variation.attributes.color?.option;

      this.$gtag.event("agrego_al_carrito", {
        currency: this.currencyCode,
        value: variation.regular_price,
        items: [
          {
            item_id: product.idEcommerce,
            item_name: product.name,
            item_variant: talla,
            price: variation.regular_price,
            quantity: 1,
          },
        ],
      });

      let item = this.cartItems.find(
        (item) => (item.product._id === product._id) & (item.color === color)
      );
      if (item) {
        return item.tallas.push(talla);
      }

      this.cartItems.push({
        product,
        tallas: [talla],
        color,
        quantity: 1,
        price: variation.regular_price,
      });
    },
    cartRemoveItem(index) {
      this.cartItems.splice(index, 1);
      if (this.cartItems.length === 0) {
        this.drawerCart = false;
      }
    },
    flipPage(direction) {
      this.$refs.flipbook[`flip${direction}`]();
    },
    setInitialPage() {
      // Mobile only shows one page at a time
      if (this.$vuetify.breakpoint.mobile) {
        this.currentPageIndex = 0;
        return;
      }

      this.currentPageIndex = this.products.length >= 2 ? 1 : 0;

      this.$refs.flipbook.goToPage(this.currentPageIndex);
    },
    onFlipLeftEnd(page) {
      this.currentPageIndex = page;
    },
    onFlipRightEnd(page) {
      this.currentPageIndex = page;
    },
    getDate() {
      const now = new Date();

      let day = now.getDate();
      let month = now.getMonth();
      let year = now.getFullYear();

      return `${day} de ${MONTHS[month].toLowerCase()} del ${year}`;
    },
    getProductImageUrl({ customImages }) {
      return `/api/wp-image?url=${customImages[0]}`;
    },
    async setFilterFromQuery() {
      const query = this.$route.query;

      let categories = query.categories
        ? query.categories.split(",").map((c) => parseInt(c, 10))
        : [];
      let tallas = query.tallas ? query.tallas.split(",") : [];
      let brands = query.brands ? query.brands.split(",") : [];

      this.filter.categories = categories;

      await this.$nextTick();

      Object.assign(this.filter, { tallas, brands });
    },
  },
};
</script>

<style scoped>
.flipbook {
  height: calc(100vh - 100px);
  position: relative;
}

.buy-button {
  position: absolute;
  bottom: 50px;
  z-index: 1;
}

.buy-button.button-left {
  left: 50px;
}

.buy-button.button-right {
  right: 50px;
}

.cart-bottom {
  position: absolute;
  bottom: 0;
  width: 100%;
}

.cart-bottom .send-ws {
  width: calc(100% - 50px);
  min-width: 0 !important;
}

.cart-bottom >>> .v-btn__content {
  flex: unset;
  white-space: normal;
}
</style>
