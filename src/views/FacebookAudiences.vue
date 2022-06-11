<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="98%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Audiencias"
        text="Listado audiencias"
      >
        <v-col cols="12" sm="6">
          <v-dialog v-model="dialog" max-width="600px">
            <template v-slot:activator="{ on }">
              <v-btn color="primary" dark class="mb-2" v-on="on">
                Crear audiencia
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <v-icon color="primary" class="mr-1">mdi-update</v-icon>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>
              <v-divider></v-divider>
              <ValidationObserver
                v-show="editedIndex == -1"
                ref="obs"
                v-slot="{}"
              >
                <div class="pa-5 ma-3">
                  <v-row>
                    <v-col cols="12" sm="6" md="6">
                      <span class="font-weight-bold"
                        >ID administrador de anuncios</span
                      >
                      <VTextFieldWithValidation
                        rules="required"
                        v-model="editedItem.ad_manager_id"
                        label="Coloca el nombre de la audiencia"
                      />
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                      <div class="body-1 font-weight-bold">Pais</div>
                      <v-select
                        dense
                        hide-details
                        placeholder="Seleccione un pais"
                        outlined
                        :items="['Peru', 'Colombia', 'Chile']"
                        v-model="editedItem.country"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <span class="font-weight-bold">Nombre</span>
                      <VTextFieldWithValidation
                        rules="required"
                        v-model="editedItem.name"
                        label="Coloca el nombre de la audiencia"
                      />
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <span class="font-weight-bold">Subtipo</span>
                      <v-select
                        hide-details
                        v-model="editedItem.subtype"
                        :items="[
                          'CUSTOM',
                          'WEBSITE',
                          'APP',
                          'OFFLINE_CONVERSION',
                          'CLAIM',
                          'PARTNER',
                          'MANAGED',
                          'VIDEO',
                          'LOOKALIKE',
                          'ENGAGEMENT',
                          'BAG_OF_ACCOUNTS',
                          'STUDY_RULE_AUDIENCE',
                          'FOX',
                          'MEASUREMENT',
                          'REGULATED_CATEGORIES_AUDIENCE',
                        ]"
                        outlined
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <span class="font-weight-bold">Fuente de datos</span>
                      <v-select
                        hide-details
                        v-model="editedItem.customer_file_source"
                        :items="[
                          'USER_PROVIDED_ONLY',
                          'PARTNER_PROVIDED_ONLY',
                          'BOTH_USER_AND_PARTNER_PROVIDED',
                        ]"
                        outlined
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="12">
                      <span class="font-weight-bold">Descripción</span>
                      <v-textarea
                        placeholder="descripcion"
                        outlined
                        v-model="editedItem.description"
                      ></v-textarea>
                    </v-col>
                  </v-row>
                </div>
                <v-card-actions rd-actions>
                  <div class="flex-grow-1"></div>
                  <v-btn outlined color="error" text @click="close"
                    >Cancelar</v-btn
                  >
                  <v-btn :loading="loadingButton" color="success" @click="save"
                    >Guardar</v-btn
                  >
                </v-card-actions>
              </ValidationObserver>
              <div v-show="editedIndex !== -1" class="pa-5">
                <b>Nombre de audiencia: </b>{{ editedItem.name }}
                <v-row>
                  <v-col cols="12" sm="12">
                    <v-combobox
                      class="mt-3"
                      item-text="name"
                      :search-input.sync="searchLabel"
                      v-model="editedItem.todofullLabels"
                      item-value="_id"
                      :items="todofullLabels"
                      multiple
                      chips
                      no-data-text="No se encontraron etiquetas"
                      @change="updateLabels(editedItem.todofullLabels)"
                    >
                      <template
                        v-slot:selection="{ attrs, item, select, selected }"
                      >
                        <v-chip
                          v-bind="attrs"
                          :input-value="selected"
                          close
                          @click="select"
                          @click:close="
                            removeLabels(editedItem.todofullLabels, item)
                          "
                          color="primary"
                        >
                          <strong>{{ item.name }}</strong>
                        </v-chip>
                      </template>
                    </v-combobox>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="3">
                    <v-btn
                      color="primary"
                      @click="
                        getLeadsByTodofullLabels(editedItem.todofullLabels)
                      "
                      >Ver Leads</v-btn
                    >
                  </v-col>
                  <v-col cols="12" sm="3"
                    ><v-btn
                      color="error"
                      @click="
                        sendLeadsToAudience(
                          editedItem,
                          editedItem.todofullLabels
                        )
                      "
                      >Enviar a Audiencia</v-btn
                    >
                  </v-col>
                </v-row>
                <v-row class="ma-2">
                  <b>Total leads: </b>{{ totalDocs }}
                </v-row>
                <v-row>
                  <v-col cols="12" sm="12">
                    <h6>Primeros 10 leads del listaod</h6>
                    <v-simple-table>
                      <template v-slot:default>
                        <thead>
                          <tr>
                            <th class="text-left">Última Actualización</th>
                            <th class="text-left">Teléfono</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="lead in cleanLeads" :key="lead._id">
                            <td>{{ lead.updatedAt }}</td>
                            <td>{{ lead.telefono }}</td>
                          </tr>
                        </tbody>
                      </template>
                    </v-simple-table>
                  </v-col>
                </v-row>
                <v-card-actions rd-actions>
                  <div class="flex-grow-1"></div>
                  <v-btn outlined color="error" text @click="close"
                    >Cancelar</v-btn
                  >
                  <v-btn :loading="loadingButton" color="success" @click="save"
                    >Guardar</v-btn
                  >
                </v-card-actions>
              </div>
            </v-card>
          </v-dialog>
        </v-col>
        <v-data-table
          no-results-text="No se encontraron resultados"
          hide-default-footer
          :headers="headers"
          :items="audiences"
          :items-per-page="100"
        >
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              class="mr-1 mb-1"
              color="primary"
              fab
              small
              dark
              @click="editItem(item)"
            >
              <v-icon>mdi-account-multiple-plus</v-icon>
            </v-btn>
            <v-btn color="error" fab small dark @click="deleteItem(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </material-card>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import MaterialCard from "@/components/material/Card";
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import cleanLeadsService from "@/services/api/cleanLeads";

