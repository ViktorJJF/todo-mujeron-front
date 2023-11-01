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
          :items="items"
          sort-by="calories"
          @page-count="pageCount = $event"
          :page.sync="page"
          :items-per-page="$store.state.itemsPerPage"
        >
          <template v-slot:top>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-btn
                    v-if="isSelectorMode"
                    @click="$router.push({ name: 'MarketingSegments' })"
                    color="primary"
                    outlined
                    dark
                    class="mb-2"
                    >Ver todos los segmentos</v-btn
                  >
                  <v-dialog v-model="dialog" max-width="700px">
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-if="!isSelectorMode"
                        color="primary"
                        dark
                        class="mb-2"
                        v-show="rolPermisos['Write']"
                        v-on="on"
                        >{{ $t(entity + ".NEW_ITEM") }}</v-btn
                      >
                    </template>
                    <MarketingSegmentsForm
                      :editedIndex="editedIndex"
                      :editedItem="editedItem"
                      @onClose="dialog = false"
                      @onSave="onSave"
                    ></MarketingSegmentsForm>
                  </v-dialog>
                </v-col>
              </v-row>
              <v-row>
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
              </v-row>
            </v-container>
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              class="mr-1 mb-1"
              color="primary"
              fab
              small
              dark
              @click="editItem(item)"
              v-if="rolPermisos['Edit'] && !isSelectorMode"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              v-if="!isSelectorMode"
              color="error"
              fab
              small
              dark
              @click="deleteItem(item)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
            <v-btn
              small
              outlined
              v-if="isSelectorMode"
              color="secondary"
              @click="$emit('onSelectedSegment', item)"
              >Previsualizar</v-btn
            >
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
          <template v-slot:[`item.updatedAt`]="{ item }">{{
            item.updatedAt | formatDate
          }}</template>
          <template v-slot:[`item.url`]="{ item }">
            <a :href="item.url" target="_blank"
              ><v-btn color="primary" small>Visitar</v-btn>
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
  </v-container>
</template>

<script>
//Nota: Modifica los campos de la tabla
const ENTITY = "marketingSegments"; // nombre de la entidad en minusculas (se repite en services y modules del store)
// const ITEMS_SPANISH = 'marcas';
import { format } from "date-fns";

import MaterialCard from "@/components/material/Card";
import auth from "@/services/api/auth";
import { es } from "date-fns/locale";
import MarketingSegmentsForm from "@/components/MarketingSegmentsForm.vue";

export default {
  props: {
    isSelectorMode: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    MaterialCard,
    MarketingSegmentsForm,
  },
  filters: {
    formatDate: function(value) {
      return format(
        new Date(value),
        "d 'de' MMMM 'del' yyyy 'a las' hh:mm:ss aaa",
        {
          locale: es,
        }
      );
    },
  },
  data: () => ({
    page: 1,
    pageCount: 0,
    search: "",
    dialog: false,
    [ENTITY]: [],
    advisors: [],

    menu1: false,
    menu2: false,
    rolPermisos: {},
    editedIndex: -1,
    editedItem: {
      name: "",
      description: "",
      todofullLabels: [],
      filters: {
        includeWithEmail: true,
        includeWithChats: true,
        includeWithSales: false,
        includeWithoutEmail: true,
        includeWithIDGenial: true,
        includeWithoutIDGenial: true,
        minSaleOrderCount: 0,
        minPosOrderCount: 0,
        minSalePosOrderCount: 0,
      },
      target_countries: [],
      botIds: [],
      type: "static",
    },
  }),
  computed: {
    items() {
      return this[ENTITY];
    },
    entity() {
      return ENTITY;
    },
    headers() {
      return this.isSelectorMode
        ? [
            {
              text: "Nombre",
              align: "left",
              sortable: false,
              value: "name",
            },
            { text: "Acciones", value: "action", sortable: false },
          ]
        : [
            {
              text: "Última modificación",
              align: "left",
              sortable: false,
              value: "updatedAt",
            },
            {
              text: "Nombre",
              align: "left",
              sortable: false,
              value: "name",
            },
            {
              text: "Tipo",
              align: "left",
              sortable: false,
              value: "type",
            },
            { text: "Acciones", value: "action", sortable: false },
          ];
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  async mounted() {
    this.$store.commit("loadingModule/showLoading");
    this.initialize();
    this.rolAuth();
  },
  methods: {
    rolAuth() {
      auth
        .roleAuthorization({
          id: this.$store.state.authModule.user._id,
          menu: "Configuracion/Propiedades/Mailchimp",
          model: "Credenciales",
        })
        .then((res) => {
          this.rolPermisos = res.data;
        })
        .finally(() => this.$store.commit("loadingModule/showLoading", false));
    },

    async initialize() {
      //llamada asincrona de items
      await Promise.all([this.$store.dispatch(ENTITY + "Module/list")]);
      //asignar al data del componente
      this[ENTITY] = this.$deepCopy(
        this.$store.state[ENTITY + "Module"][ENTITY]
      );
    },
    editItem(item) {
      this.editedIndex = this[ENTITY].indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    async deleteItem(item) {
      const index = this[ENTITY].indexOf(item);
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch(ENTITY + "Module/delete", item._id);
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
    onSave() {
      this.initialize();
      this.close();
    },
  },
};
</script>

<style lang="scss" scoped></style>
