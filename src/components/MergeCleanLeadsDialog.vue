<template>
  <v-card class="merge-leads">
    <v-card-title class="pb-1">
      <v-icon color="primary" class="mr-2">mdi-call-merge</v-icon>
      <span class="headline">Fusionar fichas</span>
      <v-spacer></v-spacer>
      <v-btn icon small @click="$emit('close')"><v-icon>mdi-close</v-icon></v-btn>
    </v-card-title>
    <v-card-subtitle class="pt-1">
      Una clienta, todos sus canales en una sola ficha. En lo que choca gana el dato más reciente.
    </v-card-subtitle>
    <v-divider></v-divider>

    <v-card-text class="pt-5">
      <v-autocomplete
        v-model="otherLead"
        :items="candidates"
        :search-input.sync="search"
        :loading="searching"
        item-text="telefono"
        item-value="_id"
        return-object
        no-filter
        hide-no-data
        clearable
        outlined
        dense
        prepend-inner-icon="mdi-magnify"
        label="Busca la otra ficha por teléfono o nombre"
      >
        <template v-slot:item="{ item }">
          <v-list-item-content>
            <v-list-item-title>{{ leadName(item) }}</v-list-item-title>
            <v-list-item-subtitle>{{ item.telefono }}</v-list-item-subtitle>
          </v-list-item-content>
        </template>
        <template v-slot:selection="{ item }">
          <span class="text-truncate">{{ leadName(item) }} · {{ item.telefono }}</span>
        </template>
      </v-autocomplete>

      <v-progress-linear v-if="loadingPreview" indeterminate color="primary"></v-progress-linear>

      <template v-if="preview">
        <v-row dense align="stretch">
          <v-col v-for="side in sides" :key="side.key" cols="12" md="6">
            <v-sheet rounded="lg" class="lead-side pa-4 fill-height" :style="sideStyle(side.key)">
              <div class="d-flex align-center">
                <v-avatar
                  size="40"
                  :color="side.key === 'keep' ? 'primary' : 'grey lighten-2'"
                  class="mr-3"
                >
                  <span
                    class="subtitle-2"
                    :class="side.key === 'keep' ? 'white--text' : 'grey--text text--darken-2'"
                    >{{ initials(side.lead.nombre) }}</span
                  >
                </v-avatar>
                <div>
                  <div
                    class="side-title"
                    :class="side.key === 'keep' ? 'primary--text' : 'grey--text text--darken-1'"
                  >
                    {{ side.title }}
                  </div>
                  <div class="subtitle-1 font-weight-medium">
                    {{ side.lead.nombre || "Sin nombre" }}
                  </div>
                </div>
              </div>
              <div class="body-2 grey--text text--darken-2 mt-3">{{ side.lead.telefono }}</div>
              <div class="caption grey--text text--darken-1">
                Creada {{ formatDate(side.lead.createdAt) }}
                <span v-if="side.lead.odoo_id"> · Odoo {{ side.lead.odoo_id }}</span>
              </div>
              <div class="mt-2">
                <v-icon
                  v-for="chat in side.lead.chats"
                  :key="chat._id"
                  small
                  class="mr-1"
                  :color="side.key === 'keep' ? 'primary' : 'grey darken-1'"
                  >{{ platformIcon(chat.platform) }}</v-icon
                >
              </div>
            </v-sheet>
          </v-col>
        </v-row>
        <div class="text-center my-1">
          <v-btn text small color="primary" :disabled="merging" @click="otherStays = !otherStays">
            <v-icon left small>mdi-swap-horizontal</v-icon>Cambiar cuál queda
          </v-btn>
        </div>

        <v-alert v-for="blocker in preview.blockers" :key="blocker" dense outlined type="error">
          {{ blocker }}
        </v-alert>

        <template v-if="preview.conflicts.length">
          <div class="subtitle-2 mt-3 mb-1">En lo que choca, gana lo más reciente</div>
          <div v-for="conflict in preview.conflicts" :key="conflict.field" class="conflict py-2">
            <div class="caption grey--text text--darken-1">{{ conflict.label }}</div>
            <v-row no-gutters>
              <v-col v-for="side in ['keep', 'drop']" :key="side" cols="6" class="pr-2">
                <div
                  v-if="conflict.winner === side"
                  class="winner primary--text font-weight-medium"
                  :style="{ backgroundColor: primaryTint(0.07) }"
                >
                  <v-icon small color="primary" class="mr-1">mdi-check</v-icon>
                  {{ conflict[side].value }}
                </div>
                <div v-else class="loser grey--text text--darken-1">{{ conflict[side].value }}</div>
                <div class="caption grey--text mt-1">{{ formatDate(conflict[side].date) }}</div>
              </v-col>
            </v-row>
          </div>
        </template>

        <div v-if="hasJoined" class="subtitle-2 mt-4 mb-1">Se une sin conflicto</div>
        <v-chip v-for="chat in preview.drop.chats" :key="chat._id" small outlined class="mr-2 mb-2">
          <v-icon left small color="primary">{{ platformIcon(chat.platform) }}</v-icon>
          Chat de {{ platformName(chat.platform) }}
        </v-chip>
        <v-chip v-if="preview.newSalesCount" small outlined class="mr-2 mb-2">
          <v-icon left small color="primary">mdi-shopping-outline</v-icon>
          {{ preview.newSalesCount }} {{ preview.newSalesCount === 1 ? "venta" : "ventas" }}
        </v-chip>
        <v-chip v-for="label in joinedLabels" :key="label" small outlined class="mr-2 mb-2">
          <v-icon left small color="primary">mdi-tag-outline</v-icon>{{ label }}
        </v-chip>
      </template>
    </v-card-text>

    <v-divider></v-divider>
    <v-card-actions class="flex-wrap px-6 py-4">
      <span class="merge-note caption grey--text text--darken-1">
        La ficha que se va no se borra: queda marcada y se puede revertir.
      </span>
      <v-spacer></v-spacer>
      <v-btn text @click="$emit('close')">Cancelar</v-btn>
      <v-btn color="primary" depressed :loading="merging" :disabled="!canMerge" @click="merge">
        <v-icon left small>mdi-call-merge</v-icon>Fusionar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { format } from "date-fns";
