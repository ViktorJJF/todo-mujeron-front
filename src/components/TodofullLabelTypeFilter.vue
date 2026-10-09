<template>
  <v-chip-group :value="value" @change="$emit('input', $event)" mandatory column>
    <v-chip value="all" filter outlined small>Todas · {{ labels.length }}</v-chip>
    <v-chip
      v-for="labelType in labelTypesInUse"
      :key="labelType.value"
      :value="labelType.value"
      :color="labelType.color"
      filter
      outlined
      small
    >
      {{ labelType.text }} · {{ labelType.labelCount }}
    </v-chip>
  </v-chip-group>
</template>

<script>
import { TODOFULL_LABEL_TYPES } from "@/classes/TodofullLabels";

/** Filter chips of the label list: all labels or one type, with counts; used with v-model. */
export default {
  props: {
    // Selected type value, or "all"
    value: { type: String, default: "all" },
    labels: { type: Array, default: () => [] },
  },
  computed: {
    labelTypesInUse() {
      return TODOFULL_LABEL_TYPES.map((labelType) => ({
        ...labelType,
        labelCount: this.labels.filter((label) => label.labelType === labelType.value).length,
      })).filter((labelType) => labelType.labelCount);
    },
  },
};
</script>
