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

const DEFAULT_COUNTRY = 'Chile'

export default {
  components: { Flipbook, CountrySelect, TallasSelect },
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
     }
  },
  created() {
    this.getByCountry()
  },
  computed: {
    pages() {
      return this.productsSource.map(product => product.customImage)
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