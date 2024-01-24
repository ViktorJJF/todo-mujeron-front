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
                    placeholder="Escribe el nombre de la etiqueta"
                    single-line
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-dialog v-model="dialog" max-width="700px">
                    <template v-slot:activator="{ on }">
                      <v-btn
                        color="primary"
                        dark
                        class="mb-2"
                        v-show="rolPermisos['Write']"
                        v-on="on"
                        >{{ $t(entity + ".NEW_ITEM") }}</v-btn
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
                          <v-row dense>
                            <v-col cols="12" sm="12" md="12" class="mb-2">
                              <p class="body-1 font-weight-bold">Nombre</p>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.name"
                                label="Nombre de etiqueta todofull"
                              />
                            </v-col>
                            <v-col cols="12">
                              <span class="body-1 font-weight-bold"
                                >Compañia</span
                              >
                              <VSelectWithValidation
                                v-model="editedItem.company"
                                :items="companies"
                                item-text="name"
                                item-value="_id"
                                placeholder="Seleccionar Compañia"
                              />
                            </v-col>
                            <v-col cols="12" sm="12" md="12">
                              <v-divider
                                style="border: 1px solid #ddd"
                                class="my-3"
                              ></v-divider>
                              <p class="body-1 font-weight-bold">
                                Etiquetas relacionadas
                              </p>
                            </v-col>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">Messenger</p>
                              <v-combobox
                                item-text="nameWithFanpage"
                                v-model="editedItem.messengerTags"
                                :items="messengerTags"
                                multiple
                                chips
                                outlined
                                no-data-text="No se encontraron etiquetas"
                                label="Busca las etiquetas"
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
                                    @click:close="
                                      remove(item._id, editedItem.messengerTags)
                                    "
                                    color="deep-purple accent-4"
                                    outlined
                                  >
                                    <strong>{{ item.nameWithFanpage }}</strong>
                                  </v-chip>
                                </template>
                              </v-combobox>
                            </v-col>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">Página Web</p>
                              <v-combobox
                                item-text="nameWithCountry"
                                v-model="editedItem.webTags"
                                :items="webTags"
                                multiple
                                chips
                                outlined
                                no-data-text="No se encontraron etiquetas"
                                label="Busca las etiquetas"
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
                                    @click:close="
                                      remove(item._id, editedItem.webTags)
                                    "
                                    color="deep-purple accent-4"
                                    outlined
                                  >
                                    <strong>{{ item.nameWithCountry }}</strong>
                                  </v-chip>
                                </template>
                              </v-combobox>
                            </v-col>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">Atributos</p>
                              <v-combobox
                                item-text="nameWithCountry"
                                v-model="editedItem.attributeTags"
                                :items="attributeTags"
                                multiple
                                chips
                                outlined
                                no-data-text="No se encontraron etiquetas"
                                label="Busca las etiquetas"
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
                                    @click:close="
                                      remove(item._id, editedItem.attributeTags)
                                    "
                                    color="deep-purple accent-4"
                                    outlined
                                  >
                                    <strong>{{ item.nameWithCountry }}</strong>
                                  </v-chip>
                                </template>
                              </v-combobox>
                            </v-col>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">
                                Retail Rocket
                              </p>
                              <v-combobox
                                item-text="idTag"
                                v-model="editedItem.retailRocketTags"
                                item-value="_id"
                                :items="retailRocketTags"
                                multiple
                                chips
                                outlined
                                no-data-text="No se encontraron etiquetas"
                                label="Busca las etiquetas"
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
                                    @click:close="
                                      remove(
                                        item._id,
                                        editedItem.retailRocketTags
                                      )
                                    "
                                    color="deep-purple accent-4"
                                    outlined
                                  >
                                    <strong>{{ item.idTag }}</strong>
                                  </v-chip>
                                </template>
                              </v-combobox>
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
          <template v-slot:[`item.is_active`]="{ item }">
            <v-checkbox
              v-model="item.is_active"
              :value="item.is_active"
              @change="updateIsActive(item, $event)"
            ></v-checkbox>
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              class="mr-1 mb-1"
              color="primary"
              fab
              small
              dark
              @click="editItem(item)"
              v-if="rolPermisos['Edit']"
            >
              <v-icon>mdi-pencil</v-icon>
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
const ENTITY = "todofullLabels"; // nombre de la entidad en minusculas (se repite en services y modules del store)
const CLASS_ITEMS = () =>
  import(`@/classes/${ENTITY.charAt(0).toUpperCase() + ENTITY.slice(1)}`);
