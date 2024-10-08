<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="1500px"
        icon="mdi-cellphone-dock"
        color="primary"
        :title="$t(entity + '.TITLE')"
        :text="$t(entity + '.SUBTITLE')"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="items"
          sort-by="calories"
          @page-count="pageCount = $event"
          :page.sync="page"
          :items-per-page="$store.state.itemsPerPage"
        >
          <template v-slot:[`item.url`]="{ item }">
            <a :href="item.url" target="_blank">{{ item.url }}</a>
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              class="mr-1 mb-1"
              color="primary"
              fab
              small
              dark
              @click="
                selectedCommentWithoutResponse = item;
                dialog = true;
              "
            >
              <v-icon>mdi-checkbox-multiple-marked</v-icon>
            </v-btn>
            <v-btn
              color="error"
              fab
              small
              dark
              @click="deleteItem(item)"
              v-if="rolPermisos['Delete']"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <template v-slot:no-data>
            <v-alert type="error" :value="true">{{
              $t("users.NO_DATA")
            }}</v-alert>
          </template>
          <template v-slot:[`item.description`]="{ item }"
            ><span class="format-breaklines">
              {{ item.description }}
            </span></template
          >
          <template v-slot:[`item.createdAt`]="{ item }">{{
            item.createdAt | formatDate
          }}</template>
          <template v-slot:[`item.fanpage`]="{ item }">
            {{
              $store.state.botsModule.bots.find(
                (el) => el.fanpageId == item.fanpageId
              )
                ? $store.state.botsModule.bots.find(
                    (el) => el.fanpageId == item.fanpageId
                  ).name
                : "SIN PAGINA"
            }}</template
          >
          <template v-slot:[`item.status`]="{ item }">
            <v-chip v-if="item.status" color="success">Activo</v-chip>
            <v-chip v-else color="error">Inactivo</v-chip>
          </template>
        </v-data-table>
        <v-col cols="12" sm="12">
          <span>
            <strong>Mostrando:</strong>
            {{
              $store.state.itemsPerPage > items.length
                ? items.length
                : $store.state.itemsPerPage
            }}
            de {{ items.length }} registros
          </span>
        </v-col>
        <div class="text-center pt-2">
          <v-pagination v-model="page" :length="pageCount"></v-pagination>
        </div>
      </material-card>
    </v-row>
    <v-dialog v-model="dialog" max-width="900px">
      <v-card>
        <v-card-title>
          <v-icon color="primary" class="mr-1">mdi-update</v-icon>
          <span class="headline">Asignar a publicación existente o crear</span>
          <v-container fluid>
            <v-col cols="12" sm="12">
              ¿Deseas asignar o crear publicación nueva?
              <v-radio-group v-model="hasToAssign">
                <v-radio label="Asignar" :value="true"></v-radio>
                <v-radio label="Crear" :value="false"></v-radio>
              </v-radio-group>
            </v-col>
            <template v-if="hasToAssign">
              <v-col cols="12" sm="8">
                <p class="body-1 font-weight-bold">
                  Tipo de publicación
                </p>
                <v-select
                  dense
                  hide-details
                  placeholder="Selecciona un tipo de publicacion"
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
                      name: 'Publicaciones de categoría',
                      value: 'PUBLICACIONES_CATEGORIA',
                    },
                    {
                      name: 'Publicaciones de marca',
                      value: 'PUBLICACIONES_MARCA',
                    },
                    {
                      name: 'No responder',
                      value: 'NO_RESPONDER',
                    },
                  ]"
                  v-model="commentToMsnType"
                  item-text="name"
                ></v-select>
              </v-col>
              <v-col
                cols="12"
                sm="12"
                v-if="commentToMsnType && commentToMsnType === 'VARIOS_PRODUCTOS'"
              >
                <span class="font-weight-bold">Filtrar por productos</span>
                <v-autocomplete
                  item-text="name"
                  item-value="_id"
                  :search-input.sync="searchProduct"
                  :items="products"
                  chips
                  dense
                  clearable
                  label="Busca los productos"
                  no-data-text="No se encontraron productos"
                  no-filter
                  solo
                  outlined
                  hide-details
                  @change="onSelectedProducts"
                  :multiple="editedIndex > -1 ? false : true"
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
                      @click="select"
                      color="deep-purple accent-4"
                      outlined
                    >
                      <strong>{{ item.name }}</strong>
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" sm="12" v-if="commentToMsnType && commentToMsnType!=='VARIOS_PRODUCTOS'">
                <span class="font-weight-bold"
                  >Filtrar por URL publicación</span
                >
                <v-text-field
                  dense
                  hide-details
                  v-model="searchPost"
                  append-icon="search"
                  placeholder="Escribe la url"
                  single-line
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="12" v-if="commentToMsnType">
                <span class="font-weight-bold"
                  >Subir imagen/video de publicación a multimedia</span
                >
                <v-checkbox
                  v-model="editedItem.hasToUploadToMultimedia"
                  label="Subir a multimedia"
                ></v-checkbox>
              </v-col>
              <v-col class="mt-3 mb-3" cols="12" sm="12" md="12">
                <p class="body-1 font-weight-bold">Selección para respuesta</p>
                <v-simple-table>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left">Fecha</th>
                        <th class="text-left">Url</th>
                        <th class="text-left">Acciones</th>
                        <!-- <th class="text-left">Url</th> -->
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(commentFacebook, idx) in commentsFacebook"
                        :key="idx"
                      >
                        <td>{{ commentFacebook.updatedAt | formatDate }}</td>
                        <td>
                          <a :href="commentFacebook.postUrl" target="_blank">{{
                            commentFacebook.postUrl
                          }}</a>
                        </td>
                        <td>
                          <v-btn
                            outlined
                            color="secondary"
                            text
                            @click="
                              assignCommentWithoutResponse(commentFacebook)
                            "
                            >Asignar</v-btn
                          >
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-col>
            </template>
            <template v-else>
              <v-col cols="12" sm="8">
                <p class="body-1 font-weight-bold">
                  Tipo de publicación
                </p>
                <v-select
                  dense
                  hide-details
                  placeholder="Selecciona un tipo de publicacion"
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
                      name: 'Publicaciones de categoría',
                      value: 'PUBLICACIONES_CATEGORIA',
                    },
                    {
                      name: 'Publicaciones de marca',
                      value: 'PUBLICACIONES_MARCA',
                    },
                    {
                      name: 'No responder',
                      value: 'NO_RESPONDER',
                    },
                  ]"
                  v-model="commentToMsnType"
                  item-text="name"
                ></v-select>
              </v-col>
            </template>
          </v-container>
        </v-card-title>
        <v-divider></v-divider>
        <v-container class="pa-5"></v-container>
        <v-card-actions rd-actions>
          <div class="flex-grow-1"></div>
          <v-btn
            v-if="!hasToAssign"
            :loading="loadingButton"
            color="success"
            @click="save"
            >Crear</v-btn
          >
          <v-btn outlined color="error" text @click="close">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