export default {
  filters: {
    formatDate: function (value) {
      return format(new Date(value), "d 'de' MMMM 'del' yyyy", {
        locale: es,
      });
    },
  },
  components: {
    MaterialCard,
    VTextFieldWithValidation,
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Crear audiencia" : "Editar audiencia";
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  data() {
    return {
      adManagerId: null,
      totalDocs: 0,
      cleanLeads: [],
      searchLabel: "",
      selectedLabels: [],
      todofullLabels: [],
      audiences: [],
      loadingButton: false,
      editedItem: {
        ad_manager_id: "211739752213400",
        subtype: "CUSTOM",
        customer_file_source: "USER_PROVIDED_ONLY",
        todofullLabels: [],
      },
      defaultItem: {
        ad_manager_id: "211739752213400",
        subtype: "CUSTOM",
        customer_file_source: "USER_PROVIDED_ONLY",
        todofullLabels: [],
      },
      dialog: false,
      editedIndex: -1,
      headers: [
        {
          text: "ID",
          align: "left",
          sortable: false,
          value: "external_id",
        },
        {
          text: "Nombre",
          align: "left",
          sortable: false,
          value: "name",
        },
        {
          text: "Subtipo",
          align: "left",
          sortable: false,
          value: "subtype",
        },
        {
          text: "Fuente de datos",
          align: "left",
          sortable: false,
          value: "customer_file_source",
        },
        {
          text: "Descripción",
          align: "left",
          sortable: false,
          value: "description",
        },
        { text: "Acciones", value: "action", sortable: false },
      ],
    };
  },
  mounted() {
    this.initialize();
  },
  methods: {
    async initialize() {
      await Promise.all([
        this.$store.dispatch("facebookAudiencesModule/list", {
          sort: "name",
          order: "asc",
        }),
        this.$store.dispatch("todofullLabelsModule/list", {
          sort: "name",
          order: "asc",
        }),
      ]);
      this.todofullLabels =
        this.$store.state.todofullLabelsModule.todofullLabels;
      this.audiences =
        this.$store.state.facebookAudiencesModule.facebookAudiences;
      // leyendo audiencias de api facebook
      let res = await axios.get("/api/graph-api/getAudiences");
      this.adManagerId = res.data.payload.ad_manager_id;
      let facebookAudiences = res.data.payload.data;
      // se sincroniza con bd todofull
      for (const audience of facebookAudiences) {
        if (!this.audiences.find((el) => el.external_id === audience.id)) {
          let payload = this.$store.dispatch("facebookAudiencesModule/create", {
            ...audience,
            external_id: audience.id,
          });
          this.audiences.push(payload);
        }
      }
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
        let itemId = this["audiences"][this.editedIndex]._id;
        try {
          await this.$store.dispatch("facebookAudiences" + "Module/update", {
            id: itemId,
            data: this.editedItem,
          });
          Object.assign(this["audiences"][this.editedIndex], this.editedItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      } else {
        //create item
        try {
          axios
            .post("/api/graph-api/audiences", { ...this.editedItem })
            .then((res) => {
              console.log(res.data);
              this.audiences.unshift({
                ...this.editedItem,
                id: res.data.payload.id,
              });
              this.editedItem = {};
              this.close();
            })
            .catch((err) => {
              console.error("err trayendo imagen: ", err);
            });
        } finally {
          this.loadingButton = false;
        }
      }
    },
    async deleteItem(item) {
      const index = this.audiences.indexOf(item);
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        axios.delete("/api/graph-api/audiences/" + item.id);
        this.audiences.splice(index, 1);
      }
    },
    editItem(item) {
      this.editedIndex = this.audiences.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    async updateLabels(selectedLabels) {
      this.selectedLabels = selectedLabels.filter(
        (el) => typeof el === "object"
      );
      console.log("🚀 Aqui *** -> selectedLabels", selectedLabels);
    },
    async removeLabels(selectedLabels, label) {
      selectedLabels.splice(
        selectedLabels.findIndex((el) => el._id === label._id),
        1
      );
    },
    async getLeadsByTodofullLabels(selectedLabels) {
      const response = (
        await cleanLeadsService.getByTodofullLabels(
          selectedLabels.map((el) => el._id)
        )
      ).data.payload;
      this.totalDocs = response.totalDocs;
      this.cleanLeads = response.docs;
    },
    async sendLeadsToAudience(audience, selectedLabels) {
      console.log("AUDIENCIA: ", audience);
      if (
        await this.$confirm(
          `¿Seguro que deseas enviar estos leads a la audiencia ${audience.name}?`
        )
      ) {
        cleanLeadsService.sendLeadsToAudience(
          audience._id,
          audience.external_id,
          selectedLabels.map((el) => el._id)
        );
        this.$swal("Los leads se están enviando a la audiencia");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700");

$base-spacing-unit: 24px;
$half-spacing-unit: $base-spacing-unit / 2;

$color-alpha: #1772ff;
$color-form-highlight: #eeeeee;

*,
*:before,
*:after {
  box-sizing: border-box;
}

body {
  padding: $base-spacing-unit;
  font-family: "Source Sans Pro", sans-serif;
  margin: 0;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0;
}

.container {
  max-width: 1000px;
  margin-right: auto;
  margin-left: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.table {
  width: 100%;
  border: 1px solid $color-form-highlight;
}

.table-header {
  display: flex;
  width: 100%;
  background: #000;
  padding: ($half-spacing-unit * 1.5) 0;
}

.table-row {
  display: flex;
  width: 100%;
  padding: ($half-spacing-unit * 1.5) 0;

  &:nth-of-type(odd) {
    background: $color-form-highlight;
  }
}

.table-data,
.header__item {
  flex: 1 1 20%;
  text-align: center;
}

.header__item {
  text-transform: uppercase;
}

.filter__link {
  color: white;
  text-decoration: none;
  position: relative;
  display: inline-block;
  padding-left: $base-spacing-unit;
  padding-right: $base-spacing-unit;

  &::after {
    content: "";
    position: absolute;
    right: -($half-spacing-unit * 1.5);
    color: white;
    font-size: $half-spacing-unit;
    top: 50%;
    transform: translateY(-50%);
  }

  &.desc::after {
    content: "(desc)";
  }

  &.asc::after {
    content: "(asc)";
  }
}
</style>