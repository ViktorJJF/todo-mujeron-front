<template>
  <v-combobox
    :disabled="disabled"
    placeholder="Selecciona las etiquetas"
    class="mt-3"
    item-text="name"
    :search-input.sync="searchLabel"
    v-model="selectedTodofullLabels"
    item-value="_id"
    :items="todofullLabels"
    multiple
    no-data-text="No se encontraron etiquetas"
    @change="onSelectedLabels"
    outlined
    hide-details="true"
    hint="hola que hace"
  >
    <template v-slot:selection="{ attrs, item, select, selected }">
      <v-chip
        v-bind="attrs"
        :input-value="selected"
        close
        @click="select"
        @click:close="removeLabels(selectedTodofullLabels, item)"
        color="primary"
      >
        <strong>{{ item.name }}</strong>
      </v-chip>
    </template>
  </v-combobox>
</template>

<script>
export default {
  props: {
    initialData: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      todofullLabels: [],
      selectedTodofullLabels: [],
      searchLabel: "",
    };
  },
  watch: {
    initialData: {
      handler() {
        this.selectedTodofullLabels = this.initialData;
      },
      immediate: true,
    },
  },
  async mounted() {
    await this.$store.dispatch("todofullLabelsModule/list", {
      sort: "name",
      order: "asc",
    });

    this.todofullLabels = this.$store.state.todofullLabelsModule.todofullLabels;
  },
  methods: {
    async removeLabels(selectedLabels, label) {
      selectedLabels.splice(
        selectedLabels.findIndex((el) => el._id === label._id),
        1
      );
      this.$emit("onSelectTodofullLabels", this.selectedTodofullLabels);
    },
    onSelectedLabels() {
      this.searchLabel = "";
      this.$emit("onSelectTodofullLabels", this.selectedTodofullLabels);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>