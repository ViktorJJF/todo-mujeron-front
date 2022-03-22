<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="90%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Facebook"
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
                    placeholder="Escribe el nomb"
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
                              <div class="body-1 font-weight-bold">Grupo de telegram</div>
                              <v-select
                                dense
                                hide-details
                                placeholder="Seleccione un grupo"
                                outlined
                                :items="[]"
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
                              <div class="body-1 font-weight-bold">Cantidad de imagenes</div>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.imagesQuantity"
                                label="Ingresa la cantidad de imagenes"
                              />
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
            <v-chip v-if="item.status" color="success">Activo</v-chip>
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
        text: "Nombre Grupo",
        align: "left",
        sortable: false,
        value: "name",
      },
      {
        text: "Última Actualización",
        align: "left",
        sortable: false,
        value: "createdAt",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    routines: [],
    editedIndex: -1,
    editedItem: TelegramRoutines(),
    defaultItem: TelegramRoutines(),
    paises: ["Peru", "Chile", "Colombia", "Estados Unidos", "Argentina"],
    rolPermisos: {},
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nueva rutina" : "Editar rutina";
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
          'menu':'Configuracion/Propiedades',
          'model':'Facebook'
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
      await Promise.all([this.$store.dispatch("telegramRoutinesModule/list")]);
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
