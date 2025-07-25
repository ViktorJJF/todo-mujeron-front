<template>
  <v-container fluid>
    <v-card-title>
      <v-icon color="primary" class="mr-1">mdi-update</v-icon>
      <span class="headline">{{ formTitle }}</span>
    </v-card-title>
    <v-divider></v-divider>
    <ValidationObserver ref="obs" v-slot="{ passes }">
      <v-container class="pa-5" v-show="step == 1">
        <v-row>
          <v-col cols="12" sm="12" md="12">
            <div class="body-1 font-weight-bold">Desde</div>
            <v-radio-group v-model="editedItem.fromType" row>
              <v-radio label="Número" value="static_number"></v-radio>
              <v-radio
                label="Enviar desde teléfono de Agente (Se busca en Google Contact)"
                value="dynamic_number"
              ></v-radio>
            </v-radio-group>

            <VSelectWithValidation
              v-if="editedItem.fromType === 'static_number'"
              rules="required"
              :items="bots"
              v-model="editedItem.from"
              itemText="textToShow"
              itemValue="_id"
            />
          </v-col>
          <v-col cols="12" sm="12" md="12">
            <div class="body-1 font-weight-bold">Nombre de la campaña</div>
            <VTextFieldWithValidation
              rules="required"
              v-model="editedItem.name"
              label="Ingresa el nombre"
            />
          </v-col>
          <v-col cols="12" sm="12" md="12">
            <div class="body-1 font-weight-bold">Segmento</div>
            <v-autocomplete
              v-model="editedItem.segment"
              :items="segments"
              :filter="customFilter"
              item-text="name"
              item-value="_id"
              outlined
              dense
              hide-details="auto"
              placeholder="Selecciona un segmento"
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="12" md="12">
            <div class="body-1 font-weight-bold">
              Marcar mensajes como leídos
            </div>
            <v-checkbox
              v-model="editedItem.markMessagesAsRead"
              label="Marcar mensajes como leídos al enviar"
              hide-details
            ></v-checkbox>
          </v-col>
          <v-col cols="12" sm="4" md="4">
            <span class="font-weight-bold">Fecha de envío</span>
            <v-menu
              v-model="menu2"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="date"
                  append-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  outlined
                  dense
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="date"
                @input="menu2 = false"
              ></v-date-picker>
            </v-menu>
          </v-col>

          <v-col cols="12" sm="4" md="4">
            {{ editedItem.scheduleTime }}
            <span class="font-weight-bold">Hora de envío</span>
            <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              :nudge-right="40"
              :return-value.sync="editedItem.scheduleTime"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="editedItem.scheduleTime"
                  append-icon="mdi-clock-time-four-outline"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  outlined
                  dense
                ></v-text-field>
              </template>
              <v-time-picker
                v-if="menu"
                v-model="time"
                full-width
                @click:minute="$refs.menu.save(time)"
              ></v-time-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" sm="4" md="4">
            <span class="font-weight-bold">Enviar por tandas de</span>
            <v-text-field
              type="number"
              v-model="editedItem.chunkSize"
              outlined
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="12" md="12">
            <div class="body-1 font-weight-bold">
              Enviar tandas automaticamente
            </div>
            <v-checkbox
              v-model="editedItem.autoSendChunksSequentiallyOnStart"
              label="Enviar tandas automaticamente al presionar 'Iniciar' "
              hide-details
              @change="editedItem.millisecondsBetweenChunks = 0"
            ></v-checkbox>
          </v-col>
          <v-col
            v-if="editedItem.autoSendChunksSequentiallyOnStart"
            cols="12"
            sm="12"
            md="12"
          >
            <div class="body-1 font-weight-bold">
              Milisegundos entre cada tanda
            </div>
          </v-col>
          <v-col
            v-if="editedItem.autoSendChunksSequentiallyOnStart"
            cols="12"
            sm="4"
            md="4"
          >
            <v-text-field
              v-model.number="editedItem.millisecondsBetweenChunks"
              type="number"
              outlined
              dense
              solo
              hide-details
            />
          </v-col>
        </v-row>
      </v-container>
      <TemplateMessagesList
        @onSelectTemplateMessage="
          editedItem.templateMessage = $event.name;
          step += 1;
        "
        :showButtonSelect="true"
        v-show="step == 2 && selectedBot && selectedBot.platform === 'whatsapp'"
      ></TemplateMessagesList>
      <div
        v-show="
          step == 2 &&
          (!selectedBot || selectedBot.platform === 'whatsapp_automated')
        "
      >
        <v-container class="pa-5">
          <div class="body-1 font-weight-bold mb-3">
            Plantillas de Mensaje Disponibles
          </div>
          <div class="template-messages-table-container">
            <table class="template-messages-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in imaginaTemplateMessages"
                  :key="item._id || item.id || item.name"
                >
                  <td>{{ item.name }}</td>
                  <td>
                    <button
                      class="select-button"
                      @click="
                        editedItem.templateMessage = item.name;
                        step += 1;
                      "
                    >
                      Seleccionar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="imaginaTemplateMessages.length === 0" class="no-data">
              No hay plantillas de mensaje disponibles
            </div>
          </div>
        </v-container>
      </div>
      <v-container class="pa-5" v-if="step == 3">
        <div><b>Nombre de campaña: </b>{{ editedItem.name }}</div>
        <div>
          <b>Desde: </b
          >{{
            editedItem.fromType === "static_number"
              ? editedItem.from
              : "Enviar desde teléfono de Agente (Se busca en Google Contact)"
          }}
        </div>
        <div>
          <b>Segmento: </b
          >{{
            segments.find((el) => el._id == editedItem.segment)
              ? segments.find((el) => el._id == editedItem.segment).name
              : "Sin segmento"
          }}
        </div>
        <div><b>Mensaje de Plantilla: </b>{{ editedItem.templateMessage }}</div>
        <div>
          <b>Fecha y Hora: </b
          >{{ formatDate(scheduleDateTime) || "Fecha y hora no válida" }}
        </div>
        <div>
          <b>Envío por tandas: </b>{{ editedItem.chunkSize || "Sin tandas" }}
        </div>
        <div v-if="editedItem.autoSendChunksSequentiallyOnStart">
          <b>Tiempo entre cada tanda al presionar 'Iniciar': </b
          >{{ editedItem.millisecondsBetweenChunks }} ms
        </div>
      </v-container>
      <v-card-actions rd-actions>
        <div class="flex-grow-1"></div>
        <v-btn v-show="step != 1" color="error" @click="step -= 1">Atrás</v-btn>
        <v-btn
          v-show="step != 3"
          color="secondary"
          @click="
            passes();
            step += 1;
            handleNextStep();
          "
          >Continuar</v-btn
        >
        <v-btn
          v-show="step == 3"
          :loading="loadingButton"
          color="primary"
          @click="passes(save)"
          >Finalizar</v-btn
        >
        <!-- <v-btn outlined color="error" text @click="$emit('onClose')"
          >Cancelar</v-btn
        > -->
      </v-card-actions>
    </ValidationObserver>
  </v-container>
