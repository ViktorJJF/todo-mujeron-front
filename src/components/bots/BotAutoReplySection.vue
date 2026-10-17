<template>
  <section class="reply-block">
    <h3 class="reply-title">Respuesta del bot en este WhatsApp</h3>
    <v-radio-group v-model="mode" hide-details class="reply-modes mt-1">
      <v-radio
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        <template v-slot:label>
          <span>
            <span class="reply-mode-name">{{ option.title }}</span>
            <span class="caption grey--text d-block">{{ option.caption }}</span>
          </span>
        </template>
      </v-radio>
    </v-radio-group>
    <p v-if="mode === 'normal'" class="caption grey--text mb-2">
      Este WhatsApp queda como hoy hasta que alguien lo cambie.
    </p>
    <v-row v-else dense class="mt-1">
      <v-col v-if="!noEndDate" cols="12" sm="6">
        <v-text-field
          v-model="untilLocal"
          type="datetime-local"
          label="Hasta (hora de Chile)"
          outlined
          dense
          hide-details
        />
      </v-col>
      <v-col cols="12" sm="6" class="d-flex align-center">
        <v-checkbox
          v-model="noEndDate"
          label="Sin fecha de término"
          hide-details
          class="mt-0"
        />
      </v-col>
    </v-row>
    <v-text-field
      v-model="reason"
      label="Motivo (opcional)"
      outlined
      dense
      counter="200"
      maxlength="200"
      class="mt-2"
    />
    <p v-if="lastChange" class="caption mb-1">{{ lastChange }}</p>
    <v-btn text small color="primary" class="px-0" @click="historyOpen = !historyOpen">
      {{ historyOpen ? "Ocultar historial" : "Ver historial" }}
    </v-btn>
    <v-list v-if="historyOpen" dense>
      <v-list-item v-if="historyError">
        <v-list-item-content>
          <v-list-item-title>No se pudo cargar el historial.</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-else-if="!historyRows.length">
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
  </section>
</template>

<script>
import botsApi from "@/services/api/bots";
import { chileInputToUtc, formatChile, utcToChileInput, MODE_LABEL } from "@/utils/chileTime";

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
      historyError: false,
      historyRows: [],
      lastEmittedKey: "",
      options: [
        {
          value: "normal",
          title: MODE_LABEL.normal,
          caption: "Borrador para la asesora (salvo Modo Feriado)",
        },
        {
          value: "graduada",
          title: MODE_LABEL.graduada,
          caption: "El bot envía sus respuestas sin revisión, con o sin feriado",
        },
        {
          value: "nunca_sola",
          title: MODE_LABEL.nunca_sola,
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
    value(nextValue) {
      this.applyValue(nextValue);
    },
    botId() {
      this.lastEmittedKey = "";
      this.applyValue(this.value);
      this.loadHistory();
    },
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
    replyKey(payload) {
      const current = payload || {};
      return JSON.stringify({
        mode: current.mode || "normal",
        until: current.until || null,
        reason: current.reason || "",
      });
    },
    applyValue(nextValue) {
      const current = nextValue || {};
      // WHY: our own emit comes back through v-model. A null end date there is an empty field, not the checkbox.
      if (this.replyKey(current) === this.lastEmittedKey) return;
      const nextMode = current.mode || "normal";
      const nextUntil = utcToChileInput(current.until);
      const nextReason = current.reason || "";
      const nextNoEnd = nextMode !== "normal" && !current.until;
      if (
        this.mode === nextMode &&
        this.untilLocal === nextUntil &&
        this.reason === nextReason &&
        this.noEndDate === nextNoEnd
      ) {
        return;
      }
      this.mode = nextMode;
      this.untilLocal = nextUntil;
      this.noEndDate = nextNoEnd;
      this.reason = nextReason;
    },
    publish() {
      const missingUntil = this.mode !== "normal" && !this.noEndDate && !this.untilLocal;
      const until =
        this.mode === "normal" || this.noEndDate || missingUntil
          ? null
          : chileInputToUtc(this.untilLocal).toISOString();
      const payload = {
        mode: this.mode,
        until,
        reason: String(this.reason || "").slice(0, 200),
        missingUntil,
      };
      this.lastEmittedKey = this.replyKey(payload);
      this.$emit("input", payload);
    },
    async loadHistory() {
      if (!this.botId) return;
      try {
        const response = await botsApi.history(this.botId);
        this.historyRows = (response.data && response.data.payload) || [];
        this.historyError = false;
      } catch (error) {
        console.error("Error loading auto reply history:", error);
        this.historyRows = [];
        this.historyError = true;
      }
    },
    historyLine(row) {
      const who = (row.by && (row.by.first_name || row.by.email)) || "Alguien";
      const toMode = MODE_LABEL[row.toMode] || row.toMode;
      const until = row.until ? ` hasta ${formatChile(row.until)}` : "";
      return `${who}, ${formatChile(row.at)}: ${toMode}${until}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.reply-block {
  margin-top: 8px;
  padding: 4px 16px 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
}

.reply-title {
  margin-top: 12px;
  font-size: 1.05rem;
  font-weight: 500;
}

.reply-mode-name {
  font-weight: 500;
}

.reply-modes {
  margin-bottom: 4px;
}
</style>
