<template>
  <v-card outlined class="pa-3">
    <p class="body-1 font-weight-bold mb-2">Así se va a comportar</p>
    <TodofullLabelChip :label="label" />
    <ul class="mt-3 body-2">
      <li v-for="behaviorRule in behaviorRules" :key="behaviorRule">
        {{ behaviorRule }}
      </li>
    </ul>
    <v-alert
      v-for="warning in warnings"
      :key="warning"
      type="warning"
      text
      dense
      class="mt-2 mb-0"
    >
      {{ warning }}
    </v-alert>
    <p class="caption grey--text mt-2 mb-0">
      Este resumen se arma solo con lo que eliges arriba, para que veas el efecto antes de guardar.
    </p>
  </v-card>
</template>

<script>
import { findTodofullLabelType } from "@/classes/TodofullLabels";
import TodofullLabelChip from "@/components/TodofullLabelChip";

/** Plain-language summary of a label's rules, built live from the form (Hito 3 mock-up). */
export default {
  components: { TodofullLabelChip },
  props: {
    label: { type: Object, required: true },
    // Every label of the corporation, to name the ones it replaces
    labels: { type: Array, default: () => [] },
  },
  computed: {
    replacedLabelNames() {
      const replacedLabelIds = this.label.replacesLabelIds || [];
      return this.labels
        .filter((todofullLabel) => replacedLabelIds.includes(todofullLabel._id))
        .map((todofullLabel) => todofullLabel.displayName || todofullLabel.name);
    },
    behaviorRules() {
      const label = this.label;
      const behaviorRules = [];
      if (label.isProtected) {
        behaviorRules.push("No vence: está protegida.");
      } else if (label.expiresAfterDays) {
        behaviorRules.push(`Se quita sola a los ${label.expiresAfterDays} días de ponerla.`);
        if (label.renewsOnReapply) {
          behaviorRules.push("Si se vuelve a poner antes, el plazo empieza de nuevo.");
        }
      } else {
        behaviorRules.push("No vence.");
      }
      if (label.exclusiveGroup) {
        behaviorRules.push(
          `Es exclusiva en el grupo «${label.exclusiveGroup}»: al ponerla se quitan las otras de ese grupo.`
        );
      }
      if (this.replacedLabelNames.length) {
        behaviorRules.push(`Al ponerla se quitan: ${this.replacedLabelNames.join(", ")}.`);
      }
      behaviorRules.push(
        label.isProtected
          ? "Solo una persona la puede poner o quitar."
          : "La pueden poner la asesora, los estados del chat y las integraciones."
      );
      if (label.excludesFromCampaigns) {
        behaviorRules.push("Mientras esté puesta, la clienta no recibe campañas.");
      }
      if (label.pausesBot) {
        behaviorRules.push("Mientras esté puesta, el bot no responde y pasa a una asesora.");
      }
      behaviorRules.push("Queda registro de quién la puso, cuándo y desde dónde.");
      return behaviorRules;
    },
    warnings() {
      const warnings = [];
      if (this.label.pausesBot && !this.label.isProtected) {
        warnings.push("Pausar el bot sin protegerla permite que un proceso automático la quite.");
      }
      if (this.label.labelType === "interest" && !this.label.expiresAfterDays) {
        const interestDays = findTodofullLabelType("interest").defaultRules.expiresAfterDays;
        warnings.push(`Las de interés suelen vencer (decisión: ${interestDays} días).`);
      }
      return warnings;
    },
  },
};
</script>
