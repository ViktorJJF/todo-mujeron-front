<template>
  <div>

    <v-navigation-drawer
      v-model="drawerFilter"
      app
      clipped
      touchless
      width="350"
    >
      <v-btn
        icon
        absolute
        right
        class="mt-1"
        @click="drawerFilter = false"
      >
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
            <template v-slot:label="{item}">
              {{item.name}} <span class="caption">({{item.products.length}})</span>
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
        <v-btn
          icon
          absolute
          right
          @click="drawerCart = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>

      <v-list
        flat
        subheader
      >
        <v-subheader>Tus Artículos</v-subheader>
        
        <v-list-item
          v-for="(item, index) in cartItems"
          three-line
          :key="item.product._id"
        >
           <v-list-item-avatar tile height="63" width="63">
              <img :src="item.product.images && item.product.images[0].src">
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{item.product.name}}</v-list-item-title>
              <div>
                <div>{{item.product.ref}}</div>
                <div v-if="item.color" style="text-transform: capitalize;">
                  Color: {{item.color}}
                </div>
                <div>Talla: {{item.tallas.join(', ')}}</div>
                <strong>{{item.price * item.quantity | currency}}</strong>
              </div>
            </v-list-item-content>
            <div class="d-flex align-center">
              <v-text-field
                v-model="item.quantity"
                style="max-width: 65px;"
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
        <div class="pa-3 d-flex align-center" :style="`background-color: ${mainColor}`">
          <v-icon size="50" dark class="mr-1">
            mdi-whatsapp
          </v-icon>
          <v-btn
            class="send-ws"
            :style="`color: ${mainColor}`"
            block
            depressed
            @click="handleSendWs"
            :disabled="!cartItems.length"
          >
            <span>
              Enviar pedido a mi asesor por Whatsapp
            </span>
          </v-btn>
        </div>
        <template v-if="mercadopagoAvailable">
          <div class="my-1 text-h6 text-center">
            O
          </div>
          <div class="pa-3" :style="`background-color: ${mainColor}`">
            <v-btn
              :style="`color: ${mainColor}`"
              block
              depressed
              @click="drawerCart = false; buyModal = true"
              :disabled="!cartItems.length"
            >
              Pagar
            </v-btn>
          </div>
        </template>
      </div>
    </v-navigation-drawer>
    
    <v-app-bar
      app
      color="white"
      flat
      clipped-left
    >
      <country-select
        v-if="!hideCountrySelect"
        class="mr-2 d-flex"
        v-model="country"
        style="max-width: 200px;"
      />
      <v-autocomplete
        class="d-flex"
        style="max-width: 400px"
        :items="products"
        v-model="productsSelected"
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
        <template v-slot:item="{item}">
          <template>
            <v-list-item-avatar tile height="63" width="63">
              <img :src="item.images && item.images[0].src">
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{item.name}}</v-list-item-title>
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
        <v-menu
          open-on-hover
          close-delay="200"
          offset-y
        >
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
          <v-list-item @click="downloadPdf()">
            <v-list-item-title>Descargar normal</v-list-item-title>
          </v-list-item>
          <v-list-item @click="downloadPdf(13)">
            <v-list-item-title>Descargar para whatsapp</v-list-item-title>
          </v-list-item>
          <v-list-item @click="downloadPdf(undefined, true)">
            <v-list-item-title>Descargar con precio</v-list-item-title>
          </v-list-item>
        </v-list>
        </v-menu>   
        <v-btn
          class="mr-1"
          icon
          color="grey"
          @click="flipPage('Left')"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <div style="min-width: 50px;" class="d-flex justify-center">
          {{pages.length ? currentPage + 1 : 0}} / {{pages.length}}
        </div>
        <v-btn
          class="ml-1"
          icon
          color="grey"
          @click="flipPage('Right')"
        >
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
          style="max-width: 200px;"
          v-model="filter.tallas"
          :tallas="tallas"
        />

        <v-select
          class="ml-2"
          style="max-width: 250px"
          v-model="filter.marcas"
          :items="marcas"
          label="Marcas"
          no-data-text="No hay datos disponibles"
          multiple
          hide-details
          solo
          dense
          outlined
          flat
        />
      </div>

    </v-app-bar>

    <v-main class="grey lighten-3">
      <v-container>
        <v-row>
          <v-col
            cols="12"
          >
            <flipbook 
              class="flipbook" 
              ref="flipbook"
              :pages="pages"
              :clickToZoom="false"
              @flip-left-end="onFlipLeftEnd"
              @flip-right-end="onFlipRightEnd"
            >
              <div class="buy-button button-left">
                <v-menu top offset-y>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      rounded
                      class="white--text"
                      color="green"
                      v-bind="attrs"
                      v-on="on"
                    >
                      <v-icon
                        dark
                      >
                        mdi-whatsapp
                      </v-icon>
                      <span class="ml-1">
                        Comprar
                      </span>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item
                      v-for="variation of leftPageProductVariations"
                      link
                      :key="variation.id"
                      @click="cartAddItem(leftPageProduct, variation)"
                    >
                      <div style="text-transform: capitalize">
                        {{getVariationLabel(variation)}}
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
                      <v-icon
                        dark
                      >
                        mdi-whatsapp
                      </v-icon>
                      <span class="ml-1">
                        Comprar
                      </span>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item
                      v-for="variation of rightPageProductVariations"
                      :key="variation.id"
                      @click="cartAddItem(rightPageProduct, variation)"
                    >
                      <div style="text-transform: capitalize">
                        {{getVariationLabel(variation)}}
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
    <v-dialog
      v-model="buyModal"
      width="500"
    >
      <buy-form :items="cartItems" :catalog="catalog" />
    </v-dialog>
  </div>
