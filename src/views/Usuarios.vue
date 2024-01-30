<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="90%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Usuarios"
        text="Tabla resumen de usuarios"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="usuarios"
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
                        >Agregar usuario</v-btn
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
                      <v-col cols="12" sm="6" md="6">
                        <p class="body-1 font-weight-bold mb-0">Nombres</p>
                        <VTextFieldWithValidation
                          rules="required"
                          v-model="editedItem.first_name"
                          label="Nombres"
                        />
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <p class="body-1 font-weight-bold mb-0">Apellidos</p>
                        <VTextFieldWithValidation
                          rules="required"
                          v-model="editedItem.last_name"
                          label="Apellidos"
                        />
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <p class="body-1 font-weight-bold mb-0">Email</p>
                        <VTextFieldWithValidation
                          rules="required"
                          v-model="editedItem.email"
                          label="Email"
                        />
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <p class="body-1 font-weight-bold mb-0">Celular</p>
                        <VTextFieldWithValidation
                          :rules="{
                            required: false,
                            decimal: true,
                          }"
                          v-model="editedItem.phone_number"
                          label="+51982745576"
                        />
                      </v-col>
                      <v-col cols="12">
                        <span class="body-1 font-weight-bold"
                          >Compañia</span>
                        <VSelectWithValidation
                          v-model="editedItem.companies"
                          :items="companies"
                          @change="updateGroupsList"
                          rules="required"
                          item-text="alias"
                          item-value="_id"
                          placeholder="Seleccionar Compañia"
                          multiple
                        />
                      </v-col>
                      <v-col cols="12">
                        <span class="body-1 font-weight-bold"
                          >Grupo</span>
                        <VSelectWithValidation
                          v-model="editedItem.roles"
                          :items="groups"
                          rules="required"
                          item-text="nombre"
                          item-value="_id"
                          placeholder="Seleccionar Grupos"
                          multiple
                        />
                      </v-col>
                      <!-- <v-col cols="12" sm="6" md="6">
                        <p class="body-1 font-weight-bold mb-0">País</p>
                        <VSelectWithValidation
                          rules=""
                          :items="countries"
                          v-model="editedItem.country"
                          label="Selecciona país"
                          itemText="name"
                          itemValue="_id"
                        />
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <p class="body-1 font-weight-bold mb-0">Ciudad</p>
                        <VSelectWithValidation
                          rules=""
                          :items="cities"
                          v-model="editedItem.city"
                          label="Selecciona una ciudad"
                          itemText="name"
                          itemValue="_id"
                        />
                      </v-col> -->

                      <v-col cols="12" sm="6" md="6" >
                        <p class="body-1 font-weight-bold mb-0">Contraseña</p>
                          <VTextFieldWithValidation
                            rules="required"
                            v-model="editedItem.password"
                            label="Contraseña"
                            type="password"
                          />
                       </v-col>

                      <v-col cols="12" sm="6" md="6" >
                        <p class="body-1 font-weight-bold mb-0">Estado</p>
                         <v-switch
                          v-model="editedItem.status"
                          inset
                          :label="status"
                        ></v-switch>
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
            <v-btn class="mr-3" small color="secondary" :to="{ name: 'UsuariosEdit',  params: {id: item._id,}, }" v-if="rolPermisos['Edit']"
              >Editar</v-btn
            >
            <v-btn small color="error" @click="deleteItem(item)" v-if="rolPermisos['Delete']"
              >Eliminar</v-btn
            >
          </template>
          <template v-slot:no-data>
            <v-alert type="error" :value="true"
              >Aún no cuentas con usuarios</v-alert
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
              $store.state.itemsPerPage > usuarios.length
                ? usuarios.length
                : $store.state.itemsPerPage
            }}
            de {{ usuarios.length }} registros
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
import VSelectWithValidation from "@/components/inputs/VSelectWithValidation.vue";
import MaterialCard from "@/components/material/Card";
import Usuarios from "@/classes/Users";
import auth from "@/services/api/auth";
export default {
  components: {
    MaterialCard,
    VTextFieldWithValidation,
    VSelectWithValidation
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
    paises: ["Peru", "Chile", "Colombia"],
    headers: [
      {
        text: "Nombres",
        align: "left",
        sortable: false,
        value: "first_name",
      },
      {
        text: "Apellidos",
        align: "left",
        sortable: false,
        value: "last_name",
      },
      {
        text: "Email",
        align: "left",
        sortable: true,
        value: "email",
      },
      {
        text: "Companies",
        align: "left",
        sortable: true,
        value: "companies",
      },
      {
        text: "Estado",
        align: "left",
        sortable: true,
        value: "status",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    usuarios: [],
    companies: [],
    selectedGroup: "",
    groups: [],
    editedIndex: -1,
    editedItem: Usuarios(),
    defaultItem: Usuarios(),
    locaciones: [],
    rolPermisos: {},
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo usuarios" : "Editar usuario";
    },
      countries() {
      return this.$store.state.countries;
    },
    cities() {
      return this.$store.state.cities;
    },

  },

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

   async created(){
    await this.$store.dispatch("usersModule/list");
    await this.$store.dispatch("companiesModule/list"),

    this.initialize();
  },

    mounted() {
    this.$store.commit("loadingModule/showLoading");
    this.rolAuth(); 
  },


  methods: {
    async updateGroupsList() {
      this.groups = [];
      if (this.editedItem.companies.length) {
        await this.$store.dispatch("groupsModule/list", { companies: this.editedItem.companies });
        this.groups = this.$deepCopy(this.$store.state.groupsModule.groups); 
      }
    },
     rolAuth(){
      auth.roleAuthorization(
        {
          'id':this.$store.state.authModule.user._id, 
          'menu':'Configuracion/TodoFull',
          'model':'Usuarios'
        })
          .then((res) => {
          this.rolPermisos = res.data;
          }).finally(() =>
            this.$store.commit("loadingModule/showLoading", false)
          );
    },
    initialize() {
      this.usuarios = this.$deepCopy(this.$store.state.usersModule.users);
      this.companies = this.$deepCopy(
        this.$store.state.companiesModule.companies
      );
      // this.locaciones = this.$store.state.locacionesModule.locaciones;
    },
    editItem(item) {
      this.editedIndex = this.usuarios.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    async deleteItem(item) {
      const index = this.usuarios.indexOf(item);
      let itemId = this.usuarios[index]._id;
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch("usersModule/delete", itemId);
        this.usuarios.splice(index, 1);
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
        //create item
        try {
          this.editedItem.corporation = this.$store.state.authModule.user.corporation._id;
          let newItem = await this.$store.dispatch(
            "usersModule/create",
            this.editedItem
          );
          this.usuarios.push(newItem);
          console.log("newItem", newItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      
    },
  },
  


};
</script>

<style lang="scss" scoped></style>
