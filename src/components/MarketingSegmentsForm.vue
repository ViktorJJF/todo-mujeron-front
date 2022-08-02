<template>
  <v-card>
    <v-card-title>
      <v-icon color="primary" class="mr-1">mdi-update</v-icon>
      <span class="headline">{{ formTitle }}</span>
    </v-card-title>
    <v-divider></v-divider>
    <ValidationObserver ref="obs" v-slot="{ passes }">
      <v-container class="pa-5">
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
            <span class="font-weight-bold">País</span>
            <CountriesSelector
              :multiple="false"
              :initialData="initialCountries"
              @onSelectedCountries="onSelectedCountries"
            ></CountriesSelector>
          </v-col>
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
      <v-card-actions rd-actions>
        <div class="flex-grow-1"></div>
        <v-btn outlined color="error" text @click="$emit('onClose')"
          >Cancelar</v-btn
        >
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
          @click="$emit('onPreview')"
          >Previsualizar</v-btn
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
      }),
    },
    activatePreview: {
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