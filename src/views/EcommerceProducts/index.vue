<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="98%"
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
          :items="ecommerces"
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
                >Filtrar por nombre: {{ search }}</span
              >
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    dense
                    hide-details
                    v-model="search"
                    append-icon="search"
                    placeholder="Escribe el nombre de producto"
                    single-line
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-btn
                    color="success"
                    class="mb-1"
                    small
                    @click="
                      filterWithoutRef = !filterWithoutRef;
                      filterWithoutRefMethods();
                    "
                    >{{
                      filterWithoutRef
                        ? "Ver todos los productos"
                        : "Filtrar productos sin referencia"
                    }}</v-btn
                  >
                  <v-btn
                    color="info"
                    style="display: block"
                    small
                    @click="
                      filterWithoutImage = !filterWithoutImage;
                      filterWithoutImageMethods();
                    "
                    >{{
                      filterWithoutImage
                        ? "Ver todos los productos"
                        : "Filtrar productos sin imagen"
                    }}</v-btn
                  >
                </v-col>

                <v-col cols="12" sm="6">
                  <v-dialog v-model="dialog" max-width="700px">
                    <!-- <template v-slot:activator="{ on }">
                      <v-btn color="primary" dark class="mb-2" v-on="on">{{
                        $t(entity + ".NEW_ITEM")
                      }}</v-btn>
                    </template> -->
                    <v-card>
                      <v-card-title>
                        <v-icon color="primary" class="mr-1">mdi-update</v-icon>
                        <span class="headline">{{ formTitle }}</span>
                      </v-card-title>
                      <v-divider></v-divider>
                      <ValidationObserver ref="obs" v-slot="{ passes }">
                        <v-container class="pa-5">
                          <v-row dense>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">Nombres</p>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.name"
                                label="Nombre del marca"
                              />
                            </v-col>
                          </v-row>
                          <v-row dense>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">Nombres</p>
                              <v-textarea
                                placeholder="descripcion"
                                outlined
                                v-model="editedItem.description"
                              ></v-textarea>
                            </v-col>
                          </v-row>
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
                            >Guardar</v-btn
                          >
                        </v-card-actions>
                      </ValidationObserver>
                    </v-card>
                  </v-dialog>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="12">
                  <span>
                    <strong>Mostrando:</strong>
                    {{
                      $store.state.itemsPerPage > ecommerces.length
                        ? ecommerces.length
                        : $store.state.itemsPerPage
                    }}
                    de {{ $store.state.ecommercesModule.total }} registros
                  </span>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="12">
                  <strong>Acciones:</strong>
                  <v-btn
                    v-show="selectedProductIds.length === 0"
                    class="mb-1 ml-1"
                    small
                    color="primary"
                    @click="syncAll"
                    >Sincronizar todo</v-btn
                  >
                  <v-btn
                    v-show="selectedProductIds.length > 0"
                    class="mb-1 ml-1"
                    small
                    color="secondary"
                    @click="syncSelected"
                    >Sincronizar Seleccionados</v-btn
                  >
                  <v-progress-linear
                    v-if="syncStarted"
                    v-model="countProductSyncPercentage"
                    color="blue-grey"
                    height="25"
                  >
                    <strong>
                      {{ countProductSync }} de {{ items.length }} ({{
                        Math.ceil(countProductSyncPercentage) || 0
                      }}%)</strong
                    >
                  </v-progress-linear>
                  <v-progress-linear
                    v-if="syncStartedSelected"
                    v-model="countProductSyncPercentageSelected"
                    color="blue-grey"
                    height="25"
                  >
                    <strong>
                      {{ countProductSyncSelected }} de
                      {{ selectedProductsSize }} ({{
                        Math.ceil(countProductSyncPercentageSelected) || 0
                      }}%)</strong
                    >
                  </v-progress-linear>
                </v-col>
                <v-col cols="12" sm="12">
                  <div class="text-center pt-2">
                    <v-pagination
                      @input="initialize(page)"
                      v-model="page"
                      :length="pageCount"
                      :total-visible="$store.state.maxPaginationButtons"
                    ></v-pagination>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <!-- <v-btn
              class="mr-1 mb-1"
              color="primary"
              fab
              small
              dark
              @click="editItem(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn> -->
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
              $t(entity + ".NO_DATA")
            }}</v-alert>
          </template>
          <template v-slot:[`item.description`]="{ item }"
            ><span class="format-breaklines">
              {{ item.description }}
            </span></template
          >
          <template v-slot:[`item.date_modified`]="{ item }">{{
            item.date_modified | formatDate
          }}</template>
          <template v-slot:[`item.permalink`]="{ item }">
            <a :href="item.permalink" target="_blank"
              ><v-btn class="mt-3" color="primary" small>Visitar</v-btn>
            </a>
            <v-btn
              style="display: block"
              small
              class="mt-1"
              color="info"
              dark
              @click.stop="
                dialogTemplate = true;
                templateCountry = item.country;
                productId = item._id;
              "
            >
              Comment to MSN
            </v-btn>
            <v-btn
              style="display: block"
              class="mt-1"
              color="accent"
              dark
              @click.stop="
                dialogImage = true;
                currentProduct = item;
              "
              small
            >
              Multimedia
            </v-btn>
            <a :href="`/ecommerce/productos/${item._id}`" target="_blank">
              <v-btn style="display: block" class="mt-1" color="primary" small>
                Editar
              </v-btn>
            </a>
          </template>
          <template v-slot:[`item.attributes`]="{ item }">
            <ul
              v-for="(attribute, attIndex) in item.attributes"
              :key="attIndex"
            >
              <li>
                <b>{{ attribute.name }}: </b>{{ attribute.options.join(",") }}
              </li>
            </ul>
          </template>
          <template v-slot:[`item.categories`]="{ item }">
            <ul
              v-for="(category, cattIndex) in item.categories"
              :key="cattIndex"
            >
              <li>{{ category.name }}</li>
            </ul>
          </template>
          <template v-slot:[`item.ref`]="{ item }">
            <v-text-field
              :hint="item.ref"
              v-model="item.ref"
              append-outer-icon="mdi mdi-checkbox-marked-circle"
              placeholder="Referencia"
              @click:append-outer="updateRef(item._id, item)"
              @keyup.enter="updateRef(item._id, item)"
            ></v-text-field>
          </template>
          <template v-slot:[`item.status`]="{ item }">
            <v-chip v-if="item.status" color="success">Activo</v-chip>
            <v-chip v-else color="error">Inactivo</v-chip>
          </template>
          <template v-slot:[`item.checkbox`]="{ item }">
            <v-checkbox
              v-model="selectedProductIds"
              :value="item._id"
              :key="updateCheckbox"
            ></v-checkbox>
          </template>
        </v-data-table>
        <v-col cols="12" sm="12">
          <span>
            <strong>Mostrando:</strong>
            {{
              $store.state.itemsPerPage > ecommerces.length
                ? ecommerces.length
                : $store.state.itemsPerPage
            }}
            de {{ $store.state.ecommercesModule.total }} registros
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

    <v-dialog v-model="dialogTemplate" max-width="890">
      <v-card class="pa-5">
        <CommentToMSNUpdate
          :key="keyNumber"
          @click="keyNumber += 1"
          v-if="templateCountry && productId && dialogTemplate"
          :isTemplate="true"
          :country="templateCountry"
          :productId="productId"
          @saved="dialogTemplate = false"
        ></CommentToMSNUpdate>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogImage" max-width="890">
      <v-card v-if="currentProduct" class="pa-5">
        <v-card-title>
          <span class="text-h5">Multimedia</span>
        </v-card-title>

        <div class="px-5">
          <v-row>
            <v-col
              v-for="(image, index) of currentProduct.customImages"
              :key="index"
              cols="4"
            >
              <div class="d-flex flex-column align-center">
                <template v-if="getTypeUrl(image) === 'video'">
                  <video
                    :src="image"
                    controls
                    style="width: 100%; height: 350px"
                  ></video>
                </template>
                <template v-if="getTypeUrl(image) === 'image'">
                  <img
                    :src="image"
                    class="mb-2"
                    style="width: 100%; height: 350px"
                  />
                </template>
                <template v-if="getTypeUrl(image) === 'youtube'">
                  <iframe
                    width="100%"
                    height="350px"
                    :src="getFormattedYoutube(image)"
                  >
                  </iframe>
                </template>
                <v-textarea
                  dense
                  hide-details
                  v-model="currentProduct.customImages[index]"
                  placeholder="Escribe la url de la imagen"
                  single-line
                  outlined
                  clearable
                />
                <div class="d-flex justify-space-between align-center w-100">
                  <v-btn icon small @click="handleRemoveCustomImage(index)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                  <v-btn icon small @click="handleFeaturedImage(index)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        :fill="
                          currentProduct.featured_images
                            ? currentProduct.featured_images
                                .map((el) => el.index)
                                .includes(index)
                              ? 'rgba(252, 196, 11)'
                              : 'rgba(0,0,0)'
                            : 'rgba(0,0,0)'
                        "
                        d="M12.076,2.549L9.122,8.442,2.5,9.5l5.32,5.174L5.858,21.5,12,17.874l6.142,3.626-1.962-6.826L21.5,9.5l-6.622-1.058Z"
                      />
                    </svg>
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>
          <div class="mt-3 ml-4">
            <v-btn color="primary" @click="handleAddCustomImage">
              <v-icon>mdi-plus</v-icon>
              Añadir
            </v-btn>
          </div>
        </div>

        <v-row class="mt-3 mb-3">
          <v-img
            v-if="currentProduct.customImage"
            class="rounded-corners"
            :src="currentProduct.customImage"
            aspect-ratio="2"
            contain
          ></v-img>
        </v-row>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :loading="loadingButton"
            dark
            color="green darken-1"
            @click="
              dialogImage = false;
              saveCustomImage(currentProduct._id, currentProduct);
            "
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
//Nota: Modifica los campos de la tabla
const ENTITY = "ecommerces"; // nombre de la entidad en minusculas (se repite en services y modules del store)
const CLASS_ITEMS = () =>
  import(`@/classes/${ENTITY.charAt(0).toUpperCase() + ENTITY.slice(1)}`);
