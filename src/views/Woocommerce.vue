<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="90%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Woocommerces"
        text="Tabla resumen de woocommerces"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="woocommerces"
          sort-by="calories"
          @page-count="pageCount = $event"
          :page.sync="page"
          :items-per-page="$store.state.itemsPerPage"
        >
          <template v-slot:top>
            <v-container>
              <v-row v-bind="{ align: 'end' }">
                <v-col cols="12" sm="6">
                  <span class="font-weight-bold">
                    Filtrar por nombre: {{ search }}
                  </span>
                  <v-text-field
                    dense
                    hide-details
                    v-model="search"
                    append-icon="search"
                    placeholder="Escribe el dominio"
                    single-line
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="3">
                  <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ on }">
                      <v-btn
                        color="primary"
                        dark
                        class="mb-1"
                        v-on="on"
                        v-show="rolPermisos['Write']"
                        >Agregar dominio</v-btn
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
                                ConsumerKey
                              </p>
                              <VTextFieldWithValidation
                                rules=""
                                v-model="editedItem.consumerKey"
                                label="Ingresa la llave de cliente"
                              />
                            </v-col>
                            <v-col cols="12" sm="12" md="12" class="mb-3">
                              <p class="body-1 font-weight-bold ma-0">
                                ConsumerSecret
                              </p>
                              <VTextFieldWithValidation
                                rules=""
                                v-model="editedItem.consumerSecret"
                                label="Ingresa la llave secreta"
                              />
                            </v-col>
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">
                                Vendedor
                              </div>
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
                            <v-col cols="12" sm="12" md="12">
                              <div class="body-1 font-weight-bold">
                                Localización
                              </div>
                              <v-select
                                dense
                                hide-details
                                placeholder="Seleccione localizaciones"
                                outlined
                                :items="locations"
                                v-model="editedItem.locations"
                                item-text="nombre"
                                item-value="_id"
                                multiple
                                chips
                                deletable-chips
                              ></v-select>
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
            {{ item.vendor ? getVendor(item.vendor).name : '' }}
          </template>
          <template v-slot:item.action="{ item }">
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
              >Aún no cuentas con woocommerces</v-alert
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
              $store.state.itemsPerPage > woocommerces.length
                ? woocommerces.length
                : $store.state.itemsPerPage
            }}
            de {{ woocommerces.length }} registros
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
import { format } from 'date-fns'
import VTextFieldWithValidation from '@/components/inputs/VTextFieldWithValidation'
import MaterialCard from '@/components/material/Card'
import Woocommerces from '@/classes/Woocommerces'
import { es } from 'date-fns/locale'
import auth from '@/services/api/auth'
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
      })
    },
  },
  data: () => ({
    page: 1,
    pageCount: 0,
    loadingButton: false,
    search: '',
    dialog: false,
    locations: [],
    headers: [
      {
        text: 'Agregado',
        align: 'left',
        sortable: true,
        value: 'createdAt',
      },
      {
        text: 'Dominio',
        align: 'left',
        sortable: false,
        value: 'domain',
      },
      {
        text: 'Vendedor',
        align: 'left',
        sortable: false,
        value: 'vendor',
      },
      { text: 'Acciones', value: 'action', sortable: false },
    ],
    woocommerces: [],
    editedIndex: -1,
    editedItem: Woocommerces(),
    defaultItem: Woocommerces(),
    locaciones: [],
    rolPermisos: {},
    vendors: [],
    stockBoundary: null,
    minStock: null,
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Nuevo dominio' : 'Editar dominio'
    },
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
  },

  async mounted() {
    this.$store.commit('loadingModule/showLoading')
    this.initialize()
    this.rolAuth()
  },

  methods: {
    rolAuth() {
      auth
        .roleAuthorization({
          id: this.$store.state.authModule.user._id,
          menu: 'Configuracion/Propiedades/Woocommerces',
          model: 'Woocommerces',
        })
        .then((res) => {
          this.rolPermisos = res.data
        })
        .finally(() => this.$store.commit('loadingModule/showLoading', false))
    },

    async initialize() {
      stockBoundaryApi.findByTarget('woocommerce').then((res) => {
        this.stockBoundary = res.data.payload
        if (this.stockBoundary) {
          this.minStock = this.stockBoundary.min
        }
      })

      await Promise.all([
        this.$store.dispatch('woocommercesModule/list'),
        this.$store.dispatch('locacionesModule/list'),
      ])

      this.woocommerces = this.$deepCopy(
        this.$store.state.woocommercesModule.woocommerces
      )

      // mostrar solo los que tengan value
      this.locations = this.$store.state.locacionesModule.locaciones.filter(
        (locacion) => locacion.value !== undefined
      )

      const res = await vendorsApi.list()
      this.vendors = res.data.payload
      console.log('🚀 Aqui *** -> this.vendors', this.vendors)
    },
    editItem(item) {
      this.editedIndex = this.woocommerces.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    getVendor(id) {
      console.log('🚀 Aqui *** -> id', id)
      console.log('🚀 Aqui *** -> this.vendors', this.vendors)
      return (
        this.vendors.find((vendor) => {
          return vendor._id === id
        }) || ''
      )
    },

    async deleteItem(item) {
      const index = this.woocommerces.indexOf(item)
      let itemId = this.woocommerces[index]._id
      if (await this.$confirm('¿Realmente deseas eliminar este registro?')) {
        await this.$store.dispatch('woocommercesModule/delete', itemId)
        this.woocommerces.splice(index, 1)
      }
    },

    async handleMinStockChange(value) {
      const hasChange = value !== this.stockBoundary.min
      if (!hasChange) return
      if (isNil(value) || value === '') return

      const res = await stockBoundaryApi.update({
        ...this.stockBoundary,
        min: value,
      })
      this.stockBoundary = res.data.payload
    },

    close() {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },

    async save() {
      this.loadingButton = true
      if (this.editedIndex > -1) {
        let itemId = this.woocommerces[this.editedIndex]._id
        try {
          await this.$store.dispatch('woocommercesModule/update', {
            id: itemId,
            data: this.editedItem,
          })
          Object.assign(this.woocommerces[this.editedIndex], this.editedItem)
          this.close()
        } finally {
          this.loadingButton = false
        }
      } else {
        //create item
        try {
          let newItem = await this.$store.dispatch(
            'woocommercesModule/create',
            this.editedItem
          )
          this.woocommerces.push(newItem)
          this.close()
        } finally {
          this.loadingButton = false
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
