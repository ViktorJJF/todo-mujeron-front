<template>
  <div>
    <v-divider></v-divider>
    <ValidationObserver ref="obs" v-slot="{ passes }">
      <v-container
        class="pa-1 ma-2"
        v-if="(commentFacebook || isTemplate) && isVariousProductsOrCommentPost"
      >
        <v-row dense v-if="!isTemplate">
          <v-col cols="12" sm="12" md="12" class="mb-2">
            <p class="body-1 font-weight-bold">URL de publicación</p>
            <VTextFieldWithValidation
              rules="required"
              v-model="commentFacebook.postUrl"
              label="Ingresa la URL"
            />
          </v-col>
        </v-row>
        <v-row dense justify="center">
          <v-col cols="12" sm="12" md="12">
            <a :href="commentFacebook.postUrl" target="_blank">
              <v-img :src="dynamicPostUrl" aspect-ratio="4" contain>
                <template v-slot:placeholder>
                  <v-skeleton-loader
                    class="mx-auto"
                    max-width="300"
                    height="100%"
                    type="image"
                  ></v-skeleton-loader>
                </template> </v-img
            ></a>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="12" sm="12">
            <p class="body-1 font-weight-bold">URL de imagen personalizada</p>
            <v-text-field
              v-model="commentFacebook.postImgUrl"
              placeholder="URL de Imagen Personalizada"
              dense
              outlined
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="12" md="12">
            <p class="body-1 font-weight-bold">Productos</p>
            <v-combobox
              item-text="name"
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
                        {{
                          product.country == "Peru" || country == "Peru"
                            ? "S/."
                            : "$"
                        }}
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
          <v-col
            cols="12"
            sm="12"
            md="12"
            v-if="!isVariousProductsOrCommentPost"
          >
            <p class="body-1 font-weight-bold">
              Mensaje para acompañar a Respuestas Rápidas (El chatbot mostrará
              una aleatoriamente)
            </p>
            <v-card></v-card>
          </v-col>
        </v-row>
        <v-row
          align="center"
          v-if="!isTemplate && isVariousProductsOrCommentPost"
        >
          <v-col cols="12" sm="4" class="text-center">
            <h3 class="mb-3">Vista previa</h3>
            <v-row justify="center">
              <div>
                <v-img
                  class="rounded-corners"
                  :src="dynamicPostUrl"
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
                    @click="openLink"
                    >Ver en
                    {{ getDomain() }}
                  </v-btn>
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
          </v-col>
          <v-col cols="12" sm="8">
            <vue-json-pretty id="code" :path="'res'" :data="generateCode()">
            </vue-json-pretty>
            <v-btn block color="primary" @click="copyToClipboard"
              >Copiar código</v-btn
            >
          </v-col>
        </v-row>
      </v-container>
      <v-container fluid v-else>
        <v-row>
          <v-col cols="12" sm="6">
            <v-row>
              <v-col cols="12" sm="12" md="12" class="mb-2">
                <p class="body-1 font-weight-bold">URL de publicación</p>
                <VTextFieldWithValidation
                  rules="required"
                  v-model="commentFacebook.postUrl"
                  label="Ingresa la URL"
                />
              </v-col>
              <v-col
                cols="12"
                sm="12"
                md="12"
                class="mb-2"
                v-if="commentFacebook.type === 'PUBLICACIONES_MARCA'"
              >
                <p class="body-1 font-weight-bold">Marca</p>
                <v-combobox
                  v-model="commentFacebook.brand"
                  :items="brands"
                  label="Selecciona la marca"
                  outlined
                  dense
                ></v-combobox>
              </v-col>
              <v-col
                cols="12"
                sm="12"
                md="12"
                class="mb-2"
                v-if="commentFacebook.type === 'PUBLICACIONES_CATEGORIA'"
              >
                <p class="body-1 font-weight-bold">Categoría</p>
                <v-combobox
                  v-model="commentFacebook.categoryId"
                  :items="categories"
                  label="Selecciona la categoría"
                  outlined
                  dense
                  item-text="name"
                  item-value="_id"
                ></v-combobox>
              </v-col>
              <v-col cols="12" sm="12" class="mb-2">
                <p class="body-1 font-weight-bold">Respuesta inbox</p>
                <div
                  v-for="(item, idx) in commentFacebook.inboxResponses"
                  :key="idx"
                >
                  <p>Respuesta {{ idx + 1 }}</p>
                  <v-textarea
                    rules="required"
                    v-model="commentFacebook.inboxResponses[idx]"
                    placeholder="Esta respuesta es una variante para el inbox"
                    outlined
                  />
                </div>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" sm="6" class="text-center">
            <h3 class="mb-3">Vista previa</h3>
            <v-row justify="center">
              <div>
                <v-img
                  class="rounded-corners"
                  :src="dynamicPostUrl || 'https://via.placeholder.com/150'"
                  aspect-ratio="1"
                  contain
                ></v-img>
                <v-card
                  outlined
                  class="pa-3"
                  v-if="commentFacebook.postResponses"
                >
                  <strong style="display:block">Respuesta Post</strong>
                  {{ commentFacebook.hasToAnswerIA }}
                  <v-checkbox
                    class="ma-3"
                    style="display:block"
                    label="Responder con IA"
                    v-model="commentFacebook.hasToAnswerIA"
                    @change="toggleHasToAnswerIa"
                  />
                  <div>
                    <v-btn
                      color="primary"
                      @click="generatePostResponsesIA"
                      class="mb-2"
                      :disabled="commentFacebook.hasToAnswerIA"
                      :loading="isLoading"
                      >Generar Respuestas estáticas con IA</v-btn
                    >
                    <div class="flex-grow-1"></div>
                    <div
                      v-for="(item, idy) in commentFacebook.postResponses"
                      :key="idy"
                    >
                      <v-textarea
                        :disabled="commentFacebook.hasToAnswerIA"
                        rules="required"
                        v-model="commentFacebook.postResponses[idy]"
                        placeholder="Esta respuesta es una variante para el post"
                        outlined
                      />
                    </div>
                  </div>
                </v-card>
              </div>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
      <v-card-actions rd-actions>
        <v-btn
          v-if="!isTemplate"
          color="primary"
          @click="$router.push({ name: 'CommentToMSN' })"
          >Volver Atrás</v-btn
        >
        <div class="flex-grow-1"></div>
        <v-btn :loading="loadingButton" color="success" @click="passes(save)"
          >Guardar</v-btn
        >
      </v-card-actions>
    </ValidationObserver>
  </div>