</template>

<script>
const ENTITY = "marketingCampaigns"; //  nombre de la entidad en minusculas (se repite en services y modules del store)
import MarketingCampaigns from "@/classes/MarketingCampaigns";
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import VSelectWithValidation from "@/components/inputs/VSelectWithValidation.vue";
import TemplateMessagesList from "@/components/TemplateMessagesList";
import imaginaTemplateMessagesService from "@/services/api/imaginaTemplateMessages";

import { format } from "date-fns";
import { es } from "date-fns/locale";

export default {
  props: {},
  components: {
    VTextFieldWithValidation,
    VSelectWithValidation,
    TemplateMessagesList,
  },
  data() {
    return {
      step: 1,
      date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10),
      time: null,
      menu: false,
      menu2: false,
      dialog: false,
      loadingButton: false,
      defaultItem: MarketingCampaigns(),
      editedItem: MarketingCampaigns(),
      bots: [],
      segments: [],
      imaginaTemplateMessages: [],
    };
  },

  computed: {
    formTitle() {
      return this.step == 1
        ? "Paso 1 de 3"
        : this.step == 2
        ? "Paso 2 de 3"
        : "Paso 3 de 3: Confirma los datos";
    },
    entity() {
      return ENTITY;
    },
    initialTodofullLabels() {
      return this.editedIndex === -1 ? [] : this.editedItem.todofullLabels;
    },
    scheduleDateTime() {
      return new Date(this.date + " " + this.editedItem.scheduleTime);
    },
    selectedBot() {
      return this.bots.find((el) => el._id == this.editedItem.from);
    },
  },
  mounted() {
    this.initialize();
  },
  methods: {
    async initialize() {
      // getting segments
      await Promise.all([
        this.$store.dispatch("marketingSegmentsModule/list"),
        this.$store.dispatch("botsModule/list", {
          platform: ["whatsapp", "whatsapp_automated"],
        }),
      ]);
      this.segments =
        this.$store.state.marketingSegmentsModule.marketingSegments;
      // show only numbers which are available to send campaigns
      this.bots = this.$store.state.botsModule.bots.filter(
        (bot) => bot.capabilities?.isEligibleForCampaigns !== false
      );
      for (const bot of this.bots) {
        bot["textToShow"] = `${bot.phone} (${
          bot.platform === "whatsapp_automated"
            ? "WhatsApp Imagina"
            : "WhatsApp Cloud"
        })`;
      }
    },
    formatDate(date) {
      try {
        let formatted = format(new Date(date), "MM/dd/yyyy 'a las' hh':'mm", {
          locale: es,
        });
        return formatted;
      } catch (error) {
        console.error(error);
      }
    },
    onSelectTodofullLabels(selectedLabels) {
      this.editedItem.todofullLabels = selectedLabels;
    },
    async save() {
      // add company
      this.editedItem.company =
        this.$store.getters["authModule/getCurrentCompany"].company._id;
      this.loadingButton = true;
      if (this.editedIndex > -1) {
        try {
          await this.$store.dispatch(ENTITY + "Module/update", {
            id: this.editedItem._id,
            data: this.editedItem,
          });
        } finally {
          this.loadingButton = false;
        }
      } else {
        //create item
        try {
          await this.$store.dispatch(ENTITY + "Module/create", {
            ...this.editedItem,
            scheduleDateTime: this.scheduleDateTime,
            hasCronJob: true,
          });
        } finally {
          this.loadingButton = false;
        }
      }
      this.$emit("onSave");
    },
    customFilter(item, queryText) {
      const textOne = item.name.toLowerCase();
      const searchText = queryText.toLowerCase();

      return textOne.indexOf(searchText) > -1;
    },
    async getImaginaTemplateMessages() {
      const response = await imaginaTemplateMessagesService.list({
        page: 1,
        limit: 1000,
      });
      console.log("🐞 LOG HERE response:", response.data);
      this.imaginaTemplateMessages = response.data.payload;
    },
    handleNextStep() {
      if (
        !this.selectedBot ||
        this.selectedBot.platform === "whatsapp_automated"
      ) {
        this.getImaginaTemplateMessages();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.template-messages-table-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.template-messages-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    background-color: #f5f5f5;
    border-bottom: 2px solid #e0e0e0;
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    color: #424242;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  td {
    border-bottom: 1px solid #e0e0e0;
    padding: 12px 16px;
    color: #616161;
  }

  tr:hover {
    background-color: #f9f9f9;
  }

  tr:last-child td {
    border-bottom: none;
  }
}

.select-button {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1565c0;
  }

  &:active {
    background-color: #0d47a1;
  }
}

.no-data {
  padding: 24px;
  text-align: center;
  color: #9e9e9e;
  font-style: italic;
}
</style>
