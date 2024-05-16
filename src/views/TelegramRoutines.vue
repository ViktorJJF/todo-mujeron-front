<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="90%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Telegram - Rutinas"
        text="Resumen de Rutinas"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="routines"
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
                  <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ on }">
                      <v-btn color="primary" dark class="mb-2" v-on="on" v-show="rolPermisos['Write']"
                        >Agregar rutina</v-btn
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
                              <div class="body-1 font-weight-bold">Nombre</div>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.name"
                                label="Ingresa el nombre"
                              />
                            </v-col>
                          </v-row>
                          <v-row v-if="editedItem.country.length">
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">Categoria</div>
                              <v-select
                                dense
                                hide-details
                                placeholder="Seleccione una categoria"
                                outlined
                                :items="categories"
                                item-text="name"
                                item-value="_id"
                                v-model="editedItem.category"
                              ></v-select>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">Grupo de telegram</div>
                              <v-select
                                dense
                                hide-details
                                placeholder="Seleccione un grupo"
                                outlined
                                :items="groups"
                                item-text="name"
                                item-value="_id"
                                v-model="editedItem.telegramGroup"
                              ></v-select>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">Minimo de inventario</div>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.minStock"
                                label="Ingresa el minimo de inventario"
                              />
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">Minimo de tallas</div>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.minSize"
                                label="Ingresa el minimo de tallas"
                              />
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">Dias de envío</div>
                              <v-select
                                dense
                                hide-details
                                placeholder="Seleccione los dias de envio"
                                outlined
                                multiple
                                chips
                                :items="scheduleDays"
                                v-model="editedItem.scheduleDays"
                              ></v-select>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col>
                              <div class="body-1 font-weight-bold">Hora de envío</div>
                              <v-menu
                                ref="timeMenu"
                                v-model="scheduleTimeMenu"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                :return-value.sync="editedItem.scheduleTime"
                                transition="scale-transition"
                                offset-y
                                max-width="290px"
                                min-width="290px"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <VTextFieldWithValidation
                                    rules="required"
                                    v-model="editedItem.scheduleTime"
                                    label="Seleccione la hora de envio"
                                    append-icon="mdi-clock-time-four-outline"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                  ></VTextFieldWithValidation>
                                </template>
                                  <v-time-picker
                                    v-if="scheduleTimeMenu"
                                    v-model="scheduleTime"
                                    full-width
                                    @click:minute="$refs.timeMenu.save(scheduleTime)"
                                  ></v-time-picker>
                              </v-menu>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">Cantidad de imagenes</div>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.imagesQuantity"
                                label="Ingresa la cantidad de imagenes"
                              />
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">Estado</div>
                              <v-select
                                dense
                                hide-details
                                placeholder="Seleccione un estado"
                                outlined
                                :items="status"
                                v-model="editedItem.status"
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
            <v-btn small color="error" @click="deleteItem(item)" v-if="rolPermisos['Delete']"
              >Eliminar</v-btn
            >
          </template>
          <template v-slot:no-data>
            <v-alert type="error" :value="true"
              >Aún no cuentas con rutinas</v-alert
            >
          </template>
          <template v-slot:[`item.createdAt`]="{ item }">{{
            item.createdAt | formatDate
          }}</template>
          <template v-slot:[`item.status`]="{ item }">
            <v-chip v-if="item.status==='active'" color="success">Activo</v-chip>
            <v-chip v-else color="error">Inactivo</v-chip>
          </template>
        </v-data-table>
        <v-col cols="12" sm="12">
          <span>
            <strong>Mostrando:</strong>
            {{
              $store.state.itemsPerPage > routines.length
                ? routines.length
                : $store.state.itemsPerPage
            }}
            de {{ routines.length }} registros
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
import TelegramRoutines from "@/classes/TelegramRoutines";
import auth from "@/services/api/auth";
import telegramGroupsApi from '@/services/api/telegramGroups'
import categoriesApi from '@/services/api/ecommercesCategories'

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
        text: "Última Actualización",
        align: "left",
        sortable: false,
        value: "updatedAt",
      },
      { text: 'Estado', value:'status', sortable: false },
      { text: "Acciones", value: "action", sortable: false },
    ],
    categories: [],
    routines: [],
    groups: [],
    editedIndex: -1,
    editedItem: TelegramRoutines(),
    defaultItem: TelegramRoutines(),
    scheduleTimeMenu: false,
    scheduleTime: null,
    status: [
      {text: 'Activo', value: 'active'},
      {text: 'Inactivo', value: 'inactive'}
    ],
    scheduleDays: [
      {text: 'Lunes', value: 1},
      {text: 'Martes', value: 2},
      {text: 'Miercoles', value: 3},
      {text: 'Jueves', value: 4},
      {text: 'Viernes', value: 5},
      {text: 'Sabado', value: 6},
      {text: 'Domingo', value: 0},
    ],
    rolPermisos: {},
  }),
  created() {
    telegramGroupsApi.list().then(res => {
      this.groups = res.data.payload
    })
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nueva rutina" : "Editar rutina";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    'editedItem.country': function(val) {
      if(val.length) {
        const query = {country: val}
        categoriesApi.list(query).then(res => {
          this.categories = res.data.payload
        })
      }
    }
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
          'menu':'Configuracion/Propiedades',
          'model':'Facebook',
          company: this.$store.getters["authModule/getCurrentCompany"].company._id,
        })
          .then((res) => {
          this.rolPermisos = res.data;
          }).finally(() =>
            this.$store.commit("loadingModule/showLoading", false)
          );
    },
    
    addUser() {
      this.editedItem.users.push("")
    },
    removeUser(index) {
      this.editedItem.users.splice(index, 1)
    },

    async initialize() {
      await Promise.all([this.$store.dispatch("telegramRoutinesModule/list", {
        companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
      })]);
      this.routines = this.$deepCopy(this.$store.state.telegramRoutinesModule.routines);
    },
    editItem(item) {
      this.editedIndex = this.routines.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    async deleteItem(item) {
      const index = this.routines.indexOf(item);
      let itemId = this.routines[index]._id;
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch("telegramRoutinesModule/delete", itemId);
        this.routines.splice(index, 1);
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
      console.log(this.editedItem)
      this.loadingButton = true;
      if (this.editedIndex > -1) {
        let itemId = this.routines[this.editedIndex]._id;
        try {
          await this.$store.dispatch("telegramRoutinesModule/update", {
            id: itemId,
            data: this.editedItem,
          });
          Object.assign(this.routines[this.editedIndex], this.editedItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      } else {
        //create item
        try {
          let newItem = await this.$store.dispatch(
            "telegramRoutinesModule/create",
            this.editedItem
          );
          this.routines.push(newItem);
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
