<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="90%"
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
              {{item.CustomerFirstName}} {{item.CustomerLastName}}
            </div>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip dark color="success">
              {{ item.Status }}
            </v-chip>
          </template>

          <template v-slot:item.fuente>
            Drafitti
          </template>

          <template v-slot:item.total="{ item }">
            {{ item.Price | currency }}
          </template>
          
          <template v-slot:item.action="{ item }">
            <v-btn class="mr-3" small color="secondary" @click="openDetails(item)">
              Detalles
            </v-btn>
          </template>

          <template v-slot:item.updatedAt="{ item }">
            {{ item.UpdatedAt }}
          </template>
          <template v-slot:no-data>
            <v-alert type="error" :value="true"
              >Aún no cuentas con ordenes</v-alert
            >
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
        text:  "N°Orden",
        value: "OrderNumber"
      },
      {
        text:  "Fuente",
        value: "fuente"
      },
      {
        text: "Estado",
        align: "left",
        sortable: false,
        value: "status",
      },
      {
        text:  "Cliente",
        value: "customer"
      },
      {
        text: "Artículos",
        align: "center",
        sortable: false,
        value: 'ItemsCount',
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
      await Promise.all([this.$store.dispatch("scOrdersModule/list", { catalog: this.$route.params.id })]);
      this.orders = this.$deepCopy(this.$store.state.scOrdersModule.orders)
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

    async save() {
      this.loadingButton = true;
      if (this.editedIndex > -1) {
        let itemId = this.orders[this.editedIndex]._id;
        try {
          await this.$store.dispatch("scOrdersModule/update", {
            id: itemId,
            data: this.editedItem,
          });
          Object.assign(this.orders[this.editedIndex], this.editedItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      } else {
        //create item
        try {
          let newItem = await this.$store.dispatch(
            "scOrdersModule/create",
            this.editedItem
          );
          this.orders.push(newItem);
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
