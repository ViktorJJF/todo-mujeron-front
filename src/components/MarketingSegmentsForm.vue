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
            <VTextFieldWithValidation rules="required" v-model="editedItem.name" label="Nombre" />
          </v-col>
          <v-col cols="12" sm="12" md="12">
            <span class="font-weight-bold">Etiquetas</span>
            <TodofullLabelsSelector :initialData="initialTodofullLabels"
              @onSelectTodofullLabels="onSelectTodofullLabels"></TodofullLabelsSelector>
          </v-col>
          <v-col cols="12" sm="12" md="12">
            <span class="font-weight-bold">País</span>
            <CountriesSelector :multiple="false" :initialData="initialCountries"
              @onSelectedCountries="onSelectedCountries"></CountriesSelector>
          </v-col>
          <v-col cols="12" sm="6" md="6">
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
          </v-col>
          <v-col v-if="!activatePreview" cols="12" sm="12">
            <span class="font-weight-bold">Descripción</span>
            <v-textarea placeholder="descripcion" outlined v-model="editedItem.description"></v-textarea>
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
          <v-chip v-for="label in editedItem.todofullLabels" color="primary" :key="label._id">
            <strong>{{ label.name }}</strong>
          </v-chip>
        </div>
        <div><b>País: </b>{{ editedItem.target_countries.join(" ,") }}</div>
        <div><b>Desde: </b>{{ editedItem.dateFrom }}</div>
        <div><b>Hasta: </b>{{ editedItem.dateTo }}</div>
      </v-container>
      <v-card-actions rd-actions>
        <div class="flex-grow-1"></div>
        <v-btn v-if="!activatePreview" :loading="loadingButton" color="success" @click="passes(save)">Guardar</v-btn>
        <v-btn v-else :loading="loadingButton" color="secondary" @click="
          $emit('onPreview', {
            todofullLabels: editedItem.todofullLabels,
            countries: editedItem.target_countries,
            dateFrom: editedItem.dateFrom,
            dateTo: editedItem.dateTo
          })
        ">Previsualizar</v-btn>
        <v-btn outlined color="error" text @click="$emit('onClose')">Cancelar</v-btn>
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
        dateFrom: new Date().toISOString().substr(0, 10),
        dateTo: new Date().toISOString().substr(0, 10)
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
  methods: {
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
  },
};
</script>

<style lang="scss" scoped>

</style>