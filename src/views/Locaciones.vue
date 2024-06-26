<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="1000px"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Locaciones"
        text="Tabla resumen de locaciones"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="locaciones"
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
                    placeholder="Escribe el nombre de la locación"
                    single-line
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ on }">
                      <v-btn
                        color="primary"
                        dark
                        class="mb-2"
                        v-on="on"
                        v-show="rolPermisos['Write']"
                        >Agregar locación</v-btn
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
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">Nombre</p>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.nombre"
                                label="Nombre de la locación"
                              />
                            </v-col>
                            <v-col cols="12">
                              <span class="body-1 font-weight-bold"
                                >Equipos de Venta</span>
                              <VSelectWithValidation
                                v-model="editedItem.teams"
                                :items="teams"
                                item-text="nombre"
                                item-value="_id"
                                placeholder="Seleccionar Equipos de Venta"
                                multiple
                                clearable
                                chips
                              />
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
            </v-container>
          </template>
          <template v-slot:[`item.action`]="{ item }">
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
              v-show="rolPermisos['Delete']"
              >Eliminar</v-btn
            >
          </template>
          <template v-slot:no-data>
            <v-alert type="error" :value="true"
              >Aún no cuentas con locaciones</v-alert
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
              $store.state.itemsPerPage > locaciones.length
                ? locaciones.length
                : $store.state.itemsPerPage
            }}
            de {{ locaciones.length }} registros
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
import VSelectWithValidation from "@/components/inputs/VSelectWithValidation.vue";
import MaterialCard from "@/components/material/Card";
import Locaciones from "@/classes/Locaciones";
import auth from "@/services/api/auth";
export default {
  components: {
    MaterialCard,
    VTextFieldWithValidation,
    VSelectWithValidation,
  },
  filters: {
    formatDate: function(value) {
      return format(new Date(value), 'dd/MM/yyyy')
    },
  },
  data: () => ({
    page: 1,
    pageCount: 0,
    loadingButton: false,
    search: '',
    dialog: false,
    headers: [
      {
        text: 'Nombre',
        align: 'left',
        sortable: false,
        value: 'nombre',
      },
      {
        text: 'Valor',
        align: 'left',
        sortable: false,
        value: 'value',
      },
      {
        text: "Agregado",
        align: "left",
        sortable: true,
        value: 'createdAt',
      },
      { text: 'Acciones', value: 'action', sortable: false },
    ],
    locaciones: [],
    editedIndex: -1,
    editedItem: Locaciones(),
    defaultItem: Locaciones(),
    teams: [],
    rolPermisos: {},
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Nueva locación' : 'Editar locación'
    },
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
  },

  async mounted() {
    this.$store.commit("loadingModule/showLoading")
    await this.$store.dispatch("locacionesModule/list", {
      companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
    });
    await this.$store.dispatch("equipoDeVentasModule/list", {
        sort: "name",
        order: "asc",
        companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
    }),
    await this.$store.dispatch("companiesModule/list"),
    this.initialize();
    this.rolAuth(); 
  },

  methods: {
    rolAuth() {
      auth
        .roleAuthorization({
          id: this.$store.state.authModule.user._id,
          menu: 'Configuracion/TodoFull',
          model: 'Locaciones',
          company: this.$store.getters["authModule/getCurrentCompany"].company._id,
        })
        .then((res) => {
          this.rolPermisos = res.data
        })
        .finally(() => this.$store.commit('loadingModule/showLoading', false))
    },

    initialize() {
      this.locaciones = this.$deepCopy(
        this.$store.state.locacionesModule.locaciones
      );
      console.log('las locaciones: ', this.locaciones)
      this.teams = this.$deepCopy(
        this.$store.state.equipoDeVentasModule.equipoDeVentas
      );
    },
    editItem(item) {
      this.editedIndex = this.locaciones.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    async deleteItem(item) {
      const index = this.locaciones.indexOf(item)
      let itemId = this.locaciones[index]._id
      if (await this.$confirm('¿Realmente deseas eliminar este registro?')) {
        await this.$store.dispatch('locacionesModule/delete', itemId)
        this.locaciones.splice(index, 1)
      }
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
        let itemId = this.locaciones[this.editedIndex]._id;
        this.editedItem.corporation = this.$store.state.authModule.user.corporation._id;
        try {
          await this.$store.dispatch('locacionesModule/update', {
            id: itemId,
            data: this.editedItem,
          })
          Object.assign(this.locaciones[this.editedIndex], this.editedItem)
          this.close()
        } finally {
          this.loadingButton = false
        }
      } else {
        //create item
        try {
          console.log('el nuevo item: ', this.editedItem)
          this.editedItem.company = this.$store.getters["authModule/getCurrentCompany"].company._id;

          let newItem = await this.$store.dispatch(
            'locacionesModule/create',
            this.editedItem
          )
          this.locaciones.push(newItem)
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
