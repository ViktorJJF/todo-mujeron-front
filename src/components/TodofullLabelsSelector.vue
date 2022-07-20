<template>
  <v-col cols="12" sm="12">
    <v-combobox
      class="mt-3"
      item-text="name"
      :search-input.sync="searchLabel"
      v-model="selectedTodofullLabels"
      item-value="_id"
      :items="todofullLabels"
      multiple
      chips
      no-data-text="No se encontraron etiquetas"
      @change="onSelectedLabels"
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
  </v-col>
</template>

<script>
export default {
  data() {
    return {
      todofullLabels: [],
      selectedTodofullLabels: [],
      searchLabel: "",
    };
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