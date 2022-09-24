<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="100%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Comments To MSN"
        text="Tabla resumen de comments to MSN"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="filteredCommentsFacebook"
          sort-by="calories"
          @page-count="pageCount = $event"
          :page.sync="page"
          :items-per-page="$store.state.itemsPerPage"
          :options.sync="pagination"
          :server-items-length="totalItems"
        >
          <template v-slot:top>
            <v-container>
              <span class="font-weight-bold"
                >Filtrar por URL: {{ search }}</span
              >
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    dense
                    hide-details
                    v-model="search"
                    append-icon="search"
                    placeholder="Escribe la url"
                    single-line
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-dialog v-model="dialog" max-width="800px">
                    <template v-slot:activator="{ on }">
                      <v-btn
                        @click="
                          editedItem.platform = 'facebook';
                          clearResponses();
                          clearData();
                        "
                        color="secondary"
                        dark
                        class="mb-2"
                        v-on="on"
                        v-show="rolPermisos['Write']"
                        >{{
                          isCommentView ? "Publicación Facebook" : "Agregar Ad"
                        }}</v-btn
                      >
                      <v-btn
                        class="mx-2 mb-2"
                        @click="
                          editedItem.platform = 'instagram';
                          clearResponses();
                        "
                        color="warning"
                        dark
                        v-on="on"
                        v-show="rolPermisos['Write']"
                        >{{
                          isCommentView ? "Publicación Instagram" : "Agregar Ad"
                        }}</v-btn
                      >
                    </template>
                    <v-card>
                      <v-card-title>
                        <v-icon color="primary" class="mr-1">mdi-update</v-icon>
                        <span class="headline">{{ formTitle }}</span>
                      </v-card-title>
                      <v-divider></v-divider>
                      <ValidationObserver ref="obs" v-slot="{ passes }">
                        <v-container class="pa-5">
                          <v-row>
                            <!-- <v-col cols="12" sm="12" class="mt-3">
                              <p class="body-1 font-weight-bold">Red social</p>
                              <v-select
                                @change="clearData()"
                                dense
                                hide-details
                                placeholder="Selecciona una red social"
                                item-value="value"
                                outlined
                                :items="[
                                  {
                                    name: 'Facebook',
                                    value: 'facebook',
                                  },
                                  {
                                    name: 'Instagram',
                                    value: 'instagram',
                                  },
                                ]"
                                v-model="editedItem.platform"
                                item-text="name"
                              ></v-select>
                            </v-col> -->
                          </v-row>
                          <div v-if="editedItem.platform">
                            <v-row dense>
                              <v-col cols="12" sm="6">
                                <span class="font-weight-bold"
                                  >Selecciona una cuenta</span
                                >
                                <v-select
                                  @change="
                                    instagramPosts = [];
                                    instagramNextPage = null;
                                    updateScroll += 1;
                                  "
                                  clearable
                                  dense
                                  hide-details
                                  placeholder="Cuenta"
                                  outlined
                                  :items="
                                    $store.state.botsModule.bots.filter(
                                      (el) =>
                                        el.platform === editedItem.platform
                                    )
                                  "
                                  item-text="fanpageName"
                                  :return-object="true"
                                  v-model="selectedFanpage"
                                ></v-select>
                              </v-col>
                              <v-col cols="12" sm="12">
                                <p class="body-1 font-weight-bold">
                                  Publicación
                                </p>
                                <v-card v-if="selectedPost">
                                  <span class="limited-text ma-2">
                                    {{ selectedPost.caption }}
                                  </span>
                                  <v-img
                                    v-if="editedItem.platform === 'instagram'"
                                    :src="
                                      selectedPost.media_type != 'VIDEO'
                                        ? selectedPost.media_url
                                        : selectedPost.thumbnail_url
                                    "
                                    height="330px"
                                    aspect-ratio="1"
                                    contain
                                  ></v-img>
                                  <v-img
                                    v-else
                                    :src="selectedPost.full_picture"
                                    height="330px"
                                    aspect-ratio="1"
                                    contain
                                  ></v-img>
                                  <v-card-actions>
                                    {{
                                      selectedPost.timestamp ||
                                      selectedPost.created_time | formatDateAgo
                                    }}
                                    <v-spacer></v-spacer>
                                    <v-btn color="info" text>
                                      <a
                                        :href="
                                          selectedPost.permalink ||
                                          selectedPost.permalink_url
                                        "
                                        target="_blank"
                                      >
                                        {{
                                          editedItem.platform === "instagram"
                                            ? "Ver en Instagram"
                                            : "Ver en Facebook"
                                        }}</a
                                      >
                                    </v-btn>
                                    <v-btn icon> </v-btn>
                                  </v-card-actions>
                                </v-card>
                                <v-dialog
                                  v-model="dialog3"
                                  width="600"
                                  hide-overlay
                                  transition="dialog-top-transition"
                                >
                                  <template v-slot:activator="{ on: dialog3 }">
                                    <v-tooltip bottom>
                                      <template
                                        v-slot:activator="{ on: tooltip }"
                                      >
                                        <v-btn
                                          class="mt-1"
                                          color="info"
                                          outlined
                                          :disabled="!selectedFanpage"
                                          v-on="{ ...tooltip, ...dialog3 }"
                                          >{{
                                            selectedPost
                                              ? "Cambiar post"
                                              : "Selecciona un Post"
                                          }}</v-btn
                                        >
                                      </template>
                                      <span>Publicaciones Instagram</span>
                                    </v-tooltip>
                                  </template>

                                  <v-card>
                                    <v-container>
                                      <v-row>
                                        <v-col cols="12" sm="12">
                                          <v-text-field
                                            dense
                                            hide-details
                                            v-model="searchPost"
                                            append-icon="search"
                                            placeholder="Escribe la url"
                                            single-line
                                            outlined
                                            class="mb-2"
                                          ></v-text-field>
                                        </v-col>
                                      </v-row>
                                      <InfiniteScroll
                                        :key="updateScroll"
                                        @loadMore="loadMore"
                                      >
                                        <v-card
                                          v-for="(post, idx) in filteredPosts"
                                          :key="idx"
                                        >
                                          <span class="limited-text ma-2">
                                            {{ post.caption || post.message }}
                                          </span>
                                          <v-img
                                            v-if="
                                              editedItem.platform ===
                                              'instagram'
                                            "
                                            aspect-ratio="0.3"
                                            style="cursor: pointer"
                                            @click="
                                              selectPost(
                                                post,
                                                editedItem.platform
                                              )
                                            "
                                            :src="
                                              post.media_type != 'VIDEO'
                                                ? post.media_url
                                                : post.thumbnail_url
                                            "
                                            height="490px"
                                          ></v-img>
                                          <v-img
                                            v-if="
                                              editedItem.platform === 'facebook'
                                            "
                                            aspect-ratio="0.3"
                                            style="cursor: pointer"
                                            @click="
                                              selectPost(
                                                post,
                                                editedItem.platform
                                              )
                                            "
                                            :src="post.full_picture"
                                            height="490px"
                                          ></v-img>
                                          <v-card-actions>
                                            {{
                                              (post.timestamp ||
                                                post.created_time)
                                                | formatDateAgo
                                            }}
                                            <v-spacer></v-spacer>
                                            <v-btn color="info" text>
                                              <a
                                                :href="
                                                  post.permalink ||
                                                  post.permalink_url
                                                "
                                                target="_blank"
                                              >
                                                {{
                                                  editedItem.platform ===
                                                  "instagram"
                                                    ? "Ver en Instagram"
                                                    : "Ver en Facebook"
                                                }}</a
                                              >
                                            </v-btn>
                                            <v-btn icon> </v-btn>
                                          </v-card-actions>
                                        </v-card>
                                      </InfiniteScroll>
                                    </v-container>
                                  </v-card>
                                </v-dialog>
                              </v-col>
                              <v-col
                                cols="12"
                                sm="12"
                                md="12"
                                v-show="editedItem.platform === 'facebook'"
                              >
                                <p class="body-1 font-weight-bold">URL</p>
                                <VTextFieldWithValidation
                                  rules="required"
                                  v-model="editedItem.postUrl"
                                  label="Ingresa la URL"
                                />
                              </v-col>
                              <v-col cols="12" sm="8">
                                <p class="body-1 font-weight-bold">
                                  Tipo de publicación
                                </p>
                                <v-select
                                  dense
                                  hide-details
                                  placeholder="Selecciona un país"
                                  item-value="value"
                                  outlined
                                  :items="[
                                    {
                                      name: 'Varios productos',
                                      value: 'VARIOS_PRODUCTOS',
                                    },
                                    {
                                      name: 'Mayoristas Default',
                                      value: 'MAYORISTAS_DEFAULT',
                                    },
                                    {
                                      name: 'Mayoristas personalizadas',
                                      value: 'MAYORISTAS_PERSONALIZADAS',
                                    },
                                    {
                                      name: 'Publicaciones de comunidad',
                                      value: 'PUBLICACIONES_COMUNIDAD',
                                    },
                                    {
                                      name: 'No responder',
                                      value: 'NO_RESPONDER',
                                    },
                                  ]"
                                  v-model="editedItem.type"
                                  item-text="name"
                                ></v-select>
                              </v-col>

                              <v-col
                                cols="12"
                                sm="6"
                                v-show="getBotId(editedItem.postUrl)"
                              >
                                <b>País: </b>
                                {{
                                  getBotId(editedItem.postUrl)
                                    ? getBotId(editedItem.postUrl).country
                                    : ""
                                }}
                              </v-col>
                              <v-col
                                cols="12"
                                sm="12"
                                md="12"
                                v-show="editedItem.type == 'VARIOS_PRODUCTOS'"
                              >
                                <p class="body-1 font-weight-bold">
                                  Selecciona una plantilla
                                </p>
                                <v-autocomplete
                                  :disabled="!selectedFanpage"
                                  item-text="nameWithCountry"
                                  item-value="_id"
                                  :search-input.sync="searchProduct"
                                  v-model="selectedProducts"
                                  :items="products"
                                  chips
                                  clearable
                                  label="Busca los productos"
                                  no-data-text="No se encontraron productos"
                                  no-filter
                                  solo
                                  @change="deleteCurrentSearch"
                                >
                                  <template
                                    v-slot:selection="{
                                      attrs,
                                      item,
                                      select,
                                      selected,
                                    }"
                                  >
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
                                </v-autocomplete>
                              </v-col>
                            </v-row>
                          </div>
                        </v-container>
                        <v-card-actions rd-actions>
                          <div class="flex-grow-1"></div>
                          <v-btn outlined color="error" text @click="close"
                            >Cancelar</v-btn
                          >
                          <v-btn
                            :loading="loadingButton"
                            color="success"
                            @click="passes(save)"
                            >Crear</v-btn
                          >
                        </v-card-actions>
                      </ValidationObserver>
                    </v-card>
                  </v-dialog>
                </v-col>
                <v-col cols="12" sm="6">
                  <span class="font-weight-bold">Filtrar por Fanpage</span>
                  <v-select
                    clearable
                    dense
                    hide-details
                    placeholder="Selecciona la fanpage"
                    outlined
                    :items="$store.state.botsModule.bots"
                    item-text="fanpageName"
                    item-value="_id"
                    v-model="filterByFanpage"
                  ></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="12">
                  <span>
                    <strong>Mostrando:</strong>
                    {{ filteredCommentsFacebook.length }} registros
                  </span>
                </v-col>
              </v-row>
              <div class="text-center pt-2">
                <v-pagination
                  @input="initialize(page)"
                  v-model="page"
                  :length="pageCount"
                  :total-visible="$store.state.maxPaginationButtons"
                ></v-pagination>
              </div>
            </v-container>
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              class="mr-3 mb-1"
              small
              color="secondary"
              @click="editItem(item)"
              v-if="rolPermisos['Edit']"
              >Editar</v-btn
            >
            <v-btn
              small
              color="error"
              @click="deleteItem(item)"
              v-if="rolPermisos['Delete']"
              >Eliminar</v-btn
            >
          </template>
          <template v-slot:no-data>
            <v-alert type="error" :value="true"
              >Aún no cuentas con commentsFacebook</v-alert
            >
          </template>
          <template v-slot:[`item.postUrl`]="{ item }">
            <a :href="item.postUrl" target="_blank">{{ item.postUrl }}</a>
          </template>
          <template v-slot:[`item.responses`]="{ item }">
            <v-chip
              v-show="item.responses.some((response) => response === '')"
              class="ma-2"
              color="red"
              text-color="white"
            >
              Faltan Respuestas
            </v-chip>
            <v-chip
              v-show="!item.responses.some((response) => response === '')"
              class="ma-2"
              color="success"
              text-color="white"
            >
              OK
            </v-chip>
          </template>
          <template v-slot:[`item.updatedAt`]="{ item }">{{
            item.updatedAt | formatDate
          }}</template>
          <template v-slot:[`item.status`]="{ item }">
            <v-chip v-if="item.status" color="success">Activo</v-chip>
            <v-chip v-else color="error">Inactivo</v-chip>
          </template>
        </v-data-table>
        <v-col cols="12" sm="12">
          <span>
            <strong>Mostrando:</strong>
            {{
              $store.state.itemsPerPage > commentsFacebook.length
                ? commentsFacebook.length
                : $store.state.itemsPerPage
            }}
            de {{ commentsFacebook.length }} registros
          </span>
        </v-col>
        <div class="text-center pt-2">
          <v-pagination
            @input="initialize(page)"
            v-model="page"
            :length="pageCount"
            :total-visible="$store.state.maxPaginationButtons"
          ></v-pagination>
        </div>
      </material-card>
    </v-row>
  </v-container>
