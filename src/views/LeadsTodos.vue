<template>
  <div class="leads">
    <material-card
      width="100%"
      icon="mdi-cellphone-dock"
      color="primary"
      title="Leads"
      text="Tabla resumen de leads"
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
            <span class="font-weight-bold">Selecciona al agente</span>
            <v-row>
              <v-col cols="12" sm="6">
                <v-combobox
                  v-model="telefonoId"
                  :items="telefonos"
                  :search-input.sync="search2"
                  hide-selected
                  item-value="_id"
                  placeholder="Selecciona el agente"
                  outlined
                  dense
                  class="mt-2"
                  clearable
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
                    <span>{{ item.fullname }} ({{ item.cellphone }})</span>
                  </template>
                  <template v-slot:item="{ item }">
                    <span>{{ item.fullname }} ({{ item.cellphone }})</span>
                  </template>
                </v-combobox>
              </v-col>
            </v-row>
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
                    <v-btn
                      color="primary"
                      dark
                      class="mb-2"
                      v-on="on"
                      v-show="rolPermisos['Write']"
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
                          <v-col cols="12" sm="12">
                            <TodofullLabelsSelector
                              :initialData="initialTodofullLabels"
                              @onSelectTodofullLabels="onSelectTodofullLabels"
                            ></TodofullLabelsSelector>
                          </v-col>
                          <v-col cols="12" sm="6" md="6">
                            <p class="body-1 font-weight-bold">
                              ID de Contacto
                            </p>
                            <VTextFieldWithValidation
                              rules=""
                              v-model="editedItem.contactId"
                              label="ID de Contacto"
                            />
                          </v-col>
                          <v-col
                            cols="12"
                            sm="6"
                            md="6"
                            v-if="editedItem.labels"
                          >
                            <v-chip
                              dark
                              class="mb-1 mr-1"
                              color="pink"
                              v-for="label in editedItem.labels.reduce(
                                (unique, o) => {
                                  if (
                                    !unique.some(
                                      (obj) =>
                                        obj.label === o.label &&
                                        obj.value === o.value
                                    )
                                  ) {
                                    unique.push(o);
                                  }
                                  return unique;
                                },
                                []
                              )"
                              :key="label._id"
                            >
                              {{ label.labelId.name }}
                            </v-chip>
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
                              rules="required"
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
                            <p class="body-1 font-weight-bold">Asunto</p>
                            <VTextFieldWithValidation
                              rules=""
                              v-model="editedItem.msnActivaDefault"
                              label="Asunto"
                            />
                          </v-col>
                          <v-col
                            v-show="editedIndex > -1"
                            cols="12"
                            sm="12"
                            md="12"
                          >
                            <p class="body-1 font-weight-bold">Nota</p>
                            <v-textarea
                              label="Notas referentes a este lead..."
                              v-model="editedItem.nota"
                              outlined
                              hide-details="auto"
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
        <template v-slot:[`item.telefonoId`]="{ item }">
          <v-chip
            small
            v-show="!item.telefonoId"
            class="ma-2"
            color="red"
            text-color="white"
          >
            Sin Asignar
          </v-chip>
          <span v-show="item.telefonoId"
            >{{
              item.telefonoId && item.telefonoId.agenteId
                ? item.telefonoId.agenteId.nombre
                : " "
            }}
            {{
              item.telefonoId && item.telefonoId.agenteId
                ? item.telefonoId.agenteId.apellido
                : " "
            }}
            ({{ item.telefonoId ? item.telefonoId.numero : " " }})</span
          >
        </template>
        <template v-slot:[`item.action`]="{ item }">
          <v-btn
            class="mr-3 mb-1"
            small
            color="secondary"
            @click="editItem(item)"
            v-if="rolPermisos['Edit']"
            >Editar</v-btn
          >
          <v-btn
            class="mb-1"
            small
            color="error"
            @click="deleteItem(item)"
            v-if="rolPermisos['Delete']"
            >Eliminar</v-btn
          >
        </template>
        <template v-slot:[`item.fuente`]="{ item }">
          {{
            sourceSelectList.find((el) => el._id === item.fuente)
              ? sourceSelectList.find((el) => el._id === item.fuente).name
              : item.fuente
          }}
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
          <v-chip
            class="ma-2"
            :color="
              item.estado == 'SIN ASIGNAR'
                ? 'red'
                : item.estado == 'INFORMADO AL AGENTE'
                ? 'deep-purple accent-4'
                : item.estado == 'RE-CONECTAR'
                ? 'pink'
                : item.estado == 'CONTACTADO'
                ? 'green'
                : 'lime'
            "
            text-color="white"
          >
            {{ item.estado ? item.estado : "SIN DATOS" }}
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
import auth from "@/services/api/auth";

