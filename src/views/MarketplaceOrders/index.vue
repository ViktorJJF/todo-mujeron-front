<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="99%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Ordenes"
        text="Resumen de Orders"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          hide-default-footer
          :headers="headers"
          :items="dataTableSoure"
          @page-count="pageCount = $event"
          @update:sort-by="handleSortByChange"
          @update:sort-desc="handleSortDescChange"
          :page.sync="page"
          :items-per-page="$store.state.itemsPerPage"
          :options.sync="pagination"
          :server-items-length="totalItems"
        >
          <template v-slot:top>
            <v-container>
              <span class="font-weight-bold">
                Filtrar por nombre: {{ search }}
              </span>
              <v-row>
                <v-col cols="12" sm="5">
                  <v-text-field
                    hide-details
                    v-model="search"
                    append-icon="search"
                    placeholder="Escribe el texto"
                    single-line
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-select
                    hide-details
                    v-model="selectedSources"
                    @input="initialize"
                    placeholder="Filtrar por fuente"
                    :items="sources"
                    single-line
                    clearable
                    deletable-chips
                    outlined
                    multiple
                    chips
                  >
                  </v-select>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-select
                    hide-details
                    v-model="selectedStatus"
                    @input="initialize"
                    placeholder="Filtrar por estado"
                    :items="status"
                    single-line
                    clearable
                    deletable-chips
                    outlined
                    multiple
                    chips
                  >
                  </v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="4">
                  <span class="font-weight-bold">
                    Filtrar por fulfillment
                  </span>
                  <div class="d-flex">
                    <v-checkbox
                      @change="initialize"
                      v-model="fulfillmentFilter"
                      label="Con Fulfillment"
                      :value="true"
                    >
                    </v-checkbox>
                    <v-checkbox
                      @change="initialize"
                      class="ml-5"
                      v-model="fulfillmentFilter"
                      label="Sin Fulfillment"
                      :value="false"
                    >
                    </v-checkbox>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </template>

          <template v-slot:item.externalNumber="{ item }">
            {{ item.externalNumber || item.packId || item.externalId }}
          </template>

          <template v-slot:item.odooOrderName="{ item }">
            <div v-if="item.odooOrderName">
              <a
                class="text-link"
                target="_blank"
                :href="getSaleOrderLink(item.odooOrderId)"
              >
                {{ item.odooOrderName }}
              </a>
            </div>
            <div v-else>
              <div class="d-flex justify-center">
                <v-btn icon @click="handleGenialRetry(item)">
                  <v-icon>mdi-cached</v-icon>
                </v-btn>
                <v-tooltip
                  v-if="!item.odooOrderName && item.lastOdooError"
                  bottom
                  color="error"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon color="error" v-bind="attrs" v-on="on">
                      <v-icon>mdi-alert-circle-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ item.lastOdooError }}</span>
                </v-tooltip>
              </div>
            </div>
          </template>

          <template v-slot:item.customer="{ item }">
            <div v-if="item.customer" class="text-capitalize">
              {{ item.customer.firstname }} {{ item.customer.lastname }}
            </div>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip dark color="success">
              {{ item.status }}
            </v-chip>
          </template>

          <template v-slot:item.source="{ item }">
            <span style="text-transform: capitalize">
              {{ item.source }}
            </span>
          </template>

          <template v-slot:item.total="{ item }">
            {{ item.total | currency }}
          </template>

          <template v-slot:item.fulfillment="{ item }">
            <div
              style="font-size: 30px; color: green"
              v-if="item.isFulfillment"
            >
              ✓
            </div>
          </template>

          <template v-slot:item.action="{ item }">
            <div class="d-flex">
              <v-btn small color="secondary" @click="openDetails(item)">
                Detalles
              </v-btn>
              <v-btn
                class="ml-3"
                v-if="pdfButtonVisible(item)"
                small
                color="secondary"
                @click="getPdf(item)"
              >
                Guía Pdf
              </v-btn>
            </div>
          </template>

          <template v-slot:item.updatedAt="{ item }">
            {{ item.updatedAt }}
          </template>
          <template v-slot:no-data>
            <v-alert type="error" :value="true">
              Aún no cuentas con ordenes
            </v-alert>
          </template>
        </v-data-table>
        <v-col cols="12" sm="12">
          <span>
            <strong>Mostrando:</strong>
            {{
              $store.state.itemsPerPage > orders.length
                ? orders.length
                : $store.state.itemsPerPage
            }}
            de {{ $store.state.marketplaceOrdersModule.total }} registros
          </span>
        </v-col>
        <div class="text-center pt-2">
          <v-pagination
            @input="initialize(page)"
            v-model="page"
            :length="pageCount"
            :total-visible="$store.state.maxPaginationButtons"
          ></v-pagination>
        </div>
      </material-card>
    </v-row>
    <v-dialog v-model="detailsModal" width="800">
      <order-details :order="currentOrder" />
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios'
import MaterialCard from '@/components/material/Card'
import OrderDetails from './Details.vue'
import marketplaceOrdersApi from '@/services/api/marketplaceOrders'
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib'

