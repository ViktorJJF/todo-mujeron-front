<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="90%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Multi Páginas / Páginas"
        text="Resumen de Catalogs"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="catalogs"
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
                    hide-details
                    v-model="search"
                    append-icon="search"
                    placeholder="Escribe el nomb"
                    single-line
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ on }">
                      <v-btn color="primary" dark class="mb-2" v-on="on" v-show="rolPermisos['Write']"
                        >Agregar catalogo</v-btn
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
                          <v-row dense class="mb-2">
                            <v-col cols="12" sm="12" md="12">
                              <h3 class="mt-1">Datos generales</h3>
                            </v-col>
                          </v-row>

                          <v-row>
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">Nombre del Cliente</div>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.name"
                                label="Ingresa el nombre"
                              />
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">Dominio</div>
                              <VTextFieldWithValidation
                                rules=""
                                v-model="editedItem.domain"
                                label="Ingresa el dominio"
                              />
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">Facebook URL</div>
                              <VTextFieldWithValidation
                                rules=""
                                v-model="editedItem.fbPage"
                                label="Ingressa el url"
                              />
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">Instagram</div>
                              <VTextFieldWithValidation
                                rules=""
                                v-model="editedItem.instagram"
                                label="Ingressa el url"
                              />
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">Telegram</div>
                              <VTextFieldWithValidation
                                rules=""
                                v-model="editedItem.telegram"
                                label="Ingressa el contacto"
                              />
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">Contacto de whatsapp</div>
                              <VTextFieldWithValidation
                                rules=""
                                v-model="editedItem.wsPhone"
                                label="Ingressa el contacto"
                              />
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">Pais</div>
                              <v-select
                                dense
                                hide-details
                                placeholder="Seleccione un pais"
                                outlined
                                :items="paises"
                                v-model="editedItem.country"
                              ></v-select>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">Asesor Comercial</div>
                              <VTextFieldWithValidation
                                rules=""
                                v-model="editedItem.facebookUrl"
                                label="Ingressa el url"
                              />
                            </v-col>
                          </v-row>

                          <v-row dense class="my-2">
                            <v-col cols="12" sm="12" md="12">
                              <h3 class="mt-1">Personalizaciones</h3>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">Foto de portada</div>
                              <VTextFieldWithValidation
                                rules=""
                                v-model="editedItem.coverPageImage"
                                label="Ingressa el url"
                              />
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">Mensaje superior</div>
                              <VTextFieldWithValidation
                                rules=""
                                v-model="editedItem.topBannerText"
                                label="Ingresa el texto"
                              />
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">Color</div>
                              <v-menu
                                ref="menu"
                                v-model="colorPickerMenu"
                                :close-on-content-click="false"
                                transition="scale-transition"
                                offset-y
                                min-width="auto"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <VTextFieldWithValidation
                                    v-model="editedItem.mainColor"
                                    label="Selecciona un color"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                  ></VTextFieldWithValidation>
                                </template>
                                <v-color-picker
                                  v-model="editedItem.mainColor"
                                  dot-size="25"
                                  swatches-max-height="200"
                                  mode="hexa"
                                ></v-color-picker>
                              </v-menu>
                            </v-col>
                          </v-row>
                           <v-row>
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">Categorias</div>
                              <v-select
                                dense
                                hide-details
                                placeholder="Seleccione las categorias"
                                outlined
                                multiple
                                chips
                                :items="categories"
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
            </v-container>
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn class="mr-3" small color="secondary" @click="editItem(item)" v-if="rolPermisos['Edit']"
              >Editar</v-btn
            >
            <v-btn class="mr-3" small color="error" @click="deleteItem(item)" v-if="rolPermisos['Delete']" >
              Eliminar
            </v-btn>
            <v-btn
              class="mr-3"
              small
              color="info"
              target="_blank"
              :href="`/catalogo-digital/${item._id}`"
            >
              Ver
            </v-btn>
            <v-btn
              small
              :color="item.isDefault ? 'primary' : ''"
              @click="setDefault(item)"
              v-if="rolPermisos['Edit']"
            >
              Por defecto
            </v-btn>
          </template>
          <template v-slot:no-data>
            <v-alert type="error" :value="true"
              >Aún no cuentas con catalogs</v-alert
            >
          </template>
          <template v-slot:[`item.createdAt`]="{ item }">{{
            item.createdAt | formatDate
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
              $store.state.itemsPerPage > catalogs.length
                ? catalogs.length
                : $store.state.itemsPerPage
            }}
            de {{ catalogs.length }} registros
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
import { format } from "date-fns";
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import MaterialCard from "@/components/material/Card";
import Catalogs from '@/classes/Catalogs'
import CatalogsApi from '@/services/api/catalogs'
import auth from "@/services/api/auth";

export default {
  components: {
    MaterialCard,
    VTextFieldWithValidation,
  },
  filters: {
    formatDate: function(value) {
      return format(new Date(value), "dd/MM/yyyy");
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
        text: "Nombre",
        align: "left",
        sortable: false,
        value: "name",
      },
      {
        text: "Dominio",
        align: "left",
        sortable: false,
        value: "domain",
      },
      {
        text: "Última Actualización",
        align: "left",
        sortable: false,
        value: "createdAt",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    catalogs: [],
    editedIndex: -1,
    editedItem: Catalogs(),
    defaultItem: Catalogs(),
    colorPickerMenu: false,
    paises: ["Peru", "Chile", "Colombia"],
    categories: ['Fajas', 'Jeans', 'Pijamas', 'Vestuario'],
    rolPermisos: {},

  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo catalogo" : "Editar catalogo";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    }
  },

  async mounted() {
    this.$store.commit("loadingModule/showLoading");
    await this.initialize();
    this.rolAuth(); 
  },

  methods: {

    rolAuth(){
       auth.roleAuthorization(
        {
          'id':this.$store.state.authModule.user._id, 
          'menu':'MultiPaginas/Paginas',
          'model':'Paginas'
        })
          .then((res) => {
          this.rolPermisos = res.data;
          }).finally(() =>
            this.$store.commit("loadingModule/showLoading", false)
          );
    },

    async initialize() {
      await Promise.all([
        this.$store.dispatch("catalogsModule/list"),
        // this.$store.dispatch("locacionesModule/list"),
        ]);
      this.catalogs = this.$deepCopy(this.$store.state.catalogsModule.catalogs).map(c => {
        c.mainColor = c.mainColor || ''
        return c;
      });
      // this.locaciones = this.$store.state.locacionesModule.locaciones;
    },
    editItem(item) {
      this.editedIndex = this.catalogs.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    async deleteItem(item) {
      const index = this.catalogs.indexOf(item);
      let itemId = this.catalogs[index]._id;
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch("catalogsModule/delete", itemId);
        this.catalogs.splice(index, 1);
      }
    },

    async setDefault(item) {
      await CatalogsApi.setIsDefault(item._id)
      const index = this.catalogs.indexOf(item)
      this.catalogs = this.catalogs.map(c => ({...c, isDefault: false}))
      this.catalogs.splice(index, 1, {...item, isDefault: true})
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
        let itemId = this.catalogs[this.editedIndex]._id;
        try {
          await this.$store.dispatch("catalogsModule/update", {
            id: itemId,
            data: this.editedItem,
          });
          Object.assign(this.catalogs[this.editedIndex], this.editedItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      } else {
        //create item
        try {
          let newItem = await this.$store.dispatch(
            "catalogsModule/create",
            this.editedItem
          );
          this.catalogs.push(newItem);
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
