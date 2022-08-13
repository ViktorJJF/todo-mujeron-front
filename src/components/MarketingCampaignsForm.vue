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
              placeholder="Selecciona un segmento"
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="6" md="6">
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
                  prepend-icon="mdi-calendar"
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
          <v-col cols="12" sm="6" md="6">
            <span class="font-weight-bold">Hora de envío</span>
            <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              :nudge-right="40"
              :return-value.sync="time"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="time"
                  label="Seleccione hora de envío"
                  prepend-icon="mdi-clock-time-four-outline"
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
        </v-row>
      </v-container>
      <TemplateMessagesList v-show="step == 2"></TemplateMessagesList>
      <v-card-actions rd-actions>
        <div class="flex-grow-1"></div>
        <v-btn color="secondary" :step="step + 1">Continuar</v-btn>
        <v-btn :loading="loadingButton" color="success" @click="passes(save)"
          >Guardar</v-btn
        >
        <v-btn outlined color="error" text @click="$emit('onClose')"
          >Cancelar</v-btn
        >
      </v-card-actions>
    </ValidationObserver>
  </v-container>
</template>

<script>
const ENTITY = "marketingCampaigns"; //  nombre de la entidad en minusculas (se repite en services y modules del store)
const CLASS_ITEMS = () =>
  import(`@/classes/${ENTITY.charAt(0).toUpperCase() + ENTITY.slice(1)}`);
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import TemplateMessagesList from "@/components/TemplateMessagesList";

export default {
  props: {},
  components: {
    VTextFieldWithValidation,
    TemplateMessagesList,
  },
  data() {
    return {
      step: 2,
      date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10),
      time: null,
      menu: false,
      menu2: false,
      dialog: false,
      loadingButton: false,
      defaultItem: CLASS_ITEMS(),
      selectedSegment: null,
      editedItem: CLASS_ITEMS(),
      segments: [],
    };
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? this.$t(this.entity + ".NEW_ITEM")
        : this.$t(this.entity + ".EDIT_ITEM");
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
  },
  mounted() {
    this.initialize();
  },
  methods: {
    async initialize() {
      // getting segments
      await Promise.all([this.$store.dispatch("marketingSegmentsModule/list")]);
      this.segments =
        this.$store.state.marketingSegmentsModule.marketingSegments;
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
          await this.$store.dispatch(ENTITY + "Module/create", this.editedItem);
        } finally {
          this.loadingButton = false;
        }
      }
      this.$emit("onSave");
    },
    customFilter(item, queryText) {
      const textOne = item.name.toLowerCase();
      const textTwo = item.abbr.toLowerCase();
      const searchText = queryText.toLowerCase();

      return (
        textOne.indexOf(searchText) > -1 || textTwo.indexOf(searchText) > -1
      );
    },
  },
};
</script>

<style lang="scss" scoped>
</style>