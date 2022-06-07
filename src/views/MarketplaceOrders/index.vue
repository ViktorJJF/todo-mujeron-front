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
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="orders"
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
                    hide-details
                    v-model="search"
                    append-icon="search"
                    placeholder="Escribe el nomb"
                    single-line
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </template>

          <template v-slot:item.customer="{ item }">
            <div class="text-capitalize">
              {{item.customer.firstname}} {{item.customer.lastname}}
            </div>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip dark color="success">
              {{ item.status }}
            </v-chip>
          </template>

          <template v-slot:item.source="{ item }">
            <span style="text-transform: capitalize;">
              {{ item.source }}
            </span>
          </template>

          <template v-slot:item.total="{ item }">
            {{ item.total | currency }}
          </template>
          
          <template v-slot:item.action="{ item }">
            <div class="d-flex">
              <v-btn small color="secondary" @click="openDetails(item)">
                Detalles
              </v-btn>
              <v-btn v-if="item.source==='dafiti'" class="ml-3" small color="secondary" @click="getPdf(item)">
                Guía Pdf
              </v-btn>
            </div>
          </template>

          <template v-slot:item.updatedAt="{ item }">
            {{ item.updatedAtSource }}
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
            de {{ orders.length }} registros
          </span>
        </v-col>
        <div class="text-center pt-2">
          <v-pagination v-model="page" :length="pageCount"></v-pagination>
        </div>
      </material-card>
    </v-row>
    <v-dialog
      v-model="detailsModal"
      width="800"
    >
      <order-details :order="currentOrder" />
    </v-dialog>
  </v-container>
</template>

<script>
import MaterialCard from "@/components/material/Card";
import OrderDetails from './Details.vue'
import marketplaceOrdersApi from '@/services/api/marketplaceOrders'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export default {
  components: {
    MaterialCard,
    OrderDetails
  },
  filters: {
    currency(val) {
      return new Intl.NumberFormat().format(val)
    }
  },
  data: () => ({
    page: 1,
    pageCount: 0,
    loadingButton: false,
    search: "",
    headers: [
      {
        text: "Última Actualización",
        align: "left",
        sortable: false,
        value: "updatedAt",
      },
      {
        text: "N°Orden",
        value: "externalNumber"
      },
      {
        text: "Genial",
        value: "odooOrderName"
      },
      {
        text: "Fuente",
        value: "source"
      },
      {
        text: "Estado",
        align: "left",
        sortable: false,
        value: "status",
      },
      {
        text: "Cliente",
        value: "customer"
      },
      {
        text: "Artículos",
        align: "center",
        sortable: false,
        value: 'itemsCount',
      },
      {
        text: "Total",
        align: "left",
        sortable: false,
        value: "total",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    detailsModal: false,
    orders: [],
    currentOrder: null
  }),

  mounted() {
    this.initialize();
  },

  methods: {
    async initialize() {
      await Promise.all([this.$store.dispatch("marketplaceOrdersModule/list", { catalog: this.$route.params.id })]);
      this.orders = this.$deepCopy(this.$store.state.marketplaceOrdersModule.orders)
      this.locaciones = this.$store.state.locacionesModule.locaciones;
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },

    openDetails(order) {
      this.currentOrder = order
      this.detailsModal = true
    },

    async formatPdf(pdfBytes, order) {
      let itemsRes = await marketplaceOrdersApi.listItems(order._id)
      const items = itemsRes.data.payload;

      const pdfDoc = await PDFDocument.load(pdfBytes)

      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

      // Get the first page of the document
      const pages = pdfDoc.getPages()
      const firstPage = pages[0]

      // Get the width and height of the first page
      const { height } = firstPage.getSize()

      for(const [index, item] of items.entries()) {
        const price = new Intl.NumberFormat().format(item.ItemPrice)

        const baseText = `${item.Sku} \t ${price}`

        let text = order.OdooOrderName
          ? `${order.OdooOrderName} \t ${baseText}`
          : baseText

        firstPage.drawText(text, {
          x: order.OdooOrderName ? 90 : 105,
          y: (height / 2) + 15 - (15 * index),
          size: 8,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        })
      }

      // Serialize the PDFDocument to bytes (a Uint8Array)
      return pdfDoc.save()
    },

    async getPdf(order) {

      let res = await marketplaceOrdersApi.listDocument(order._id, 'shippingParcel')

      const document = res.data.payload

      let pdfBytes = Uint8Array.from(atob(document.File), c => c.charCodeAt(0))
      
      pdfBytes = await this.formatPdf(pdfBytes, order)

      var blob = new Blob( [ pdfBytes ], { type: document.MimeType } )
      var url = URL.createObjectURL( blob );
      window.open(url);
    },
  },
};
</script>

<style lang="scss" scoped></style>
