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
                    placeholder="Escribe el nombre"
                    single-line
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-dialog v-model="dialog" max-width="700px">
                    <template v-slot:activator="{ on }">
                      <v-btn color="primary" dark class="mb-2" v-show="rolPermisos['Write']" v-on="on">{{
                        $t(entity + ".NEW_ITEM")
                      }}</v-btn>
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
                            <v-col cols="12" sm="12" md="12">
                              <span class="font-weight-bold">Api Key</span>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.apiKey"
                                label="Coloca tu Api Key de Mailchimp "
                              />
                            </v-col>
                            <v-col cols="12" sm="12" md="12">
                              <span class="font-weight-bold">Servidor</span>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.server"
                                label="server. Ejemplo: us5"
                              />
                            </v-col>
                            <v-col cols="12" sm="6">
                              <span class="font-weight-bold">País</span>
                              <v-select
                                dense
                                hide-details
                                placeholder="Selecciona un país"
                                outlined
                                :items="$store.state.countries"
                                v-model="editedItem.country"
                              ></v-select>
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
          <!-- <template v-slot:[`item.action`]="{ item }">
            <v-btn
              class="mr-1 mb-1"
              color="primary"
              fab
              small
              dark
              @click="editItem(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn color="error" fab small dark @click="deleteItem(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template> -->
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
          <template v-slot:[`item.foreignLabel`]="{ item }">
            {{ item.foreignLabel }}
            <v-combobox
              item-text="nameWithCountry"
              :search-input.sync="searchLabel"
              v-model="item.foreignLabelId"
              item-value="_id"
              :items="[
                ...labelsFromTodoFull,
                ...labelsFromPeru,
                ...labelsFromChile,
              ]"
              chips
              no-data-text="No se encontraron etiquetas"
              label="Busca las etiquetas"
              @change="updateLabel(item, $event)"
            >
              <template v-slot:selection="{ attrs, select, selected }">
                <v-chip
                  v-bind="attrs"
                  :input-value="selected"
                  close
                  @click="select"
                  @click:close="removeLabel(item)"
                  color="deep-purple accent-4"
                  outlined
                >
                  <strong
                    >{{ item.foreignLabelId.name }} ({{
                      item.foreignLabelId.country
                    }})</strong
                  >
                </v-chip>
              </template>
            </v-combobox>
          </template>
          <template v-slot:[`item.country`]="{ item }">
            <span>{{ item.mailchimpId.country }}</span>
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
const ENTITY = "mailchimpTags"; // nombre de la entidad en minusculas (se repite en services y modules del store)
const CLASS_ITEMS = () =>
  import(`@/classes/${ENTITY.charAt(0).toUpperCase() + ENTITY.slice(1)}`);