// const ITEMS_SPANISH = 'marcas';
import { format } from "date-fns";
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import VSelectWithValidation from "@/components/inputs/VSelectWithValidation";
import MaterialCard from "@/components/material/Card";
import { sortAlphabetically, getAttributesWithValues } from "@/utils/utils";
import { es } from "date-fns/locale";
import auth from "@/services/api/auth";
export default {
  components: {
    MaterialCard,
    VTextFieldWithValidation,
    VSelectWithValidation
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
        text: "Nombre",
        align: "left",
        sortable: false,
        value: "name",
      },
      {
        text: "Company",
        align: "left",
        sortable: true,
        value: "company.name",
      },
      {
        text: "¿Activo?",
        align: "left",
        sortable: false,
        value: "is_active",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    [ENTITY]: [],
    advisors: [],
    editedIndex: -1,
    editedItem: CLASS_ITEMS(),
    defaultItem: CLASS_ITEMS(),
    companies: [],
    menu1: false,
    menu2: false,
    rolPermisos: {},
    labels: [],
    messengerTags: [],
    webTags: [],
    retailRocketTags: [],
    usedTags: [],
    attributeTags: [],
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
      sort: "name",
      order: "1",
    });
    this.initialize();
    this.rolAuth();
  },
  methods: {
    rolAuth() {
      auth
        .roleAuthorization({
          id: this.$store.state.authModule.user._id,
          menu: "Configuracion/TodoFull",
          model: "TodofullLabels",
        })
        .then((res) => {
          this.rolPermisos = res.data;
        })
        .finally(() => this.$store.commit("loadingModule/showLoading", false));
    },
    async initialize() {
      //llamada asincrona de items
      await Promise.all([
        this.$store.dispatch("botsModule/list"),
        this.$store.dispatch("ecommercesCategoriesModule/list"),
        this.$store.dispatch("facebookLabelsModule/list"),
        this.$store.dispatch("retailRocketTagsModule/list"),
        this.$store.dispatch("ecommercesAttributesModule/list"),
        this.$store.dispatch("companiesModule/list"),
      ]);

      this.companies = this.$deepCopy(
        this.$store.state.companiesModule.companies
      );
      //asignar al data del componente
      this[ENTITY] = this.$deepCopy(
        this.$store.state[ENTITY + "Module"][ENTITY]
      );
      // agregando campo a etiquetas guardadas
      for (const todoFullLabel of this[ENTITY]) {
        if (todoFullLabel.messengerTags) {
          todoFullLabel.messengerTags = todoFullLabel.messengerTags.map(
            (el) => ({
              ...el,
              nameWithFanpage: `${el.name} (${
                this.$store.state.botsModule.bots.find(
                  (bot) => bot.fanpageId === el.fanpageId
                ).name
              })`,
            })
          );
        }
        if (todoFullLabel.webTags) {
          todoFullLabel.webTags = todoFullLabel.webTags.map((el) => ({
            ...el,
            nameWithCountry: `${el.name} (${el.country})`,
          }));
        }
        if (todoFullLabel.attributeTags) {
          todoFullLabel.attributeTags = getAttributesWithValues(
            this.$store.state["ecommercesAttributesModule"].ecommercesAttributes
          ).filter((el) => todoFullLabel.attributeTags.includes(el._id));
          console.log(
            "🚀 Aqui *** -> todoFullLabel.attributeTags",
            todoFullLabel.attributeTags
          );
        }
      }

      // etiquetas messenger
      this.webTags = this.$store.state[
        "ecommercesCategoriesModule"
      ].ecommercesCategories
        .map((el) => ({
          ...el,
          nameWithCountry: `${el.name} (${el.country})`,
        }))
        .sort((a, b) => sortAlphabetically(a, b, "name"));
      this.messengerTags = this.$store.state[
        "facebookLabelsModule"
      ].facebookLabels
        .filter((el) => !el.name.includes("ad_id."))
        .map((el) => ({
          ...el,
          nameWithFanpage: `${el.name} (${
            this.$store.state.botsModule.bots.find(
              (bot) => bot.fanpageId === el.fanpageId
            ).name
          })`,
        }))
        .sort((a, b) => sortAlphabetically(a, b, "name"));
      this.retailRocketTags =
        this.$store.state["retailRocketTagsModule"].retailRocketTags;
      // attriutes
      this.attributeTags = getAttributesWithValues(
        this.$store.state["ecommercesAttributesModule"].ecommercesAttributes
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
          let editedItem = this.$deepCopy(this.editedItem);
          // add corporationId
          editedItem.corporation = this.$store.state.authModule.user.corporation._id;
          // mandando solo id de tags
          editedItem.attributeTags = editedItem.attributeTags
            ? editedItem.attributeTags.map((el) => el._id)
            : [];
          editedItem.messengerTags = editedItem.messengerTags
            ? editedItem.messengerTags.map((el) => el._id)
            : [];
          editedItem.webTags = editedItem.webTags
            ? editedItem.webTags.map((el) => el._id)
            : [];
          editedItem.retailRocketTags = editedItem.retailRocketTags
            ? editedItem.retailRocketTags.map((el) => el._id)
            : [];
          await this.$store.dispatch(ENTITY + "Module/update", {
            id: itemId,
            data: editedItem,
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
    remove(itemId, labels) {
      let index = labels.findIndex((label) => label._id == itemId);
      labels.splice(index, 1);
    },
    isUsedTag(_id) {
      return this.usedTags.find((tag) => tag === _id);
    },
    updateIsActive(item, status) {
      item.is_active = !!status;
      this.$store.dispatch(ENTITY + "Module/update", {
        id: item._id,
        data: item,
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
