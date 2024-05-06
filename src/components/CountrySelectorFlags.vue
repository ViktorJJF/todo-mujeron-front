<template>
  <div class="d-flex justify-space-evenly">
    <v-btn
      class="mr-2"
      v-for="(country, idx) in countries"
      :key="idx"
      small
      icon
      color="white"
      @click="toggleCountry(country)"
      :class="{ selected: selectedCountry === country.value }"
    >
      <img :src="country.icon" style="width: 25px" />
      <v-tooltip activator="parent" anchor="bottom">
        {{ country.value }}
      </v-tooltip>
    </v-btn>
  </div>
</template>

<script>
export default {
  data() {
    return {
      countries: [
        { value: "Peru", icon: "/assets/images/flags/peru.png" },
        { value: "Chile", icon: "/assets/images/flags/chile.png" },
        { value: "Colombia", icon: "/assets/images/flags/colombia.png" },
        { value: "España", icon: "/assets/images/flags/espania.png" },
      ],
      selectedCountry: "",
    };
  },
  methods: {
    toggleCountry(country) {
      this.selectedCountry =
        this.selectedCountry === country.value ? null : country.value;
      this.$emit("onSelectedCountry", this.selectedCountry);
    },
  },
  watch: {
    selectedCountry(newVal) {
      console.log("🐞 LOG HERE newVal:", newVal);
      this.$emit("onSelectedCountry", newVal);
    },
  },
};
</script>

<style scoped></style>
