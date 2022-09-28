<template>
  <v-select
      :value="value"
      @input="onInput"
      :items="countries"
      label="Paises"
      hide-details
      clearable
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
    },
    clearable: {
      type: Boolean,
      default: false
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