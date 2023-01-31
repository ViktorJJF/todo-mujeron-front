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
            <VSelectWithValidation rules="required" :items="bots" v-model="editedItem.from" itemText="phone"
              itemValue="_id" />
          </v-col>
          <v-col cols="12" sm="12" md="12">
            <div class="body-1 font-weight-bold">Nombre de la campaña</div>
            <VTextFieldWithValidation rules="required" v-model="editedItem.name" label="Ingresa el nombre" />
          </v-col>
          <v-col cols="12" sm="12" md="12">
            <div class="body-1 font-weight-bold">Segmento</div>
            <v-autocomplete v-model="editedItem.segment" :items="segments" :filter="customFilter" item-text="name"
              item-value="_id" outlined dense hide-details="auto" placeholder="Selecciona un segmento"></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="4" md="4">
            <span class="font-weight-bold">Fecha de envío</span>
            <v-menu v-model="menu2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition"
              offset-y min-width="auto">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="date" append-icon="mdi-calendar" readonly v-bind="attrs" v-on="on" outlined
                  dense></v-text-field>
              </template>
              <v-date-picker v-model="date" @input="menu2 = false"></v-date-picker>
            </v-menu>
          </v-col>

          <v-col cols="12" sm="4" md="4">
            {{ editedItem.scheduleTime }}
            <span class="font-weight-bold">Hora de envío</span>
            <v-menu ref="menu" v-model="menu" :close-on-content-click="false" :nudge-right="40"
              :return-value.sync="editedItem.scheduleTime" transition="scale-transition" offset-y max-width="290px"
              min-width="290px">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="editedItem.scheduleTime" append-icon="mdi-clock-time-four-outline" readonly
                  v-bind="attrs" v-on="on" outlined dense></v-text-field>
              </template>
              <v-time-picker v-if="menu" v-model="time" full-width
                @click:minute="$refs.menu.save(time)"></v-time-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" sm="4" md="4">
            <span class="font-weight-bold">Enviar por tandas de</span>
            <v-text-field type="number" v-model="editedItem.chunkSize" outlined dense></v-text-field>
          </v-col>
        </v-row>
      </v-container>
      <TemplateMessagesList @onSelectTemplateMessage="
  editedItem.templateMessage = $event.name;
step += 1;
      " :showButtonSelect="true" v-show="step == 2"></TemplateMessagesList>
      <v-container class="pa-5" v-if="step == 3">
        <div><b>Nombre de campaña: </b>{{ editedItem.name }}</div>
        <div>
          <b>Segmento: </b>{{
            segments.find((el) => el._id == "editedItem.segment ")
              ? segments.find((el) => el._id == "editedItem.segment ").name
              : "Sin segmento"
          }}
        </div>
        <div><b>Mensaje de Plantilla: </b>{{ editedItem.templateMessage }}</div>
        <div>
          <b>Fecha y Hora: </b>{{ formatDate(scheduleDateTime) || "Fecha y hora no válida" }}
        </div>
        <div>
          <b>Envío por tandas: </b>{{ editedItem.chunkSize || "Sin tandas" }}
        </div>
      </v-container>
      <v-card-actions rd-actions>
        <div class="flex-grow-1"></div>
        <v-btn v-show="step != 1" color="error" @click="step -= 1">Atrás</v-btn>
        <v-btn v-show="step != 3" color="secondary" @click="
  passes();
step += 1;
        ">Continuar</v-btn>
        <v-btn v-show="step == 3" :loading="loadingButton" color="primary" @click="passes(save)">Finalizar</v-btn>
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
    initialCountries() {
      return this.editedIndex === -1 ? [] : this.editedItem.target_countries;
    },
    scheduleDateTime() {
      return new Date(this.date + " " + this.editedItem.scheduleTime);
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
        this.$store.dispatch("botsModule/list", { platform: "whatsapp" }),
      ]);
      this.segments =
        this.$store.state.marketingSegmentsModule.marketingSegments;
      this.bots = this.$store.state.botsModule.bots;
      console.log("🚀 Aqui *** -> this.bots", this.bots);
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
    onSelectedCountries(selectedCountries) {
      this.editedItem.target_countries = selectedCountries;
    },
    async save() {
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
  },
};
</script>

<style lang="scss" scoped>

</style>