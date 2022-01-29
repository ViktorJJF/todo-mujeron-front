<template>
  <div class="page" v-scroll="onScroll">

    <v-navigation-drawer
      v-model="drawerFilter"
      app
      clipped
      touchless
      width="350"
      color="#bebebe"
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
        <v-list-item class="filter-drawer-top">
          <v-img :src="coverImage" max-height="300" />
          <div class="content">
            <div class="text-h4 font-weight-bold white--text">{{catalog.domain}}</div>
            <div class="text-subtitle-1 font-weight-bold" style="color: #e3e3e3">
              Full moda {{new Date().getFullYear()}}
            </div>
          </div>
        </v-list-item>
        <v-list-item class="mt-3">
          <v-autocomplete
            class="d-flex"
            :items="products"
            v-model="productsSelected"
            prepend-inner-icon="mdi-magnify"
            append-icon=""
            hide-details
            hide-no-data
            outlined
            dense
            flat
            multiple
            return-object
            item-text="name"
            :search-input.sync="search"
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
            <template v-slot:item="{item, attrs, on}">
              <v-list-item v-bind="attrs" v-on="on" @click="search=null" >
                <v-list-item-avatar tile height="63" width="63">
                  <img :src="item.images && item.images[0].src">
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{item.name}}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-list-item>
        <v-list-group :value="true" color="dark">
          <template v-slot:activator>
            <v-list-item-content class="drawer-title">
              <v-list-item-title>Filtrar por categorias</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item>
            <v-treeview
              v-model="filter.categories"
              :items="categoriesTree"
              item-key="idCategory"
              selectable
              rounded
            >
              <template v-slot:label="{item}">
                {{item.name}} <span class="caption">({{item.products.length}})</span>
              </template>
            </v-treeview>
          </v-list-item>
        </v-list-group>
 
        <v-list-group :value="true" color="dark">
          <template v-slot:activator>
            <v-list-item-content class="drawer-title">
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
                class="filter-item-action"
                :value="item"
                :key="`item-${i}`"
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
            <v-list-item-content class="drawer-title">
              <v-list-item-title>Filtrar por marcas</v-list-item-title>
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
                class="filter-item-action"
                :value="item"
                :key="`item-${i}`"
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

      <v-list flat>
        <v-list-item-content class="drawer-title">
          <v-list-item-title>Tus Artículos</v-list-item-title>
        </v-list-item-content>
        
        <v-list-item
          v-for="(item, index) in cartItems"
          three-line
          :key="item.product._id"
        >
           <v-list-item-avatar tile width="70" height="100">
              <v-img
                :src="item.product.images && item.product.images[0].src"
              />
            </v-list-item-avatar>
            <v-list-item-content>
              <div>
                <div>{{item.product.name}}</div>
                <div>{{item.product.ref}}</div>
                <div>Talla: {{item.tallas.join(', ')}}</div>
                <strong style="font-size: 23px">
                  {{ (item.product.regular_price || item.product.variations[0].regular_price) * item.quantity | currency}}
                </strong>
              </div>
            </v-list-item-content>
            <v-list-item-action class="d-flex flex-column align-center">
              <v-btn class="mb-3" icon @click="cartRemoveItem(index)">
                <v-icon size="40" color="grey">mdi-delete</v-icon>
              </v-btn>
              <div class="d-flex align-center justify-center">
                <v-icon color="grey" @click="item.quantity>0 && item.quantity--">mdi-minus</v-icon>
                <v-text-field
                  class="text-field-center"
                  v-model="item.quantity"
                  style="width: 42px;"
                  type="number"
                  min="1"
                  hide-details
                  dense
                  outlined
                />
                <v-icon color="grey" @click="item.quantity++">mdi-plus</v-icon>
              </div>
            </v-list-item-action>
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

    <v-banner dark :color="mainColor" single-line>
      <marquee-text class="text-body-2" :duration="50">
        {{catalog.topBannerText || 'Hola, recuerda seguirme en las redes sociales!!! Con Mi Tienda móvil, compras fácil y rápido, todo lo que ves está disponible; puedes filtrar por Talla  o también seleccionar la categoría (Fajas, jeans, Vestir..) para que encuentres más rápido todo lo que buscas.  recuerda filtrar por talla y veras solo lo que te interesa en tu talla. Usa el menú para filtrar por talla, marca o categoría de producto. Suma al carrito y al final me enviaras un mensaje al Whatsapp con los productos que te gustan. Estamos felices por tu visita!!'}}
      </marquee-text>
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
          outlined
          dense
          flat
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

    <div v-if="isAppBarHidden && cartItems.length" class="cart-fixed">
      <v-btn
        icon
        outlined
        color="blue darken-3"
        @click="drawerCart = true"
      >
        <v-icon>mdi-cart-variant</v-icon>
      </v-btn>
    </div>

    <v-main class="grey lighten-3">
      <v-container>
        <v-row>
          <v-col class="pa-1">
            <div class="d-flex justify-center align-center">
              <v-btn
                class="mr-1"
                icon
                color="grey"
                @click="flipPage('Left')"
              >
                <v-icon size="35">mdi-chevron-left</v-icon>
              </v-btn>
              <div style="min-width: 50px;" class="d-flex justify-center">
                {{pages.length ? currentPage : 0}} / {{pages.length}}
              </div>
              <v-btn
                class="ml-1"
                icon
                color="grey"
                @click="flipPage('Right')"
              >
                <v-icon size="35">mdi-chevron-right</v-icon>
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
                      v-for="talla of currentPageProductTallas"
                      link
                      :key="talla"
                      @click="cartAddItem(currentPageProduct, talla)"
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

        <v-row justify="center">
          <v-col cols="11">
            <v-sheet class="d-flex justify-center rounded-xl">
              <div class="pa-3 d-flex flex-column align-center" style="max-width: 75%">
                <div class="text-h4 font-weight-bold" :style="`color: ${mainColor}`">{{catalog.domain}}</div>
                <div class="mb-6 text-subtitle-1 grey--text">Full moda {{new Date().getFullYear()}}</div>
                <div class="mb-6 text-center">
                  Todos los derechos reservados de este website pertenecen a
                  <span class="text-uppercase">{{catalog.domain}}</span>
                </div>
                <div class="mb-6 d-flex justify-space-around" style="width: 100%">
                  <v-btn v-if="catalog.fbPage" icon color="blue" :href="catalog.fbPage" target="_blank">
                    <v-icon x-large>mdi-facebook</v-icon>
                  </v-btn>
                  <v-btn v-if="catalog.wsPhone" icon color="green" :href="getWsInfoLink()" target="_blank">
                    <v-icon x-large>mdi-whatsapp</v-icon>
                  </v-btn>
                  <v-btn v-if="catalog.instagram" icon color="pink" :href="catalog.instagram" target="_blank">
                    <v-icon x-large>mdi-instagram</v-icon>
                  </v-btn>
                  <v-btn v-if="catalog.telegram" icon color="orange" :href="catalog.telegram" target="_blank">
                    <v-icon x-large>mdi-phone</v-icon>
                  </v-btn>
                </div>
                <div class="mb-6 text-caption">Copyright Enabled {{new Date().getFullYear()}}. All Rights Reserved.</div>
              </div>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <bottom-navigation
      @menuClick="drawerFilter = true"
      @itemClick="handleBottomItemClick"
      :color="mainColor"
    />

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
import TallasSelect from '@/components/catalog/TallasSelect'
import BottomNavigation from './BottomNavigation'
import MarqueeText from 'vue-marquee-text-component'
import BuyForm from "../BuyForm"
import PersonaR from './persona.jpg'
import { jsPDF } from "jspdf";
import _ from 'lodash'

