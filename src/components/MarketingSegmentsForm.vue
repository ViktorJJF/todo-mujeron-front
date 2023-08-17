<template>
  <v-card>
    <v-card-title>
      <v-icon color="primary" class="mr-1">mdi-update</v-icon>
      <span class="headline">{{ formTitle }}</span>
    </v-card-title>
    <v-divider></v-divider>
    <ValidationObserver ref="obs" v-slot="{ passes }">
      <v-container v-if="!isFinalStep" class="pa-5">
        <v-row>
          <v-col v-if="!activatePreview" cols="12" sm="12" md="12">
            <span class="font-weight-bold">Nombre del segmento</span>
            <VTextFieldWithValidation
              rules="required"
              v-model="editedItem.name"
              label="Nombre"
            />
          </v-col>
          <v-col cols="12" sm="12" md="12">
            <span class="font-weight-bold">Etiquetas</span>
            <TodofullLabelsSelector
              :initialData="initialTodofullLabels"
              @onSelectTodofullLabels="onSelectTodofullLabels"
            ></TodofullLabelsSelector>
          </v-col>
          <v-col cols="12" sm="12" md="12">
            <span class="font-weight-bold">Excluir etiquetas</span>
            <TodofullLabelsSelector
              :initialData="initialExcludeTodofullLabels"
              @onSelectTodofullLabels="onSelectEcludeTodofullLabels"
            ></TodofullLabelsSelector>
          </v-col>
          <v-col cols="12" sm="6" md="6">
            <span class="font-weight-bold">Sobre ID Genial</span>
            <v-checkbox
              v-model="editedItem.filters.includeWithIDGenial"
              label="Incluir leads con ID Genial"
            ></v-checkbox>
            <v-checkbox
              v-model="editedItem.filters.includeWithoutIDGenial"
              label="Incluir leads sin ID Genial"
            ></v-checkbox>
          </v-col>
          <v-col cols="12" sm="6" md="6">
            <span class="font-weight-bold">Email</span>
            <v-checkbox
              v-model="editedItem.filters.includeWithEmail"
              label="Incluir leads con email"
            ></v-checkbox>
            <v-checkbox
              v-model="editedItem.filters.includeWithoutEmail"
              label="Incluir leads sin email"
            ></v-checkbox>
          </v-col>
          <v-col cols="12" sm="12" md="12">
            <span class="font-weight-bold">País</span>
            <CountriesSelector
              :multiple="false"
              :initialData="initialCountries"
              @onSelectedCountries="onSelectedCountries"
            ></CountriesSelector>
          </v-col>
          <!-- <v-col cols="12" sm="12" md="12">
            <span class="font-weight-bold">Bots WhatsApp</span>
            <v-sheet max-width="700">
              <v-slide-group v-model="botIds" :multiple="true" show-arrows>
                <v-slide-item v-for="bot in botIds" :key="bot._id" v-slot="{ active, toggle }">
                  <v-btn :disabled="disabled" class="mx-2" :input-value="active" active-class="purple white--text"
                    depressed rounded @click="toggle">
                    {{ bot.name }}
                  </v-btn>
                </v-slide-item>
              </v-slide-group>
            </v-sheet>
          </v-col> -->
          <!-- <v-col cols="12" sm="6" md="6">
            <span class="font-weight-bold">Desde</span>
            <v-menu v-model="menuFrom" :close-on-content-click="false" :nudge-right="40" transition="scale-transition"
              offset-y min-width="auto">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="editedItem.dateFrom" append-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"
                  outlined dense></v-text-field>
              </template>
              <v-date-picker v-model="editedItem.dateFrom" @input="menuFrom = false"></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" sm="6" md="6">
            <span class="font-weight-bold">Hasta</span>
            <v-menu v-model="menuTo" :close-on-content-click="false" :nudge-right="40" transition="scale-transition"
              offset-y min-width="auto">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="editedItem.dateTo" append-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"
                  outlined dense></v-text-field>
              </template>
              <v-date-picker v-model="editedItem.dateTo" @input="menuTo = false"></v-date-picker>
            </v-menu>
          </v-col> -->
          <v-col v-if="!activatePreview" cols="12" sm="12">
            <span class="font-weight-bold">Descripción</span>
            <v-textarea
              placeholder="descripcion"
              outlined
              v-model="editedItem.description"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-container>
      <v-container v-else class="pa-5">
        <v-card-title class="text-h5">
          ¿Cómo te gustaría llamar a tu nuevo segmento?
        </v-card-title>
        <VTextFieldWithValidation rules="required" v-model="editedItem.name" />
        <p class="mt-2">
          Estas guardando un segmento con los siguientes criterios
        </p>
        <div>
          <b>Etiquetas: </b>
          <v-chip
            v-for="label in editedItem.todofullLabels"
            color="primary"
            :key="label._id"
          >
            <strong>{{ label.name }}</strong>
          </v-chip>
        </div>
        <div><b>País: </b>{{ editedItem.target_countries.join(" ,") }}</div>
        <!-- <div><b>Desde: </b>{{ editedItem.dateFrom }}</div>
        <div><b>Hasta: </b>{{ editedItem.dateTo }}</div> -->
      </v-container>
      <v-card-actions rd-actions>
        <div class="flex-grow-1"></div>
        <v-btn
          v-if="!activatePreview"
          :loading="loadingButton"
          color="success"
          @click="passes(save)"
          >Guardar</v-btn
        >
        <v-btn
          v-else
          :loading="loadingButton"
          color="secondary"
          @click="
            $emit('onPreview', {
              todofullLabels: editedItem.todofullLabels,
              countries: editedItem.target_countries,
              botIds: editedItem.botIds,
            })
          "
          >Previsualizar</v-btn
        >
        <v-btn outlined color="error" text @click="$emit('onClose')"
          >Cancelar</v-btn
        >
      </v-card-actions>
    </ValidationObserver>
  </v-card>
