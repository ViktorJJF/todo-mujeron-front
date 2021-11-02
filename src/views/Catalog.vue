<template>
  <v-app id="inspire">

    <v-navigation-drawer
      v-model="drawerFilter"
      app
      clipped
      width="350"
    >
      <v-list
        flat
        subheader
      >
      <v-list-item>
        <v-btn text @click="clearFilters" color="grey">
          Limpiar
          <v-icon>mdi-filter-remove-outline</v-icon>
        </v-btn>
      </v-list-item>

        <v-subheader>Filtrar por categorias</v-subheader>
        
        <v-list-item>
          <v-treeview
            v-model="filter.categories"
            :items="categoriesTree"
            item-key="idCategory"
            selectable
            open-all
          >
            <template v-slot:label="{item}">
              {{item.name}} <span class="caption">({{item.products.length}})</span>
            </template>
          </v-treeview>
        </v-list-item>
        
      </v-list>
    </v-navigation-drawer>
  
    <v-app-bar
      app
      color="white"
      flat
      clipped-left
    >
      <country-select
        v-if="!hideCountrySelect"
        class="mr-2"
        v-model="country"
        style="max-width: 200px;"
      />
      <v-autocomplete
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
              <img :src="getProductImageUrl(item)">
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{item.name}}</v-list-item-title>
              <!-- <v-list-item-subtitle>Subtitle</v-list-item-subtitle> -->
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
          color="grey"
          @click="flipPage('Left')"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <div>
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
              @flip-left-end="onFlipLeftEnd"
              @flip-right-end="onFlipRightEnd"
            >
            </flipbook>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Flipbook from 'flipbook-vue'
import EcommercesApi from "@/services/api/ecommerces";
import EcommercesCategoriesApi from "@/services/api/ecommercesCategories";
import CountrySelect from '@/components/catalog/CountrySelect'
import TallasSelect from '@/components/catalog/TallasSelect'
import { jsPDF } from "jspdf";
import _ from 'lodash'

const COUNTRIES = ['Chile', 'Peru']
const DEFAULT_COUNTRY = 'Chile'

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default {
  components: { Flipbook, CountrySelect, TallasSelect },
  data() {
    return {
      country: DEFAULT_COUNTRY,
      countryLoaded: false,
      hideCountrySelect: true,
      drawerFilter: true,
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
    }
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
  computed: {
    pages() {
      return this.productsSource.map(this.getProductImageUrl)
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
        let leftText = `Rerefencia: ${product.ref} - Tallas disponibles: ${this.getTallas(product)}`
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
      if(tallasAvailable) {
        return tallaAttr.options.join(', ')
      }
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
        
        const talla = product.attributes.find(attr => attr.name.trim().toLowerCase() === 'talla')
        const tallasAvailables = talla && talla.options.length
        
        return imageAvailable && tallasAvailables;
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
    handleBuyClick(direction) {
      if(direction==='left') {
        const isLastProduct = this.productsSource.length === this.currentPage 
        const productIndex = isLastProduct
          ? this.currentPage
          : this.currentPage - 1

        console.log(isLastProduct, productIndex)
        console.log(this.productsSource[productIndex])
        return;
      }

      return
    },
    flipPage(direction) {
      this.$refs.flipbook[`flip${direction}`]()
    },
    onFlipLeftEnd(page) {
      this.currentPage = page
      // window.location.hash = '#' + page
    },
    onFlipRightEnd(page) {
      this.currentPage = page
      // window.location.hash = '#' + page
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

<style>
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
</style>