//Nota: Modifica los campos de la tabla
import Vue from "vue";
import graphApiService from "@/services/api/graphApi";
const ENTITY = "commentsWithoutResponses"; // nombre de la entidad en minusculas (se repite en services y modules del store)
const CLASS_ITEMS = () =>
  import(`@/classes/${ENTITY.charAt(0).toUpperCase() + ENTITY.slice(1)}`);
// const ITEMS_SPANISH = 'marcas';
import { format } from "date-fns";
import MaterialCard from "@/components/material/Card";
import auth from "@/services/api/auth";
import { es } from "date-fns/locale";
export default {
  components: {
    MaterialCard,
  },
  filters: {
    formatDate: function(value) {
      return format(new Date(value), "d 'de' MMMM 'del' yyyy", {
        locale: es,
      });
    },
  },
  data: () => ({
    hasToAssign: true,
    searchProduct: null,
    selectedCommentWithoutResponse: null,
    selectedCommentFacebook: null,
    searchPost: "",
    commentsFacebook: [],
    selectedProductsSearch: [],
    dialog: false,
    page: 1,
    pageCount: 0,
    loadingButton: false,
    search: "",
    headers: [
      {
        text: "Agregado",
        align: "left",
        sortable: false,
        value: "createdAt",
      },
      {
        text: "URL",
        align: "left",
        sortable: false,
        value: "url",
      },
      {
        text: "Fanpage",
        align: "left",
        sortable: false,
        value: "fanpage",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    [ENTITY]: [],
    advisors: [],
    editedIndex: -1,
    editedItem: CLASS_ITEMS(),
    defaultItem: CLASS_ITEMS(),
    menu1: false,
    menu2: false,
    rolPermisos: {},
    updateSearch: 0,
    delayTimer: null,
    products: [],
    commentToMsnType: null,
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? this.$t(this.entity + ".NEW_ITEM")
        : this.$t(this.entity + ".EDIT_ITEM");
    },
    items() {
      return this[ENTITY];
    },
    entity() {
      return ENTITY;
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
    searchPost() {
      clearTimeout(this.delayTimer);
      this.delayTimer = setTimeout(() => {
        if (this.searchPost && this.searchPost.length > 0) {
          this.searchPost = this.searchPost.trim();
        }
        this.getCommentsFacebook();
      }, 600);
    },
    async searchProduct() {
      clearTimeout(this.delayTimer);
      this.delayTimer = setTimeout(() => {
        this.getProducts(1);
      }, 600);
    },
  },
  async mounted() {
    this.$store.commit("loadingModule/showLoading");
    await this.$store.dispatch(ENTITY + "Module/list", {
      companies: [
        this.$store.getters["authModule/getCurrentCompany"].company._id,
      ],
    });
    this.initialize();
    this.rolAuth();
  },
  methods: {
    rolAuth() {
      auth
        .roleAuthorization({
          id: this.$store.state.authModule.user._id,
          menu: "Facebook/Facebook",
          model: "Comentarios-SinResponder",
          company: this.$store.getters["authModule/getCurrentCompany"].company
            ._id,
        })
        .then((res) => {
          this.rolPermisos = res.data;
        })
        .finally(() => this.$store.commit("loadingModule/showLoading", false));
    },
    async initialize() {
      //llamada asincrona de items
      // await Promise.all([this.$store.dispatch(ENTITY + "Module/list")]);
      //asignar al data del componente
      this[ENTITY] = this.$deepCopy(
        this.$store.state[ENTITY + "Module"][ENTITY]
      );
    },
    async getCommentsFacebook() {
      let payload = {
        page: 1,
        search: this.search,
        fieldsToSearch: ["postUrl"],
        sort: "updatedAt",
        order: "desc",
        companies: [
          this.$store.getters["authModule/getCurrentCompany"].company._id,
        ],
        ...payload,
      };
      if (
        this.selectedProductsSearch.length > 0 &&
        this.commentToMsnType === "VARIOS_PRODUCTOS"
      ) {
        payload.products = this.selectedProductsSearch;
      }
      if (this.searchPost && this.commentToMsnType !== "VARIOS_PRODUCTOS") {
        payload.filter = this.searchPost.trim();
      }

      const comments = await this.$store.dispatch(
        "commentsFacebookModule/list",
        payload
      );
      Vue.set(this, "commentsFacebook", comments);
      this.commentsFacebook = [];
      for (const comment of comments) {
        this.commentsFacebook.push(comment);
      }

      // // Ensure reactivity
    },
    async getProducts(page = 1) {
      if (!this.searchProduct) return;
      //llamada asincrona de items
      let payload = {
        sort: "name",
        page,
        search: this.searchProduct,
        fieldsToSearch: ["name", "ref"],
        listType: "All",
      };
      if (this.editedIndex > -1) {
        payload.country = this.selectedFanpage.country;
      }
      if (this.editedIndex === -1 && this.selectedCountry) {
        payload.country = this.selectedCountry;
      }
      await Promise.all([
        this.$store.dispatch("ecommercesModule/list", {
          sort: "name",
          page,
          search: this.searchProduct,
          fieldsToSearch: ["name", "ref"],
          listType: "All",
          companies: [
            this.$store.getters["authModule/getCurrentCompany"].company._id,
          ],
        }),
      ]);
      //asignar al data del componente

      // .filter((el) => el.status === "publish") // mostrar solo produtos con status publish
      this.rawProducts = this.products = this.$deepCopy(
        this.$store.state.ecommercesModule.ecommerces
      );
    },
    editItem(item) {
      this.editedIndex = this[ENTITY].indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    async deleteItem(item) {
      const index = this[ENTITY].indexOf(item);
      let itemId = this[ENTITY][index]._id;
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch(ENTITY + "Module/delete", itemId);
        this[ENTITY].splice(index, 1);
      }
    },
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    async assignCommentWithoutResponse(commentFacebook) {
      if (!(await this.$confirm("¿Deseas continuar con esta acción?"))) {
        return;
      }
      // check if has to upload media to multimedia
      if (this.editedItem.hasToUploadToMultimedia) {
        // upload media to multimedia
        graphApiService.downloadMediaPostUploadToProduct(
          this.selectedCommentWithoutResponse.fanpageId,
          this.selectedCommentWithoutResponse.postId,
          this.selectedCommentWithoutResponse.url,
          this.selectedProductsSearch
        );
      }

      if (!commentFacebook) {
        return;
      }
      // add url to postUrls
      if (!commentFacebook.postUrls) commentFacebook.postUrls = [];
      commentFacebook.postUrls.push({
        url: this.selectedCommentWithoutResponse.url,
      });
      // set postId
      commentFacebook.external_id = this.selectedCommentWithoutResponse.postId;
      // update
      await this.$store.dispatch("commentsFacebookModule/update", {
        id: commentFacebook._id,
        data: commentFacebook,
        showMessage: false,
      });
      this.$store.commit(
        "successModule/success",
        "Comentario sin responder asignado con éxito",
        { root: true }
      );
      this.$store.commit("loadingModule/showLoading", false, { root: true });
      this.selectedProductsSearch = [];
      // remove current post without response
      this.$store.dispatch(
        "commentsWithoutResponsesModule/delete",
        this.selectedCommentWithoutResponse._id
      );
      this.initialize();
      this.dialog = false;
    },
    onSelectedProducts(e) {
      this.searchProduct = "";
      // in case in product search for filter
      if (this.editedIndex === -1) {
        this.selectedProductsSearch = e; // ids products
        this.getCommentsFacebook();
      }
    },
    async save() {
      try {
        this.loadingButton = true;
        // get botId
        const bots = await this.$store.dispatch("botsModule/list", {
          fanpageId: this.selectedCommentWithoutResponse.fanpageId,
        });
        if (bots.length > 0) {
          const bot = bots[0];
          const payload = {
            postUrl: this.selectedCommentWithoutResponse.url,
            external_id:
              bot.platform === "facebook"
                ? `${this.selectedCommentWithoutResponse.fanpageId}_${this.selectedCommentWithoutResponse.postId}`
                : this.selectedCommentWithoutResponse.postId,
            botId: bot._id,
            type: this.commentToMsnType,
            platform: bot.platform,
          };
          await this.$store.dispatch("commentsFacebookModule/create", payload);
          // remove current post without response
          this.$store.dispatch(
            "commentsWithoutResponsesModule/delete",
            this.selectedCommentWithoutResponse._id
          );
          // call initialize
          this.initialize();
          this.close();
        }
      } finally {
        this.loadingButton = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