</template>

<script>
const ENTITY = "marketingSegments"; // nombre de la entidad en minusculas (se repite en services y modules del store)
const CLASS_ITEMS = () =>
  import(`@/classes/${ENTITY.charAt(0).toUpperCase() + ENTITY.slice(1)}`);
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import TodofullLabelsSelector from "@/components/TodofullLabelsSelector.vue";
import CountriesSelector from "@/components/CountriesSelector.vue";
export default {
  props: {
    editedIndex: {
      type: Number,
      default: -1,
    },
    editedItem: {
      type: Object,
      default: () => ({
        name: "",
        description: "",
        todofullLabels: [],
        target_countries: [],
        filters: {
          includeWithEmail: true,
          includeWithoutEmail: true,
          includeWithIDGenial: true,
          includeWithoutIDGenial: true,
        },
        // dateFrom: new Date().toISOString().substr(0, 10),
        // dateTo: new Date().toISOString().substr(0, 10),
        botIds: [],
      }),
    },
    activatePreview: {
      type: Boolean,
      default: false,
    },
    isFinalStep: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    VTextFieldWithValidation,
    TodofullLabelsSelector,
    CountriesSelector,
  },
  data() {
    return {
      menuFrom: false,
      menuTo: false,
      dialog: false,
      loadingButton: false,
      defaultItem: CLASS_ITEMS(),
      botIds: [1],
      disabled: false,
    };
  },
  async mounted() {
    // getting segments
    await Promise.all([
      this.$store.dispatch("botsModule/list", { platform: "whatsapp" }),
    ]);
    this.botIds = this.$store.state.botsModule.bots;
    this.editedItem.botIds = this.botIds.map((bot) => bot._id);
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
    initialExcludeTodofullLabels() {
      return this.editedIndex === -1
        ? []
        : this.editedItem.excludeTodofullLabels;
    },
    initialCountries() {
      return this.editedIndex === -1 ? [] : this.editedItem.target_countries;
    },
  },
  methods: {
    onSelectTodofullLabels(selectedLabels) {
      this.editedItem.todofullLabels = selectedLabels;
    },
    onSelectEcludeTodofullLabels(selectedLabels) {
      this.editedItem.excludeTodofullLabels = selectedLabels;
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
  },
};
</script>

<style lang="scss" scoped></style>