import { buildPayloadPagination } from "@/utils/utils.js";
import { es } from "date-fns/locale";
import TodofullLabelsSelector from "@/components/TodofullLabelsSelector.vue";
export default {
  components: {
    MaterialCard,
    VTextFieldWithValidation,
    TodofullLabelsSelector,
  },
  filters: {
    formatDate: function (value) {
      return format(new Date(value), "d 'de' MMMM 'del' yyyy", {
        locale: es,
      });
    },
    formatDateChips: function (value) {
      return format(new Date(value), "dd'-'MM'-'yyyy", {
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
    itemsPerPage: 10,
    isDataReady: false,
    selectedOrder: 0,
    pagination: {},
    headers: [
      {
        text: "Última actualización",
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
        text: "Nombre FB",
        align: "left",
        sortable: false,
        value: "appName",
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
        text: "Agente",
        align: "left",
        sortable: false,
        value: "telefonoId",
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
    fieldsToSearch: [
      "nombre",
      "apellido",
      "telefono",
      "displayName",
      "appName",
    ],
    rolPermisos: {},
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
          company: bot.company,
        })),
        ...this.$store.state.woocommercesModule.woocommerces.map(
          (woocommerce) => ({
            _id: woocommerce._id,
            name: woocommerce.domain,
            company: woocommerce.company,
          })
        ),
      ];
    },
    initialTodofullLabels() {
      return this.editedIndex === -1 ? [] : this.editedItem.todofullLabels;
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    async search() {
      clearTimeout(this.delayTimer);
      this.delayTimer = setTimeout(() => {
        this.doSearch();
      }, 400);
    },
    telefonoId() {
      this.initialize(this.buildPayloadPagination(null, this.buildSearch()));
    },
  },
  mounted() {
    this.$store.commit("loadingModule/showLoading");
    this.initialize(this.buildPayloadPagination(null, this.buildSearch()));
    this.rolAuth();
  },

  methods: {
    rolAuth() {
      auth
        .roleAuthorization({
          id: this.$store.state.authModule.user._id,
          menu: "ChatBot/Leads",
          model: "Lista-Completa",
          company: this.$store.getters["authModule/getCurrentCompany"].company._id,
        })
        .then((res) => {
          this.rolPermisos = res.data;
        })
        .finally(() => this.$store.commit("loadingModule/showLoading", false));
    },
    async initialize(paginationPayload) {
      this.$store.commit("loadingModule/showLoading", true);
      let body = {
        ...paginationPayload,
        company: this.$store.getters["authModule/getCurrentCompany"].company._id,
        sort: "updatedAt",
        order: "desc",
      };
      if (this.telefonoId) body["telefonoId"] = this.telefonoId._id;
      await Promise.all([
        this.$store.dispatch("leadsModule/list", body),
        this.$store.dispatch("telefonosModule/list", {
          companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
        }),
        this.$store.dispatch("botsModule/list", {
          companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
        }),
        this.$store.dispatch("woocommercesModule/list", {
          companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
        }),
      ]);
      this.$store.commit("loadingModule/showLoading", false);

      this.leads = this.$store.state.leadsModule.leads;
      this.leadsReady = true;
      this.telefonos = this.$store.state.telefonosModule.telefonos.map(
        (telefono) => ({
          _id: telefono._id,
          agent: `${telefono.agenteId.nombre} ${telefono.agenteId.apellido} (${telefono.numero})`,
          fullname: `${telefono.agenteId.nombre} ${telefono.agenteId.apellido}`,
          cellphone: `${telefono.numero}`,
          active: telefono.active,
        })
      );
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
    },
    async doSearch() {
      try {
        this.dataTableLoading = true;
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
      try {
        let id = this.editedItem._id;
        delete this.editedItem._id;
        delete this.editedItem.createdAt;
        delete this.editedItem.updatedAt;
        this.editedItem.estado = this.editedItem.telefonoId
          ? "RE-CONECTAR"
          : "SIN ASIGNAR";
        //ASIGNANDO PAIS POR DEFECTO
        this.editedItem.details = [{}];
        this.editedItem.pais = this.editedItem.pais || "Peru";
        let fuente = this.sourceSelectList.find(
          (el) => el._id === this.editedItem.fuente
        )
          ? this.sourceSelectList.find(
              (el) => el._id === this.editedItem.fuente
            ).name
          : this.editedItem.fuente;
        this.editedItem.details[0].fuente = this.editedItem.fuente;
        this.editedItem.details[0].appName = this.editedItem.sourceName;
        this.editedItem.details[0].contactId = this.editedItem.contactId;
        this.editedItem.details[0].fuente = this.editedItem.fuente;
        this.editedItem.details[0].labels = this.editedItem.labels;
        this.editedItem.details[0].msnActivaDefault =
          this.editedItem.msnActivaDefault;
        this.editedItem.details[0].email = this.editedItem.email;
        this.editedItem.details[0].nombre = this.editedItem.nombre;
        this.editedItem.details[0].ciudad = this.editedItem.ciudad;
        this.editedItem.details[0].asunto = this.editedItem.asunto;
        this.editedItem.details[0].nota = this.editedItem.nota;
        this.editedItem.details[0].pais =
          fuente == "www.mujeron.cl" ||
          fuente == "www.pushup.cl" ||
          fuente == "www.fajassalome.cl" ||
          fuente == "www.annchery.cl"
            ? "Chile"
            : "Peru";
        const selectedSource = this.sourceSelectList.find(source => {
          return source._id ? source._id === this.editedItem.details[0].fuente : false;
        });
        if (selectedSource) {
          this.editedItem.details[0].company = selectedSource ? selectedSource.company : null;
        }
        this.editedItem.corporation = this.$store.getters["authModule/getCurrentCompany"].company.corporation;
        console.log("CREANDO...");
        let createdItem = await this.$store.dispatch(
          "cleanLeadsModule/create",
          this.editedItem
        );
        // actualizando referencia a lead
        await this.$store.dispatch("leadsModule/update", {
          id,
          data: { cleanLeadId: createdItem._id },
        });
        //refrescar tabla
        this.initialize(this.buildPayloadPagination(null, this.buildSearch()));
        this.close();
      } finally {
        this.loadingButton = false;
        // }
      }
    },
    onSelectTodofullLabels(selectedLabels) {
      this.editedItem.todofullLabels = selectedLabels;
    },
  },
};
</script>

<style lang="scss">
.leads .text-left {
  font-size: 1em !important;
}
</style>
