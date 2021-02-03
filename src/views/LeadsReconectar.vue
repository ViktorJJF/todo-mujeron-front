<template>
  <div class="leads">
    <material-card
      width="100%"
      icon="mdi-cellphone-dock"
      color="primary"
      title="Leads - Re-conectar"
      text="Tabla resumen de leads Re-conectar"
    >
      <v-data-table
        dense
        calculate-widths
        :loading="dataTableLoading"
        no-results-text="No se encontraron resultados"
        hide-default-footer
        :headers="headers"
        :items="leads"
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
              >Filtrar por nombre/apellido/teléfono: {{ search }}</span
            >
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  dense
                  hide-details
                  v-model="search"
                  append-icon="search"
                  placeholder="Escribe los nombres/apellidos/telefonos del lead"
                  single-line
                  outlined
                  clearable
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-dialog v-model="dialog" max-width="900px">
                  <template v-slot:activator="{ on }">
                    <v-btn color="primary" dark class="mb-2" v-on="on"
                      >Agregar lead</v-btn
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
                            <p class="body-1 font-weight-bold">Agente</p>
                            <p>
                              {{ telefono.agenteId.nombre }}
                              {{ telefono.agenteId.apellido }} ({{
                                telefono.numero
                              }})
                            </p>
                          </v-col>
                          <v-col cols="12" sm="12" md="12">
                            <p class="body-1 font-weight-bold">Nombres</p>
                            <VTextFieldWithValidation
                              rules=""
                              v-model="editedItem.nombre"
                              label="Nombres"
                            />
                          </v-col>
                          <v-col cols="12" sm="6" md="6">
                            <p class="body-1 font-weight-bold">Teléfono</p>
                            <VTextFieldWithValidation
                              rules=""
                              v-model="editedItem.telefono"
                              label="Teléfono"
                            />
                          </v-col>
                          <v-col cols="12" sm="6" md="6">
                            <p class="body-1 font-weight-bold">Email</p>
                            <VTextFieldWithValidation
                              rules=""
                              v-model="editedItem.email"
                              label="Email"
                            />
                          </v-col>
                          <v-col cols="12" sm="6" md="6">
                            <p class="body-1 font-weight-bold">Ciudad</p>
                            <VTextFieldWithValidation
                              rules=""
                              v-model="editedItem.ciudad"
                              label="Ciudad"
                            />
                          </v-col>
                          <v-col cols="12" sm="6" md="6">
                            <p class="body-1 font-weight-bold">Fuente</p>
                            <v-select
                              v-model="editedItem.fuente"
                              :items="sourceSelectList"
                              hide-selected
                              item-value="_id"
                              item-text="name"
                              placeholder="Selecciona la fuente"
                              outlined
                              dense
                              class="mt-2"
                              clearable
                            >
                            </v-select>
                          </v-col>
                          <v-col cols="12" sm="12" md="12">
                            <p class="body-1 font-weight-bold">Nota</p>
                            <v-textarea
                              label="Notas referentes a este lead..."
                              v-model="editedItem.nota"
                              outlined
                              hide-details="auto"
                            ></v-textarea>
                          </v-col>
                          <v-col cols="12" sm="12" md="12">
                            <span class="body-1 font-weight-bold mr-3">
                              Cambiar estado a Informado al agente:
                            </span>
                            <v-switch
                              style="display:inline-block;"
                              v-model="cambiarAInformadoAgente"
                            ></v-switch>
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
            <v-col cols="12" sm="12">
              <span>
                <strong>Mostrando:</strong>
                {{
                  $store.state.itemsPerPage > leads.length
                    ? leads.length
                    : $store.state.itemsPerPage
                }}
                de {{ $store.state.leadsModule.total }} registros
              </span>
            </v-col>
            <div class="text-center pt-2">
              <v-pagination
                v-model="page"
                @input="initialize(buildPayloadPagination(page, buildSearch()))"
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
        <template v-slot:[`item.fuente`]="{ item }">
          {{
            sourceSelectList.find((el) => el._id === item.fuente)
              ? sourceSelectList.find((el) => el._id === item.fuente).name
              : item.fuente
          }}
        </template>
        <template v-slot:[`item.action`]="{ item }">
          <v-btn
            class="mr-3 mb-1"
            small
            color="secondary"
            @click="editItem(item)"
            >Editar</v-btn
          >
          <v-btn class="mb-1" small color="error" @click="deleteItem(item)"
            >Eliminar</v-btn
          >
        </template>
        <template v-slot:no-data>
          <v-alert type="error" :value="true">Aún no cuentas con leads</v-alert>
        </template>
        <template v-slot:[`item.createdAt`]="{ item }">{{
          item.createdAt | formatDate
        }}</template>
        <template v-slot:[`item.status`]="{ item }">
          <v-chip v-if="item.status" color="success">Activo</v-chip>
          <v-chip v-else color="error">Inactivo</v-chip>
        </template>
        <template v-slot:[`item.estado`]="{ item }">
          <v-chip class="ma-2" color="pink" text-color="white">
            {{ item.estado }}
          </v-chip>
        </template>
      </v-data-table>
      <v-col cols="12" sm="12">
        <span>
          <strong>Mostrando:</strong>
          {{
            $store.state.itemsPerPage > leads.length
              ? leads.length
              : $store.state.itemsPerPage
          }}
          de {{ $store.state.leadsModule.total }} registros
        </span>
      </v-col>
      <div class="text-center pt-2">
        <v-pagination
          v-model="page"
          @input="initialize(buildPayloadPagination(page, buildSearch()))"
          :length="totalPages"
          total-visible="15"
        ></v-pagination>
      </div>
    </material-card>
  </div>
