<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="90%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Facebook"
        text="Resumen de Grupos"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="groups"
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
                        >Agregar grupo</v-btn
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
                              <p class="body-1 font-weight-bold">Nombre</p>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.name"
                                label="Ingresa el nombre del grupo"
                              />
                            </v-col>
                          </v-row>

                          <v-row dense class="my-2">
                            <v-col cols="12" sm="12" md="12">
                              <h3 class="mt-1">Usuarios de Telegram</h3>
                            </v-col>
                          </v-row>

                          <v-row v-for="(id, index) of editedItem.users" :key="index">
                            <v-col cols="11">
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.users[index]"
                                label="Ingresa el id de telegram"
                              />
                            </v-col>
                            <v-col class="d-flex justify-center" cols="1" v-if="index > 0">
                             <v-btn
                              icon
                              color="primary"
                              @click="removeUser(index)"
                            >
                              <v-icon>mdi-delete</v-icon>
                            </v-btn>
                            </v-col>
                          </v-row>

                          <v-row>
                            <v-col>
                              <v-btn color="primary" @click="addUser">
                                <v-icon left>mdi-plus-circle</v-icon>
                                Agregar usuario
                              </v-btn>
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
              >Aún no cuentas con grupos</v-alert
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
              $store.state.itemsPerPage > groups.length
                ? groups.length
                : $store.state.itemsPerPage
            }}
            de {{ groups.length }} registros
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
import TelegramGroups from "@/classes/TelegramGroups";
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
    groups: [],
    editedIndex: -1,
    editedItem: TelegramGroups(),
    defaultItem: TelegramGroups(),
    paises: ["Peru", "Chile", "Colombia", "Estados Unidos", "Argentina"],
    rolPermisos: {},
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo grupo" : "Editar grupo";
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
      await Promise.all([this.$store.dispatch("telegramGroupsModule/list")]);
      this.groups = this.$deepCopy(this.$store.state.telegramGroupsModule.groups);
    },
    editItem(item) {
      this.editedIndex = this.groups.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    async deleteItem(item) {
      const index = this.groups.indexOf(item);
      let itemId = this.groups[index]._id;
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch("telegramGroupsModule/delete", itemId);
        this.groups.splice(index, 1);
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
        let itemId = this.groups[this.editedIndex]._id;
        try {
          await this.$store.dispatch("telegramGroupsModule/update", {
            id: itemId,
            data: this.editedItem,
          });
          Object.assign(this.groups[this.editedIndex], this.editedItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      } else {
        //create item
        try {
          let newItem = await this.$store.dispatch(
            "telegramGroupsModule/create",
            this.editedItem
          );
          this.groups.push(newItem);
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