</template>

<script>
import Flipbook from 'flipbook-vue'
import EcommercesApi from "@/services/api/ecommerces";
import EcommercesCategoriesApi from "@/services/api/ecommercesCategories";
import CountrySelect from '@/components/catalog/CountrySelect'
import TallasSelect from '@/components/catalog/TallasSelect'
import BuyForm from "../BuyForm"
import { jsPDF } from "jspdf";
import _ from 'lodash'

const COUNTRIES = ['Chile', 'Peru']
const DEFAULT_COUNTRY = 'Chile'

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default {
  components: { Flipbook, CountrySelect, TallasSelect, BuyForm },
  props: {
    catalog: {
      type: Object
    }
  },
  data() {
    return {
      buyModal: false,
      country: this.catalog.country || DEFAULT_COUNTRY,
      countryLoaded: false,
      hideCountrySelect: true,
      drawerFilter: true,
      drawerCart: false,
      products: [],
      categories: [],
      cartItems: [],
      productsSelected: [],
      filterInitialized: false,
      filter: {
        categories: [],
        tallas: [],
        marcas: [],
      },
      currentPage: 0,
      mainColor: 'purple',
    }
  },
  created() {
    if(this.catalog.mainColor) {
      this.mainColor = this.catalog.mainColor
    }

    this.hideCountrySelect = 'hide_country' in this.$route.query ? true : false

    const country = this.$route.query.country

    if(country && COUNTRIES.includes(country)) {
      this.country = country
    }
    
    this.getByCountry().then(() => {
      this.setInitialPage()
      this.setFilterFromQuery()
    })
  },
  filters: {
    currency(val) {
      return new Intl.NumberFormat().format(val)
    }
  },
  computed: {
    pages() {
      return this.productsSource.map(this.getProductImageUrl)
    },
    leftPageProduct() {
      const index = this.currentPage > 0
        ? this.currentPage-1
        : 0
      return this.productsSource[index]
    },
    leftPageProductVariations() {
      return this.leftPageProduct
        ? this.getVariations(this.leftPageProduct)
        : []
    },
    rightPageProduct() {
      return this.productsSource[this.currentPage]
    },
    rightPageProductVariations() {
      return this.rightPageProduct
        ? this.getVariations(this.rightPageProduct)
        : []
    },
    currencyCode() {
      if(this.country === COUNTRIES[0]) {
        return 'CLP'
      }

      return 'PEN'
    },
    mercadopagoAvailable() {
      return (
        this.catalog.mercadopagoAccessToken && this.catalog.mercadopagoAccessToken.trim().length > 0
      )
    },
    filtersActive() {
      return (
        this.filter.categories.length ||
        this.filter.tallas.length ||
        this.filter.marcas.length ||
        this.productsSelected.length
      )
    },
    allCategories() {
      return this.categories
        .map(category => ({
          ...category,
          products: this.products.filter(product => {
            return product.categories.find(productCat => productCat._id === category._id)
          })
        }))
        .filter(category => category.products.length > 0)
    },
    rootCategories() {
      return this.allCategories.filter(cat => cat.parent===0)
    },
    categoriesTree() {
      return this.rootCategories.map(category => ({
        ...category,
        children: this.allCategories.filter(cat => cat.parent === category.idCategory)
      }))
    },
    productsSource() {
      if(this.productsSelected.length) {
        return this.productsSelected;
      }

      let filteredProducts = [...this.productsByCategory];

      if(this.filter.tallas.length) {
        filteredProducts = filteredProducts.filter(product => {
          return this.hasSomeTalla(product, this.filter.tallas)
        })
      }

      if(this.filter.marcas.length) {
        filteredProducts = filteredProducts.filter(product => {
          return this.hasSomeAttribute(product, 'marca', this.filter.marcas)
        })
      }

      return filteredProducts;
    },
    productsByCategory() {
      if(this.filter.categories.length) {
        let categories = this.allCategories.filter(c => this.filter.categories.includes(c.idCategory))
        return _.chain(categories).flatMap('products').uniqBy('_id').value()
      }

      return this.products;
    },
    tallas() {
      let res = this.productsByCategory.reduce((tallas, product) => {
        const tallaAttr = product.attributes.find(attr => attr.name.trim().toLowerCase() === 'talla')
        const tallasAvailable = tallaAttr && tallaAttr.options.length
        if(!tallasAvailable) {
          return tallas;
        }

        for(const [index, talla] of tallaAttr.options.entries()) {
          const inStock = product.variations[index]?.status==="publish" && product.variations[index]?.stock_status==="instock"
          if(inStock) {
            tallas[talla] = true
          }
        }

        return tallas;
      }, {})

      return Object.keys(res)
    },
    marcas() {
      let res = this.productsByCategory.reduce((marcas, product) => {
        const marcaAttr = product.attributes.find(attr => attr.name.trim().toLowerCase() === 'marca')
        const marcasAvailable = marcaAttr && marcaAttr.options.length
        if(!marcasAvailable) {
          return marcas;
        }

        for(const marca of marcaAttr.options) {
          marcas[marca] = true
        }

        return marcas;
      }, {})

      return Object.keys(res)
    },
    cartTotal() {
      return this.cartItems.reduce((total, item) => {
        const price = item.product.regular_price || item.product.variations[0].regular_price
        return total + (price * item.quantity)
      }, 0)
    }
  },
  watch: {
    'country': function() {
      if(!this.countryLoaded) return;

      this.filterInitialized = false

      this.filter = {
        tallas: [],
        marcas: [],
        categories: []
      }

      let query = {
        ...this.$route.query,
        country: this.country
      }

      this.$router.push({ name: 'Catalog', query })

      this.getByCountry().then(() => {
        this.filterInitialized = true
      })
    },
    'filter': {
      deep: true,
      handler: function(val) {
        if(!this.filterInitialized) return;

        if(this.currentPage > this.pages.length) {
          this.currentPage = this.pages.length-1
          this.$refs.flipbook.goToPage(this.currentPage)
        }
        let query = {
          ...this.$route.query,
          categories: val.categories.join(','),
          tallas: val.tallas.join(','),
          marcas: val.marcas.join(',')
        }

        this.$router.push({ name: 'Catalog', query })
      }
    },
    'filter.categories': function() {
      if(!this.filterInitialized) return;

      Object.assign(this.filter, {tallas: [], marcas: []})
    },    
  },
  methods: {
    async downloadPdf(maxSize, price) {
      if(!this.productsSource.length) {
        return;
      }

      let doc = new jsPDF();

      const [x, y] = [30, 7]
      let width = doc.internal.pageSize.getWidth() - (x * 2);
      let height = doc.internal.pageSize.getHeight() - (y * 2);
      

      for(const [index, product] of this.productsSource.entries()) {
        let leftText = `Rerefencia: ${product.ref} - Tallas disponibles: ${this.getTallas(product).join(', ')}`
        doc.text(leftText, x-3, height+y, {angle: 90});

        let rightText = `Actualizado al ${this.getDate()} - Pais: ${this.country}`
        doc.text(rightText, width+x+6, height+y, {angle: 90});

        if(price) {
          let productPrice = product.regular_price || product.variations[0].regular_price
          productPrice = new Intl.NumberFormat().format(productPrice)
          let priceText = `Precio: ${productPrice}`

          doc.setFontSize(doc.getFontSize() + 2)
             .setFont(undefined, 'bold')
             .text(priceText, width+x+6, height+y - (rightText.length * 2.65), {angle: 90});

          // return font to normal
          doc.setFontSize(doc.getFontSize() - 2).setFont(undefined, 'normal')
        }

        let image = this.getProductImageUrl(product)
        doc.addImage(image, "JPEG", x, y, width, height)

        const filename = `${Date.now()}.pdf`

        const isLast = index === this.productsSource.length-1
        if(isLast) {
          return doc.output('save', filename);
        }

        if(maxSize) {
          let size = doc.output().length
          let sizeMb = size / (1024*1024)
          if(sizeMb >= maxSize) {
            doc.output('save', filename);
            await this.delay(500)
            doc = new jsPDF();  // reset pdf
            continue;
          } 
        }

        doc.addPage()
      }
    },
    delay(time=1000) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, time)
      })
    },
    clearFilters() {
      this.filter.categories = []
      this.productsSelected = []
    },
    getTallas(product) {
      const tallaAttr = product.attributes.find(attr => attr.name.trim().toLowerCase() === 'talla')
      const hasVariations = tallaAttr && tallaAttr.variation === true
      if(!hasVariations) {
        return [];
      }

      let tallas = []
      for(const variation of product.variations) {
        const available = variation.status === 'publish' && variation.stock_status === 'instock'
        if(!available) {
          continue;
        }

        const attr = variation.attributes?.find(attr => attr.id == tallaAttr.id)
        if(!attr) {
          continue;
        }

        const talla = attr.option
        const isDuplicated = tallas.includes(talla)
        if(!isDuplicated) {
          tallas.push(talla)
        }
      }

      return tallas;
    },
    getVariationLabel (variation) {
      const talla = variation.attributes.talla.option
      const color = variation.attributes.color?.option

      if(color) {
        return `${talla} - ${color}`
      }

      return talla;
    },
    getVariations(product) {
      let variations = []

      for(const variation of product.variations) {
        const available = variation.status === 'publish' && variation.stock_status === 'instock'
        if(available) {
          variations.push({
            ...variation,
            attributes: this.getFormatAttributes(variation.attributes)
          })
        }
      }

      return variations;
    },
    getFormatAttributes(attributes) {
      return attributes.reduce((attributes, current) => ({
        ...attributes,
        [current.name.toLowerCase()]: current
      }), {})
    },
    async getByCountry() {
      const query = {country: this.country}

      let [productsRes, categoriesRes] = await Promise.all([
        EcommercesApi.list(query),
        EcommercesCategoriesApi.list(query)
      ])

      this.categories = categoriesRes.data.payload

      this.products = this.getAvailableProducts(productsRes.data.payload)

      this.$nextTick(() => {
        this.countryLoaded = true;
      })
    },
    getAvailableProducts(products) {
      return products.filter(product => {
        const imageAvailable = product.customImage && product.customImage.trim().length > 0
        
        const tallas = this.getTallas(product)
        
        return imageAvailable && tallas.length;
      })
    },
    hasSomeAttribute(product, attributeName, attrs) {
      let attribute = product.attributes.find(attr => attr.name.trim().toLowerCase() === attributeName)

      if(attribute && attribute.options.length) {
        for(const needle of attrs) {
          if(attribute.options.includes(needle)) {
            return true;
          }
        }
      }

      return false;
    },
    // Return true if has some of the talla from the array
    hasSomeTalla(product, tallas) {
      const tallaAttr = product.attributes.find(attr => attr.name.trim().toLowerCase() === 'talla')
      const tallasAvailable = tallaAttr && tallaAttr.options.length
      if(!tallasAvailable) {
        return false;
      }

      for(const talla of tallas) {
        const tallaIndex = tallaAttr.options.indexOf(talla)
        if(tallaIndex === -1) {
          continue;
        }

        const inStock = product.variations[tallaIndex]?.status==="publish" && product.variations[tallaIndex]?.stock_status==="instock"
        if(inStock) {
          return true;
        }
      }


      return false;
    },
    removeSelectedProduct (item) {
      const index = this.productsSelected.findIndex(p => p._id===item._id)
      if (index >= 0) this.productsSelected.splice(index, 1)
    },
    handleSendWs() {
      let message = 'Hola, estos son los productos que me gustaría pedir\n';
    
      let total = 0
      let items = []
      for(const item of this.cartItems) {
        const tallas = item.tallas.join(', ')
        const price = (item.product.regular_price || item.product.variations[0].regular_price)
        const productTotal = price * item.quantity
        const totalFormat = new Intl.NumberFormat().format(productTotal)
        total += productTotal
        message += `\n${item.product.name} | Talla: ${tallas} - ${totalFormat}`
        if(item.color) {
          message += ` | Color: ${item.color}`
        }

        // Google Analytics items
        items.push({
          item_id: item.product.idEcommerce,
          item_name: item.product.name,
          item_variant: tallas,
          price,
          quantity: item.quantity
        })
      }

      message += `\n\nTotal: ${new Intl.NumberFormat().format(total)}`

      this.$gtag.event('begin_checkout', {
        currency: this.currencyCode,
        value: total,
        items
      })

      let url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
      
      window.open(url, "_blank");  
    },
    cartAddItem(product, variation) {
      const talla = variation.attributes.talla.option
      const color = variation.attributes.color?.option

      this.$gtag.event('agrego_al_carrito', {
        currency: this.currencyCode,
        value: variation.regular_price,
        items: [{
          item_id: product.idEcommerce,
          item_name: product.name,
          item_variant: talla,
          price: variation.regular_price,
          quantity: 1,
        }]
      })

      let item = this.cartItems.find(item => item.product._id === product._id & item.color === color)
      if(item) {
        return item.tallas.push(talla)
      }

      this.cartItems.push({
        product,
        tallas: [talla],
        color,
        quantity: 1,
        price: variation.regular_price,
      })
    },
    cartRemoveItem(index) {
      this.cartItems.splice(index, 1)
      if(this.cartItems.length === 0) {
        this.drawerCart = false;
      }
    },
    flipPage(direction) {
      this.$refs.flipbook[`flip${direction}`]()
    },
    setInitialPage() {
      if(this.$vuetify.breakpoint.mobile) {
        this.currentPage = 0;
        return;
      }

      this.currentPage = this.productsSource.length >= 1
        ? 1
        : 0
    },
    onFlipLeftEnd(page) {
      this.currentPage = page
    },
    onFlipRightEnd(page) {
      this.currentPage = page
    },
    getDate() {
      const now = new Date();

      let day = now.getDate();
      let month = now.getMonth();
      let year = now.getFullYear();

      return `${day} de ${MONTHS[month].toLowerCase()} del ${year}`
    },
    getProductImageUrl({customImage}) {
      return `/api/wp-image?url=${customImage}`
    },
    async setFilterFromQuery() {
      const query = this.$route.query

      let categories = query.categories ? query.categories.split(',').map(c=>parseInt(c, 10)) : []
      let tallas = query.tallas ? query.tallas.split(',') : []
      let marcas = query.marcas ? query.marcas.split(',') : []


      this.filter.categories = categories

      await this.$nextTick()

      Object.assign(this.filter, {tallas, marcas})
      
      await this.$nextTick()

      this.filterInitialized = true
    },
  }
}
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