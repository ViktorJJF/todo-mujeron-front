<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="99%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Variaciones"
        text="Resumen de Variaciones"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="variations"
          @page-count="pageCount = $event"
          :page.sync="page"
          :items-per-page="$store.state.itemsPerPage"
          :options.sync="pagination"
          :server-items-length="totalItems"
        >
          <template v-slot:top>
            <v-container>
              <span class="font-weight-bold"> Filtrar: {{ search }} </span>
              <v-row>
                <v-col cols="12" sm="4">
                  <v-text-field
                    hide-details
                    v-model="search"
                    append-icon="search"
                    placeholder="Escribe el texto"
                    single-line
                    outlined
                    clearable
                    @input="handleSearchUpdate"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="2">
                  <CountrySelect v-model="country" />
                </v-col>
                <v-col>
                  <v-btn color="primary" @click="handleProductsCrossover">
                    Sincronizar
                  </v-btn>
                  <div
                    class="controls-container"
                    v-if="productsCrossoverSku.length"
                  >
                    <div>
                      <v-btn
                        v-if="currentProductIndex > 0"
                        @click="
                          handleCurrentProductChange(currentProductIndex - 1)
                        "
                      >
                        Anterior
                      </v-btn>
                      <v-btn
                        v-if="
                          currentProductIndex < productsCrossoverSku.length - 1
                        "
                        class="ml-2"
                        @click="
                          handleCurrentProductChange(currentProductIndex + 1)
                        "
                      >
                        Siguiente
                      </v-btn>
                    </div>
                    <div>
                      {{ currentProductIndex + 1 }} /
                      {{ productsCrossoverSku.length }}
                    </div>
                  </div>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="2">
                  <v-checkbox
                    v-model="filterByArchived"
                    label="Archivados"
                    @change="initialize(page)"
                  />
                </v-col>
              </v-row>
              <v-row v-if="variationsSelected.length">
                <v-col>
                  <v-btn color="primary" depressed @click="batchUpdate(true)">
                    On
                  </v-btn>
                  <v-btn
                    class="ml-2"
                    color="error"
                    depressed
                    @click="batchUpdate(false)"
                  >
                    OFF
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </template>

          <template v-slot:item.checkbox="{ item }">
            <span class="format-breaklines">
              <v-checkbox
                :value="getCheckboxValue(item)"
                @change="(val) => handleCheckboxChange(val, item)"
              />
            </span>
          </template>

          <template v-slot:item.switch="{ item }">
            <span class="format-breaklines">
              <v-switch
                :input-value="item.stock > 0"
                :loading="loading.includes(item._id)"
                @change="(val) => handleSwitchChange(val, item)"
              />
            </span>
          </template>

          <template v-slot:item.source="{ item }">
            <span style="text-transform: capitalize;">
              {{ item.product ? item.product.source : '' }}
            </span>
          </template>

          <template v-slot:item.sku="{ item }">
            <a
              v-if="item.url || (item.product && item.product.url)"
              :href="item.url || item.product.url"
              target="_blank"
            >
              {{ item.sku }}
            </a>
            <span v-else>{{ item.sku }}</span>
          </template>

          <template v-slot:item.price="{ item }">
            {{ item.price | currency }}
          </template>

          <template v-slot:item.stock="{ item }">
            <v-edit-dialog
              large
              persistent
              @save="handleStockSave(item)"
              @open="currentStock = item.stock"
            >
              <div>{{ item.stock }}</div>
              <template v-slot:input>
                <div class="mt-4 text-h6">
                  Modificar Stock
                </div>
                <v-text-field
                  ref="stockTextEdit"
                  v-model="currentStock"
                  label="Edit"
                  type="number"
                  min="0"
                  :rules="stockRules"
                  single-line
                  autofocus
                ></v-text-field>
              </template>
            </v-edit-dialog>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              small
              color="secondary"
              icon
              @click="handleSyncVariation(item)"
            >
              <v-icon :class="loading.includes(item._id) ? 'loading' : ''"
                >mdi-sync</v-icon
              >
            </v-btn>
          </template>

          <template v-slot:no-data>
            <v-alert type="error" :value="true">
              Aún no cuentas con variaciones
            </v-alert>
          </template>
        </v-data-table>
        <v-col cols="12" sm="12">
          <span>
            <strong>Mostrando:</strong>
            {{
              $store.state.itemsPerPage > variations.length
                ? variations.length
                : $store.state.itemsPerPage
            }}
            de {{ variations.length }} registros
          </span>
        </v-col>
        <div class="text-center pt-2">
          <v-pagination
            @input="initialize(page)"
            v-model="page"
            :length="pageCount"
            :total-visible="$store.state.maxPaginationButtons"
          />
        </div>
      </material-card>
    </v-row>
  </v-container>
</template>

<script>
import productsApi from '@/services/api/marketplaceProducts'
import MaterialCard from '@/components/material/Card'
import CountrySelect from '@/components/CountrySelect.vue'

