<template>
  <v-select
      :value="value"
      @input="onInput"
      :items="countries"
      label="Paises"
      hide-details
      outlined
      solo
      dense
      flat
    >
  </v-select>
</template>

<script>
export default {
  props: {
    value: {
      type: String
    }
  },
  data() {
    return {
      countries: [
        {text: 'Chile', value: 'Chile'},
        {text: 'Perú', value: 'Peru'},
      ]
    }
  },
  methods: {
    onInput(value) {
      this.$emit('input', value)
    }
  }
}
</script>

<style>

</style>