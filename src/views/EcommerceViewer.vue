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

        <v-subheader>Filtrar por tallas</v-subheader>
        <v-list-item v-for="talla of tallas" :key="talla.name">
          <v-list-item-action>
            <v-checkbox></v-checkbox>
          </v-list-item-action>
          <v-list-item-content>
              <v-list-item-title>{{talla.name}}</v-list-item-title>
            </v-list-item-content>
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
      <div>
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
import CountrySelect from '@/components/CountrySelect'

const DEFAULT_COUNTRY = 'Chile'

export default {
  components: { Flipbook, CountrySelect },
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
      let res = this.productsSource.reduce((tallas, product) => {
        const tallaAttr = product.attributes.find(attr => attr.name.trim().toLowerCase() === 'talla')
        const tallasAvailable = tallaAttr && tallaAttr.options.length
        if(!tallasAvailable) {
          return tallas;
        }

        for(const [index, talla] of tallaAttr.options.entries()) {
          const inStock = product.variations[index]?.status==="publish" && product.variations[index]?.stock_status==="instock"
          if(inStock) {
            const alreadyDefined = tallas[talla];
            if(alreadyDefined) {
              tallas[talla].products.push(product._id)
            }else {
              tallas[talla] = {name: talla, products: [product]}
            }
          }
        }

        return tallas;
      }, {})

      return Object.values(res)
    }
  },
  watch: {
    'country': function() {
      this.getByCountry()
    },
    'filter.categories': function(val) {
      console.log(val)
    },
    'tallas': function(val) {
      console.log(val)
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