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
        <v-subheader>Filtrar por categorias</v-subheader>
        
        <v-list-item>
          <v-treeview
            v-model="filter.categories"
            :items="categoriesTree"
            item-key="_id"
            selectable
            return-object
            open-all
          ></v-treeview>
        </v-list-item>
        
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      app
      color="white"
      flat
      clipped-left
    >
      <country-select v-model="country" style="max-width: 200px;"/>

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
          v-if="productsSource.length < 60"
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
          <v-list-item @click="downloadPdf">
            <v-list-item-title>Descargar normal</v-list-item-title>
          </v-list-item>
          <v-list-item @click="downloadWsPdf">
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
      
      <tallas-select
        style="max-width: 250px;"
        v-model="filter.tallas"
        :tallas="tallas"
      />

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
              <!-- <div class="buy-button">
                <v-btn
                  rounded
                  color="secondary"                  
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
              </div> -->
            </flipbook>
          </v-col>
        </v-row>
        <vue-html2pdf
          ref="html2Pdf"
          :show-layout="false"
          float-layout
          :html-to-pdf-options="htmlToPdfOptions"
          :preview-modal="false"
          :enable-download="true"
          :manual-pagination="true"
          @hasDownloaded="hasDownloaded"
        >
         <pdf-content
          slot="pdf-content"
          :products="productsToDownload"
          :country="country"
        />
        </vue-html2pdf>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Flipbook from 'flipbook-vue'
import EcommercesApi from "@/services/api/ecommerces";
import EcommercesCategoriesApi from "@/services/api/ecommercesCategories";
import CountrySelect from '@/components/ecommerceViewer/CountrySelect'
import TallasSelect from '@/components/ecommerceViewer/TallasSelect'
import PdfContent from '@/components/ecommerceViewer/PdfContent'
import VueHtml2pdf from 'vue-html2pdf'
import _ from 'lodash'

const DEFAULT_COUNTRY = 'Chile'

export default {
  components: { Flipbook, VueHtml2pdf, CountrySelect, TallasSelect, PdfContent },
  data() {
    return {
      country: DEFAULT_COUNTRY,
      drawerFilter: true,
      products: [],
      categories: [],
      filter: {
        categories: [],
        tallas: [],
      },
      currentPage: 0,
      productsToDownload: [],
      productsToDownloadQueue: [],
      htmlToPdfOptions: {
        margin: 0,
        filename: `${Date.now()}.pdf`,
        image: {
          type: "jpeg",
          quality: 0.98,
        },
        enableLinks: true,
        html2canvas: {
          scale: 1,
          useCORS: true,
          logging: false
        },
        jsPDF: {
          unit: "mm",
          format: 'a4',
        },
      }
    }
  },
  created() {
    this.getByCountry()
  },
  computed: {
    pages() {
      return this.productsSource.map(product => `/api/wp-image?url=${product.customImage}`)
    },
    rootCategories() {
      return this.categories.filter(cat => cat.parent===0)
    },
    categoriesTree() {
      return this.rootCategories.map(category => ({
        ...category,
        children: this.categories.filter(cat => cat.parent === category.idCategory)
      }))
    },
    productsSource() {
      let filteredProducts = [...this.productsByCategory];

      if(this.filter.tallas.length) {
        filteredProducts = filteredProducts.filter(product => {
          return this.hasSomeTalla(product, this.filter.tallas)
        })
      }

      return filteredProducts;
    },
    productsByCategory() {
      let filteredProducts = [...this.products];
      
      if(this.filter.categories.length) {
        let categoriesId = this.filter.categories.map(category => category._id)

        filteredProducts = filteredProducts.filter(product => {
          return product.categories.find(pc => categoriesId.includes(pc._id))
        })
      }

      return filteredProducts;
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
    }
  },
  watch: {
    'country': function() {
      this.getByCountry()
    },
    'filter.categories': function() {
      this.filter.tallas = []
    }
  },
  methods: {
    async downloadPdf() {
      if(this.productsSource.length) {
        this.productsToDownload = this.productsSource;
        this.$refs.html2Pdf.generatePdf();
      }
    },
    async downloadWsPdf() {
      if(this.productsSource.length) {
        let productsChunk = _.chunk(this.productsSource, 70)
        
        this.productsToDownload = productsChunk[0]

        productsChunk.shift()

        this.productsToDownloadQueue = productsChunk

        this.$refs.html2Pdf.generatePdf();
      }
    },
    hasDownloaded() {
      if(this.productsToDownloadQueue.length) {
        this.productsToDownload = this.productsToDownloadQueue[0]

        this.productsToDownloadQueue.shift()

        this.$refs.html2Pdf.generatePdf();
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
    },
    getAvailableProducts(products) {
      return products.filter(product => {
        const imageAvailable = product.customImage && product.customImage.trim().length > 0
        
        const talla = product.attributes.find(attr => attr.name.trim().toLowerCase() === 'talla')
        const tallasAvailables = talla && talla.options.length
        
        return imageAvailable && tallasAvailables;
      })
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
  }
}
</script>

<style>
.flipbook {
  height: calc(100vh - 100px);
}
</style>