<template>
  <VTextFieldWithValidation
    v-if="field.type === 'text' || field.type === 'number'"
    :type="field.type"
    :rules="field.rules"
    v-bind="attrs"
    v-on="listeners"
  />
  <v-textarea
    v-else-if="field.type === 'textarea'"
    :rules="field.rules"
    v-bind="attrs"
    v-on="listeners"
  />
  <VSelectWithValidation
    v-else-if="field.type === 'select'"
    :rules="field.rules"
    :items="field.options"
    v-bind="attrs"
    v-on="listeners"
  />
</template>

<script>
import VTextFieldWithValidation from '@/components/inputs/VTextFieldWithValidation';
import VSelectWithValidation from '@/components/inputs/VSelectWithValidation.vue';

export default {
  components: { VTextFieldWithValidation, VSelectWithValidation },
  inheritAttrs: false,
  props: {
    field: {
      type: Object,
      required: true
    }
  },
  computed: {
    attrs: function () {
      return Object.assign(
        {},
        //Default attributes
        {
          outlined: true,
          hideDetails: true,
          solo: false,
          dense: true,
        },
        // We add all attrs from the parent and override defaults
        this.$attrs,
        // Make sure that items can't be overrided
        {
          items: this.options,
        }
      );
    },
    listeners: function () {
      var vm = this;
      // `Object.assign` merges objects together to form a new object
      return Object.assign(
        {},
        // We add all the listeners from the parent
        this.$listeners,
        {
          // This ensures that the component works with v-model
          input: function (vehicle) {
            vm.$emit("input", vehicle);
          },
        }
      );
    },
  },
};
</script>

<style>
</style>