</template>

<script>
import { format } from "date-fns";
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import MaterialCard from "@/components/material/Card";
import Leads from "@/classes/Leads";
import { buildPayloadPagination } from "@/utils/utils.js";
import { es } from "date-fns/locale";
export default {
  components: {
    MaterialCard,
    VTextFieldWithValidation,
  },
  filters: {
    formatDate: function(value) {
      return format(new Date(value), "d 'de' MMMM 'del' yyyy", {
        locale: es,
      });
    },
  },
  data: () => ({
    dataTableLoading: true,
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
        text: "Creado",
        align: "left",
        sortable: false,
        value: "createdAt",
      },
      {
        text: "Fuente",
        align: "left",
        sortable: false,
        value: "fuente",
      },
      {
        text: "Nombre",
        align: "left",
        sortable: false,
        value: "nombre",
      },
      {
        text: "Teléfono",
        align: "left",
        sortable: false,
        value: "telefono",
      },
      {
        text: "Estado",
        align: "left",
        sortable: false,
        value: "estado",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    leads: [],
    leadsReady: false,
    editedIndex: -1,
    editedItem: Leads(),
    defaultItem: Leads(),
    telefonos: [],
    search2: "",
    telefonoId: null,
    delayTimer: null,
    fieldsToSearch: ["nombre", "apellido", "celular", "displayName"],
    telefono: {},
    cambiarAInformadoAgente: false,
  }),

  computed: {
    totalItems() {
      return this.$store.state.leadsModule.total;
    },
    totalPages() {
      return this.$store.state.leadsModule.totalPages;
    },
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo lead" : "Editar lead";
    },
    sourceSelectList() {
      return [
        ...this.$store.state.botsModule.bots.map((bot) => ({
          _id: bot._id,
          name: bot.name,
        })),
        ...this.$store.state.woocommercesModule.woocommerces.map(
          (woocommerce) => ({
            _id: woocommerce._id,
            name: woocommerce.domain,
          })
        ),
      ];
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    async search() {
      clearTimeout(this.delayTimer);
      console.log("haciendo busqueda...: ", this.search);
      this.delayTimer = setTimeout(() => {
        this.doSearch();
      }, 400);
    },
  },

  mounted() {
    this.initialize(this.buildPayloadPagination(null, this.buildSearch()));
  },

  methods: {
    async initialize(paginationPayload) {
      this.$store.commit("loadingModule/showLoading", true);
      let body = {
        ...paginationPayload,
        sort: "createdAt",
        order: "desc",
      };
      body["estado"] = "RE-CONECTAR";
      await Promise.all([this.$store.dispatch("leadsModule/list", body)]);
      this.$store.commit("loadingModule/showLoading", false);

      this.leads = this.$store.state.leadsModule.leads;
      this.leadsReady = true;
      this.telefonos = this.$store.state.telefonosModule.telefonos;
      this.dataTableLoading = false;
    },
    buildPayloadPagination(page, searchPayload) {
      return buildPayloadPagination(
        {
          page: page || 1,
          itemsPerPage: this.$store.state.itemsPerPage,
        },
        searchPayload
      );
    },
    editItem(item) {
      this.editedIndex = this.leads.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
      //buscando agente
      this.telefono = this.telefonos.find(
        (telefono) => telefono._id == this.editedItem.telefonoId._id
      );
    },
    async doSearch() {
      try {
        this.dataTableLoading = true;
        console.log("paginando..");
        console.log(
          "el paginado: ",
          buildPayloadPagination(
            {
              page: 1,
              itemsPerPage: this.$store.state.itemsPerPage,
            },
            this.buildSearch()
          )
        );
        await this.initialize(
          buildPayloadPagination(
            {
              page: 1,
              itemsPerPage: this.$store.state.itemsPerPage,
            },
            this.buildSearch()
          )
        );
        this.dataTableLoading = false;
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        this.dataTableLoading = false;
      }
    },
    buildSearch() {
      return this.search
        ? { query: this.search, fields: this.fieldsToSearch.join(",") }
        : {};
    },

    async deleteItem(item) {
      const index = this.leads.indexOf(item);
      let itemId = this.leads[index]._id;
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch("leadsModule/delete", itemId);
        this.leads.splice(index, 1);
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
        //verificando si se cambió el estado
        if (this.cambiarAInformadoAgente)
          this.editedItem.estado = "INFORMADO AL AGENTE";
        let itemId = this.leads[this.editedIndex]._id;
        try {
          await this.$store.dispatch("leadsModule/update", {
            id: itemId,
            data: this.editedItem,
          });
          Object.assign(this.leads[this.editedIndex], this.editedItem);
          //refrescando pagina
          this.initialize(
            this.buildPayloadPagination(null, this.buildSearch())
          );
          this.close();
        } finally {
          this.loadingButton = false;
        }
      } else {
        //create item
        try {
          let newItem = await this.$store.dispatch(
            "leadsModule/create",
            this.editedItem
          );
          this.leads.push(newItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      }
    },
  },
};
</script>

<style lang="scss">
.leads .text-left {
  font-size: 1em !important;
}
</style>
