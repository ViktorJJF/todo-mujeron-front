<template>
  <div class="d-flex flex-wrap py-1" style="gap: 4px">
    <v-chip
      v-for="rulePill in rulePills"
      :key="rulePill.text"
      x-small
      :outlined="!rulePill.isStrong"
      :color="rulePill.isStrong ? 'grey darken-2' : 'grey'"
      :text-color="rulePill.isStrong ? 'white' : undefined"
    >
      {{ rulePill.text }}
    </v-chip>
  </div>
</template>

<script>
/** A label's rules in one line of small pills (list of TodoFull labels). */
export default {
  props: {
    label: { type: Object, required: true },
  },
  computed: {
    rulePills() {
      const label = this.label;
      const isExpiring = label.expiresAfterDays && !label.isProtected;
      const rulePills = [
        isExpiring
          ? { text: `Vence ${label.expiresAfterDays} d`, isStrong: true }
          : { text: "No vence", isStrong: false },
      ];
      if (isExpiring && label.renewsOnReapply) rulePills.push({ text: "Se renueva", isStrong: false });
      if (label.exclusiveGroup) {
        rulePills.push({ text: `Grupo: ${label.exclusiveGroup}`, isStrong: false });
      }
      if ((label.replacesLabelIds || []).length) {
        rulePills.push({ text: `Reemplaza a ${label.replacesLabelIds.length}`, isStrong: false });
      }
      if (label.isProtected) rulePills.push({ text: "Protegida", isStrong: true });
      if (label.excludesFromCampaigns) {
        rulePills.push({ text: "Excluye de campañas", isStrong: true });
      }
      if (label.pausesBot) rulePills.push({ text: "Pausa el bot", isStrong: true });
      return rulePills;
    },
  },
};
</script>
