<template>
  <div>
    <v-row dense>
      <v-col cols="12">
        <h3 class="mt-3">Respuesta del bot en este WhatsApp</h3>
      </v-col>
    </v-row>
    <v-radio-group v-model="mode" hide-details class="mt-1">
      <v-radio
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        <template v-slot:label>
          <div>
            <div>{{ option.title }}</div>
            <div class="caption grey--text">{{ option.caption }}</div>
          </div>
        </template>
      </v-radio>
    </v-radio-group>
    <v-row dense class="mt-2">
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="untilLocal"
          type="datetime-local"
          label="Hasta (hora de Chile)"
          outlined
          dense
          hide-details
          :disabled="mode === 'normal' || noEndDate"
        />
      </v-col>
      <v-col cols="12" sm="6" class="d-flex align-center">
        <v-checkbox
          v-model="noEndDate"
          label="Sin fecha de término"
          hide-details
          class="mt-0"
          :disabled="mode === 'normal'"
        />
      </v-col>
    </v-row>
    <p v-if="mode === 'normal'" class="caption grey--text mb-2">
      Este WhatsApp queda como hoy hasta que alguien lo cambie.
    </p>
    <v-text-field
      v-model="reason"
      label="Motivo (opcional)"
      outlined
      dense
      counter="200"
      maxlength="200"
    />
    <p v-if="lastChange" class="caption mb-1">{{ lastChange }}</p>
    <v-btn text small color="primary" @click="historyOpen = !historyOpen">
      {{ historyOpen ? "Ocultar historial" : "Ver historial" }}
    </v-btn>
    <v-list v-if="historyOpen" dense>
      <v-list-item v-if="!historyRows.length">
        <v-list-item-content>
          <v-list-item-title>Todavía no hay cambios.</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-for="(row, index) in historyRows" :key="index">
        <v-list-item-content>
          <v-list-item-title>{{ historyLine(row) }}</v-list-item-title>
          <v-list-item-subtitle v-if="row.reason">{{ row.reason }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import botsApi from "@/services/api/bots";
import { chileInputToUtc, formatChile, utcToChileInput } from "@/utils/chileTime";

const MODE_TITLE = {
  normal: "Normal",
  graduada: "Responde sola",
  nunca_sola: "Nunca responde sola",
};

export default {
  props: {
    value: {
      type: Object,
      default: () => ({ mode: "normal", until: null, reason: "" }),
    },
    botId: {
      type: String,
      default: "",
    },
  },
  data() {
    const current = this.value || {};
    return {
      mode: current.mode || "normal",
      untilLocal: utcToChileInput(current.until),
      noEndDate: current.mode !== "normal" && !current.until,
      reason: current.reason || "",
      historyOpen: false,
      historyRows: [],
      options: [
        {
          value: "normal",
          title: "Normal",
          caption: "Borrador para la asesora (salvo Modo Feriado)",
        },
        {
          value: "graduada",
          title: "Responde sola",
          caption: "El bot envía sus respuestas sin revisión, con o sin feriado",
        },
        {
          value: "nunca_sola",
          title: "Nunca responde sola",
          caption: "Todo queda en borrador, también en Modo Feriado",
        },
      ],
    };
  },
  computed: {
    lastChange() {
      const row = this.historyRows[0];
      if (!row) return "";
      const who = (row.by && (row.by.first_name || row.by.email)) || "Alguien";
      return `Último cambio: ${who}, ${formatChile(row.at)}`;
    },
  },
  watch: {
    mode() {
      this.publish();
    },
    untilLocal() {
      this.publish();
    },
    noEndDate() {
      this.publish();
    },
    reason() {
      this.publish();
    },
  },
  mounted() {
    this.loadHistory();
  },
  methods: {
    publish() {
      const until =
        this.mode === "normal" || this.noEndDate || !this.untilLocal
          ? null
          : chileInputToUtc(this.untilLocal).toISOString();
      this.$emit("input", {
        mode: this.mode,
        until,
        reason: String(this.reason || "").slice(0, 200),
      });
    },
    async loadHistory() {
      if (!this.botId) return;
      const response = await botsApi.history(this.botId);
      this.historyRows = (response.data && response.data.payload) || [];
    },
    historyLine(row) {
      const who = (row.by && (row.by.first_name || row.by.email)) || "Alguien";
      const toMode = MODE_TITLE[row.toMode] || row.toMode;
      const until = row.until ? ` hasta ${formatChile(row.until)}` : "";
      return `${who}, ${formatChile(row.at)}: ${toMode}${until}`;
    },
  },
};
</script>