</template>

<script>
import { format } from "date-fns";
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import axios from "axios";
// import MaterialCard from "@/components/material/Card";
import { es } from "date-fns/locale";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import ecommercesService from "@/services/api/ecommerces";
import openaiService from "@/services/api/openai";
import brandPrompt from "@/promptTemplates/postCommentBrandResponses";
import categoryPrompt from "@/promptTemplates/postCommentCategoryResponses";

export default {
  props: {
    isTemplate: {
      type: Boolean,
      default: false,
    },
    country: {
      type: String,
    },
    productId: {
      type: String,
    },
  },
  components: {
    // MaterialCard,
    VTextFieldWithValidation,
    VueJsonPretty,
  },
  filters: {
    formatDate: function(value) {
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
    inboxResponses: ["", "", ""],
    postResponses: ["", "", ""],
    tab: null,
    postPicture: "",
    searchProduct: "",
    products: [],
    facebookLabels: [],
    urls: [],
    selectedLabel: null,
    filteredLabels: [],
    customUrl: "",
    isReady: false,
    brands: [],
    categories: [],
    metaPost: null,
    instagramPost: null,
    isLoading: false,
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
    isCommentView() {
      return this.$route.name == "CommentToMSNUpdate";
    },
    dynamicPostUrl() {
      return this.commentFacebook.postImgUrl
        ? this.commentFacebook.postImgUrl.length > 0
          ? this.commentFacebook.postImgUrl
          : this.postPicture
        : this.postPicture;
    },
    isInstagramPost() {
      return this.commentFacebook.platform === "instagram";
    },
    isVariousProductsOrCommentPost() {
      return (
        this.commentFacebook?.type === "comment" ||
        this.commentFacebook?.type === "VARIOS_PRODUCTOS"
      );
    },
  },
  created() {
    this.commentFacebook = {
      responses: ["", "", ""],
      products: [],
      labels: [],
      selectedCategories: [],
      type: "template",
      postUrl: "",
      postImgUrl: "",
      selectedUrl: "",
      botId: null,
      todofullLabels: [],
    };
  },
  async mounted() {
    if (!this.isTemplate) {
      await this.initialize();
      this.getPostImage();
    } else {
      this.initialize();
    }
    console.log("los active: ", this.activeProducts);
    // inicializando imagen producto inicial
    if (this.commentFacebook.products.length > 0) {
      this.commentFacebook.postUrl = this.commentFacebook.products.images[0].src;
    }
  },
  watch: {
    async searchProduct() {
      clearTimeout(this.delayTimer);
      this.delayTimer = setTimeout(() => {
        this.getProducts(1);
      }, 600);
    },
    // "commentFacebook.labels": function(newVal) {
    //   console.log("el nuevo valor: ", newVal);
    // },
    commentFacebook: function() {
      this.generateCode();
    },
    "commentFacebook.products": async function(products) {
      let urls = [];
      this.filteredLabels = [];
      for (const product of products) {
        console.log("🚀 Aqui *** -> product", product);
        urls.push({ url: product.permalink, type: "product" });
        for (const category of product.categories) {
          if (
            this.commentFacebook.selectedCategories &&
            this.commentFacebook.selectedCategories.findIndex(
              (selectedCategory) => selectedCategory.categoryId == category._id
            ) > -1
          ) {
            await Promise.all([
              this.$store.dispatch("ecommercesCategoriesModule/list", {
                limit: 9999,
                companies: [
                  this.$store.getters["authModule/getCurrentCompany"].company
                    ._id,
                ],
              }),
            ]);

            let searchedCategory = this.$store.state.ecommercesCategoriesModule.ecommercesCategories.find(
              (el) => el.idCategory == category.id
            );
            if (searchedCategory) {
              urls.push({
                url: searchedCategory.url,
                type: "category",
              });
            }
          }
        }
        //mapeandp etiquetas
        for (const category of product.categories) {
          console.log("🚀 Aqui *** -> category", category);
          this.filteredLabels.push(...this.getFilteredLabels(category));
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
    },
    deep: true,
  },

  methods: {
    async initialize() {
      let commentFacebook;
      const query = {
        country: this.$store.getters["authModule/getCurrentCompany"].company
          .country,
        products_available: true,
      };
      if (!this.isTemplate) {
        await Promise.all([
          this.$store.dispatch("todofullLabelsModule/list", {
            webtagsDetails: true,
            limit: 9999,
          }),
        ]);
        commentFacebook = await this.$store.dispatch(
          "commentsFacebookModule/listOne",
          this.$route.params.id
        );
      } else {
        await Promise.all([
          this.$store.dispatch("todofullLabelsModule/list"),
          {
            webtagsDetails: true,
            limit: 9999,
          },
        ]);
        // buscando si existe plantilla asociada a producto
        commentFacebook = await this.$store.dispatch(
          "commentsFacebookModule/listOne",
          this.productId
        );
      }
      if (commentFacebook.type === "PUBLICACIONES_CATEGORIA") {
        this.categories = (
          await ecommercesService.listCategories(query)
        ).data.payload;
      }
      if (commentFacebook.type === "PUBLICACIONES_MARCA") {
        this.brands = (
          await ecommercesService.listAttributes({
            ...query,
            name: "marca",
          })
        ).data.payload.map((el) => el.options);
      }
      this.todofullLabels = this.$store.state.todofullLabelsModule.todofullLabels;
      //inicializando URL seleccionados
      if (
        !commentFacebook.selectedUrlIndex &&
        commentFacebook.selectedUrlIndex != 0
      )
        this.customUrl = commentFacebook.selectedUrl;
      //inicializando categorias seleccionadas
      this.selectedCategories = commentFacebook.selectedCategories;
      this.isReady = true;
      // initializing postResponses and inboxResponses
      if (
        !commentFacebook.postResponses ||
        (commentFacebook.postResponses && !commentFacebook.postResponses.length)
      ) {
        commentFacebook.postResponses = ["", "", ""];
      }
      if (
        !commentFacebook.inboxResponses ||
        (commentFacebook.inboxResponses &&
          !commentFacebook.inboxResponses.length)
      ) {
        commentFacebook.inboxResponses = ["", "", ""];
      }
      if (!("hasToAnswerIA" in commentFacebook)) {
        commentFacebook.hasToAnswerIA = false; // not answer with ia by default
      }
      this.commentFacebook = commentFacebook;
      // get ig or meta post information from graph api
      if (
        this.commentFacebook.platform === "instagram" &&
        this.commentFacebook.external_id
      ) {
        this.getInstagramPost();
      } else {
        this.getMetaPost();
      }
    },
    async getPostImage() {
      let postId = this.commentFacebook.postUrl.includes("/photos")
        ? this.commentFacebook.postUrl.match(/\d+/g)[1]
        : this.commentFacebook.postUrl.match(/\d+/g)[0];
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
    async getInstagramPost() {
      let postId = this.commentFacebook.external_id;
      axios
        .get(
          `/api/graph-api/get-instagram-post/${postId}?fanpageId=${this.commentFacebook.botId.fanpageId}`
        )
        .then((res) => {
          this.instagramPost = res.data.payload;
        })
        .catch((err) => {
          console.error("err trayendo imagen: ", err);
        });
    },
    async getMetaPost() {
      let postId = this.commentFacebook.external_id;
      axios
        .get(
          `/api/graph-api/get-facebook-post/${postId}?fanpageId=${this.commentFacebook.botId.fanpageId}`
        )
        .then((res) => {
          this.metaPost = res.data.payload;
        })
        .catch((err) => {
          console.error("err trayendo imagen: ", err);
        });
    },
    async save() {
      try {
        if (this.isVariousProductsOrCommentPost) {
          this.loadingButton = true;
          //agregando categorias seleccionadas
          this.commentFacebook.selectedCategories = this.selectedCategories;
          //aca se sobreescribe la url seleccionada por la custom (si hubiera)
          this.commentFacebook.selectedUrl = this.getCurrentUrl();
          this.commentFacebook.selectedLabel = this.filteredLabels[
            parseInt(this.commentFacebook.selectedLabelIndex)
          ]._id;
          if (
            this.isTemplate &&
            this.commentFacebook.postImgUrl.trim().length == 0
          )
            throw new Error("Falta imagen personalizada");
          if (!this.isTemplate || this.commentFacebook._id) {
            await this.$store.dispatch("commentsFacebookModule/update", {
              id: this.commentFacebook._id,
              data: this.commentFacebook,
            });
          } else {
            //agregando tipo template
            this.commentFacebook.type = "template";
            this.commentFacebook.ecommerceId = this.productId;
            await this.$store.dispatch(
              "commentsFacebookModule/create",
              this.commentFacebook
            );
          }
        } else {
          await this.$store.dispatch("commentsFacebookModule/update", {
            id: this.commentFacebook._id,
            data: this.commentFacebook,
          });
        }
      } catch (error) {
        console.log(error);
        this.$swal({
          icon: "error",
          title: "Es probable que se diera alguno de estos errores",
          html:
            "<ul>Falta colocar imagen personalizada (si es plantilla)<ul><ul>Falta seleccionar una etiqueta<ul>Falta seleccionar una categoría<br>Falta seleccionar una URL o completar URL personalizada</ul>",
        });
      } finally {
        this.loadingButton = false;
        this.$emit("saved");
      }
    },
    getCurrentUrl() {
      try {
        if (this.customUrl && this.customUrl.trim().length > 0) {
          this.commentFacebook.selectedUrlIndex = null;
          return this.customUrl;
        } else {
          return this.urls[parseInt(this.commentFacebook.selectedUrlIndex || 0)]
            .url;
        }
      } catch (error) {
        return "";
      }
    },
    getDomain(fullDomain = this.getCurrentUrl()) {
      let cleanedDomain = fullDomain.replace(/^https?:\/\//, "");

      const domainParts = cleanedDomain.split("/")[0];

      const parts = domainParts.split(".");
      const domain = parts.length > 2 ? parts.slice(-2).join(".") : domainParts;

      return domain;
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
          sort: "name",
          page,
          search: this.searchProduct,
          fieldsToSearch: ["name"],
          listType: "All",
          companies: [
            this.$store.getters["authModule/getCurrentCompany"].company._id,
          ],
        }),
      ]);
      //asignar al data del componente
      console.log(
        "los productos: ",
        this.$store.state.ecommercesModule.ecommerces
      );
      this.products = this.$deepCopy(
        this.$store.state.ecommercesModule.ecommerces
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
      this.commentFacebook.products = this.commentFacebook.products.slice();
    },
    /**
     * @Description Este metodo obtiene las etiquetas de Facebook vinculadas a etiqueta de todofull correspondiente
     */
    getFilteredLabels(category) {
      let selectedTodofullLabels = this.todofullLabels.find(
        (el) =>
          el.webTags &&
          el.webTags.find(
            (tag) =>
              tag.idCategory == category.id &&
              tag.woocommerceId.company === this.commentFacebook.botId.company
          )
      );
      if (selectedTodofullLabels) {
        return this.isInstagramPost
          ? selectedTodofullLabels.messengerTags
          : selectedTodofullLabels.messengerTags.filter(
              (tag) => tag.fanpageId === this.commentFacebook.botId.fanpageId // se retorna solo las que pertenezcan a la fanpage actual
            );
      }
      return [];
    },
    generateCode() {
      let quickReplies = [];
      for (const product of this.commentFacebook.products) {
        let category = this.commentFacebook.selectedCategories.find(
          (category) => category.productId == product._id
        );
        if (category)
          quickReplies.push({
            content_type: "text",
            title: `Precio ${product.ref}`,
            payload: `${category.categoryName}-${
              product.variations.length > 0
                ? product.variations[0].regular_price
                : "sin precio"
            }-${product.ref}-${product.permalink}`,
          });
      }
      let code = {
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: [
                {
                  title: "Gracias por tu comentario",
                  image_url: this.dynamicPostUrl,
                  subtitle: "Selecciona alguna de las siguientes opciones",
                  buttons: [
                    {
                      type: "web_url",
                      url: this.getCurrentUrl(),
                      title: `Ver en ${this.getDomain()} `,
                    },
                    {
                      type: "postback",
                      title: "Contactarme",
                      payload: "Quiero que me contacten",
                    },
                    {
                      type: "postback",
                      title: "Tallas",
                      payload: `en que Todas esta disponible el ${
                        this.commentFacebook.products.length > 0
                          ? this.commentFacebook.products[0].ref
                          : ""
                      }`, // se usa el label seleccionado
                    },
                  ],
                },
              ],
            },
          },
          quick_replies: quickReplies,
        },
      };
      return code;
    },
    copyToClipboard() {
      let range = document.createRange();
      range.selectNode(document.getElementById("code"));
      window.getSelection().removeAllRanges(); // clear current selection
      window.getSelection().addRange(range); // to select text
      document.execCommand("copy");
      window.getSelection().removeAllRanges(); // to deselect
      this.snackbar = true;
      this.$swal("JSON copiado");
    },
    openLink() {
      window.open(this.getCurrentUrl(), "_blank");
    },
    async generatePostResponsesIA() {
      try {
        this.isLoading = true;
        let template;
        let post;
        if (this.commentFacebook.platform === "instagram") {
          post = this.instagramPost;
        } else {
          post = this.metaPost;
        }
        if (this.commentFacebook.type === "PUBLICACIONES_MARCA") {
          template = brandPrompt;
        } else if (this.commentFacebook.type === "PUBLICACIONES_CATEGORIA") {
          template = categoryPrompt;
        }
        const inputVariables = {
          post_url: this.commentFacebook.postUrl,
          platform: this.commentFacebook.platform,
          country: this.$store.getters["authModule/getCurrentCompany"].company
            .country,
          post_content: post?.message || post?.caption || "",
          brand: this.commentFacebook.brand,
          category: this.commentFacebook?.categoryId?.name,
        };
        let prompt = template.replace(/{([^{}]*)}/g, (match, p1) => {
          return inputVariables[p1.trim()] || match;
        });

        const response = await openaiService.generateCompletion([
          {
            role: "system",
            content: prompt,
          },
        ]);

        const postResponses = response.data.payload.choices[0].message.content
          .split("[COMMENT]")
          .map((el) => el.trim());
        this.commentFacebook.postResponses = postResponses;
      } catch (error) {
        console.log(error);
      } finally {
        this.isLoading = false;
      }
    },
    toggleHasToAnswerIa($event) {
      this.commentFacebook.hasToAnswerIA = $event;
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
