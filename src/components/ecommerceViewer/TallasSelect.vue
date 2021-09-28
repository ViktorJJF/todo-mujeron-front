<template>
  <v-select
      :value="value"
      @input="onInput"
      :items="tallas"
      label="Tallas"
      item-text="name"
      item-value="name"
      no-data-text="No hay datos disponibles"
      multiple
      hide-details
      solo
    >
  </v-select>
</template>

<script>
export default {
  props: {
    value: {
      type: Array
    },
    tallas: {
      type: Array
    }
  },
  data() {
    return {}
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