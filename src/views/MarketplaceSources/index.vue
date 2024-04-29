<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="90%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Marketplaces"
        text="Tabla resumen de sources"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="sources"
          sort-by="calories"
          @page-count="pageCount = $event"
          :page.sync="page"
          :items-per-page="$store.state.itemsPerPage"
        >
          <template v-slot:top>
            <v-container>
              <v-row v-bind="{ align: 'end' }">
                <v-col cols="12" sm="6">
                  <span class="font-weight-bold"
                    >Filtrar por nombre: {{ search }}</span
                  >
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
                <v-col cols="12" sm="3">
                  <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ on }">
                      <v-btn color="primary" class="mb-1" dark v-on="on">
                        Agregar Marketplace
                      </v-btn>
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
                            <v-col cols="12" sm="12" md="12" class="mb-3">
                              <p class="body-1 font-weight-bold ma-0">
                                Nombre
                              </p>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.name"
                                label="Ingresa el nombre"
                              />
                            </v-col>
                            <v-col cols="12" sm="12" md="12" class="mb-3">
                              <p class="body-1 font-weight-bold ma-0">
                                Dominio
                              </p>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.domain"
                                label="Ingresa el dominio"
                              />
                            </v-col>
                            <v-col cols="12" sm="12" md="12" class="mb-3">
                              <p class="body-1 font-weight-bold ma-0">
                                Odoo Partner Id
                              </p>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.odooPartnerId"
                                label="Ingresa el numero"
                              />
                            </v-col>
                            <v-col cols="12" sm="12" md="12" class="mb-3">
                              <div class="body-1 font-weight-bold">Vendedor</div>
                              <v-select
                                dense
                                hide-details
                                placeholder="Seleccione el vendedor"
                                outlined
                                :items="vendors"
                                item-text="name"
                                item-value="_id"
                                v-model="editedItem.vendor"
                              ></v-select>
                            </v-col>
                            <v-col cols="12" sm="12" md="12" class="mb-3">
                              <div class="body-1 font-weight-bold">Localizaciones</div>
                              <v-select
                                dense
                                hide-details
                                placeholder="Seleccione localizaciones"
                                outlined
                                :items="locations"
                                v-model="editedItem.locations"
                                multiple
                                chips
                                deletable-chips
                              ></v-select>
                            </v-col>
                            <v-col cols="12" sm="12" md="12">
                              <v-checkbox
                                v-model="editedItem.hasFulfillment"
                                label="Contine fulfillment"
                              >
                              </v-checkbox>
                            </v-col>
                            <template v-if="editedItem.hasFulfillment">
                              <v-col cols="12" sm="12" md="12" class="mb-3">
                                <div class="body-1 font-weight-bold">Odoo Partner Id secundario</div>
                                <VTextFieldWithValidation
                                  rules="required"
                                  v-model="editedItem.secondaryOdooPartnerId"
                                  label="Ingresa el numero"
                                />
                              </v-col>
                              <v-col cols="12" sm="12" md="12" class="mb-3">
                                <div class="body-1 font-weight-bold">Vendedor secundario</div>
                                <v-select
                                  dense
                                  hide-details
                                  placeholder="Seleccione el vendedor"
                                  outlined
                                  :items="vendors"
                                  item-text="name"
                                  item-value="_id"
                                  v-model="editedItem.secondaryVendor"
                                ></v-select>
                              </v-col>
                              <v-col cols="12" sm="12" md="12" class="mb-3">
                                <div class="body-1 font-weight-bold">Localizaciones secundarias</div>
                                <v-select
                                  dense
                                  hide-details
                                  placeholder="Seleccione localizaciones"
                                  outlined
                                  :items="locations"
                                  v-model="editedItem.secondaryLocations"
                                  multiple
                                  chips
                                  deletable-chips
                                ></v-select>
                              </v-col>
                            </template>
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

                <v-col cols="12" sm="3" v-if="stockBoundary">
                  <span class="font-weight-bold">
                    Stock Minimo
                  </span>
                  <v-text-field
                    hide-details
                    v-model.number="minStock"
                    type="number"
                    min="0"
                    placeholder="Stock Minimo"
                    single-line
                    outlined
                    @change="handleMinStockChange"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </template>
          <template v-slot:item.vendor="{ item }">
            {{item.vendor ? getVendor(item.vendor).name : ''}}
          </template>
          <template v-slot:item.action="{ item }">
            <v-btn class="mr-3" small color="secondary" @click="editItem(item)"
              >Editar</v-btn
            >
            <v-btn small color="error" @click="deleteItem(item)"
              >Eliminar</v-btn
            >
          </template>
          <template v-slot:no-data>
            <v-alert type="error" :value="true"
              >Aún no cuentas con sources</v-alert
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
              $store.state.itemsPerPage > sources.length
                ? sources.length
                : $store.state.itemsPerPage
            }}
            de {{ sources.length }} registros
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
import Sources from "@/classes/MarketplaceSources";
import { es } from "date-fns/locale";
import vendorsApi from '@/services/api/vendors'
import stockBoundaryApi from '@/services/api/stockBoundary'
import { isNil } from 'lodash'

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
    page: 1,
    pageCount: 0,
    loadingButton: false,
    search: "",
    dialog: false,
    locations: [
      {text: '2Cara/Stock', value: 98},
      {text: 'CALID/Stock', value: 52},
      {text: 'CMCHI/Stock', value: 8},
      {text: 'CMCHI/StockFULL', value: 141},
      {text: 'CMCHI/StockFULL/FALABELLA', value: 146},
      {text: 'CMCHI/StockFULL/MERCADO LIBRE', value: 148},
      {text: 'CMCHI/StockFULL/PARIS', value: 147},
      {text: 'DEVOLUCIONES', value: 139},
      {text: 'ESTUP/Stock', value: 62},
      {text: 'MODL/Stock', value: 122},
      {text: 'Mira/Stock', value: 134},
      {text: 'NVAFI/Stock', value: 104},
      {text: 'NVAPR/Stock', value: 110},
      {text: 'STA/Stock', value: 92},
    ],
    headers: [
      {
        text: "Agregado",
        align: "left",
        sortable: true,
        value: "createdAt",
      },
      {
        text: "Nombre",
        align: "left",
        sortable: false,
        value: "name",
      },
      {
        text: "Vendedor",
        align: "left",
        sortable: false,
        value: "vendor",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    sources: [],
    editedIndex: -1,
    editedItem: Sources(),
    defaultItem: Sources(),
    locaciones: [],
    vendors: [],
    stockBoundary: null,
    minStock: null
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nueva fuente" : "Editar fuente";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

   async mounted() {
    this.initialize();
  },

  methods: {

    async initialize() {
      stockBoundaryApi.findByTarget({
        target: "marketplace",
        company: this.$store.getters["authModule/getCurrentCompany"].company._id,
      }).then(res => {
        this.stockBoundary = res.data.payload
        if (this.stockBoundary) {
          this.minStock = this.stockBoundary.min
        }
      })

      await Promise.all([
        this.$store.dispatch("marketplaceSourcesModule/list", {
          companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
        }),
        this.$store.dispatch("locacionesModule/list", {
          companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
        }),
      ]);

      this.sources = this.$deepCopy(
        this.$store.state.marketplaceSourcesModule.sources
      );
      this.locaciones = this.$store.state.locacionesModule.locaciones;

      const res = await vendorsApi.list()
      this.vendors = res.data.payload
    },
    editItem(item) {
      this.editedIndex = this.sources.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    getVendor(id) {
      return this.vendors.find(vendor => vendor._id === id) || ""
    },

    async deleteItem(item) {
      const index = this.sources.indexOf(item);
      let itemId = this.sources[index]._id;
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch("marketplaceSourcesModule/delete", itemId);
        this.sources.splice(index, 1);
      }
    },

    async handleMinStockChange(value) {
      const hasChange = value !== this.stockBoundary.min
      if (!hasChange) return
      if(isNil(value) || value === '') return

      const res = await stockBoundaryApi.update({ ...this.stockBoundary, min: value })
      this.stockBoundary = res.data.payload
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
        let itemId = this.sources[this.editedIndex]._id;
        try {
          await this.$store.dispatch("marketplaceSourcesModule/update", {
            id: itemId,
            data: this.editedItem,
          });
          Object.assign(this.sources[this.editedIndex], this.editedItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      } else {
        //create item
        this.editedItem.company = this.$store.getters["authModule/getCurrentCompany"].company._id;
        try {
          let newItem = await this.$store.dispatch(
            "marketplaceSourcesModule/create",
            this.editedItem
          );
          this.sources.push(newItem);
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
