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
                <v-col cols="12" sm="6"
                  ><v-btn
                    color="primary"
                    dark
                    class="mb-2"
                    v-show="rolPermisos['Write']"
                    @click.stop="dialogNewCampaign = true"
                    >Nueva campaña</v-btn
                  >
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
            <!-- <v-btn
              class="mr-1 mb-1"
              color="primary"
              fab
              small
              dark
              @click="editItem(item)"
              v-if="rolPermisos['Edit']"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn> -->
            <v-btn color="error" fab small dark @click="deleteItem(item)">
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
            <v-chip v-if="item.status == 'Enviado'" color="success"
              >Enviado</v-chip
            >
            <v-chip v-else color="warning">Pendiente</v-chip>
          </template>
          <template v-slot:[`item.scheduleDateTime`]="{ item }">
            {{ formatDate(item.scheduleDateTime) }}
          </template>
          <template v-slot:[`item.range`]="{ item }">
            {{ item.segmentCount }}
          </template>
          <template v-slot:[`item.cost`]="{ item }">
            $ {{ (item.segmentCount * 0.0757).toFixed(2) }}
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
    <v-dialog v-model="dialogNewCampaign" max-width="700px">
      <v-card>
        <MarketingCampaignsForm
          @onSave="
            dialogNewCampaign = false;
            initialize();
          "
        ></MarketingCampaignsForm>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
//Nota: Modifica los campos de la tabla
const ENTITY = "marketingCampaigns"; // nombre de la entidad en minusculas (se repite en services y modules del store)
const CLASS_ITEMS = () =>
  import(`@/classes/${ENTITY.charAt(0).toUpperCase() + ENTITY.slice(1)}`);
// const ITEMS_SPANISH = 'marcas';
import { format } from "date-fns";
import MaterialCard from "@/components/material/Card";
import auth from "@/services/api/auth";
import { es } from "date-fns/locale";
import MarketingCampaignsForm from "@/components/MarketingCampaignsForm";

export default {
  components: {
    MaterialCard,
    MarketingCampaignsForm,
  },
  filters: {
    formatDate: function (value) {
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
    dialogNewCampaign: false,
    page: 1,
    pageCount: 0,
    loadingButton: false,
    search: "",
    dialog: false,
    headers: [
      {
        text: "Nombre de la campaña",
        align: "left",
        sortable: false,
        value: "name",
      },
      {
        text: "Alcance",
        align: "left",
        sortable: false,
        value: "range",
      },
      {
        text: "Costo",
        align: "left",
        sortable: false,
        value: "cost",
      },
      {
        text: "Fecha",
        align: "left",
        sortable: false,
        value: "scheduleDateTime",
      },
      {
        text: "Estado",
        align: "left",
        sortable: false,
        value: "status",
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
      // console.log(
      //   "el resultado: ",
      //   await Promise.all([this.$store.dispatch(ENTITY + "Module/list")])
      // );
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
      let itemId = this[ENTITY][index]._id;
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch(this[ENTITY] + "Module/delete", itemId);
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
    formatDate(date) {
      try {
        let formatted = format(new Date(date), "MM/dd/yyyy 'a las' hh':'mm", {
          locale: es,
        });
        return formatted;
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