import { es } from "date-fns/locale";
import cleanLeadsService from "@/services/api/cleanLeads";
import { chatPlatform } from "@/utils/chatPlatforms";

const SEARCH_DELAY_MS = 300;
// WHY: an autocomplete suggestion list, not a page of results.
const SEARCH_RESULTS_LIMIT = 8;

/** Merge another contact into this one: find it, see side by side what joins and what wins, confirm. */
export default {
  props: {
    lead: { type: Object, required: true },
  },
  data: () => ({
    search: "",
    searching: false,
    candidates: [],
    otherLead: null,
    otherStays: false,
    preview: null,
    loadingPreview: false,
    merging: false,
    searchTimer: null,
  }),
  computed: {
    keepId() {
      return this.otherStays ? this.otherLead._id : this.lead._id;
    },
    dropId() {
      return this.otherStays ? this.lead._id : this.otherLead._id;
    },
    sides() {
      return [
        { key: "keep", title: "Queda", lead: this.preview.keep },
        { key: "drop", title: "Se va", lead: this.preview.drop },
      ];
    },
    joinedLabels() {
      const conflictValues = this.preview.conflicts.map((conflict) => conflict.drop.value);
      return this.preview.drop.etiquetas.filter(
        (label) => !this.preview.keep.etiquetas.includes(label) && !conflictValues.includes(label)
      );
    },
    hasJoined() {
      return Boolean(
        this.preview.drop.chats.length || this.preview.newSalesCount || this.joinedLabels.length
      );
    },
    canMerge() {
      return Boolean(this.preview && !this.preview.blockers.length && !this.loadingPreview);
    },
  },
  watch: {
    search(term) {
      clearTimeout(this.searchTimer);
      if (!term || term === this.otherLead?.telefono) return;
      this.searchTimer = setTimeout(() => this.searchCandidates(term), SEARCH_DELAY_MS);
    },
    otherLead() {
      this.otherStays = false;
      this.loadPreview();
    },
    otherStays() {
      this.loadPreview();
    },
  },
  methods: {
    // WHY: tints of the theme primary keep the indigo hue; Vuetify's "lighten" variants drift to lilac.
    primaryTint(alpha) {
      const hex = this.$vuetify.theme.currentTheme.primary.replace("#", "");
      const [red, green, blue] = [0, 2, 4].map((start) => parseInt(hex.slice(start, start + 2), 16));
      return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    },
    sideStyle(sideKey) {
      return sideKey === "keep"
        ? { backgroundColor: this.primaryTint(0.04), borderColor: this.primaryTint(0.24) }
        : {};
    },
    initials(name) {
      return (name || "?")
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
    },
    leadName(lead) {
      const detail = (lead.details || []).find((item) => item.nombre || item.appName);
      return detail ? detail.nombre || detail.appName : "Sin nombre";
    },
    platformIcon(platform) {
      return chatPlatform(platform).icon;
    },
    platformName(platform) {
      return chatPlatform(platform).name;
    },
    formatDate(date) {
      return date ? format(new Date(date), "d MMM yyyy", { locale: es }) : "sin fecha";
    },
    async searchCandidates(term) {
      this.searching = true;
      try {
        const response = await cleanLeadsService.list({
          filter: term,
          fields: "telefono,details.nombre,details.appName",
          page: 1,
          limit: SEARCH_RESULTS_LIMIT,
          sort: "updatedAt",
          order: "desc",
        });
        this.candidates = response.data.payload.filter((item) => item._id !== this.lead._id);
      } finally {
        this.searching = false;
      }
    },
    async loadPreview() {
      this.preview = null;
      if (!this.otherLead) return;
      this.loadingPreview = true;
      try {
        const response = await cleanLeadsService.mergePreview(this.keepId, this.dropId);
        this.preview = response.data.payload;
      } finally {
        this.loadingPreview = false;
      }
    },
    async merge() {
      this.merging = true;
      try {
        await cleanLeadsService.merge(this.keepId, this.dropId);
        this.$emit("merged", this.keepId);
      } finally {
        this.merging = false;
      }
    },
  },
};
</script>

<style scoped>
.merge-leads .lead-side {
  border: 1px solid rgba(0, 0, 0, 0.06);
  background-color: #fafafa;
}
.merge-leads .side-title {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.merge-leads .winner {
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  padding: 2px 10px 2px 6px;
}
.merge-leads .loser {
  padding: 2px 0;
}
.merge-leads .conflict + .conflict {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
@media (max-width: 599px) {
  .merge-leads .merge-note {
    flex-basis: 100%;
    margin-bottom: 12px;
  }
}
</style>