const SellerCenterSources = ['dafiti', 'falabella']
const DafitiYSpace = 20

export default {
  components: {
    MaterialCard,
    OrderDetails,
  },
  filters: {
    currency(val) {
      return new Intl.NumberFormat().format(val)
    },
  },
  data: () => ({
    page: 1,
    pageCount: 0,
    pagination: {},
    sort: {
      field: 'updatedAt',
      order: 'desc',
    },
    loadingButton: false,
    sources: [
      { text: 'Dafiti', value: 'dafiti' },
      { text: 'Falabella', value: 'falabella' },
      { text: 'Mercadolibre', value: 'mercadolibre' },
      { text: 'Ripley', value: 'ripley' },
    ],
    status: [
      { text: 'Entregado', value: 'delivered' },
      { text: 'No entregado', value: 'not_delivered' },
      { text: 'Pagado', value: 'paid' },
      { text: 'Enviado', value: 'shipped' },
      { text: 'Listo para enviar', value: 'ready_to_ship' },
      { text: 'Devuelto', value: 'returned' },
      { text: 'Cerrado', value: 'CLOSED' },
      { text: 'Cancelado', value: 'CANCELED' },
      { text: 'Recibido', value: 'RECEIVED' },
    ],
    fieldsToSearch: [
      'odooOrderName',
      'source',
      'status',
      'price',
      'customer.firstname',
      'customer.lastname',
    ],
    selectedSources: [],
    selectedStatus: [],
    fulfillmentFilter: [],
    search: '',
    headers: [
      {
        text: 'Última Actualización',
        align: 'left',
        sortable: true,
        value: 'updatedAt',
      },
      {
        text: 'N°Orden',
        value: 'externalNumber',
      },
      {
        text: 'Genial',
        value: 'odooOrderName',
        align: 'center',
        sortable: true,
      },
      {
        text: 'Fuente',
        value: 'source',
      },
      {
        text: 'Estado',
        align: 'left',
        sortable: true,
        value: 'status',
      },
      {
        text: 'Cliente',
        value: 'customer',
      },
      {
        text: 'Artículos',
        align: 'center',
        sortable: false,
        value: 'itemsCount',
      },
      {
        text: 'Total',
        align: 'left',
        sortable: false,
        value: 'total',
      },
      {
        text: 'Fulfillment',
        align: 'center',
        sortable: false,
        value: 'fulfillment',
      },

      { text: 'Acciones', value: 'action', sortable: false },
    ],
    detailsModal: false,
    orders: [],
    currentOrder: null,
    delayTimer: null,
  }),

  computed: {
    totalItems() {
      return this.$store.state['marketplaceOrdersModule'].total
    },
    dataTableSoure() {
      let orders = this.orders

      if (this.selectedSources.length) {
        orders = orders.filter((order) =>
          this.selectedSources.includes(order.source)
        )
      }

      if (this.selectedStatus.length) {
        orders = orders.filter((order) =>
          this.selectedStatus.includes(order.status)
        )
      }

      if (this.fulfillmentFilter.length) {
        orders = orders.filter((order) =>
          this.fulfillmentFilter.includes(order.isFulfillment)
        )
      }

      return orders
    },
  },

  mounted() {
    this.initialize()
  },

  methods: {
    async initialize(page = 1) {
      let body = {
        page,
        search: this.search,
        fieldsToSearch: this.fieldsToSearch,
        sort: this.sort.field,
        order: this.sort.order,
        catalog: this.$route.params.id,
      }
      if (this.selectedSources.length) {
        body.sources = this.selectedSources
      }
      if (this.selectedStatus.length) {
        body.status = this.selectedStatus
      }
      if (this.fulfillmentFilter.length) {
        body.fulfillment = this.fulfillmentFilter
      }
      body.companies = [this.$store.getters["authModule/getCurrentCompany"].company._id];
      this.orders = await this.$store.dispatch(
        'marketplaceOrdersModule/list',
        body
      )
      this.locaciones = this.$store.state.locacionesModule.locaciones
    },

    handleSortByChange(data) {
      this.sort.field = data[0]
    },
    handleSortDescChange(data) {
      this.sort.order = data[0] === true ? 'desc' : 'asc'
    },

    close() {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },

    openDetails(order) {
      this.currentOrder = order
      this.detailsModal = true
    },

    async handleGenialRetry(order) {
      const res = await marketplaceOrdersApi.genialRetry(order._id)

      const successful = res.ok === true

      const lastOdooError = !successful
        ? res.error.data?.message ??
          res.error.message ??
          'Unknown error occurred'
        : undefined

      Object.assign(order, {
        odooOrderId: successful ? res.payload.order_new_id : undefined,
        odooOrderName: successful ? res.payload.order_new_name : undefined,
        lastOdooError: lastOdooError,
      })

      let index = this.orders.findIndex((o) => o._id === order._id)

      this.orders.splice(index, 1, order)
    },

    async formatPdf(pdfBytes, order) {
      let itemsRes = await marketplaceOrdersApi.listItems(order._id)
      const items = itemsRes.data.payload

      const pdfDoc = await PDFDocument.load(pdfBytes)

      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

      // Get the first page of the document
      const pages = pdfDoc.getPages()
      const firstPage = pages[0]

      if (order.source === 'mercadolibre') {
        pdfDoc.removePage(1)
      }

      // Get the width and height of the first page
      const { height } = firstPage.getSize()

      if (order.source === 'mercadolibre') {
        firstPage.drawText(order.odooOrderName || '********', {
          x: 298,
          y: 125,
          size: 7,
          font: helveticaFont,
          color: rgb(0, 0, 0),
          rotate: degrees(90),
        })
      }

      if (order.source === 'falabella') {
        firstPage.drawText(order.odooOrderName || '********', {
          x: 244,
          y: 467,
          size: 8,
          font: helveticaFont,
          color: rgb(0, 0, 0),
          rotate: degrees(90),
        })
      }

      for (const [index, item] of items.entries()) {
        const price = new Intl.NumberFormat().format(item.price)

        if (order.source === 'dafiti') {
          const text = order.odooOrderName
            ? `${order.odooOrderName} \t ${item.sku} \t ${price}`
            : `${item.sku} \t ${price}`

          const baseTextYPosition = height / 2 - 10 * index

          const textYPosition = baseTextYPosition + DafitiYSpace

          firstPage.drawText(text, {
            x: order.odooOrderName ? 90 : 105,
            y: textYPosition,
            size: 8,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          })
        }

        if (order.source === 'mercadolibre') {
          const text = `${item.sku}   ${price}`

          firstPage.drawText(text, {
            x: 298,
            y: 158 + 75 * index,
            size: 7,
            font: helveticaFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90),
          })
        }

        if (order.source === 'falabella') {
          const deliveryPrice =
            order.deliveryPrice > 0
              ? new Intl.NumberFormat().format(order.deliveryPrice)
              : undefined

          const text = deliveryPrice
            ? `${item.sku}   ${price}    Envio: ${deliveryPrice}`
            : `${item.sku}   ${price}`

          firstPage.drawText(text, {
            x: 244,
            y: 500 + (deliveryPrice ? 130 : 75) * index,
            size: 8,
            font: helveticaFont,
            color: rgb(0, 0, 0),
            rotate: degrees(90),
          })
        }
      }

      // Serialize the PDFDocument to bytes (a Uint8Array)
      return pdfDoc.save()
    },

    async getPdf(order) {
      let pdfBytes

      if (SellerCenterSources.includes(order.source)) {
        pdfBytes = await this.getSellerCenterPdf(order)
      }

      if (order.source === 'mercadolibre' && order.shipmentLabelPath) {
        pdfBytes = await this.getMercadolibrePdf(order)
      }

      if (!pdfBytes) {
        return
      }

      const isFormatted =
        order.source === 'mercadolibre' && order.externalId >= 2000003861160360
      if (!isFormatted) {
        pdfBytes = await this.formatPdf(pdfBytes, order)
      }

      var blob = new Blob([pdfBytes], { type: 'application/pdf' })
      var url = URL.createObjectURL(blob)
      window.open(url)
    },

    async getSellerCenterPdf(order) {
      let res = await marketplaceOrdersApi.listDocument(
        order._id,
        'shippingParcel'
      )

      const document = res.data.payload

      return Uint8Array.from(atob(document.File), (c) => c.charCodeAt(0))
    },

    async getMercadolibrePdf(order) {
      let res = await axios.get(`/uploads/${order.shipmentLabelPath}`, {
        responseType: 'arraybuffer',
      })

      return new Uint8Array(res.data)
    },

    pdfButtonVisible(order) {
      if (SellerCenterSources.includes(order.source)) {
        return true
      }

      if (order.source === 'mercadolibre') {
        if (order.shipmentLabelPath) {
          return true
        }
      }
    },

    getSaleOrderLink(id) {
      return `https://mujeron.odoo.com/web#action=344&cids=1&id=${id}&menu_id=224&model=sale.order&view_type=form`
    },
  },
  watch: {
    dialog(val) {
      val || this.close()
    },
    async search() {
      clearTimeout(this.delayTimer)
      this.delayTimer = setTimeout(() => {
        this.initialize(this.page)
      }, 600)
    },
    sort: {
      deep: true,
      handler() {
        clearTimeout(this.delayTimer)
        this.delayTimer = setTimeout(() => {
          this.initialize(this.page)
        }, 500)
      },
    },
  },
}
</script>

<style lang="scss" scoped>
.text-link {
  color: blue;
  text-decoration: none;
}
</style>
