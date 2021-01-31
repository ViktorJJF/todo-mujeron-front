<template>
  <v-container>
    <div>
      <v-divider></v-divider>
      <ValidationObserver ref="obs" v-slot="{ passes }">
        <v-container class="pa-5" v-if="commentFacebook">
          <v-row dense>
            <v-col cols="12" sm="12" md="12" class="mb-2">
              <p class="body-1 font-weight-bold">
                URL de publicación
              </p>
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
              <p class="body-1 font-weight-bold">
                Productos
              </p>
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
            <v-col cols="12" sm="12" md="12">
              <p class="body-1 font-weight-bold">
                Respuestas
              </p>
              <v-card>
                <v-tabs v-model="tab" centered icons-and-text>
                  <v-tab v-for="item in items" :key="item">
                    {{ item }}
                  </v-tab>
                </v-tabs>

                <v-tabs-items v-model="tab">
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
            </v-col>
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
    formatDate: function(value) {
      return format(new Date(value), "d 'de' MMMM 'del' yyyy", {
        locale: es,
      });
    },
  },
  data: () => ({
    loadingButton: false,
    commentsFacebook: [],
    commentFacebook: null,
    chips: [],
    items: ["Respuesta 1", "Respuesta 2", "Respuesta 3"],
    tab: null,
    postPicture: "",
    searchProduct: "",
    products: [],
  }),

  computed: {},

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
  },

  methods: {
    async initialize() {
      await Promise.all([
        this.$store.dispatch("commentsFacebookModule/list", { limit: 9999 }),
      ]);
      this.commentsFacebook = this.$deepCopy(
        this.$store.state.commentsFacebookModule.commentsFacebook
      );
      this.commentFacebook = this.commentsFacebook.find(
        (commentFacebook) => commentFacebook._id === this.$route.params.id
      );
    },
    async getPostImage() {
      let postId = this.commentFacebook.postUrl.match(/\d+/g)[0];
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
          console.error(err);
        });
    },
    async save() {
      this.loadingButton = true;
      try {
        await this.$store.dispatch("commentsFacebookModule/update", {
          id: this.commentFacebook._id,
          data: this.commentFacebook,
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
        this.$store.dispatch("productsModule/list", {
          sort: "name",
          page,
          search: this.searchProduct,
          fieldsToSearch: ["name"],
        }),
      ]);
      //asignar al data del componente
      this.products = this.$deepCopy(this.$store.state.productsModule.products);
    },
    deleteCurrentSearch() {
      this.searchProduct = "";
    },
  },
};
</script>

<style lang="scss" scoped></style>