</template>

<script>
import { format, formatDistance } from "date-fns";
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import MaterialCard from "@/components/material/Card";
import CommentsFacebook from "@/classes/CommentsFacebook";
import auth from "@/services/api/auth";
import { es } from "date-fns/locale";
import { getRandomInt } from "@/utils/utils";
import InfiniteScroll from "@/components/InfiniteScroll.vue";
import graphApiService from "@/services/api/graphApi";
export default {
  components: {
    MaterialCard,
    VTextFieldWithValidation,
    InfiniteScroll,
  },
  filters: {
    formatDate: function (value) {
      return format(new Date(value), "d 'de' MMMM 'del' yyyy", {
        locale: es,
      });
    },
    formatDateAgo: function (value) {
      return formatDistance(new Date(value), new Date(), {
        addSuffix: true,
        locale: es,
      });
    },
  },
  data: () => ({
    searchPost: "",
    updateScroll: 0,
    fieldsToSearch: ["postUrl"],
    selectedProducts: null,
    products: [],
    searchProduct: "",
    filterByFanpage: null,
    selectedFanpage: null,
    page: 1,
    pageCount: 0,
    loadingButton: false,
    search: "",
    dialog: false,
    dialog3: false,
    paises: ["Peru", "Chile", "Colombia"],
    headers: [
      {
        text: "Fecha",
        align: "left",
        sortable: false,
        value: "updatedAt",
      },
      {
        text: "Tipo",
        align: "left",
        sortable: false,
        value: "type",
      },
      {
        text: "URL",
        align: "left",
        sortable: false,
        value: "postUrl",
      },
      {
        text: "País",
        align: "left",
        sortable: true,
        value: "botId.country",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    commentsFacebook: [],
    editedIndex: -1,
    editedItem: CommentsFacebook(),
    defaultItem: CommentsFacebook(),
    type: "comment",
    rolPermisos: {},
    pagination: {},
    instagramPosts: [],
    selectedPost: null,
  }),

  computed: {
    totalItems() {
      return this.$store.state["commentsFacebookModule"].total;
    },
    totalPages() {
      return this.$store.state["commentsFacebookModule"].totalPages;
    },
    formTitle() {
      return this.editedIndex === -1
        ? "Nuevo URL"
        : "Editar respuestas de publicación";
    },
    filteredCommentsFacebook() {
      return this.filterByFanpage
        ? this.commentsFacebook
            .filter((comment) => comment.botId._id == this.filterByFanpage)
            .filter((el) => el.type == this.type)
        : this.commentsFacebook.filter((el) => el.type !== "ad");
    },
    isCommentView() {
      return this.$route.name == "CommentToMSN";
    },
    filteredPosts() {
      return this.searchPost.trim().length > 0
        ? this.instagramPosts.filter((el) =>
            (el.permalink ? el.permalink : el.permalink_url)
              .toLowerCase()
              .includes(this.searchPost.trim().toLowerCase())
          )
        : this.instagramPosts;
    },
  },

  watch: {
    async searchProduct() {
      clearTimeout(this.delayTimer);
      this.delayTimer = setTimeout(() => {
        this.getProducts(1);
      }, 600);
    },
    dialog(val) {
      val || this.close();
    },
    "$route.name": function () {
      let isCommentView = this.$route.name == "CommentToMSN";
      this.type = isCommentView ? "comment" : "ad";
    },
    async search() {
      clearTimeout(this.delayTimer);
      this.delayTimer = setTimeout(() => {
        this.initialize(this.page);
      }, 600);
    },
  },

  mounted() {
    this.$store.commit("loadingModule/showLoading");
    this.initialize();
    this.rolAuth();
  },

  methods: {
    rolAuth() {
      auth
        .roleAuthorization({
          id: this.$store.state.authModule.user._id,
          menu: "Facebook/Facebook",
          model: "Comentarios",
        })
        .then((res) => {
          this.rolPermisos = res.data;
        })
        .finally(() => this.$store.commit("loadingModule/showLoading", false));
    },

    async initialize(page = 1) {
      await Promise.all([
        this.$store.dispatch("commentsFacebookModule/list", {
          page,
          search: this.search,
          fieldsToSearch: this.fieldsToSearch,
          sort: "updatedAt",
          order: "desc",
        }),
        this.$store.dispatch("botsModule/list"),
      ]);
      this.commentsFacebook = this.$deepCopy(
        this.$store.state.commentsFacebookModule.commentsFacebook
      );
    },
    initializeAds() {
      console.log("iniciando...");
    },
    editItem(item) {
      this.editedIndex = this.commentsFacebook.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.$router.push({
        name: this.isCommentView ? "CommentToMSNUpdate" : "AdToMSNUpdate",
        params: { id: item._id },
      });
    },

    async deleteItem(item) {
      const index = this.commentsFacebook.indexOf(item);
      let itemId = this.commentsFacebook[index]._id;
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch("commentsFacebookModule/delete", itemId);
        this.commentsFacebook.splice(index, 1);
      }
    },

    close() {
      this.dialog = false;
      this.clearData();
    },
    clearData() {
      // conservando seleccion plataforma
      let auxPlatform = this.editedItem.platform;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedItem.platform = auxPlatform;
        this.selectedProducts = null;
        this.products = [];
        this.editedIndex = -1;
        this.selectedFanpage = null;
        this.searchPost = "";
        this.selectedPost = null;
      }, 300);
    },

    async save() {
      this.loadingButton = true;
      this.editedItem.botId = this.selectedFanpage
        ? this.selectedFanpage._id
        : this.getBotId(this.editedItem.postUrl)._id;
      if (this.editedIndex > -1) {
        let itemId = this.commentsFacebook[this.editedIndex]._id;
        try {
          await this.$store.dispatch("commentsFacebookModule/update", {
            id: itemId,
            data: this.editedItem,
          });
          Object.assign(
            this.commentsFacebook[this.editedIndex],
            this.editedItem
          );
          this.close();
        } finally {
          this.loadingButton = false;
        }
      } else {
        //create item
        try {
          if (this.selectedProducts) {
            //agregando tipo comment/add
            this.editedItem.type = this.isCommentView ? "comment" : "ad";
            // verificando si se agrego plantilla
            // agregando plantilla
            if (this.products.length > 0) {
              const product = this.products[0];
              await this.generateTemplate(product);
            }
          }
          let newItem = await this.$store.dispatch(
            "commentsFacebookModule/create",
            this.editedItem
          );
          this.commentsFacebook.unshift(newItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      }
    },
    async getProducts(page = 1) {
      if (!this.searchProduct) return;
      //llamada asincrona de items
      console.log(
        "🚀 Aqui *** -> this.selectedFanpage.country",
        this.selectedFanpage.country
      );
      await Promise.all([
        this.$store.dispatch("ecommercesModule/list", {
          country: this.selectedFanpage.country,
          sort: "name",
          page,
          search: this.searchProduct,
          fieldsToSearch: ["name","ref"],
          listType: "All",
        }),
      ]);
      //asignar al data del componente

      // .filter((el) => el.status === "publish") // mostrar solo produtos con status publish
      this.rawProducts = this.products = this.$deepCopy(
        this.$store.state.ecommercesModule.ecommerces
      ).map((el) => ({
        ...el,
        nameWithCountry: el.name + ` (${el.country})`,
      }));
    },
    deleteCurrentSearch() {
      this.searchProduct = "";
    },
    clearResponses() {
      if (this.editedIndex == -1) {
        this.responses = ["", "", ""];
      }
    },
    getBotId(link) {
      if (link.trim().length > 0)
        return this.$store.state.botsModule.bots.find(
          (bot) =>
            bot.country == this.getCountryByPostLink(link) ||
            link.toLowerCase().includes(bot.fanpageId) ||
            link.toLowerCase().includes(bot.fanpageName)
        );
    },
    getCountryByPostLink(link) {
      let bots = this.$store.state.botsModule.bots;
      let country;
      bots.forEach((bot) => {
        if (
          link
            .toLowerCase()
            .includes(bot.fanpageName.toLowerCase().replace("@", "")) ||
          link.toLowerCase().includes(bot.fanpageId) ||
          link.toLowerCase().includes(bot.fanpageName)
        ) {
          return (country = bot.country);
        }
      });
      return country;
    },
    remove(item) {
      this.products.splice(this.products.indexOf(item), 1);
      this.products = [...this.products];
      this.selectedProducts = null;
    },
    async generateTemplate(product) {
      await this.$store.dispatch("facebookLabelsModule/list", { limit: 9999 });
      // obteniendo etiquetas emparejadas con categorias
      let facebookLabels = [];
      product.categories.forEach((category) => {
        facebookLabels.push(
          ...this.$store.getters["facebookLabelsModule/getLabelsByCategoryId"](
            category._id
          )
        );
        console.log(
          "etiquetas: ",
          this.$store.getters["facebookLabelsModule/getLabelsByCategoryId"](
            category._id
          )
        );
      });
      // el resto del template
      this.editedItem.postImgUrl =
        product.images[getRandomInt(0, product.images.length - 1)].src;
      this.editedItem.products = [product._id];
      this.editedItem.selectedCategories = [
        {
          categoryId: product.categories[0]._id,
          categoryName: product.categories[0].name,
          productId: product._id,
        },
      ];
      this.editedItem.responses = ["", "", "", ""];
      this.editedItem.selectedLabel =
        facebookLabels.length > 0 ? facebookLabels[0]._id : null;
      this.editedItem.selectedLabelIndex = facebookLabels.length > 0 ? 0 : null;
      this.editedItem.selectedUrl = product.permalink;
      this.editedItem.selectedUrlIndex = 0;
    },
    async loadMore() {
      console.log("CARGANDO MAS...");
      let response;
      if (this.editedItem.platform === "instagram") {
        response = await graphApiService.getInstagramPosts(
          this.selectedFanpage.fanpageId,
          this.instagramNextPage
        );
      } else {
        response = await graphApiService.getFacebookPosts(
          this.selectedFanpage.fanpageId,
          this.instagramNextPage
        );
      }
      this.instagramPosts.push(...response.data.payload.data);
      this.instagramNextPage = response.data.payload.paging.cursors.after;
    },
    selectPost(post, platform) {
      this.selectedPost = post;
      this.dialog3 = false;
      if (platform === "instagram") {
        this.editedItem.postImgUrl =
          post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url;
        this.editedItem.postUrl = post.permalink;
      } else {
        this.editedItem.postImgUrl = post.full_picture;
        this.editedItem.postUrl = post.permalink_url;
      }

      this.editedItem.external_id = post.id;
    },
  },
};
</script>

<style lang="scss" scoped></style>
