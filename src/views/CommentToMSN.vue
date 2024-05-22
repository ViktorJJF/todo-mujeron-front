<template>
  <v-container fluid>
    <v-row justify="center">
      <material-card
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
          :items="commentsFacebook"
          sort-by="calories"
          @page-count="pageCount = $event"
          :page.sync="page"
          :items-per-page="$store.state.itemsPerPage"
          :options.sync="pagination"
          :server-items-length="totalItems"
        >
          <template v-slot:top>
            <v-container>
              <CountrySelectorFlags
                @onSelectedCountry="
                  selectedCountry = $event;
                  initialize();
                "
              ></CountrySelectorFlags>
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
                                        selectedPost.created_time
                                          | formatDateAgo
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
                                sm="12"
                                md="12"
                                v-show="editedItem.type == 'VARIOS_PRODUCTOS'"
                              >
                                <p class="body-1 font-weight-bold">
                                  Selecciona una plantilla
                                </p>
                                <v-autocomplete
                                  :disabled="!selectedFanpage"
                                  item-text="name"
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
                    @change="initialize(1)"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6">
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
              <v-row>
                <v-col cols="12" sm="12">
                  <span v-if="$store.state.commentsFacebookModule">
                    <strong>Mostrando:</strong>
                    {{ commentsFacebook.length }} registros de
                    {{ $store.state.commentsFacebookModule.total }}
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
          <template v-slot:[`item.products`]="{ item }">
            {{
              item.products && item.products.length > 0
                ? item.products.map((el) => el.name).join(", ")
                : "Sin productos"
            }}
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
              class="mr-1 mb-1"
              >Eliminar</v-btn
            >
            <v-btn
              small
              color="primary"
              @click.stop="
                dialogGpt = true;
                generatePrompt(item);
              "
              class="mr-1 mb-1"
              >GPT</v-btn
            >
          </template>
          <template v-slot:no-data>
            <v-alert type="error" :value="true"
              >Aún no cuentas con commentsFacebook</v-alert
            >
          </template>
          <template v-slot:[`item.postUrl`]="{ item }">
            <a
              style="display: block; max-width: 250px; overflow-wrap: break-word;"
              class="mb-2"
              :href="item.postUrl"
              target="_blank"
            >
              {{ item.postUrl }}
            </a>
            <div>
              <div
                v-for="(postUrl, postUrlsIndex) in item.postUrls"
                :key="postUrlsIndex"
              >
                <a
                  style="display: inline; max-width: 250px; overflow-wrap: break-word;"
                  class="mb-2"
                  :href="postUrl.url"
                  target="_blank"
                >
                  {{ postUrl.url }}
                </a>
                <button
                  type="danger"
                  small
                  @click="removePostUrl(item, postUrlsIndex)"
                >
                  X
                </button>
              </div>
            </div>
            <v-text-field
              class="mb-2"
              placeholder="Nueva URL"
              dense
              hide-details=""
              v-model="item.newPostUrl"
              @keyup.enter="addPostUrl(item, item.newPostUrl)"
            ></v-text-field>
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
          <span v-if="$store.state.llmTracker">
            <strong>Mostrando:</strong>
            {{
              $store.state.itemsPerPage > commentsFacebook.length
                ? $store.state.llmTracker?.total
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
    <v-dialog v-model="dialogGpt" max-width="790">
      <v-card>
        <v-card-title class="text-h5">
          Respuestas a comentarios GPT
        </v-card-title>

        <div class="pa-3">
          <span>Comentario</span>
          <div class="d-flex align-center">
            <v-text-field
              class="mb-1"
              placeholder="Comentario"
              v-model="commentToTest"
              dense
              hide-details="auto"
              outlined
            ></v-text-field>
            <div class="ml-2">
              <svg
                fill="#000000"
                viewBox="0 0 24 24"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                @click="generateCompletion"
                :class="{ 'rotate-on-load': isGPTLoading, 'openai-logo': true }"
              >
                <title>OpenAI icon</title>

                <path
                  d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
                />
              </svg>
            </div>
          </div>
          <span>Prompt</span>
          <v-textarea
            dense
            outlined
            hide-details="auto"
            v-model="prompt"
            class="mb-2"
          ></v-textarea>
          <p v-if="isGPTLoading">Generando respuesta...</p>
          <p v-else>{{ aiResponse }}</p>
        </div>

        <v-card-actions>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { format, formatDistance } from "date-fns";
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import MaterialCard from "@/components/material/Card";
import CountrySelectorFlags from "@/components/CountrySelectorFlags";
import CommentsFacebook from "@/classes/CommentsFacebook";
import auth from "@/services/api/auth";
import { es } from "date-fns/locale";
import { getRandomInt, stripHtml, generateCategoryUrls } from "@/utils/utils";
import InfiniteScroll from "@/components/InfiniteScroll.vue";
import graphApiService from "@/services/api/graphApi";
import openaiService from "@/services/api/openai";
import woocommerceService from "@/services/api/woocommerce";
export default {
  components: {
    MaterialCard,
    VTextFieldWithValidation,
    InfiniteScroll,
    CountrySelectorFlags,
  },
  filters: {
    formatDate: function(value) {
      return format(new Date(value), "d 'de' MMMM 'del' yyyy", {
        locale: es,
      });
    },
    formatDateAgo: function(value) {
      return formatDistance(new Date(value), new Date(), {
        addSuffix: true,
        locale: es,
      });
    },
  },
  data: () => ({
    selectedCountry: null,
    commentToTest: "Informacion",
    isGPTLoading: false,
    aiResponse: "",
    prompt: "",
    searchPost: "",
    updateScroll: 0,
    fieldsToSearch: ["postUrl"],
    selectedProductsSearch: [],
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
    dialogGpt: false,
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
        width: "100px",
      },
      {
        text: "Productos agregados",
        align: "left",
        sortable: true,
        value: "products",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    commentsFacebook: [],
    items: [],
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
    "$route.name": function() {
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
          company: this.$store.getters["authModule/getCurrentCompany"].company._id,
        })
        .then((res) => {
          this.rolPermisos = res.data;
        })
        .finally(() => this.$store.commit("loadingModule/showLoading", false));
    },

    async initialize(page = 1) {
      let payload = {
        page,
        search: this.search,
        fieldsToSearch: this.fieldsToSearch,
        sort: "updatedAt",
        order: "desc",
      };
      if (this.filterByFanpage) {
        payload.botId = this.filterByFanpage;
      }
      if (this.selectedCountry) {
        payload.country = this.selectedCountry;
      }
      if (this.selectedProductsSearch.length > 0) {
        payload.products = this.selectedProductsSearch;
      }
      await Promise.all([
        this.$store.dispatch("commentsFacebookModule/list", {
          page,
          search: this.search,
          fieldsToSearch: this.fieldsToSearch,
          sort: "updatedAt",
          order: "desc",
          companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
          ...payload,
        }),
        this.$store.dispatch("botsModule/list", {
          companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
        }),
      ]);
      this.commentsFacebook = this.$deepCopy(
        this.$store.state.commentsFacebookModule.commentsFacebook
      );
      // postUrls field in case it doesnt exist
      this.commentsFacebook.forEach((comment) => {
        if (!comment.postUrls) {
          comment.postUrls = [];
        }
      });
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
              const product = this.products.find(
                (el) => el._id === this.selectedProducts
              );
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
          companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
        }),
      ]);
      //asignar al data del componente

      // .filter((el) => el.status === "publish") // mostrar solo produtos con status publish
      this.rawProducts = this.products = this.$deepCopy(
        this.$store.state.ecommercesModule.ecommerces
      );
    },
    onSelectedProducts(e) {
      this.searchProduct = "";
      // in case in product search for filter
      if (this.editedIndex === -1) {
        this.selectedProductsSearch = e; // ids products
        this.initialize();
      }
    },
    clearResponses() {
      if (this.editedIndex == -1) {
        this.responses = ["", "", ""];
      }
    },
    getBotId(link) {
      if (link.trim().length > 0) {
        const filteredBot = this.$store.state.botsModule.bots.find(
          (bot) =>
            link.toLowerCase().includes(bot.fanpageId) ||
            link.toLowerCase().includes(bot.fanpageName)
        );
        return filteredBot;
      }
    },
    remove(item) {
      const index = this.selectedProductsSearch.findIndex(p => p === item._id);
      this.selectedProductsSearch.splice(index, 1);
      this.initialize();
      
    },
    async generateTemplate(product) {
      await this.$store.dispatch("facebookLabelsModule/list", {
        limit: 9999,
        companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
      });
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
      this.editedItem.postImgUrl = product.images[
        getRandomInt(0, product.images.length - 1)
      ]
        ? product.images[getRandomInt(0, product.images.length - 1)].src
        : null;
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
    async generatePrompt(commentToMsn) {
      let products = commentToMsn.products;
      // populate categories, description and shortDescription
      products = await Promise.all(
        products.map(async (product) => {
          let productData = await woocommerceService.productById(
            product.woocommerceId,
            product.idEcommerce
          );
          product.categories = await Promise.all(
            productData.data.payload.categories.map(
              async (category) =>
                (
                  await woocommerceService.categoryById(
                    product.woocommerceId,
                    category.id
                  )
                ).data.payload
            )
          );
          product.description = productData.data.payload.description;
          product.shortDescription = productData.data.payload.short_description;
          product.categoriesUrl = generateCategoryUrls(
            product.categories,
            product.url
          );
          return product;
        })
      );
      // products=products.map(el=>{...el,categoriesUrl:`${el.url}/`})
      this.prompt =
        `Agrega a tu conocimiento el ADN de Tiendas Mujeron:

$ADN de Tiendas Mujeron:
Nombre de la Empresa: Tiendas Mujeron
Propósito: Abrazamos a las Mujeres con nuestras prendas de vestir, haciendo que independientemente de sus medidas, tamaños o edades, no se sientan excluidas de la moda colombiana y logren sentirse más seguras elevando su autoestima
Misión: Nuestros productos deben abrazar los cuerpos de las mujeres y acompañarlas en su viaje hacia una mayor seguridad en sí mismas.
$Información General de Tiendas MUjeron
País: ${commentToMsn.products[0].country}
Página Web: Mujeron.cl
URL de guia de tallas de todos nuestros productos: https://mujeron.cl/guia-de-tallas/
Redes Sociales:
facebook: https://www.facebook.com/MujeronCL
Instagram: @mujeronjeans
Youtube: https://www.youtube.com/@TiendasMujeron
Tiktok: https://www.tiktok.com/@tiendas_mujeron
Número de Whatsapp: +56 971733614
Dirección:
Para quienes llegan en auto: Seguir instrucciones de Google Maps: https://maps.app.goo.gl/mZAFHSAX8VY5zTDP9
Para quienes llegan en metro: Entrada más cercana en Santa Filomena 440, Recoleta local 23, Santiago de Chile.
Envíos: Realizan envíos a todas las regiones de Chile. Por compras superiores a $35,000, el envío es gratis.
Métodos de Pago:
Pago en página web o por transferencia.
Datos de Depósito:
Principal:
Nombre: Tiendas Mujeron
Rut: 77.303.262-9
BANCO CHILE/EDWARDS
Tipo de Cuenta: Cuenta Corriente
Número de Cuenta: 001594722307
Email: comercial@mujeron.cl
Nota: Enviar pantallazo o fotos de los pagos e indicar si es factura o boleta.

¿En qué áreas geográficas tiene?: Chile y Perú

¿Qué aspectos hacen diferenciable el negocio?
La calidad de nuestros productos
La frecuencia con la que lanzamos nuevos productos
La variedad de marcas
La variedad en Categorias: Vestuario Mujer, Fajas Colombianas, Jeans PushUP, Ropa Deportiva
El calce o horma
El rango de tallas
En las Fajas Colombianas desde la xs hasta la 5xl
En  los Jeans Push UP desde la 36 hasta la 50
En el Vestuario Femenino desde la S hasta la XL
La atención al cliente
La importancia que le damos a los datos del negocio
La presencia en redes sociales
Atendemos B2B B2BC y B2C
Origen Colombiano

Tarea:

Te Actúa como el experto community manager de Tiendas Mujeron, y darás respuesta a el $comentario hecho por un $Usuario de nuestras redes sociales, haciendo uso del $ADN de Tiendas Mujeron, y la $Información del Producto

instrucciones:

No alucines solo responde con la información contenida en este prompt
Cumplir con las políticas de la red social.
LA respuesta no debe contener más de 500 caracteres Se breve
Simula que responde un humano, puedes usar emoticones.
Responde con el nombre de quien te hace la consulta.
Si te preguntan información adicional de otros productos que no estén en $Detalles de los productos, amablemente le dirás que en el inbox le has dejado más información.
Si te llegara a faltar información para resolver el comentario debes persuadir de hablarnos en el chat.
No envíes URL inventadas.

Pos: https://www.facebook.com/photo/?fbid=728831582620268&set=pcb.728834829286610
Red Social: ${commentToMsn.platform}
Pais: Chile
$Usuario: carito la mas bonita
$Comentario: ${this.commentToTest}

$Detalles de los productos: [` +
        products.map(
          (product) => `Producto 1:
En la ref: ${product.ref},
Está disponible en estas tallas: ${product.attributes
            .find((attribute) => attribute.name.toLowerCase() == "talla")
            .options.join(" - ")}.
Su valor es de ${product.variations[0].regular_price}
y puedes adquirirla en
${product.permalink}
Categorías:
${product.categoriesUrl.join("\n")}

Descripción producto larga: ${stripHtml(product.description)}`
        ) +
        `]
`;
    },
    generateCompletion() {
      this.isGPTLoading = true;
      console.log("Enviando esto: ", this.prompt, this.commentToTest);
      openaiService
        .generateCompletionForConversation(this.prompt, this.commentToTest)
        .then((response) => {
          console.log(response.data);
          this.aiResponse = response.data.payload.choices[0].message.content;
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => (this.isGPTLoading = false));
    },
    addPostUrl(item, newPostUrl) {
      let indexComment = this.commentsFacebook.findIndex(
        (el) => el._id === item._id
      );
      this.commentsFacebook[indexComment].postUrls.push({ url: newPostUrl });
      // save it
      this.$store.dispatch("commentsFacebookModule/update", {
        id: item._id,
        data: this.commentsFacebook[indexComment],
      });
      if(item.newPostUrl){
        item.newPostUrl = "";
      }
    },
    async removePostUrl(item, index) {
      let indexComment = this.commentsFacebook.findIndex(
        (el) => el._id === item._id
      );
      this.commentsFacebook[indexComment].postUrls.splice(index, 1);
      // save it
      await this.$store.dispatch("commentsFacebookModule/update", {
        id: item._id,
        data: this.commentsFacebook[indexComment],
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rotate-on-load {
  animation: rotate 2s linear infinite;
}

.openai-logo {
  width: 40px;
  cursor: pointer;
}
</style>
