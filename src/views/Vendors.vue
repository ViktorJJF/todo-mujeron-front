<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="90%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Vendors"
        text="Tabla resumen de vendors"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="vendors"
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
                    placeholder="Escribe el nomb"
                    single-line
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn color="error" fab small dark @click="deleteItem(item)" v-show="rolPermisos['Delete']">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <template v-slot:no-data>
            <v-alert type="error" :value="true"
              >Aún no cuentas con vendors</v-alert
            >
          </template>
          <template v-slot:item.createdAt="{ item }">
            {{item.createdAt | formatDate}}
          </template>
        </v-data-table>
        <v-col cols="12" sm="12">
          <span>
            <strong>Mostrando:</strong>
            {{
              $store.state.itemsPerPage > vendors.length
                ? vendors.length
                : $store.state.itemsPerPage
            }}
            de {{ vendors.length }} registros
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
import MaterialCard from "@/components/material/Card";
import auth from "@/services/api/auth";
import Vendors from "@/classes/Vendors";
export default {
  components: {
    MaterialCard,
  },
  filters: {
    formatDate: function(value) {
      return format(new Date(value), "dd/MM/yyyy");
    },
  },
  data: () => ({
    page: 1,
    pageCount: 0,
    loadingButton: false,
    search: "",
    dialog: false,
    paises: ["Peru", "Chile", "Colombia"],
    headers: [
      {
        text: "Odoo Partner Id",
        align: "left",
        sortable: false,
        value: "partnerId",
      },
      {
        text: "Nombre",
        align: "left",
        sortable: false,
        value: "name",
      },
      {
        text: "Compañia Id",
        align: "left",
        sortable: false,
        value: "company.id",
      },
      {
        text: "Compañia",
        align: "left",
        sortable: false,
        value: "company.name",
      },
      {
        text: "Email",
        align: "left",
        sortable: true,
        value: "email",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    vendors: [],
    editedIndex: -1,
    editedItem: Vendors(),
    defaultItem: Vendors(),
    locaciones: [],
    rolPermisos: {},
  }),

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

  async mounted() {
    // this.$store.commit("loadingModule/showLoading")
    await this.$store.dispatch("vendorsModule/list", {
      companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
    }); 
    await this.$store.dispatch("locacionesModule/list", {
      companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
    });
    this.initialize();
    this.rolAuth(); 
  },

  methods: {
    rolAuth(){
       auth.roleAuthorization(
        {
          'id':this.$store.state.authModule.user._id, 
          'menu':'Configuracion/Propiedades/Genial',
          'model':'Vendedores',
          company: this.$store.getters["authModule/getCurrentCompany"].company._id,
        })
          .then((res) => {
          this.rolPermisos = res.data;
          }).finally(() =>
            this.$store.commit("loadingModule/showLoading", false)
          );
    },
    initialize() {
      this.vendors = this.$deepCopy(this.$store.state.vendorsModule.vendors);
      this.locaciones = this.$store.state.locacionesModule.locaciones;
    },
    editItem(item) {
      this.editedIndex = this.vendors.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
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
      let itemId = this.vendors[this.editedIndex]._id;
      try {
        await this.$store.dispatch("vendorsModule/update", {
          id: itemId,
          data: this.editedItem,
        });
        Object.assign(this.vendors[this.editedIndex], this.editedItem);
        this.close();
      } finally {
        this.loadingButton = false;
      }
    },

    async deleteItem(item) {
      const index = this.vendors.indexOf(item);
      let itemId = this.vendors[index]._id;
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch("vendorsModule/delete", itemId);
        this.vendors.splice(index, 1);
      }
    },

  },
};
</script>

<style lang="scss" scoped></style>