// const ITEMS_SPANISH = 'marcas';
// import { getProductRef } from "@/utils/utils";
import { format } from "date-fns";
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import MaterialCard from "@/components/material/Card";
import CommentToMSNUpdate from "@/views/CommentToMSNUpdate";
import { es } from "date-fns/locale";
import dialogflow from "@/services/api/dialogflow";
import ecommercesApi from "@/services/api/ecommerces";
import {
  timeout,
  getFileTypeFromUrl,
  getFormattedYoutubeUrl,
} from "@/utils/utils";
import auth from "@/services/api/auth";
import Vue from "vue";
export default {
  components: {
    MaterialCard,
    VTextFieldWithValidation,
    CommentToMSNUpdate,
  },
  filters: {
    formatDate: function(value) {
      return format(new Date(value), "d 'de' MMMM 'del' yyyy", {
        locale: es,
      });
    },
  },
  data: () => ({
    selectedProductIds: [],
    dialogImage: false,
    currentProduct: null,
    keyNumber: 0,
    productId: null,
    templateCountry: null,
    dialogTemplate: false,
    page: 1,
    pagination: {},
    fieldsToSearch: [
      "name",
      "permalink",
      "ref",
      "stock_status",
      "status",
      "sku",
      "url",
    ],
    pageCount: 0,
    loadingButton: false,
    search: "",
    dialog: false,
    headers: [
      {
        text: "",
        align: "left",
        sortable: false,
        value: "checkbox",
      },
      {
        text: "Última modificación",
        align: "left",
        sortable: false,
        value: "date_modified",
        width: "10",
      },
      {
        text: "Nombre",
        align: "left",
        sortable: false,
        value: "name",
      },
      {
        text: "Referencia",
        align: "left",
        sortable: false,
        value: "ref",
      },
      {
        text: "Atributos",
        align: "left",
        sortable: false,
        value: "attributes",
      },
      {
        text: "Categorías",
        align: "left",
        sortable: false,
        value: "categories",
      },
      {
        text: "País",
        align: "left",
        sortable: false,
        value: "country",
      },
      {
        text: "Link",
        align: "left",
        sortable: false,
        value: "permalink",
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
    filterWithoutRef: false,
    filterWithoutImage: false,
    syncStarted: false,
    countProductSync: 0,
    syncStartedSelected: false,
    countProductSyncSelected: 0,
    selectedProductsSize: 1,
    updateCheckbox: 0,
    rolPermisos: {},
  }),
  computed: {
    totalItems() {
      return this.$store.state["ecommercesModule"].total;
    },
    totalPages() {
      return this.$store.state["ecommercesModule"].totalPages;
    },
    formTitle() {
      return this.editedIndex === -1
        ? this.$t(this.entity + ".NEW_ITEM")
        : this.$t(this.entity + ".EDIT_ITEM");
    },
    items() {
      if (this.search.length) {
        return this[ENTITY];
      }

      return this[ENTITY].filter((item) => item.stock_status !== "outofstock");
    },
    entity() {
      return ENTITY;
    },
    countProductSyncPercentage() {
      return (this.countProductSync / this.items.length) * 100;
    },
    countProductSyncPercentageSelected() {
      return (this.countProductSyncSelected / this.selectedProductsSize) * 100;
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
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
          menu: "Configuracion/Propiedades/Woocommerces",
          model: "Productos",
        })
        .then((res) => {
          this.rolPermisos = res.data;
        })
        .finally(() => this.$store.commit("loadingModule/showLoading", false));
    },
    getTypeUrl(url) {
      return getFileTypeFromUrl(url);
    },
    getFormattedYoutube(url) {
      return getFormattedYoutubeUrl(url);
    },
    getIcon(url) {
      const type = getFileTypeFromUrl(url);
      switch (type) {
        case "image":
          return "mdi-image";
        case "video":
          return "mdi-video";
        case "audio":
          return "mdi-audio";
        case "document":
          return "mdi-file-document";
        default:
          return "";
      }
    },
    handleFeaturedImage(index) {
      if (!this.currentProduct.featured_images) {
        Vue.set(this.currentProduct, "featured_images", []);
      }
      if (
        !this.currentProduct.featured_images
          .map((el) => el.index)
          .includes(index)
      ) {
        this.currentProduct.featured_images.push({ index });
      } else {
        this.currentProduct.featured_images.splice(
          this.currentProduct.featured_images.findIndex(
            (el) => el.index == index
          ),
          1 // remove 1 element at index
        );
      }
    },
    filterWithoutRefMethods() {
      this.initialize();
    },
    async initialize(page = 1) {
      //llamada asincrona de items
      let payload = {
        page,
        search: this.search,
        fieldsToSearch: this.fieldsToSearch,
        sort: "date_modified",
        order: -1,
        // listType: "All",
      };
      if (this.filterWithoutRef) {
        payload["products_without_ref"] = true;
      }
      if (this.filterWithoutImage) {
        payload["products_without_image"] = true;
      }
      await Promise.all([
        this.$store.dispatch(ENTITY + "Module/list", payload),
      ]);
      //asignar al data del componente
      this[ENTITY] = this.$deepCopy(
        this.$store.state[ENTITY + "Module"][ENTITY]
      ).map((el) => ({ ...el, originalRef: el.ref }));
      //se agrego el campo ref original
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
        await this.$store.dispatch(this[ENTITY] + "Module/delete", itemId);
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
    handleAddCustomImage() {
      this.currentProduct.customImages.push("");
    },
    handleRemoveCustomImage(index) {
      this.currentProduct.customImages.splice(index, 1);
      // remove index from featured_images
      this.currentProduct.featured_images.splice(
        this.currentProduct.featured_images.findIndex(
          (el) => el.index == index
        ),
        1 // remove 1 element at index
      );
    },
    async save() {
      this.loadingButton = true;
      if (this.editedIndex > -1) {
        console.log("actualizando: ", this.editedItem);
        let itemId = this[ENTITY][this.editedIndex]._id;
        try {
          await this.$store.dispatch(ENTITY + "Module/update", {
            id: itemId,
            data: this.editedItem,
          });
          Object.assign(this[ENTITY][this.editedIndex], this.editedItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      } else {
        //create item
        console.log("creando...", this.editedItem);
        try {
          let newItem = await this.$store.dispatch(
            ENTITY + "Module/create",
            this.editedItem
          );
          this[ENTITY].push(newItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      }
    },
    async saveCustomImage(id, item) {
      this.loadingButton = true;
      try {
        await this.$store.dispatch(ENTITY + "Module/update", {
          id,
          data: item,
        });
      } finally {
        this.loadingButton = false;
      }
    },
    // getProductReference(productName) {
    //   return getProductRef(productName);
    // },
    async updateRef(id, item) {
      //actualizando nombre corto en entidad dialogflow
      await dialogflow.updateEntityValue({
        country: item.country,
        value: item.originalRef,
        newValue: item.ref,
      });
      //actualizando originalRef
      item.originalRef = item.ref.trim();
      // actualizando el nombre corto en bd
      await this.$store.dispatch(ENTITY + "Module/update", {
        id: id,
        data: item,
      });
    },
    filterWithoutImageMethods() {
      // filtrando productos sin imagen
      this.initialize();
    },
    /**
     * @description Se sincronizan todos los productos desde Woocommerce
     */
    async syncAll() {
      try {
        await ecommercesApi.syncAll();
        this.syncStarted = true;
        // si todo fue bien, activar el endpoint empezara a retornar la cantidad de productos sincronizados
        await timeout(3000);
        while (this.syncStarted) {
          try {
            await timeout(4000);
            this.countProductSync = (
              await ecommercesApi.syncAll()
            ).data.payload.countProductSync;
            // si se llega al límite, eliminar de localStorage
            if (this.countProductSync >= this.items.length) {
              this.syncStarted = false;
              break;
            }
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    async syncSelected() {
      console.log("sincronizando...");
      try {
        await ecommercesApi.syncSelected({
          productIds: this.selectedProductIds,
          isInit: true,
        });
        this.selectedProductsSize = this.selectedProductIds.length;
        this.syncStartedSelected = true;
        let isReady = false;
        while (!isReady) {
          try {
            await timeout(4000);
            this.countProductSyncSelected = (
              await ecommercesApi.syncSelected({
                productIds: this.selectedProductIds,
              })
            ).data.payload.countProductSyncSelected;
            // si se llega al límite, terminar
            if (
              this.countProductSyncSelected == this.selectedProductIds.length
            ) {
              isReady = true;
              setTimeout(() => {
                this.syncStartedSelected = false;
                this.countProductSyncSelected = 0;
              }, 15 * 1000);
              this.selectedProductIds = [];
            }
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
