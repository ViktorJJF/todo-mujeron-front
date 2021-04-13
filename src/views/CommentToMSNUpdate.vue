<template>
  <v-container>
    <div>
      <v-divider></v-divider>
      <ValidationObserver ref="obs" v-slot="{ passes }">
        <v-container class="pa-5" v-if="commentFacebook">
          <v-row dense>
            <v-col cols="12" sm="12" md="12" class="mb-2">
              <p class="body-1 font-weight-bold">URL de publicación</p>
              <!-- <VTextFieldWithValidation
                rules=""
                v-model="commentFacebook.botId"
                label="Ingresa el botId"
              /> -->
              <VTextFieldWithValidation
                rules="required"
                v-model="commentFacebook.postUrl"
                label="Ingresa la URL"
              />
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" sm="12" md="12">
              <a :href="commentFacebook.postUrl" target="_blank">
                <v-img :src="postPicture" aspect-ratio="4" contain>
                  <template v-slot:placeholder>
                    <v-skeleton-loader
                      class="mx-auto"
                      max-width="300"
                      height="100%"
                      type="image"
                    ></v-skeleton-loader> </template></v-img
              ></a>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" sm="12" md="12">
              <p class="body-1 font-weight-bold">Productos</p>
              <v-combobox
                item-text="nameWithCountry"
                :search-input.sync="searchProduct"
                v-model="commentFacebook.products"
                :items="products"
                chips
                clearable
                label="Busca los productos"
                multiple
                prepend-icon="mdi-filter-variant"
                no-data-text="No se encontraron productos"
                no-filter
                solo
                :return-object="true"
                @change="deleteCurrentSearch"
              >
                <template v-slot:selection="{ attrs, item, select, selected }">
                  <v-chip
                    v-bind="attrs"
                    :input-value="selected"
                    close
                    @click="select"
                    @click:close="remove(item)"
                    color="deep-purple accent-4"
                    outlined
                  >
                    <strong>{{ item.name }}</strong>
                  </v-chip>
                </template>
              </v-combobox>
            </v-col>
            <v-col class="mt-3" cols="12" sm="12" md="12">
              <p class="body-1 font-weight-bold">Etiquetas de Facebook</p>
              <v-chip-group column v-model="commentFacebook.selectedLabelIndex">
                <v-chip
                  filter
                  class="mr-3 mb-1"
                  v-for="el in filteredLabels"
                  :key="el.id"
                  color="deep-purple accent-4"
                  outlined
                >
                  <strong>{{ el.name }}</strong>
                </v-chip>
              </v-chip-group>
            </v-col>
            <v-col class="mt-3 mb-3" cols="8" sm="8" md="8">
              <p class="body-1 font-weight-bold">Selección para respuesta</p>
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left"></th>
                      <th class="text-left">Precio</th>
                      <th class="text-left">Categorías</th>
                      <!-- <th class="text-left">Url</th> -->
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(product, productIndex) in activeProducts"
                      :key="product._id"
                    >
                      <td>{{ product.name }}</td>
                      <td>
                        <span>
                          {{ product.country == "Peru" ? "S/." : "$" }}
                          {{
                            product.variations.length > 0
                              ? product.variations[0].regular_price
                              : "Sin precio"
                          }}
                        </span>
                      </td>
                      <td>
                        <v-chip-group
                          @change="
                            selectingCategories(
                              $event,
                              product.categories,
                              productIndex,
                              activeProducts
                            )
                          "
                          column
                          v-model="product.selectedCategory"
                        >
                          <v-chip
                            filter
                            class="mr-3 mb-1"
                            v-for="category in product.categories"
                            :key="category.id"
                            color="deep-purple accent-4"
                            outlined
                          >
                            <strong>{{ category.name }}</strong>
                          </v-chip>
                        </v-chip-group>
                      </td>
                      <!-- <td>
                        <v-chip
                          class="mr-3 mb-1"
                          color="deep-purple accent-4"
                          outlined
                        >
                          <strong>{{ product.permalink }}</strong>
                        </v-chip>
                      </td> -->
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
              <!-- <v-combobox
                item-text="name"
                :search-input.sync="searchFacebookLabel"
                v-model="commentFacebook.labels"
                :items="facebookLabels"
                chips
                clearable
                label="Busca las etiquetas de Facebook"
                multiple
                prepend-icon="mdi-filter-variant"
                no-data-text="No se encontraron productos"
                no-filter
                solo
                :return-object="true"
                @change="deleteCurrentSearch"
              >
                <template v-slot:selection="{ attrs, item, select, selected }">
                  <v-chip
                    v-bind="attrs"
                    :input-value="selected"
                    close
                    @click="select"
                    @click:close="remove(item)"
                    color="deep-purple accent-4"
                    outlined
                  >
                    <strong>{{ item.name }}</strong>
                  </v-chip>
                </template>
              </v-combobox> -->
            </v-col>
            <v-col class="mt-3 mb-3" cols="4" sm="4" md="4">
              <p class="body-1 font-weight-bold">Selecciona la URL</p>
              <v-chip-group column v-model="commentFacebook.selectedUrlIndex">
                <div v-for="(url, urlI) in urls" :key="urlI">
                  <v-chip
                    filter
                    class="mr-3 mb-1"
                    color="deep-purple accent-4"
                    outlined
                  >
                    <strong>{{ url.url }}</strong>
                  </v-chip>
                </div>
              </v-chip-group>
              <v-text-field
                v-model="customUrl"
                placeholder="URL personalizada"
                dense
                outlined
              ></v-text-field>
            </v-col>
            <!-- <v-col cols="12" sm="12" md="12">
              <p class="body-1 font-weight-bold">
                Mensaje para acompañar a Respuestas Rápidas (El chatbot mostrará
                una aleatoriamente)
              </p>
              <v-card>
                <v-tabs v-model="tab" centered icons-and-text>
                  <v-tab v-for="item in items" :key="item">
                    {{ item }}
                  </v-tab>
                </v-tabs>

                <v-tabs-items disabled v-model="tab">
                  <v-tab-item v-for="item in items" :key="item">
                    <div class="mt-3">
                      <v-textarea
                        v-show="tab == 0"
                        dense
                        outlined
                        hide-details="auto"
                        placeholder="Respuesta 1"
                        v-model="commentFacebook.responses[0]"
                        class="mb-2"
                      ></v-textarea>
                      <v-textarea
                        v-show="tab == 1"
                        dense
                        outlined
                        hide-details="auto"
                        placeholder="Respuesta 2"
                        v-model="commentFacebook.responses[1]"
                        class="mb-2"
                      ></v-textarea>
                      <v-textarea
                        v-show="tab == 2"
                        dense
                        outlined
                        hide-details="auto"
                        placeholder="Respuesta 3"
                        v-model="commentFacebook.responses[2]"
                        class="mb-2"
                      ></v-textarea>
                    </div>
                  </v-tab-item>
                </v-tabs-items>
              </v-card>
            </v-col> -->
          </v-row>
          <v-row justify="center">
            <div>
              <v-img
                class="rounded-corners"
                :src="postPicture"
                aspect-ratio="1"
                contain
              ></v-img>
              <v-card color="#F0F2F5" outlined class="pa-3" width="200">
                <strong>Gracias por tu comentario</strong>
                <p>Selecciona alguna de las siguientes opciones</p>
                <v-btn
                  small
                  class="wrapText mb-2"
                  block
                  outlined
                  color="primary"
                  >Ver en mujeron.cl</v-btn
                >
                <v-btn
                  small
                  class="wrapText mb-2"
                  block
                  outlined
                  color="primary"
                  >Contactarme</v-btn
                >
                <v-btn small class="wrapText" block outlined color="primary"
                  >Talla</v-btn
                >
              </v-card>
            </div>
          </v-row>
        </v-container>
        <v-card-actions rd-actions>
          <div class="flex-grow-1"></div>
          <v-btn :loading="loadingButton" color="success" @click="passes(save)"
            >Guardar</v-btn
          >
        </v-card-actions>
      </ValidationObserver>
    </div>
    <v-btn color="primary" @click="$router.push({ name: 'CommentToMSN' })"
      >Volver Atrás</v-btn
    >
  </v-container>
