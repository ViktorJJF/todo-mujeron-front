<template>
  <v-select
    hide-details
    single-line
    outlined
    dense
    :items="countries"
    :value="value"
    @input="onInput"
  />
</template>

<script>
export default {
  props: {
    value: {
      type: String,
    },
    showAllCountries: {
      type: Boolean,
    },
  },
  data() {
    const countries = !this.showAllCountries ? [
      { text: 'Chile', value: 'Chile' },
      { text: 'Perú', value: 'Peru' },
    ] : [
      { text: 'Chile', value: 'Chile' },
      { text: 'Perú', value: 'Peru' },
      { text: 'Colombia', value: 'Colombia' },
      // Add more countries
    ]
    return {
      countries,
    }
  },
  methods: {
    onInput(value) {
      this.$emit('input', value)
    },
  },
}
</script>
