<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="99%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Destinos"
        text="Resumen de Destinos"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          hide-default-footer
          :headers="headers"
          :items="marketplaces"
          @page-count="pageCount = $event"
          :page.sync="page"
          :items-per-page="$store.state.itemsPerPage"
        >
          <template v-slot:top>
            <v-container>
              <span class="font-weight-bold">
                Filtrar: {{ search }}
              </span>
              <v-row>
                <v-col cols="5">
                  <v-text-field
                    v-model="search"
                    hide-details
                    append-icon="search"
                    placeholder="Escribe el texto"
                    single-line
                    outlined
                    dense
                  ></v-text-field>
                </v-col>
                <v-col cols="2">
                  <v-btn color="primary" @click="openCreateUpdateDialog(null)">
                    Agregar Marketplace
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </template>
          
          <template v-slot:item.createdAt="{ item }">
            {{item.createdAt | formatDate}}
          </template>
          
          <template v-slot:item.action="{ item }">
            <div class="d-flex">
              <v-btn small color="secondary" @click="openCreateUpdateDialog(item)">
                Modificar
              </v-btn>
            </div>
          </template>

          <template v-slot:no-data>
            <v-alert type="error" :value="true">
              Aún no cuentas con categorias
            </v-alert>
          </template>
        </v-data-table>

        <v-col cols="12" sm="12">
          <span>
            <strong>Mostrando:</strong>
            {{
              $store.state.itemsPerPage > marketplaces.length
                ? marketplaces.length
                : $store.state.itemsPerPage
            }}
            de {{ marketplaces.length }} registros
          </span>
        </v-col>
        <div class="text-center pt-2">
          <v-pagination v-model="page" :length="pageCount"></v-pagination>
        </div>
      </material-card>
    </v-row>
    <v-dialog v-model="isOpenCreateUpdateDialog" max-width="600px">
      <create-update :marketplace="selectedMarketplace" @save="handleCreateUpdateSave"/>
    </v-dialog>
  </v-container>
</template>

<script>
import MaterialCard from "@/components/material/Card";
import CreateUpdate from "./CreateUpdate.vue"

export default {
  components: {
    MaterialCard,
    CreateUpdate,
  },
  data: () => ({
    page: 1,
    pageCount: 0,
    search: "",
    marketplaces: [],
    selectedMarketplace: null,
    isOpenCreateUpdateDialog: false,
    headers: [
      {
        text: "Última Actualización",
        align: "left",
        sortable: false,
        value: "updatedAt",
      },
      {
        text: "Nombre",
        value: "name"
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
  }),

  mounted() {
    this.initialize();
  },

  methods: {
    async initialize() {
      await Promise.all([this.$store.dispatch("marketplacesModule/list", { catalog: this.$route.params.id })]);
      this.marketplaces = this.$deepCopy(this.$store.state.marketplacesModule.marketplaces)
    },
    openCreateUpdateDialog(item) {
      this.selectedMarketplace = item
      this.isOpenCreateUpdateDialog = true
    },
    handleCreateUpdateSave({ updated, item }) {
      if(updated) {
        const index = this.marketplaces.findIndex(cat => cat._id === item._id)
        this.marketplaces.splice(index, 1, item)
      }else {
        this.marketplaces.unshift(item)
      }

      this.isOpenCreateUpdateDialog = false
    }
  },
};
</script>

<style lang="scss" scoped></style>
