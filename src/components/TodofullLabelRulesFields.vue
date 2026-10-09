<template>
  <v-row dense>
    <v-col cols="12">
      <p class="body-1 font-weight-bold">Nombre mostrado</p>
      <v-text-field
        :value="value.displayName"
        @input="update('displayName', $event || null)"
        label="El que ve la asesora en el chat"
        hint="Vacío = se muestra el nombre"
        persistent-hint
        outlined
        dense
      ></v-text-field>
    </v-col>
    <v-col cols="12">
      <p class="body-1 font-weight-bold">Tipo</p>
      <v-select
        :value="value.labelType"
        @change="chooseLabelType"
        :items="labelTypes"
        label="Tipo de etiqueta"
        hint="El tipo da el color y propone vencimiento y protección; ajusta solo lo que haga falta"
        persistent-hint
        clearable
        outlined
        dense
      >
        <template v-slot:item="{ item }">
          <v-list-item-content>
            <v-list-item-title>{{ item.text }}</v-list-item-title>
            <v-list-item-subtitle>{{ item.description }}</v-list-item-subtitle>
          </v-list-item-content>
        </template>
      </v-select>
    </v-col>
    <v-col cols="12">
      <p class="body-1 font-weight-bold">Comportamiento</p>
    </v-col>
    <v-col cols="12" sm="6">
      <v-text-field
        :value="value.expiresAfterDays"
        @input="update('expiresAfterDays', toWholeDaysOrNull($event))"
        type="number"
        min="1"
        step="1"
        label="Vence a los (días)"
        hint="Vacío = no vence"
        persistent-hint
        :disabled="value.isProtected"
        outlined
        dense
      ></v-text-field>
    </v-col>
    <v-col cols="12" sm="6">
      <v-switch
        :input-value="value.renewsOnReapply"
        @change="update('renewsOnReapply', !!$event)"
        label="Se renueva"
        hint="Si se vuelve a poner antes de vencer, el plazo empieza de nuevo"
        persistent-hint
        :disabled="!value.expiresAfterDays || value.isProtected"
        class="mt-0"
      ></v-switch>
    </v-col>
    <v-col cols="12">
      <v-combobox
        :value="value.exclusiveGroup"
        @change="update('exclusiveGroup', $event || null)"
        :items="existingGroups"
        label="Grupo exclusivo"
        hint="Dentro de un grupo solo puede haber una: poner una quita las otras"
        persistent-hint
        clearable
        outlined
        dense
      ></v-combobox>
    </v-col>
    <v-col cols="12">
      <v-autocomplete
        :value="value.replacesLabelIds || []"
        @change="update('replacesLabelIds', $event)"
        :items="otherLabels"
        item-text="name"
        item-value="_id"
        label="Reemplaza a"
        hint="Al ponerla, quita estas etiquetas"
        persistent-hint
        multiple
        chips
        small-chips
        deletable-chips
        outlined
        dense
      ></v-autocomplete>
    </v-col>
    <v-col cols="12">
      <v-switch
        :input-value="value.isProtected"
        @change="update('isProtected', !!$event)"
        label="Protegida"
        hint="Solo una persona la pone o la quita. Ningún estado, webhook ni proceso automático la toca, y no vence"
        persistent-hint
        class="mt-0"
      ></v-switch>
    </v-col>
    <v-col cols="12">
      <p class="body-1 font-weight-bold mt-3">Efectos mientras esté puesta</p>
      <v-switch
        :input-value="value.excludesFromCampaigns"
        @change="update('excludesFromCampaigns', !!$event)"
        label="Excluir de campañas"
        class="mt-0"
        hide-details
      ></v-switch>
      <v-switch
        :input-value="value.pausesBot"
        @change="update('pausesBot', !!$event)"
        label="Pausar el bot (la conversación pasa a una asesora)"
        hide-details
      ></v-switch>
    </v-col>
    <v-col cols="12" class="mt-3">
      <TodofullLabelBehaviorPreview :label="value" :labels="labels" />
    </v-col>
  </v-row>
</template>

<script>
import { TODOFULL_LABEL_TYPES, findTodofullLabelType } from "@/classes/TodofullLabels";
import TodofullLabelBehaviorPreview from "@/components/TodofullLabelBehaviorPreview";

/** Rules of a TodoFull label (type, expiry, group, replaces, protection, effects); used with v-model. */
export default {
  components: { TodofullLabelBehaviorPreview },
  props: {
    value: { type: Object, required: true },
    // Every label of the corporation, for "Reemplaza a" and the existing groups
    labels: { type: Array, default: () => [] },
  },
  data: () => ({ labelTypes: TODOFULL_LABEL_TYPES }),
  computed: {
    otherLabels() {
      return this.labels.filter((label) => label._id !== this.value._id);
    },
    existingGroups() {
      const groups = this.labels.map((label) => label.exclusiveGroup).filter(Boolean);
      return [...new Set(groups)].sort();
    },
  },
  methods: {
    update(field, fieldValue) {
      this.$emit("input", { ...this.value, [field]: fieldValue });
    },
    chooseLabelType(labelTypeValue) {
      const labelType = findTodofullLabelType(labelTypeValue);
      this.$emit("input", {
        ...this.value,
        labelType: labelTypeValue || null,
        ...(labelType ? labelType.defaultRules : {}),
      });
    },
    toWholeDaysOrNull(days) {
      const wholeDays = parseInt(days, 10);
      return wholeDays >= 1 ? wholeDays : null;
    },
  },
};
</script>
