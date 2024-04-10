<template>
    <v-container>
      <v-row justify="center">
        <material-card
          width="90%"
          icon="mdi-cellphone-dock"
          color="primary"
          title="Compañias"
          text="Tabla resumen de Compañias"
        >
          <v-data-table
            no-results-text="No se encontraron resultados"
            :search="search"
            hide-default-footer
            :headers="headers"
            :items="companies"
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
                          >Agregar Compañia</v-btn
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
                          <p class="body-1 font-weight-bold mb-0">Nombre</p>
                          <VTextFieldWithValidation
                            rules="required"
                            v-model="editedItem.name"
                            label="Nombres"
                          />
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                          <p class="body-1 font-weight-bold mb-0">Alias</p>
                          <VTextFieldWithValidation
                            v-model="editedItem.alias"
                            label="Alias"
                          />
                        </v-col>
                        <v-col cols="12" sm="12">
                          <span class="font-weight-bold">Icono (url)</span>
                            <v-textarea
                              hide-details
                              placeholder="Ingresa el url del icono"
                              outlined
                              v-model="editedItem.iconUrl"
                            ></v-textarea>
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
                >Aún no cuentas con compañias</v-alert
              >
            </template>
            <template v-slot:[`item.createdAt`]="{ item }">{{
              item.createdAt | formatDate
            }}</template>
          </v-data-table>
          <v-col cols="12" sm="12">
            <span>
              <strong>Mostrando:</strong>
              {{
                $store.state.itemsPerPage > companies.length
                  ? companies.length
                  : $store.state.itemsPerPage
              }}
              de {{ companies.length }} registros
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
  import Companies from "@/classes/Companies";
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
          text: "Alias",
          align: "left",
          sortable: false,
          value: "alias",
        },
        { text: "Acciones", value: "action", sortable: false },
      ],
      companies: [],
      editedIndex: -1,
      editedItem: Companies(),
      defaultItem: Companies(),
      locaciones: [],
      rolPermisos: {},
    }),
  
    computed: {
      formTitle() {
        return this.editedIndex === -1 ? "Nueva Compañia" : "Editar Compañia";
      }
    },
  
    watch: {
      dialog(val) {
        val || this.close();
      },
    },
  
    async created() {
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
            'model':'Companies',
            company: this.$store.getters["authModule/getCurrentCompany"].company._id,
          })
            .then((res) => {
            this.rolPermisos = res.data;
            }).finally(() =>
              this.$store.commit("loadingModule/showLoading", false)
            );
      },
      initialize() {
        this.companies = this.$deepCopy(
          this.$store.state.companiesModule.companies
        );
        // this.locaciones = this.$store.state.locacionesModule.locaciones;
      },
      editItem(item) {
        this.editedIndex = this.companies.indexOf(item);
        this.editedItem = Object.assign({}, item);
        this.dialog = true;
      },
  
      async deleteItem(item) {
        const index = this.companies.indexOf(item);
        let itemId = this.companies[index]._id;
        if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
          await this.$store.dispatch("companiesModule/delete", itemId);
          this.companies.splice(index, 1);
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
          let itemId = this.companies[this.editedIndex]._id;
          try {
            await this.$store.dispatch("companiesModule/update", {
              id: itemId,
              data: this.editedItem,
            });
            Object.assign(this.companies[this.editedIndex], this.editedItem);
            this.close();
          } finally {
            this.loadingButton = false;
          }
        }
        else {
          //create item
          try {
            this.editedItem.corporation = this.$store.state.authModule.user.corporation._id;
            let newItem = await this.$store.dispatch(
              "companiesModule/create",
              this.editedItem
            );
            this.companies.push(newItem);
            console.log("newItem", newItem);
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
  