</template>

<script>
import { format } from "date-fns";
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import axios from "axios";
// import MaterialCard from "@/components/material/Card";
import { es } from "date-fns/locale";
export default {
  components: {
    // MaterialCard,
    VTextFieldWithValidation,
  },
  filters: {
    formatDate: function (value) {
      return format(new Date(value), "d 'de' MMMM 'del' yyyy", {
        locale: es,
      });
    },
  },
  data: () => ({
    errors: [
      { hasLabel: true, msg: "Selecciona alguna etiqueta" },
      { hasLabel: true, msg: "Selecciona alguna url" },
    ],
    selectedCategories: [],
    loadingButton: false,
    commentsFacebook: [],
    commentFacebook: null,
    chips: [],
    items: ["Respuesta 1", "Respuesta 2", "Respuesta 3"],
    tab: null,
    postPicture: "",
    searchProduct: "",
    searchFacebookLabel: "",
    products: [],
    facebookLabels: [],
    originalCommentFacebook: [],
    urls: [],
    selectedLabel: null,
    filteredLabels: [],
    customUrl: "",
  }),

  computed: {
    activeProducts() {
      return this.commentFacebook.products.map((product) => ({
        ...product,
        selectedCategory: this.commentFacebook.selectedCategories.find(
          (selectedCategory) => selectedCategory.productId == product._id
        )
          ? product.categories.findIndex(
              (category) =>
                category._id ==
                this.commentFacebook.selectedCategories.find(
                  (selectedCategory) =>
                    selectedCategory.productId == product._id
                ).categoryId
            )
          : null,
      }));
    },
  },

  async mounted() {
    await this.initialize();
    this.getPostImage();
  },
  watch: {
    async searchProduct() {
      clearTimeout(this.delayTimer);
      this.delayTimer = setTimeout(() => {
        this.getProducts(1);
      }, 600);
    },
    async searchFacebookLabel() {
      clearTimeout(this.delayTimer);
      this.delayTimer = setTimeout(() => {
        this.getFacebookLabels(1);
      }, 600);
    },
    // "commentFacebook.labels": function(newVal) {
    //   console.log("el nuevo valor: ", newVal);
    // },
    "commentFacebook.products": function (products) {
      console.log("products: ", products);
      let urls = [];
      this.filteredLabels = [];
      for (const product of products) {
        urls.push({ url: product.permalink, type: "product" });
        for (const category of product.categories) {
          if (
            this.commentFacebook.selectedCategories.findIndex(
              (selectedCategory) => selectedCategory.categoryId == category._id
            ) > -1
          )
            urls.push({
              url: this.$store.state.ecommercesCategoriesModule.ecommercesCategories.find(
                (el) => el.idCategory == category.id
              ).url,
              type: "category",
            });
        }
        //mapeandp etiquetas
        for (const category of product.categories) {
          console.log("esta categoria: ", category);
          console.log("pusheare esto: ", category._id);
          this.filteredLabels.push(...this.getFilteredLabels(category._id));
        }
      }
      //haciendo que etiquetas de fb no se repitan
      this.filteredLabels = this.filteredLabels.reduce((unique, o) => {
        //esto hace que no se repitan labels fb
        if (!unique.some((obj) => obj.name === o.name)) {
          unique.push(o);
        }
        return unique;
      }, []);
      this.urls = urls;
      //inicializando url seleccionada (si hubiera)
      // let searchProduct;
      // if (newVal.length === 1) {
      //   let fanpageName = this.commentFacebook.botId.fanpageName;
      //   let productInfo = {
      //     country: "",
      //     url: "",
      //     price: "",
      //   };
      //   if (fanpageName === "@MujeronPeru") {
      //     console.log("buscando: ", this.commentFacebook.products[0].details);
      //     searchProduct = this.commentFacebook.products[0].details.find(
      //       (product) => product.country === "Peru"
      //     );
      //   }
      //   if (fanpageName === "@MujeronJeans") {
      //     searchProduct = this.commentFacebook.products[0].details.find(
      //       (product) => product.country === "Chile"
      //     );
      //   }
      //   if (fanpageName === "@TiendasMujeron") {
      //     searchProduct = this.commentFacebook.products[0].details.find(
      //       (product) => product.country === "Colombia"
      //     );
      //   }
      //   //si se encontró el producto, se sustituye productInfo
      //   if (searchProduct) {
      //     productInfo.country = searchProduct.country;
      //     productInfo.url =
      //       searchProduct.urls.length > 0 ? searchProduct.urls[0] : "";
      //     productInfo.price = searchProduct.price;
      //   }
      //   let generatedMsg = `En el siguiente vinculo encontraras toda la info: ${
      //     productInfo.url
      //   }, su valor es ${
      //     productInfo.country == "Peru"
      //       ? "S/."
      //       : productInfo.country == "Chile"
      //       ? "$"
      //       : productInfo.country == "Colombia"
      //       ? "$"
      //       : ""
      //   }${productInfo.price}`;
      //   this.commentFacebook.responses[0] = generatedMsg;
      //   this.commentFacebook.responses[1] = generatedMsg;
      //   this.commentFacebook.responses[2] = generatedMsg;
      // } else {
      //   this.commentFacebook.responses[0] = this.originalCommentFacebook[0];
      //   this.commentFacebook.responses[1] = this.originalCommentFacebook[1];
      //   this.commentFacebook.responses[2] = this.originalCommentFacebook[2];
      // }
    },
    deep: true,
  },

  methods: {
    async initialize() {
      await Promise.all([
        this.$store.dispatch("commentsFacebookModule/list", { limit: 9999 }),
        this.$store.dispatch("facebookLabelsModule/list"),
        { limit: 9999 },
      ]);
      this.commentsFacebook = this.$deepCopy(
        this.$store.state.commentsFacebookModule.commentsFacebook
      );
      this.commentFacebook = this.commentsFacebook.find(
        (commentFacebook) => commentFacebook._id === this.$route.params.id
      );
      this.originalCommentFacebook = JSON.parse(
        JSON.stringify(this.commentFacebook.responses)
      );
      this.facebookLabels = this.$store.state.facebookLabelsModule.facebookLabels.filter(
        (el) => !el.name.includes("ad_id.")
      );
      //inicializando URL seleccionados
      if (!this.commentFacebook.selectedUrlIndex)
        this.customUrl = this.commentFacebook.selectedUrl;
      //inicializando categorias seleccionadas
      this.selectedCategories = this.commentFacebook.selectedCategories;
    },
    async getPostImage() {
      let postId = this.commentFacebook.postUrl.match(/\d+/g)[0];
      console.log("el comment: ", this.commentFacebook);
      axios
        .get(
          "/api/graph-api/" +
            this.commentFacebook.botId._id +
            "/" +
            this.commentFacebook.botId.fanpageId +
            "_" +
            postId
        )
        .then((res) => {
          console.log(res.data);
          this.postPicture = res.data.payload.full_picture;
        })
        .catch((err) => {
          console.error("err trayendo imagen: ", err);
        });
    },
    async save() {
      try {
        this.loadingButton = true;
        //agregando categorias seleccionadas
        this.commentFacebook.selectedCategories = this.selectedCategories;
        //aca se sobreescribe la url seleccionada por la custom (si hubiera)
        if (this.customUrl.trim().length > 0) {
          this.commentFacebook.selectedUrl = this.customUrl;
          this.commentFacebook.selectedUrlIndex = null;
        } else {
          this.commentFacebook.selectedUrl = this.urls[
            parseInt(this.commentFacebook.selectedUrlIndex)
          ].url;
        }

        this.commentFacebook.selectedLabel = this.filteredLabels[
          parseInt(this.commentFacebook.selectedLabelIndex)
        ]._id;
        console.log("guardare: ", this.commentFacebook);
        await this.$store.dispatch("commentsFacebookModule/update", {
          id: this.commentFacebook._id,
          data: this.commentFacebook,
        });
      } catch (error) {
        this.$swal({
          icon: "error",
          title: "Es probable que se diera alguno de estos errores",
          html:
            "<ul>Falta seleccionar una etiqueta<br>Falta seleccionar una URL o completar URL personalizada</ul>",
        });
      } finally {
        this.loadingButton = false;
      }
    },
    remove(item) {
      this.commentFacebook.products.splice(
        this.commentFacebook.products.indexOf(item),
        1
      );
      this.commentFacebook.products = [...this.commentFacebook.products];
    },
    async getProducts(page = 1) {
      if (!this.searchProduct) return;
      //llamada asincrona de items
      await Promise.all([
        this.$store.dispatch("ecommercesModule/list", {
          country: this.commentFacebook.botId.country,
          sort: "name",
          page,
          search: this.searchProduct,
          fieldsToSearch: ["name"],
        }),
      ]);
      //asignar al data del componente
      console.log(
        "los productos: ",
        this.$store.state.ecommercesModule.ecommerces
      );
      this.products = this.$deepCopy(
        this.$store.state.ecommercesModule.ecommerces
      ).map((el) => ({ ...el, nameWithCountry: el.name + ` (${el.country})` }));
    },
    async getFacebookLabels(page = 1) {
      if (!this.searchFacebookLabel) return;
      //llamada asincrona de items
      await Promise.all([
        this.$store.dispatch("facebookLabelsModule/list", {
          sort: "name",
          page,
          search: this.searchFacebookLabel,
          fieldsToSearch: ["name"],
        }),
      ]);
      //asignar al data del componente
      this.facebookLabels = this.$deepCopy(
        this.$store.state.facebookLabelsModule.facebookLabels
      );
    },
    deleteCurrentSearch() {
      this.searchProduct = "";
    },
    selectingCategories(event, categories, productIndex, activeProducts) {
      console.log("el evento: ", {
        event,
        categories,
        productIndex,
        activeProducts,
      });
      this.selectedCategories = this.activeProducts.map((activeProduct) => ({
        categoryId: activeProduct.categories[activeProduct.selectedCategory]
          ? activeProduct.categories[activeProduct.selectedCategory]._id
          : null,
        productId: activeProduct._id,
        categoryName: activeProduct.categories[activeProduct.selectedCategory]
          ? activeProduct.categories[activeProduct.selectedCategory].name
          : null,
      }));
      this.commentFacebook.selectedCategories = this.selectedCategories;
      // .filter((el) => !!el);
      console.log("categorias seleccionadas: ", this.selectedCategories);
      this.commentFacebook.products = this.commentFacebook.products.slice();
      // //con este metodo solo puedo seleccionar una categorias de entre toda la columna
      // for (let i = 0; i < activeProducts.length; i++) {
      //   if (productIndex !== i) activeProducts[i].selectedCategory = null;
      // }
      // activeProducts = activeProducts.splice(
      //   0,
      //   activeProducts.length,
      //   activeProducts
      // );
    },
    getFilteredLabels(categoryId) {
      return this.facebookLabels.filter(
        (label) => label.foreignLabelId == categoryId
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.rounded-corners {
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
}
</style>