// const ITEMS_SPANISH = 'marcas';
import { format } from "date-fns";
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import MaterialCard from "@/components/material/Card";
import auth from "@/services/api/auth";
import { es } from "date-fns/locale";
export default {
  components: {
    MaterialCard,
    VTextFieldWithValidation,
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
    page: 1,
    pageCount: 0,
    loadingButton: false,
    searchLabel: "",
    search: "",
    dialog: false,
    headers: [
      {
        text: "Última modificación",
        align: "left",
        sortable: false,
        value: "updatedAt",
      },
      {
        text: "ID",
        align: "left",
        sortable: false,
        value: "idMailchimpTag",
      },
      {
        text: "Nombre",
        align: "left",
        sortable: false,
        value: "name",
      },
      {
        text: "Pais",
        align: "left",
        sortable: false,
        value: "country",
      },
      {
        text: "Etiquetas Todofull",
        align: "left",
        sortable: false,
        value: "foreignLabel",
      },
    ],
    [ENTITY]: [],
    advisors: [],
    editedIndex: -1,
    editedItem: CLASS_ITEMS(),
    defaultItem: CLASS_ITEMS(),
    menu1: false,
    menu2: false,
    labels: [],
    rolPermisos: {},
  }),
  computed: {
    labelsFromTodoFull() {
      return this.labels
        .filter((el) => !el.country)
        .sort((a, b) => this.sortAlphabetically(a, b, "name"))
        .map((el) => ({ ...el, nameWithCountry: el.name }));
    },
    labelsFromPeru() {
      return this.labels
        .filter((el) => el.country === "Peru")
        .sort((a, b) => this.sortAlphabetically(a, b, "name"))
        .map((el) => ({
          ...el,
          nameWithCountry: `${el.name} (${el.country})`,
        }));
    },
    labelsFromChile() {
      return this.labels
        .filter((el) => el.country === "Chile")
        .sort((a, b) => this.sortAlphabetically(a, b, "name"))
        .map((el) => ({
          ...el,
          nameWithCountry: `${el.name} (${el.country})`,
        }));
    },
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
    this.$store.commit("loadingModule/showLoading")
    this.initialize();
    this.rolAuth(); 
  },
  methods: {
    rolAuth(){
       auth.roleAuthorization(
        {
          'id':this.$store.state.authModule.user._id, 
          'menu':'Configuracion/Propiedades/Mailchimp',
          'model':'Etiquetas',
          company: this.$store.getters["authModule/getCurrentCompany"].company._id,
        })
          .then((res) => {
          this.rolPermisos = res.data;
          }).finally(() =>
            this.$store.commit("loadingModule/showLoading", false)
          );
    },

    async initialize() {
      //llamada asincrona de items
      await Promise.all([
        this.$store.dispatch(ENTITY + "Module/list", {
          companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
        }),
        this.$store.dispatch("ecommercesCategoriesModule/list"),
        this.$store.dispatch("ecommercesTagsModule/list", {
          companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
        }),
        this.$store.dispatch("todofullLabelsModule/list"),
        this.$store.dispatch("ecommercesAttributesModule/list", {
          companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
        }),
        this.$store.dispatch("botsModule/list"),
        ]);

      //asignar al data del componente
      this[ENTITY] = this.$deepCopy(
        this.$store.state[ENTITY + "Module"][ENTITY]
      );
      // inicializando etiquetas de todofull
      this.labels = [
        ...this.$store.state.ecommercesCategoriesModule.ecommercesCategories,
        ...this.$store.state.ecommercesTagsModule.ecommercesTags,
        ...this.$store.state.todofullLabelsModule.todofullLabels,
        ...this.getAttributesWithValues(
          this.$store.state.ecommercesAttributesModule.ecommercesAttributes
        ),
      ];
      // poblando datos del label en base a id
      for (let i = 0; i < this[ENTITY].length; i++) {
        this[ENTITY][i].foreignLabelId = this.labels.find(
          (label) => label._id == this[ENTITY][i].foreignLabelId
        );
      }
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
    getAttributesWithValues(attributes) {
      let attributesWithValues = [];
      for (const attribute of attributes) {
        for (const term of attribute.terms) {
          attributesWithValues.push({
            name: attribute.name + " " + term.name,
            _id: term._id,
            country: attribute.woocommerceId.country,
            nameWithCountry:
              attribute.name +
              " " +
              term.name +
              (attribute.woocommerceId.country
                ? ` (${attribute.woocommerceId.country})`
                : ""),
            source: "EcommercesAttributes",
          });
        }
      }
      return attributesWithValues.sort((a, b) =>
        this.sortAlphabetically(a, b, "nameWithCountry")
      );
    },
    filterByCountry(facebookLabel, country) {
      return (
        this.$store.state.botsModule.bots.find(
          (bot) => bot.fanpageId === facebookLabel.fanpageId
        ).country === country
      );
    },
    sortAlphabetically(a, b, attribute) {
      var textA = a[attribute].toUpperCase();
      var textB = b[attribute].toUpperCase();
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    },
    async updateLabel(item, label) {
      this.searchLabel = "";
      await this.$store.dispatch("mailchimpTagsModule/update", {
        id: item._id,
        data: { foreignLabelId: label._id },
      });
    },
    async removeLabel(item) {
      item.foreignLabelId = null;
      await this.$store.dispatch("mailchimpTagsModule/update", {
        id: item._id,
        data: { foreignLabelId: null },
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
