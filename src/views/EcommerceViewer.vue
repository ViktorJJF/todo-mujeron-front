<template>
  <v-app id="inspire">

    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
      width="350"
    >
      <v-list
        flat
        subheader
      >
        <v-subheader>Filtrar por categorias</v-subheader>

        <v-list-item-group
          v-model="filter.categories"
          multiple
          active-class=""
        >
          <v-list-item v-for="category of rootCategories" :key="category._id">
            <template v-slot:default="{ active }">
              <v-list-item-action>
                <v-checkbox :input-value="active"></v-checkbox>
              </v-list-item-action>

              <v-list-item-content>
                <v-list-item-title>{{category.name}}</v-list-item-title>
              </v-list-item-content>
            </template>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      app
      color="white"
      flat
      clipped-left
      class="d-flex justify-center"
    >
      <div>
        {{pages.length ? currentPage + 1 : 0}} / {{pages.length}}
      </div>
    </v-app-bar>

    <v-main class="grey lighten-3">
      <v-container fluid>
        <v-row>
          <v-col
            cols="12"
          >
            <flipbook ref="flipbook" class="flipbook" 
              :pages="pages"
              v-slot="flipbook"
              @flip-left-end="onFlipLeftEnd"
              @flip-right-end="onFlipRightEnd"
            >
              <div>
                <v-btn
                  rounded
                  color="primary"
                  dark
                  @click="flipbook.flipLeft"
                >
                  Previous Page
                </v-btn>
                <v-btn
                  rounded
                  color="primary"
                  dark
                  @click="flipbook.flipRight"
                >
                  Next Page
                </v-btn>
                <div class="buy-button">
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
                </div>
              </div>
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

export default {
  components: { Flipbook },
  data() {
     return {
       products: [],
       categories: [],
       filter: {
         categories: []
       },
       currentPage: 0
     }
  },
  created() {
    this.initialize()
  },
  computed: {
    pages() {
      return this.productsSource.map(product => product.customImage)
    },
    rootCategories() {
      return this.categories.filter(cat => cat.parent===0)
    },
    productsSource() {
      let filteredProducts = [...this.products];
      if(this.filter.categories.length) {
        let categories = this.filter.categories.map(catIndex => this.rootCategories[catIndex]._id)

        filteredProducts = filteredProducts.filter(product => {
          return product.categories.find(pc => categories.includes(pc._id))
        })
      }

      return filteredProducts;
    }
  },
  methods: {
    async initialize() {
      let [productsRes, categoriesRes] = await Promise.all([
        EcommercesApi.list(),
        EcommercesCategoriesApi.list()
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
  min-height: 70vh;
  width: 100%;
  height: 100%;
}
</style>