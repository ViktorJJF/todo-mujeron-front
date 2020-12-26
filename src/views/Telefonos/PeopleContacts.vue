<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="1500px"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Exportar contactos"
        text="Contactos de Google People"
      >
        <v-container fluid
          ><div>
            <h3><b>Agente: </b></h3>
            <span
              >{{ selectedTelefono.agenteId.nombre }}
              {{ selectedTelefono.agenteId.apellido }}</span
            >
          </div>
          <div>
            <h3><b>Número: </b></h3>
            <span>{{ selectedTelefono.numero }}</span>
          </div>
          <v-dialog v-model="dialog" width="800">
            <template v-slot:activator="{ on: dialog }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on: tooltip }">
                  <v-btn
                    @click="contactsPreview"
                    color="warning"
                    dark
                    v-on="{ ...tooltip, ...dialog }"
                    >Vista previa</v-btn
                  >
                </template>
                <span>100 primeros contactos</span>
              </v-tooltip>
            </template>
            <v-card>
              <v-toolbar color="primary" dark>
                <v-toolbar-title
                  >Vista previa de contactos (100 primeros)
                </v-toolbar-title>
              </v-toolbar>
              <v-container v-show="!contactsReady">
                <v-row justify="center">
                  <v-progress-circular
                    :size="70"
                    :width="7"
                    color="purple"
                    indeterminate
                  ></v-progress-circular>
                </v-row>
              </v-container>
              <v-container v-show="contactsReady">
                <p>
                  <b>Agente: </b>{{ selectedTelefono.agenteId.nombre }}
                  {{ selectedTelefono.agenteId.apellido }}
                </p>
                <p><b>Teléfono: </b>{{ selectedTelefono.numero }}</p>
                <p><b>Cantidad de ítems: </b>{{ totalItems }}</p>
                <p><b>Cantidad de contactos: </b>{{ totalPeople }}</p>
                <v-simple-table>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left">
                          ID People
                        </th>
                        <th class="text-left">
                          Nombres Completos
                        </th>
                        <th class="text-left">
                          Nombres
                        </th>
                        <th class="text-left">
                          Apellidos
                        </th>
                        <th class="text-left">
                          Celular
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(contact, index) in contacts" :key="index">
                        <td>{{ contact.resourceName }}</td>
                        <td>
                          {{
                            contact.names ? contact.names[0].displayName : ""
                          }}
                        </td>
                        <td>
                          {{ contact.names ? contact.names[0].middleName : "" }}
                        </td>
                        <td>
                          {{ contact.names ? contact.names[0].familyName : "" }}
                        </td>
                        <td>
                          {{
                            contact.phoneNumbers
                              ? contact.phoneNumbers[0].canonicalForm
                              : ""
                          }}
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table></v-container
              >
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="dialog = false"
                  >De acuerdo</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-badge class="ml-3" bordered color="error" icon="mdi-lock" overlap>
            <v-btn
              @click="contactsExport"
              class="white--text"
              color="error"
              depressed
            >
              Exportar
            </v-btn>
          </v-badge>
          <v-progress-linear class="mt-3" v-model="knowledge" height="25">
            <strong>{{ Math.ceil(knowledge) }}%</strong>
          </v-progress-linear>
        </v-container>
      </material-card>
    </v-row>
  </v-container>
</template>

<script>
import MaterialCard from "@/components/material/Card";
import axios from "axios";
export default {
  components: {
    MaterialCard,
  },
  async mounted() {
    if (this.selectedTelefono.credenciales.access_token == "") {
      this.$store.commit(
        "setSelectedTelefono",
        await this.$store.dispatch(
          "telefonosModule/listOne",
          this.$route.params.id
        )
      );
    }
  },
  data() {
    return {
      knowledge: 97,
      dialog: false,
      contacts: [],
      totalItems: 0,
      totalPeople: 0,
      contactsReady: false,
    };
  },
  computed: {
    selectedTelefono() {
      return this.$store.state.selectedTelefono;
    },
  },
  methods: {
    contactsPreview() {
      if (this.contacts.length === 0) {
        this.contactsReady = false;
        axios
          .post("/api/google-people/contacts-preview", {
            ...this.selectedTelefono.credenciales,
          })
          .then((res) => {
            this.contacts = res.data.payload.connections;
            this.totalItems = res.data.payload.totalItems;
            this.totalPeople = res.data.payload.totalPeople;
            this.contactsReady = true;
          })
          .catch((err) => {
            console.error(err);
          });
      }
    },
    contactsExport() {
      console.log("exportando...");
    },
  },
};
</script>

<style lang="scss" scoped></style>
