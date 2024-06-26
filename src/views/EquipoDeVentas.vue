<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="700px"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Equipo de ventas"
        text="Tabla resumen de equipo de ventas"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="equipoDeVentas"
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
                    placeholder="Escribe el nombre del equipo de ventas"
                    single-line
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ on }">
                      <v-btn
                        color="primary"
                        dark
                        class="mb-2"
                        v-on="on"
                        v-show="rolPermisos['Write']"
                        >Agregar equipo de ventas</v-btn
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
                              <span class="body-1 font-weight-bold"
                                >Nombre</span
                              >
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.nombre"
                              />
                            </v-col>
                            <v-col cols="12" sm="12">
                              <span class="font-weight-bold">Descripción</span>
                              <v-textarea
                                hide-details
                                placeholder="Ingresa una descripción"
                                outlined
                                v-model="editedItem.description"
                              ></v-textarea>
                            </v-col>
                            <v-col cols="12">
                              <span class="body-1 font-weight-bold"
                                >Locaciones</span>
                              <VSelectWithValidation
                                v-model="editedItem.locations"
                                :items="locations"
                                item-text="nombre"
                                item-value="_id"
                                placeholder="Seleccionar Locaciones"
                                multiple
                                clearable
                                chips
                              />
                            </v-col>
                            <v-col cols="12">
                              <span class="body-1 font-weight-bold"
                                >Agentes</span
                              >
                              <VSelectWithValidation
                                v-model="editedItem.agents"
                                :items="agents"
                                item-text="email"
                                item-value="_id"
                                multiple
                                placeholder="Seleccionar Agentes"
                              />
                            </v-col>
                            <v-col cols="12">
                              <span class="body-1 font-weight-bold"
                                >Etiquetas Todofull para filtro Chat</span
                              >
                              <VSelectWithValidation
                                v-model="editedItem.todofullLabels"
                                :items="todofullLabels"
                                item-text="name"
                                item-value="_id"
                                multiple
                                placeholder="Seleccionar Etiquetas"
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
          <template v-slot:item.locations="{ item }">
            <span v-for="(team, index) in item.locations" :key="index">
              - {{ team.nombre }}
              <br>
            </span>
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              class="mr-3"
              small
              color="secondary"
              @click="editItem(item)"
              v-if="rolPermisos['Edit']"
              >Editar</v-btn
            >
            <v-btn
              small
              color="error"
              @click="deleteItem(item)"
              v-if="rolPermisos['Delete']"
              >Eliminar</v-btn
            >
          </template>
          <template v-slot:no-data>
            <v-alert type="error" :value="true"
              >Aún no cuentas con equipos de ventas</v-alert
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
              $store.state.itemsPerPage > equipoDeVentas.length
                ? equipoDeVentas.length
                : $store.state.itemsPerPage
            }}
            de {{ equipoDeVentas.length }} registros
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
import EquipoDeVentas from "@/classes/EquipoDeVentas";
import auth from "@/services/api/auth";
import agentsApi from "@/services/api/agentes";

export default {
  components: {
    MaterialCard,
    VTextFieldWithValidation,
    VSelectWithValidation,
  },
  filters: {
    formatDate: function (value) {
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
        value: "nombre",
      },
      {
        text: "Locaciones",
        align: "left",
        sortable: true,
        value: "locations",
      },
      {
        text: "Agregado",
        align: "left",
        sortable: true,
        value: "createdAt",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    equipoDeVentas: [],
    locations: [],
    editedIndex: -1,
    editedItem: EquipoDeVentas(),
    defaultItem: EquipoDeVentas(),
    rolPermisos: {},
    agents: [],
    todofullLabels: [],
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? "Nuevo equipo de ventas"
        : "Editar equipo de ventas";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

  async created() {
    this.$store.commit("loadingModule/showLoading");
    await Promise.all([
      this.$store.dispatch("equipoDeVentasModule/list", {
        companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
      }),
      this.$store.dispatch("todofullLabelsModule/list", {
        sort: "name",
        order: "asc",
      }),
      this.$store.dispatch("locacionesModule/list", {
        companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
      }),
    ]);
    this.initialize();
    this.rolAuth();
    agentsApi.list({
      sort: "name",
      order: "1",
      companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
    }).then((res) => {
      this.agents = res.data.payload;
    });
  },

  methods: {
    rolAuth() {
      auth
        .roleAuthorization({
          id: this.$store.state.authModule.user._id,
          menu: "Configuracion/TodoFull",
          model: "EquipodeVentas",
          company: this.$store.getters["authModule/getCurrentCompany"].company._id,
        })
        .then((res) => {
          this.rolPermisos = res.data;
        })
        .finally(() => this.$store.commit("loadingModule/showLoading", false));
    },
    initialize() {
      this.equipoDeVentas = this.$deepCopy(
        this.$store.state.equipoDeVentasModule.equipoDeVentas
      );
      this.todofullLabels = this.$deepCopy(
        this.$store.state.todofullLabelsModule.todofullLabels
      );
      this.locations = this.$deepCopy(
        this.$store.state.locacionesModule.locaciones
      );
    },
    editItem(item) {
      this.editedIndex = this.equipoDeVentas.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    async deleteItem(item) {
      const index = this.equipoDeVentas.indexOf(item);
      let itemId = this.equipoDeVentas[index]._id;
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch("equipoDeVentasModule/delete", itemId);
        this.equipoDeVentas.splice(index, 1);
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
        let itemId = this.equipoDeVentas[this.editedIndex]._id;
        try {
          const updatedItem = await this.$store.dispatch("equipoDeVentasModule/update", {
            id: itemId,
            data: this.editedItem,
          });
          Object.assign(this.equipoDeVentas[this.editedIndex], updatedItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      } else {
        //create item
        this.editedItem.company = this.$store.getters["authModule/getCurrentCompany"].company._id;
        try {
          let newItem = await this.$store.dispatch(
            "equipoDeVentasModule/create",
            this.editedItem
          );
          this.equipoDeVentas.push(newItem);
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
