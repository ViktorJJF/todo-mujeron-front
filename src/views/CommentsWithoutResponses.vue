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
              @click="dialog = true"
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
            <v-select
              hide-details
              single-line
              outlined
              dense
              :items="commentsFacebook"
              v-model="selectedCommentFacebook"
            />
          </v-container>
        </v-card-title>
        <v-divider></v-divider>
        <v-container class="pa-5"></v-container>
        <v-card-actions rd-actions>
          <div class="flex-grow-1"></div>
          <v-btn outlined color="error" text @click="close">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
//Nota: Modifica los campos de la tabla
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
    commentsFacebook: [],
    selectedCommentFacebook: null,
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
    getCommentsFacebook() {
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
      if (this.searchCommentFacebook)
        payload["search"] = this.searchCommentFacebook;
      this.$store.dispatch("commentsFacebookModule/list", payload);
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
  },
};
</script>

<style lang="scss" scoped></style>
