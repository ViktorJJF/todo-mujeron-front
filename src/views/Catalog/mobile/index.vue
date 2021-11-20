<template>
  <div class="page">

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

      <v-list
        flat
        expand
        subheader
      >
        <v-list-item class="px-0">
          <v-img :src="personResource" max-height="300" />
        </v-list-item>
        <v-list-group style="margin-top: 30px;" :value="true" color="dark">
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Filtrar por categorias</v-list-item-title>
            </v-list-item-content>
          </template>
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
        </v-list-group>
 
        <v-list-group :value="true" color="dark">
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Filtrar por tallas</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item-group
            v-model="filter.tallas"
            multiple
          >
            <template v-for="(item, i) in tallas">
              <v-divider
                v-if="!item"
                :key="`divider-${i}`"
              ></v-divider>

              <v-list-item
                v-else
                :key="`item-${i}`"
                :value="item"
              >
                <template v-slot:default="{ active }">
                  <v-checkbox :input-value="active" color="purple lighten-1"></v-checkbox>
                  <v-list-item-content>
                    <v-list-item-title v-text="item"></v-list-item-title>
                  </v-list-item-content>
                </template>
              </v-list-item>
            </template>
          </v-list-item-group>
        </v-list-group>

        <v-list-group :value="true" color="dark">
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Filtrar por tallas</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item-group
            v-model="filter.marcas"
            multiple
          >
            <template v-for="(item, i) in marcas">
              <v-divider
                v-if="!item"
                :key="`divider-${i}`"
              ></v-divider>

              <v-list-item
                v-else
                :key="`item-${i}`"
                :value="item"
              >
                <template v-slot:default="{ active }">
                  <v-checkbox :input-value="active" color="purple lighten-1"></v-checkbox>
                  <v-list-item-content>
                    <v-list-item-title v-text="item"></v-list-item-title>
                  </v-list-item-content>
                </template>
              </v-list-item>
            </template>
          </v-list-item-group>
        </v-list-group>
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
                <div>Talla: {{item.tallas.join(', ')}}</div>
                <strong>{{ (item.product.regular_price || item.product.variations[0].regular_price) * item.quantity | currency}}</strong>
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
      <div class="cart-total">
        <div class="text-h4 text-center font-weight-bold mb-1">
          Total: {{ cartTotal | currency }}
        </div>
        <div class="">
          <v-btn
            class="white--text"
            color="green"
            depressed
            block
            min-height="55"
            @click="handleCartBuy"
            :disabled="!cartItems.length"
          >
            <v-icon
              dark
              class="mr-1"
            >
              mdi-whatsapp
            </v-icon>
            <span>
              Enviar pedido a mi asesor por Whatsapp
            </span>
          </v-btn>
        </div>
      </div>
    </v-navigation-drawer>

    <v-banner dark color="purple" single-line>
      <span class="text-body-2">
        Siguenos en facebok para mantenerte siempre al dia con secretos de
      </span>
    </v-banner>

    <v-app-bar
      color="white"
      flat
    > 
      <div class="app-bar">
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
        </v-list>
        </v-menu>
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
          :disabled="!filtersActive"
          icon
          color="grey-darken-4"
          @click="clearFilters"
        >
          <v-icon>mdi-filter-remove-outline</v-icon>
        </v-btn>
        <tallas-select
          style="max-width: 150px;"
          v-model="filter.tallas"
          :tallas="tallas"
        />
        <v-btn
          :disabled="!cartItems.length"
          icon
          color="blue darken-3"
          @click="drawerCart = true"
        >
          <v-icon>mdi-cart-variant</v-icon>
        </v-btn>
      </div>
    </v-app-bar>

    <v-main class="grey lighten-3">
      <v-container>
        <v-row>
          <v-col class="pa-0">
            <div class="d-flex justify-center align-center">
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
            </div>
          </v-col>
        </v-row>
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
                      v-for="talla of leftPageProductTallas"
                      link
                      :key="talla"
                      @click="cartAddItem(leftPageProduct, talla)"
                    >
                      <v-list-item-title>{{talla}}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>

              <v-fade-transition>
                <div class="hand-gesture" v-if="showGesture">
                  <v-img
                    src="./iconomano.png"
                  />
                </div>          
              </v-fade-transition>
            </flipbook>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <bottom-navigation @action="drawerFilter = true" />
  </div>
