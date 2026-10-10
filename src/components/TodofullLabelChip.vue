<template>
  <v-chip
    small
    :color="`${typeColor} lighten-4`"
    :text-color="`${typeColor} darken-3`"
    class="font-weight-bold"
  >
    {{ label.isProtected ? "🔒 " : "" }}{{ label.displayName || label.name || "Sin nombre" }}
  </v-chip>
</template>

<script>
import { findTodofullLabelType } from "@/classes/TodofullLabels";

/** A TodoFull label as the advisor sees it: type color, lock when protected, display name. */
export default {
  props: {
    label: { type: Object, required: true },
  },
  computed: {
    typeColor() {
      const labelType = findTodofullLabelType(this.label.labelType);
      return labelType ? labelType.color : "grey";
    },
  },
};
</script>
