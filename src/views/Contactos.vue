<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="95%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Contactos"
        text="Tabla resumen de contactos"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="contactos"
          sort-by="calories"
          @page-count="pageCount = $event"
          :page.sync="page"
          :items-per-page="$store.state.itemsPerPage"
          :options.sync="pagination"
          :server-items-length="totalItems"
        >
          <template v-slot:top>
            <v-container>
              <span class="font-weight-bold"
                >Filtrar por nombre o teléfono: {{ search }}</span
              >
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    dense
                    hide-details
                    v-model="search"
                    append-icon="search"
                    placeholder="Escribe el contacto"
                    single-line
                    outlined
                  ></v-text-field>
                  <v-combobox
                    @change="initialize(page, filters)"
                    v-model="telefonoId"
                    :items="telefonos"
                    :search-input.sync="search2"
                    hide-selected
                    item-value="_id"
                    placeholder="Selecciona el agente"
                    outlined
                    dense
                    class="mt-2"
                  >
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            No se encontraron resultados
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                    <template v-slot:selection="{ item }">
                      <span
                        >{{ item.agenteId.nombre }}
                        {{ item.agenteId.apellido }} ({{ item.numero }})</span
                      >
                    </template>
                    <template v-slot:item="{ item }">
                      <span
                        >{{ item.agenteId.nombre }}
                        {{ item.agenteId.apellido }} ({{ item.numero }})</span
                      >
                    </template>
                  </v-combobox>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ on }">
                      <v-btn color="primary" dark class="mb-2" v-on="on"
                        >Agregar contacto</v-btn
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
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">Nombres</p>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.nombre"
                                label="Nombres"
                              />
                            </v-col>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">Apellidos</p>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.apellido"
                                label="Apellidos"
                              />
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <p class="body-1 font-weight-bold">Celular</p>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.celular"
                                label="Celular"
                              />
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <p class="body-1 font-weight-bold">Teléfono</p>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.telefono"
                                label="Teléfono"
                              />
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <p class="body-1 font-weight-bold">Email</p>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.email"
                                label="Email"
                              />
                            </v-col>

                            <v-col cols="12" sm="6">
                              <span class="font-weight-bold"
                                >Teléfono de tienda</span
                              >
                              <v-select
                                hide-details
                                placeholder="Selecciona una locación"
                                outlined
                                :items="telefonos"
                                item-text="numero"
                                item-value="_id"
                                v-model="editedItem.telefonoId"
                              ></v-select>
                            </v-col>
                            <!-- <v-col cols="12" sm="12" md="12">
                            <span class="font-weight-bold">Estado</span>
                            <v-select
                              hide-details
                              v-model="editedItem.status"
                              :items="[{name:'Activo',value:true},{name:'Inactivo',value:false}]"
                              item-text="name"
                              item-value="value"
                              outlined
                            ></v-select>
                            </v-col>-->
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
              <div class="text-center pt-2">
                <v-pagination
                  v-model="page"
                  @input="initialize(page, filters)"
                  :length="totalPages"
                  total-visible="15"
                ></v-pagination>
              </div>
            </v-container>
          </template>
          <template v-slot:[`item.agente`]="{ item }">
            {{ item.telefonoId ? item.telefonoId.agenteId.nombre : " " }}
            {{ item.telefonoId ? item.telefonoId.agenteId.apellido : " " }}
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn class="mr-3" small color="secondary" @click="editItem(item)"
              >Editar</v-btn
            >
            <v-btn small color="error" @click="deleteItem(item)"
              >Eliminar</v-btn
            >
          </template>
          <template v-slot:no-data>
            <v-alert
              v-show="telefonoId && contactosReady"
              type="error"
              :value="true"
              >Este agente no cuenta con contactos</v-alert
            >
            <v-alert
              v-show="!telefonoId && !contactosReady"
              type="error"
              :value="true"
              >Por favor, selecciona algún agente</v-alert
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
              $store.state.itemsPerPage > contactos.length
                ? contactos.length
                : $store.state.itemsPerPage
            }}
            de {{ contactos.length }} registros
          </span>
        </v-col>
        <div class="text-center pt-2">
          <v-pagination
            v-model="page"
            @input="initialize(page, filters)"
            :length="totalPages"
            total-visible="15"
          ></v-pagination>
        </div>
      </material-card>
    </v-row>
  </v-container>
</template>

<script>
import { format } from "date-fns";
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import MaterialCard from "@/components/material/Card";
import Contactos from "@/classes/Contactos";
import { buildPayloadPagination } from "@/utils/utils.js";
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
    paises: ["Peru", "Chile", "Colombia"],
    itemsPerPage: 10,
    isDataReady: false,
    selectedOrder: 0,
    pagination: {},
    headers: [
      {
        text: "Nombres",
        align: "left",
        sortable: false,
        value: "nombre",
      },
      {
        text: "Apellidos",
        align: "left",
        sortable: false,
        value: "apellido",
      },
      {
        text: "Celular",
        align: "left",
        sortable: false,
        value: "celular",
      },
      {
        text: "Email",
        align: "left",
        sortable: false,
        value: "email",
      },
      {
        text: "Agente",
        align: "left",
        sortable: false,
        value: "agente",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    contactos: [],
    contactosReady: false,
    editedIndex: -1,
    editedItem: Contactos(),
    defaultItem: Contactos(),
    telefonos: [],
    search2: "",
    telefonoId: null,
    filters: {},
  }),

  computed: {
    totalItems() {
      return this.$store.state.contactosModule.totalSales;
    },
    totalPages() {
      return this.$store.state.contactosModule.totalPages;
    },
    formTitle() {
      return this.editedIndex === -1 ? "Nueva locación" : "Editar locación";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

  mounted() {
    this.initialize();
  },

  methods: {
    async initialize(currentPage, filters) {
      if (this.telefonoId) {
        console.log("el id: ", this.telefonoId._id);
        this.$store.commit("loadingModule/showLoading", true);
        currentPage = currentPage || 1;
        await Promise.all([
          this.$store.dispatch("contactosModule/list", {
            telefonoId: this.telefonoId._id,
            ...filters,
            ...buildPayloadPagination({
              page: currentPage,
              itemsPerPage: this.$store.state.itemsPerPage,
            }),
          }),
        ]);
        this.$store.commit("loadingModule/showLoading", false);

        this.contactos = this.$store.state.contactosModule.contactos;
        console.log("los contactos: ", this.contactos);
        this.contactosReady = true;
      }
      this.telefonos = this.$store.state.telefonosModule.telefonos;
    },
    editItem(item) {
      this.editedIndex = this.contactos.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    async deleteItem(item) {
      const index = this.contactos.indexOf(item);
      let itemId = this.contactos[index]._id;
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch("contactosModule/delete", itemId);
        this.contactos.splice(index, 1);
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
        let itemId = this.contactos[this.editedIndex]._id;
        try {
          await this.$store.dispatch("contactosModule/update", {
            id: itemId,
            data: this.editedItem,
          });
          Object.assign(this.contactos[this.editedIndex], this.editedItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      } else {
        //create item
        try {
          let newItem = await this.$store.dispatch(
            "contactosModule/create",
            this.editedItem
          );
          this.contactos.push(newItem);
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