export default {
  components: { MaterialCard, CountrySelect },
  filters: {
    currency(val) {
      return new Intl.NumberFormat().format(val)
    },
    date(val) {
      const dateOptions = Intl.DateTimeFormat(undefined, {
        dateStyle: 'short',
        timeStyle: 'medium',
      })
      return dateOptions.format(new Date(val))
    },
  },
  data: () => ({
    page: 1,
    pageCount: 0,
    loadingButton: false,
    search: '',
    filterByArchived: false,
    debounceTimer: null,
    detailsModal: false,
    pagination: {},
    currentStock: 0,
    loading: [],
    variations: [],
    fieldsToSearch: ['externalId', 'sku'],
    variationsSelected: [],
    productsCrossoverSku: [],
    currentProductSku: null,
    currentProductIndex: null,
    country: 'Chile',
    stockRules: [
      (val) => /^[0-9]*$/.test(val) || 'Debe ser un número',
      (val) => val >= 0 || 'No puede ser negativo',
      (val) => !!val || 'El campo es requerido',
    ],
    headers: [
      {
        text: '',
        align: 'left',
        sortable: false,
        value: 'checkbox',
      },
      {
        text: '',
        align: 'left',
        sortable: false,
        value: 'switch',
      },
      {
        text: 'Identificador',
        align: 'left',
        value: 'externalId',
      },
      {
        text: 'Fuente',
        align: 'left',
        value: 'source',
      },
      {
        text: 'SKU',
        align: 'left',
        value: 'sku',
      },
      {
        text: 'Stock',
        align: 'left',
        value: 'stock',
      },
      {
        text: 'Precio',
        align: 'left',
        value: 'price',
      },
      {
        text: 'Acciones',
        value: 'actions',
      },
    ],
  }),

  computed: {
    totalItems() {
      return this.$store.state['marketplaceProductsModule'].total
    },
    totalPages() {
      return this.$store.state['marketplaceProductsModule'].totalPages
    },
  },

  mounted() {
    this.initialize()
  },

  methods: {
    async initialize(page = 1) {
      let payload = {
        page,
        search: this.search,
        fieldsToSearch: this.fieldsToSearch,
        sort: 'date_modified',
        order: -1,
      }

      if (this.filterByArchived) {
        payload.status = 'archived'
      }

      await this.$store.dispatch(
        'marketplaceProductsModule/fetchVariations',
        payload
      )
      this.variations = this.$deepCopy(
        this.$store.state.marketplaceProductsModule.variations
      )
      this.variationsSelected = []
    },
    debounce(cb, timeout = 600) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        cb()
      }, timeout)
    },
    handleSearchUpdate(value) {
      this.search = value

      this.debounce(() => this.initialize(this.page))
    },
    async handleStockSave(item) {
      if (this.$refs.stockTextEdit.valid) {
        const changes = {
          stock: this.currentStock,
        }

        await productsApi.updateVariation(item._id, changes)

        Object.assign(item, changes)
      }
    },
    async handleSwitchChange(value, item) {
      const loadingItemIndex = this.loading.indexOf(item._id)
      if (loadingItemIndex !== -1) {
        return
      }

      this.loading.push(item._id)

      const changes = {
        stock: value === true ? item.stock + 1 : 0,
      }

      await productsApi.updateVariation(item._id, changes)

      Object.assign(item, changes)

      this.loading.splice(loadingItemIndex, 1)
    },
    getCheckboxValue(item) {
      return (
        this.variationsSelected.findIndex(
          (variation) => variation._id === item._id
        ) !== -1
      )
    },
    async handleCheckboxChange(value, item) {
      if (value === true) {
        this.variationsSelected.push(item)
        return
      }

      const index = this.variationsSelected.findIndex(
        (variation) => variation._id === item._id
      )
      this.variationsSelected.splice(index, 1)
    },
    async batchUpdate(value) {
      const promises = this.variationsSelected.map(async (variation) => {
        const shouldProceed =
          value === true
            ? variation.stock === 0 // Only turn on products that are off
            : variation.stock > 0 // Only turn off products that are on

        if (!shouldProceed) {
          return
        }

        await this.handleSwitchChange(value, variation)
      })

      await Promise.allSettled(promises)
    },
    async handleProductsCrossover() {
      const isAlreadyFetched = this.productsCrossoverSku.length > 0
      if (isAlreadyFetched) {
        return this.handleSearchUpdate(this.currentProductSku)
      }

      const res = await productsApi.getProductsCrossover(this.country)
      if (res.data?.ok !== true) return
      const productsSku = res.data.payload
      this.productsCrossoverSku = productsSku
      const sku = productsSku[0]
      this.currentProductSku = sku
      this.currentProductIndex = 0
      this.handleSearchUpdate(sku)
    },
    handleCurrentProductChange(index) {
      const sku = this.productsCrossoverSku[index]
      if (sku) {
        this.currentProductIndex = index
        this.currentProductSku = sku
        this.handleSearchUpdate(sku)
      }
    },

    async handleSyncVariation(variation) {
      const isLoading = this.loading.includes(variation._id)
      if (isLoading) return

      try {
        this.loading.push(variation._id)
        const res = await productsApi.syncVariation(variation._id)
        const variationIndex = this.variations.findIndex(
          (_variation) => _variation._id == variation._id
        )
        if (variationIndex === -1) return

        const updatedVariation = res.data.payload
        if (updatedVariation.status === 'archived' && !this.filterByArchived) {
          this.variations.splice(variationIndex, 1)
        } else {
          this.variations.splice(variationIndex, 1, res.data.payload)
        }
      } catch (error) {
        console.error(error)
      } finally {
        const loadingIndex = this.loading.indexOf(variation._id)
        this.loading.splice(loadingIndex, 1)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.controls-container {
  display: inline-flex;
  flex-direction: column;
  margin-left: 8px;
  align-items: center;
}

.loading {
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
