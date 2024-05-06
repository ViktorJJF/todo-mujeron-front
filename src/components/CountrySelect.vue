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
  },
  data() {
    return {
      countries: [
        { text: 'Chile', value: 'Chile' },
        { text: 'Perú', value: 'Peru' },
      ],
    }
  },
  methods: {
    onInput(value) {
      this.$emit('input', value)
    },
  },
}
</script>
