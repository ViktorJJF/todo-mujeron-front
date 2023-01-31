<template>
  <v-sheet max-width="700">
    <v-slide-group @change="
      $emit(
        'onSelectedCountries',
        multiple
          ? getCountries(selectedCountries)
          : getCountry(selectedCountries)
      )
    " v-model="selectedCountries" :multiple="multiple" show-arrows>
      <v-slide-item v-for="country in $store.state.countries" :key="country" v-slot="{ active, toggle }">
        <v-btn :disabled="disabled" class="mx-2" :input-value="active" active-class="purple white--text" depressed
          rounded @click="toggle">
          {{ country }}
        </v-btn>
      </v-slide-item>
    </v-slide-group>
  </v-sheet>
</template>

<script>
export default {
  props: {
    multiple: {
      type: Boolean,
      default: true,
    },
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
      selectedCountries: [],
    };
  },
  watch: {
    initialData: {
      handler() {
        this.selectedCountries = this.multiple
          ? this.initialData.map(
            (el) =>
              this.$store.state.countries[
              this.$store.state.countries.findIndex((el2) => el2 === el)
              ]
          )
          : this.$store.state.countries.findIndex(
            (el) => el === (this.initialData ? this.initialData[0] : null)
          );
      },
      immediate: true,
    },
  },
  methods: {
    getCountries(selectedCountries) {
      return selectedCountries.map(
        (country) => this.$store.state.countries[country]
      );
    },
    getCountry(selectedCountries) {
      return [this.$store.state.countries[selectedCountries]];
    },
  },
};
</script>

<style lang="scss" scoped>

</style>