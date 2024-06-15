<template>
  <v-select
    hide-details
    single-line
    outlined
    dense
    v-bind="$attrs"
    v-on="$listeners"
    :items="items"
    @input="onInput"
    :loading="loading"
  />
</template>

<script>
import MultimediaApi from '@/services/api/multimedia'

export default {
  data() {
    return {
      items: [],
      loading: false
    }
  },
  async created() {
    this.loading = true
    const categories = await MultimediaApi.listCategories()
    this.items = categories.map(category => ({
      text: category.name,
      value: category._id
    }))
    this.loading = false
  },
  methods: {
    onInput(value) {
      this.$emit('input', value)
    },
  },
}
</script>
