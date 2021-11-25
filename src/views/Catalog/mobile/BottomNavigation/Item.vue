<template>
  <div class="d-flex flex-column justify-center align-center elevetion-5">
    <v-img :src="icon"
      max-height="30"
      contain
    />
    <div class="text-caption">
      {{label || ''}}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      required: true
    },
    label: {
      type: String
    }
  }
}
</script>

<style>

</style>