</template>

<script>
import Flipbook from 'flipbook-vue'
import EcommercesApi from "@/services/api/ecommerces";
import EcommercesCategoriesApi from "@/services/api/ecommercesCategories";
import TallasSelect from '@/components/catalog/TallasSelect'
import BottomNavigation from './BottomNavigation'
import { jsPDF } from "jspdf";
import _ from 'lodash'
import PersonaR from './persona.jpg'

const COUNTRIES = ['Chile', 'Peru']
const DEFAULT_COUNTRY = 'Chile'

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default {
  components: { Flipbook, TallasSelect, BottomNavigation },
  data() {
    return {
      country: DEFAULT_COUNTRY,
      countryLoaded: false,
      hideCountrySelect: true,
      drawerFilter: false,
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
      showGesture: false,
      personResource: PersonaR
    }
  },
  mounted() {
    const showGestureTime = 2000
    setTimeout(() => {
      this.showGesture = true
    }, showGestureTime)
    
    setTimeout(() => {
      this.showGesture = false
    }, showGestureTime*4)
  },
  created() {
    this.hideCountrySelect = 'hide_country' in this.$route.query ? true : false

    const country = this.$route.query.country

    if(country && COUNTRIES.includes(country)) {
      this.country = country
    }
    
    this.getByCountry().then(() => {
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
    leftPageProductTallas() {
      return this.leftPageProduct
        ? this.getTallas(this.leftPageProduct)
        : []
    },
    rightPageProduct() {
      return this.productsSource[this.currentPage]
    },
    rightPageProductTallas() {
      return this.rightPageProduct
        ? this.getTallas(this.rightPageProduct)
        : []
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
    async downloadPdf(maxSize) {
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
      const tallasAvailable = tallaAttr && tallaAttr.options.length
      if(!tallasAvailable) {
        return [];
      }

      let tallas = []
      for(const [index, talla] of tallaAttr.options.entries()) {
        const inStock = product.variations[index]?.status==="publish" && product.variations[index]?.stock_status==="instock"
        if(inStock) {
          tallas.push(talla)
        }
      }

      return tallas;
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
    handleCartBuy() {
      let message = 'Hola, estos son los productos que me gustaría pedir\n';
    
      let total = 0
      for(const item of this.cartItems) {
        const tallas = item.tallas.join(', ')
        const price = (item.product.regular_price || item.product.variations[0].regular_price)
        const productTotal = price * item.quantity
        const totalFormat = new Intl.NumberFormat().format(productTotal)
        total += productTotal
        message += `\n${item.product.name} | Talla: ${tallas} - ${totalFormat}`
      }

      message += `\n\nTotal: ${new Intl.NumberFormat().format(total)}`

      let url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`

      window.open(url, "_blank");  
    },
    cartAddItem(product, talla) {
      let item = this.cartItems.find(item => item.product._id === product._id)
      if(item) {
        return item.tallas.push(talla)
      }

      this.cartItems.push({product, tallas: [talla], quantity: 1})
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
    onFlipLeftEnd(page) {
      this.currentPage = page
    },
    onFlipRightEnd(page) {
      this.currentPage = page
    },
    getDate() {
      const now = new Date();

      let day = now.getDay();
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
.app-bar {
  display: flex;
  justify-content: center;
  align-items: center;
}

.page >>> .v-toolbar__content {
  justify-content: center;
}

.flipbook {
  height: calc(100vh - 100px);
  position: relative;
}

.buy-button {
  position: absolute;
  bottom: 35%;
  z-index: 1;
}

.buy-button.button-left {
  left: 50px;
}

.buy-button.button-right {
  right: 50px;
}

@keyframes rotation {
  50% {
    transform: rotate(60deg);
  }
  100% {
    transform: rotate(-60deg);
  }
}

.hand-gesture {
    position: absolute;
    z-index: 1;
    bottom: 50%;
    right: 10%;
    pointer-events: none;
    transform: rotate(-60deg);
    transform-origin: bottom !important;
    animation: rotation 2s infinite linear;
}

.cart-total {
  position: absolute;
  bottom: 0;
  width: 100%;
  margin-bottom: 30px;
}

.cart-total .v-btn__content {
  flex: unset;
  white-space: normal
}
</style>