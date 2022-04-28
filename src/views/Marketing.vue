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
              <ValidationObserver ref="obs" v-slot="{ passes }">
                <div class="pa-5 ma-3">
                  <v-row>
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
        <v-data-table
          no-results-text="No se encontraron resultados"
          hide-default-footer
          :headers="headers"
          :items="audiences"
          sort-by="calories"
        >
          <template v-slot:[`item.action`]="{ item }">
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
import MaterialCard from "@/components/material/Card";
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
export default {
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
      audiences: [],
      loadingButton: false,
      editedItem: {
        subtype: "CUSTOM",
        customer_file_source: "USER_PROVIDED_ONLY",
      },
      defaultItem: {
        subtype: "CUSTOM",
        customer_file_source: "USER_PROVIDED_ONLY",
      },
      dialog: false,
      editedIndex: -1,
      headers: [
        {
          text: "ID",
          align: "left",
          sortable: false,
          value: "id",
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
    axios
      .get("/api/graph-api/getAudiences")
      .then((res) => {
        console.log(res.data);
        this.audiences = res.data.payload.data;
      })
      .catch((err) => {
        console.error("err trayendo imagen: ", err);
      });
    console.log("AUDIENCIAS: ");
  },
  methods: {
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    save() {
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
    },
    async deleteItem(item) {
      const index = this.audiences.indexOf(item);
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        axios.delete("/api/graph-api/audiences/" + item.id);
        this.audiences.splice(index, 1);
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