const COUNTRIES = ['Chile', 'Peru']
const DEFAULT_COUNTRY = 'Chile'

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default {
  components: { Flipbook, TallasSelect, BottomNavigation, MarqueeText, BuyForm },
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
      search: '',
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
      currentPage: 1,
      showGesture: false,
      personResource: PersonaR,
      isAppBarHidden: false,
      mainColor: 'purple',
      coverImage: 'https://scontent.fscl3-1.fna.fbcdn.net/v/t31.18172-8/12138341_105828646442199_4570082104489449039_o.jpg?_nc_cat=100&ccb=1-5&_nc_sid=09cbfe&_nc_eui2=AeEtDVL0I5_JPxDKp954Y2_QP4OTzUqEWGg_g5PNSoRYaHaF9kjznQrYgi4YeKa7j5E&_nc_ohc=0qywmKQvB5QAX9ZvLnr&_nc_ht=scontent.fscl3-1.fna&oh=a2d5c8b618f79811896cda3bb009f531&oe=61D747D6',
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
    if(this.catalog.mainColor) {
      this.mainColor = this.catalog.mainColor
    }

    if(this.catalog.coverPageImage) {
      this.coverImage = this.catalog.coverPageImage
    }

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
    currentPageProduct() {
      const index = this.currentPage > 0
        ? this.currentPage-1
        : 0
      return this.productsSource[index]
    },
    currentPageProductTallas() {
      return this.currentPageProduct
        ? this.getTallas(this.currentPageProduct)
        : []
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

      return filteredProducts.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt)
      });
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

        this.currentPage = this.pages.length ? 1 : 0
        this.$refs.flipbook.goToPage(this.currentPage)

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
    onScroll () {
      this.isAppBarHidden = window.scrollY >= 95
    },
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
    handleSearchItemClick() {
      this.search = ''
    },
    handleBottomItemClick (category) {
      this.filter.categories = [category]
    },
    removeSelectedProduct (item) {
      const index = this.productsSelected.findIndex(p => p._id===item._id)
      if (index >= 0) this.productsSelected.splice(index, 1)
    },
    handleSendWs() {
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

      let url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}&phone=${this.catalog.wsPhone}`

      window.open(url, "_blank");  
    },
    getWsInfoLink() {
      let message = `Hola estuve viendo tu pagina ${this.catalog.domain} y quiero información`

      return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}&phone=${this.catalog.wsPhone}`
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
.app-bar {
  display: flex;
  justify-content: center;
  align-items: center;
}

.page >>> .v-toolbar__content {
  justify-content: center;
}

.drawer-title { 
  margin-left: 20px;
  font-weight: bold;
}

.filter-item-action {
  margin-left: 20px;
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

.cart-fixed {
  position: fixed;
  right: 5%;
  top: 3%;
  z-index: 1;
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

.text-field-center >>> input {
  text-align: center;
}


.filter-drawer-top {
  position: relative;
  padding-left: 0;
  padding-right: 0;
}

.filter-drawer-top .content {
  position: absolute;
  bottom: 20px;
  margin-left: 20px;
  width: 100%;
}


</style>