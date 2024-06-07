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
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <v-icon color="primary" class="mr-1">mdi-update</v-icon>
          <span class="headline">Asignar a publicación existente</span>
          <v-container fluid>
            <v-combobox
              :key="updateSearch"
              v-model="selectedCommentFacebook"
              :items="commentsFacebook"
              :search-input.sync="searchPost"
              hide-selected
              item-value="_id"
              item-text="postUrl"
              placeholder="Busca una publicación por URL"
              outlined
              dense
              class="mt-2"
              clearable
            >
              <template v-slot:no-data>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>
                      No se encontraron resultados
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-combobox>
            <div v-if="selectedCommentFacebook">
              <div>
                <b>Se vinculará este post sin responder:</b>
                <a :href="selectedCommentWithoutResponse" target="_blank">{{
                  selectedCommentWithoutResponse.url
                }}</a>
              </div>
              <div>
                <b>Post Objetivo:</b>
                <span v-if="selectedCommentFacebook.postUrl"
                  ><a :href="selectedCommentFacebook.postUrl" target="_blank">{{
                    selectedCommentFacebook.postUrl
                  }}</a></span
                >
                <span v-else>Selecciona un post</span>
              </div>
            </div>
          </v-container>
        </v-card-title>
        <v-divider></v-divider>
        <v-container class="pa-5"></v-container>
        <v-card-actions rd-actions>
          <div class="flex-grow-1"></div>
          <v-btn
            outlined
            color="primary"
            text
            @click="assignCommentWithoutResponse"
            >Asignar</v-btn
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
    selectedCommentWithoutResponse: null,
    selectedCommentFacebook: null,
    searchPost: "",
    commentsFacebook: [],
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
      if (this.searchPost) {
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
    async save() {
      this.loadingButton = true;
      if (this.editedIndex > -1) {
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
    assignCommentWithoutResponse() {
      if (!this.selectedCommentFacebook) {
        return;
      }
      // add url to postUrls
      this.selectedCommentFacebook.postUrls.push({
        url: this.selectedCommentWithoutResponse.url,
      });
      // set postId
      this.selectedCommentFacebook.external_id = this.selectedCommentWithoutResponse.postId;
      // update
      this.$store.dispatch("commentsFacebookModule/update", {
        id: this.selectedCommentFacebook._id,
        data: this.selectedCommentFacebook,
      });
      this.selectedCommentFacebook = null;
      // remove current post without response
      this.$store.dispatch(
        "commentsWithoutResponsesModule/delete",
        this.selectedCommentWithoutResponse._id
      );
      this.dialog = false;
    },
  },
};
</script>

<style lang="scss" scoped></style>
