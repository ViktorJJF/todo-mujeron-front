<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="90%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Grupos"
        text="Tabla resumen de grupos"
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
                    placeholder="Escribe el nombre"
                    single-line
                    outlined
                  ></v-text-field>

                  
                </v-col>
                <v-col cols="12" sm="6">
                  <v-dialog v-model="dialog" max-width="500px" >

                    <template v-slot:activator="{ on }">
                      <v-btn  color="primary" dark class="mb-2" v-on="on" v-show="rolPermisos['Write']"
                        >Agregar grupo </v-btn
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

                            <v-col cols="12" >
                              <p class="body-1 font-weight-bold">Nombre</p>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.nombre"
                                label="Ingresa el nombre"
                              />
                            </v-col >

                            <v-col cols="12">
                              <span class="body-1 font-weight-bold"
                                >Compañia</span
                              >
                              <VSelectWithValidation
                                v-model="editedItem.company"
                                :items="companies"
                                rules="required"
                                item-text="name"
                                item-value="_id"
                                placeholder="Seleccionar Compañia"
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
            <v-btn 
            class="mr-3" 
            small color="secondary" 
            @click=" $router.push({ name: 'EditarGrupos',
                                    params: {id: item._id,},
                                  })"

            v-if="rolPermisos['Edit']"
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
import VSelectWithValidation from "@/components/inputs/VSelectWithValidation";
import MaterialCard from "@/components/material/Card";
import Groups from "@/classes/Groups";
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
    headers: [
      {
        text: "Nombres",
        align: "left",
        sortable: false,
        value: "nombre",
      },
      {
        text: "Company",
        align: "left",
        sortable: true,
        value: "company.name",
      },
      {
        text: "Agregado",
        align: "left",
        sortable: true,
        value: "createdAt",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    groups: [],
    companies: [],
    editedIndex: -1,
    editedItem: Groups(),
    defaultItem: Groups(),
    editedPermisos:{ },
    
    rolPermisos: {},

  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo grupo" : "Editar grupo";
    },
  },

  watch: {
    dialog(val) {
      this.editedPermisos = Object.assign({}, this.editedItem.permisos);
      val || this.close();
    },
  },

  async created(){
    console.log("created groups");
    await this.$store.dispatch("groupsModule/list"); 
    await this.$store.dispatch("companiesModule/list"),
    this.initialize();
  },

    mounted() {
    this.$store.commit("loadingModule/showLoading");
    this.rolAuth(); 
  },

  methods: {

    rolAuth(){

       auth.roleAuthorization(
        {
          'id':this.$store.state.authModule.user._id, 
          'menu':'Configuracion/TodoFull',
          'model':'Groups'
        })
          .then((res) => {
          this.rolPermisos = res.data;
          }).finally(() =>
            this.$store.commit("loadingModule/showLoading", false)
          );
    },

    initialize() {
      this.groups = this.$deepCopy(this.$store.state.groupsModule.groups); 
      console.log(this.groups);
      this.companies = this.$deepCopy(
        this.$store.state.companiesModule.companies
      );
    },
    async deleteItem(item) {
      const index = this.groups.indexOf(item);
      let itemId = this.groups[index]._id;
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch("groupsModule/delete", itemId);
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
        //create item
        try {
          this.editedItem.corporation = this.$store.state.authModule.user.corporation._id;
          this.editedItem.permisos =  this.editedPermisos; 
          let newItem = await this.$store.dispatch(
            "groupsModule/create",
            this.editedItem
          );
          this.groups.push(newItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      
    },
  },
};
</script>

<style lang="scss" scoped></style>
