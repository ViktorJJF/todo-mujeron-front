<template>
  <div class="leads">
    <material-card
      width="100%"
      icon="mdi-cellphone-dock"
      color="primary"
      title="Leads sin asignar"
      text="Tabla resumen de leads sin asignar"
    >
      <v-data-table
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
            <span class="font-weight-bold">Selecciona la compañía</span>
            <v-row class="my-1">
              <v-col cols="12" sm="6">
                <v-sheet max-width="700">
                  <CompaniesSelector
                    :multiple="true"
                    :initial-data="[getCurrentCompany()]"
                    @onSelectedCompanies="
                      selectedCompanies = $event;
                      initialize(
                        buildPayloadPagination(
                          {
                            page: 1,
                            itemsPerPage: $store.state.itemsPerPage,
                          },
                          buildSearch()
                        )
                      );
                    "
                  ></CompaniesSelector>
                </v-sheet>
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
                  <!-- <template v-slot:activator="{ on }">
                    <v-btn color="primary" dark class="mb-2" v-on="on"  v-show="rolPermisos['Write']"
                      >Agregar lead</v-btn
                    >
                  </template> -->
                  <v-card>
                    <v-card-title>
                      <v-icon color="primary" class="mr-1">mdi-update</v-icon>
                      <span class="headline">{{ formTitle }}</span>
                    </v-card-title>
                    <v-divider></v-divider>
                    <ValidationObserver ref="obs" v-slot="{ passes }">
                      <v-container class="pa-5">
                        <v-row>
                          <v-combobox
                            item-text="name"
                            :search-input.sync="searchLabel"
                            v-model="editedItem.todofullLabels"
                            item-value="_id"
                            :items="todofullLabels"
                            multiple
                            chips
                            no-data-text="No se encontraron etiquetas"
                            label="Busca las etiquetas"
                            @change="updateLabels(editedItem)"
                          >
                            <template
                              v-slot:selection="{
                                attrs,
                                item,
                                select,
                                selected,
                              }"
                            >
                              <v-chip
                                v-bind="attrs"
                                :input-value="selected"
                                close
                                @click="select"
                                @click:close="removeLabels(editedItem, item)"
                                color="primary"
                              >
                                <strong>{{ item.name }}</strong>
                              </v-chip>
                            </template>
                          </v-combobox>
                        </v-row>
                        <v-row dense>
                          <v-col
                            v-for="detail in editedItem.details"
                            :key="detail._id"
                            cols="12"
                            sm="12"
                            md="12"
                          >
                            <div v-if="detail.labels">
                              <v-chip
                                dark
                                class="mb-1 mr-1"
                                color="pink"
                                v-for="label in detail.labels
                                  .filter((el) => el.labelId)
                                  .reduce((unique, o) => {
                                    if (
                                      !unique.some(
                                        (obj) =>
                                          obj.labelId.name === o.labelId.name
                                      )
                                    ) {
                                      unique.push(o);
                                    }
                                    return unique;
                                  }, [])"
                                :key="label._id"
                              >
                                {{ label.labelId.name }}
                              </v-chip>
                            </div>
                          </v-col>
                        </v-row>
                        <span class="font-weight-bold">Agente Asignado</span>
                        <v-row dense>
                          <v-col cols="12" sm="12">
                            <v-select
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
                              @change="generateNotes"
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
                                  {{ item.agenteId.apellido }} ({{
                                    item.numero
                                  }})</span
                                >
                              </template>
                              <template v-slot:item="{ item }">
                                <span
                                  >{{ item.agenteId.nombre }}
                                  {{ item.agenteId.apellido }} ({{
                                    item.numero
                                  }})</span
                                >
                              </template>
                            </v-select>
                          </v-col>
                          <v-col cols="12" sm="6" md="6">
                            <p class="body-1 font-weight-bold">Teléfono</p>
                            <VTextFieldWithValidation
                              rules=""
                              v-model="editedItem.telefono"
                              label="Teléfono"
                            />
                          </v-col>
                        </v-row>
                        <v-row
                          v-for="(detail, detailIndex) in editedItem.details"
                          :key="detail._id"
                        >
                          <v-col
                            v-show="editedItem.details.length > 1"
                            cols="12"
                            sm="12"
                          >
                            <div class="striped-border">
                              <p class="body-1 font-weight-bold">
                                Origen N° {{ detailIndex + 1 }}
                              </p>
                            </div>
                          </v-col>
                          <v-col cols="12" sm="6" md="6">
                            <p class="body-1 font-weight-bold">Fuente</p>
                            <v-select
                              v-model="detail.fuente"
                              :items="sourceSelectList"
                              hide-selected
                              item-value="_id"
                              item-text="name"
                              placeholder="Selecciona la fuente"
                              outlined
                              hide-details
                              dense
                              class="mt-2"
                              clearable
                            >
                            </v-select>
                          </v-col>
                          <v-col cols="12" sm="6" md="6">
                            <p class="body-1 font-weight-bold">
                              ID de Contacto
                            </p>
                            <VTextFieldWithValidation
                              rules=""
                              v-model="detail.contactId"
                              label="ID de Contacto"
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="12">
                            <p class="body-1 font-weight-bold">Nombres</p>
                            <VTextFieldWithValidation
                              rules=""
                              v-model="detail.nombre"
                              label="Nombres"
                            />
                          </v-col>
                          <v-col cols="12" sm="6" md="6">
                            <p class="body-1 font-weight-bold">Email</p>
                            <VTextFieldWithValidation
                              rules=""
                              v-model="detail.email"
                              label="Email"
                            />
                          </v-col>
                          <v-col cols="12" sm="6" md="6">
                            <p class="body-1 font-weight-bold">Ciudad</p>
                            <VTextFieldWithValidation
                              rules=""
                              v-model="detail.ciudad"
                              label="Ciudad"
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="12">
                            <p class="body-1 font-weight-bold">Asunto</p>
                            <VTextFieldWithValidation
                              rules=""
                              v-model="detail.msnActivaDefault"
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
                              v-model="detail.nota"
                              outlined
                              hide-details="auto"
                            ></v-textarea> </v-col
                        ></v-row>
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
                de {{ $store.state.cleanLeadsModule.total }} registros
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
          <v-simple-table dense class="pa-6">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">Tipo</th>
                  <th class="text-left">Fuente</th>
                  <th class="text-left">Nombre Facebook</th>
                  <th class="text-left">Nombre</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="detail in item.details" :key="detail._id">
                  <td>{{ detail.type }}</td>
                  <td>
                    {{
                      sourceSelectList.find((el) => el._id === detail.fuente)
                        ? sourceSelectList.find(
                            (el) => el._id === detail.fuente
                          ).name
                        : detail.fuente
                    }}
                  </td>
                  <td>{{ detail.appName }}</td>
                  <td>{{ detail.nombre }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </template>
        <template v-slot:[`item.action`]="{ item }">
          <v-btn
            class="mb-1 mr-2"
            small
            color="primary"
            @click="editItem(item)"
            v-if="rolPermisos['Edit']"
            >Asignar o editar</v-btn
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
        <template v-slot:no-data>
          <v-alert type="error" :value="true">Aún no cuentas con leads</v-alert>
        </template>
        <template v-slot:[`item.updatedAt`]="{ item }">{{
          item.updatedAt | formatDate
        }}</template>
        <template v-slot:[`item.status`]="{ item }">
          <v-chip v-if="item.status" color="success">Activo</v-chip>
          <v-chip v-else color="error">Inactivo</v-chip>
        </template>
        <template v-slot:[`item.estado`]="{ item }">
          <v-chip class="ma-2" color="red" text-color="white">
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
          de {{ $store.state.cleanLeadsModule.total }} registros
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
import CompaniesSelector from "@/components/CompaniesSelector.vue";
import MaterialCard from "@/components/material/Card";
import Leads from "@/classes/Leads";
import auth from "@/services/api/auth";

import {
  buildPayloadPagination,
  formatPhone,
  getCountryByPhone,
} from "@/utils/utils.js";
import { es } from "date-fns/locale";
export default {
  components: {
    MaterialCard,
    VTextFieldWithValidation,
    CompaniesSelector,
  },
  filters: {
    formatDate: function (value) {
      return format(new Date(value), "d 'de' MMMM 'del' yyyy", {
        locale: es,
      });
    },
  },
  data: () => ({
    telefonos: [],
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
        text: "Última Actualización",
        align: "left",
        sortable: false,
        value: "updatedAt",
      },
      {
        text: "Detalle del lead",
        align: "left",
        sortable: false,
        value: "fuente",
      },
      {
        text: "Teléfono",
        align: "left",
        sortable: false,
        value: "telefono",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    leads: [],
    leadsReady: false,
    editedIndex: -1,
    editedItem: Leads(),
    defaultItem: Leads(),
    search2: "",
    telefonoId: null,
    delayTimer: null,
    selectedCompanies: [],
    fieldsToSearch: ["nombre", "apellido", "telefono", "displayName"],
    rolPermisos: {},
    todofullLabels: [],
    searchLabel: "",
  }),

  computed: {
    totalItems() {
      return this.$store.state.cleanLeadsModule.total;
    },
    totalPages() {
      return this.$store.state.cleanLeadsModule.totalPages;
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
      this.delayTimer = setTimeout(() => {
        this.doSearch();
      }, 400);
    },
    telefonoId() {
      this.initialize(this.buildPayloadPagination(null, this.buildSearch()));
    },
    filterCompanies() {
      this.initialize(this.buildPayloadPagination(null, this.buildSearch()));
    },
  },
  mounted() {
    this.$store.commit("loadingModule/showLoading");
    this.selectedCompanies = [this.getCurrentCompany()];
    this.initialize(this.buildPayloadPagination(null, this.buildSearch()));
    this.rolAuth();
  },

  methods: {
    rolAuth() {
      auth
        .roleAuthorization({
          id: this.$store.state.authModule.user._id,
          menu: "ChatBot/Leads",
          model: "Sin-Asignar",
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
        sort: "updatedAt",
        order: "desc",
      };
      body["estado"] = "SIN ASIGNAR";
      if (this.telefonoId) body["telefonoId"] = this.telefonoId._id;
      if (this.selectedCompanies.length > 0) {
          body["companies"] = this.selectedCompanies.map(c => c?._id);
      }
      await Promise.all([
        this.$store.dispatch("cleanLeadsModule/list", body),
        this.$store.dispatch("telefonosModule/list"),
        this.$store.dispatch("botsModule/list"),
        this.$store.dispatch("woocommercesModule/list"),
        this.$store.dispatch("todofullLabelsModule/list", {
          sort: "name",
          order: "asc",
        }),
      ]);
      this.$store.commit("loadingModule/showLoading", false);

      this.leads = this.$store.state.cleanLeadsModule.cleanLeads;
      this.todofullLabels =
        this.$store.state.todofullLabelsModule.todofullLabels;
      this.leadsReady = true;
      this.telefonos = this.$store.state.telefonosModule.telefonos.filter(
        (telefono) => telefono.active == true
      );
      this.dataTableLoading = false;
    },
    getCurrentCompany() {
      return this.$store.getters["authModule/getCurrentCompany"].company;
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
      //agregando telefono ID si es que tiene
      this.telefonoId = item.telefonoId;
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

    async assignAgent(item) {
      console.log(item);
      // const index = this.leads.indexOf(item);
      // let itemId = this.leads[index]._id;
      // assignAgent
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
        //asignando agente si es que está seleccionado
        if (this.telefonoId) this.editedItem.telefonoId = this.telefonoId;
        let itemId = this.leads[this.editedIndex]._id;
        try {
          //agregando campo de control
          this.editedItem = { ...this.editedItem, assign: true };
          let agent = this.telefonos.find(
            (telefono) => telefono._id == this.editedItem.telefonoId
          );
          //Generando mensaje para el agente
          this.editedItem.details[0].nota = `Hola ${agent.agenteId.nombre} te hemos asignado al cliente ${this.editedItem.details[0].nombre} que nos ha dicho en el chat: ${this.editedItem.details[0].msnActivaDefault} con teléfono : ${this.editedItem.telefono}. En cuanto la contactes me informas para borrarla de los pendientes \n\nhttps://wa.me/${this.editedItem.telefono}`;
          //cambiando estado del LEAD
          this.editedItem.estado = "INFORMADO AL AGENTE";
          await this.$store.dispatch("cleanLeadsModule/update", {
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
            "cleanLeadsModule/create",
            this.editedItem
          );
          this.leads.push(newItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      }
    },
    generateNotes(telefonoId) {
      let agent = this.telefonos.find((telefono) => telefono._id == telefonoId);
      //Generando mensaje para el agente
      // buscando detail con datos:
      let detail = this.editedItem.details.find(
        (el) => el.labels && el.labels.length > 0
      );
      this.editedItem.details[0].nota = `Hola ${agent.agenteId.nombre} te hemos asignado al cliente ${this.editedItem.details[0].nombre} que nos ha dicho en el chat: ${this.editedItem.details[0].msnActivaDefault} con teléfono : ${this.editedItem.telefono}. En cuanto la contactes me informas para borrarla de los pendientes`;
      this.editedItem.details[0].nota += `\n✅ *Etiquetas: ${detail.labels
        .filter((el) => el.labelId)
        .reduce((unique, o) => {
          if (!unique.some((obj) => obj.labelId.name === o.labelId.name)) {
            unique.push(o);
          }
          return unique;
        }, [])
        .map((el) => el.labelId.name)
        .join(", ")}`;
      this.editedItem.details[0].nota += `\n\nhttps://wa.me/${formatPhone(
        this.editedItem.telefono,
        getCountryByPhone(agent.numero)
      )}`;
    },
    async deleteItem(item) {
      const index = this.leads.indexOf(item);
      let itemId = this.leads[index]._id;
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch("cleanLeadsModule/delete", itemId);
        this.leads.splice(index, 1);
      }
    },
    async updateLabels(lead) {
      lead.todofullLabels = lead.todofullLabels.filter(
        (el) => typeof el === "object"
      );
    },
    async removeLabels(lead, label) {
      lead.todofullLabels.splice(
        lead.todofullLabels.findIndex((el) => el._id === label._id),
        1
      );
    },
  },
};
</script>

<style lang="scss">
.leads .text-left {
  font-size: 1em !important;
}
</style>
