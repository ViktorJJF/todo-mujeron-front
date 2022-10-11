<template>
  <v-select
    v-on="listeners"
    v-bind="attrs"
  />
</template>

<script>
export default {
  inheritAttrs: false,
  data() {
    return {
      options: ["Peru", "Chile", "Colombia"]
    }
  },
  computed: {
    attrs: function() {
      return Object.assign({},
        //Default attributes
        {
          outlined: true,
          hideDetails: true,
          dense: true,
          placeholder: 'Seleccionar Pais'
        },
        // We add all attrs from the parent and override defaults
        this.$attrs,
        // Make sure that items can't be overrided
        {
          items: this.options
        }
      )
    },
    listeners: function () {
      var vm = this
      // `Object.assign` merges objects together to form a new object
      return Object.assign({},
        // We add all the listeners from the parent
        this.$listeners,
        {
          // This ensures that the component works with v-model
          input: function (vehicle) {
            vm.$emit('input', vehicle)
          }
        }
      )
    }
  },
}
</script>

<style>

</style>