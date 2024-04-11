<template>
  <v-sheet max-width="700">
    <v-slide-group @change="
      $emit(
        'onSelectedCompanies',
        multiple
          ? getCompanies(selectedCompanies)
          : getCompany(selectedCompanies)
      )
    " v-model="selectedCompanies" :multiple="multiple" show-arrows>
      <v-slide-item v-for="company in companies" :key="company._id" v-slot="{ active, toggle }">
        <v-btn :disabled="disabled" class="mx-2" :input-value="active" active-class="purple white--text" depressed
          rounded @click="toggle">
          {{ company.alias }}
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
      selectedCompanies: [],
      companies: [],
    };
  },
  watch: {
    initialData: {
      handler() {
        console.log("handelr");
        this.selectedCompanies = this.multiple
          ? this.initialData.map(
            (el) =>
              this.companies[
              this.companies.findIndex((el2) => el2._id === el._id)
              ]
          )
          : this.companies.findIndex(
            (el) => el === (this.initialData ? this.initialData[0]._id : null)
          );
      },
      immediate: true,
    },
  },
  async created() {
    await this.$store.dispatch("companiesModule/list"),
    this.initialize();
    console.log("created companies list");
  },
  methods: {
    initialize() {
      this.companies = this.$deepCopy(
        this.$store.state.companiesModule.companies,
      );
    },
    getCompanies(selectedCompanies) {
      console.log("get companies", selectedCompanies);
      const a = selectedCompanies.map(
        (company) => this.companies[company]
      );
      console.log("gettted comptanies" , a);
      return a;
    },
    getCompany(selectedCompanies) {
      console.log("get company", selectedCompanies);
      return [this.companies[selectedCompanies]];
    },
  },
};
</script>

<style lang="scss" scoped>

</style>