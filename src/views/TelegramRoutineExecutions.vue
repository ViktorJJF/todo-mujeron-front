<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="90%"
        icon="mdi-history"
        color="primary"
        title="Telegram - Ejecuciones de Rutinas"
        text="Historial de ejecuciones"
      >
        <!-- Stats Cards -->
        <v-row class="mb-4">
          <v-col cols="12" sm="3">
            <v-card outlined>
              <v-card-text>
                <div class="text-center">
                  <v-icon large color="primary">mdi-play-circle</v-icon>
                  <h3 class="mt-2">{{ safeStats.totalExecutions }}</h3>
                  <p class="mb-0">Total Ejecuciones</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="3">
            <v-card outlined>
              <v-card-text>
                <div class="text-center">
                  <v-icon large color="info">mdi-clock-outline</v-icon>
                  <h3 class="mt-2">{{ formatDuration(safeStats.avgDuration) }}</h3>
                  <p class="mb-0">Duración Promedio</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="3">
            <v-card outlined>
              <v-card-text>
                <div class="text-center">
                  <v-icon large color="success">mdi-check-circle</v-icon>
                  <h3 class="mt-2">{{ getStatusCount('success') }}</h3>
                  <p class="mb-0">Exitosas</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="3">
            <v-card outlined>
              <v-card-text>
                <div class="text-center">
                  <v-icon large color="error">mdi-alert-circle</v-icon>
                  <h3 class="mt-2">{{ getStatusCount('error') }}</h3>
                  <p class="mb-0">Fallidas</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-data-table
          no-results-text="No se encontraron resultados"
          hide-default-footer
          :headers="headers"
          :items="executions"
          @page-count="pageCount = $event"
          :page.sync="page"
          :items-per-page="$store.state.itemsPerPage"
        >
          <template v-slot:top>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <span class="font-weight-bold">Buscar</span>
                  <v-text-field
                    dense
                    hide-details
                    v-model="search"
                    append-icon="search"
                    placeholder="Buscar por nombre"
                    single-line
                    outlined
                    @input="handleSearch"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <span class="font-weight-bold">Estado</span>
                  <v-select
                    dense
                    hide-details
                    placeholder="Todos los estados"
                    outlined
                    :items="statusOptions"
                    item-text="text"
                    item-value="value"
                    v-model="statusFilter"
                    clearable
                    @change="loadExecutions"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <span class="font-weight-bold">Rutina</span>
                  <v-select
                    dense
                    hide-details
                    placeholder="Todas las rutinas"
                    outlined
                    :items="routines"
                    item-text="name"
                    item-value="_id"
                    v-model="routineFilter"
                    clearable
                    @change="loadExecutions"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <span class="font-weight-bold">Acciones</span>
                  <v-btn
                    color="primary"
                    block
                    @click="loadExecutions"
                    :loading="loading"
                  >
                    <v-icon left>mdi-refresh</v-icon>
                    Actualizar
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </template>

          <template v-slot:[`item.routineName`]="{ item }">
            <div>
              <strong>{{ item.routineName }}</strong>
              <div class="caption text--secondary">
                <v-chip
                  v-for="(type, index) in item.routineType"
                  :key="index"
                  x-small
                  class="mr-1"
                >
                  {{ getRoutineTypeLabel(type) }}
                </v-chip>
              </div>
            </div>
          </template>

          <template v-slot:[`item.status`]="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              small
              text-color="white"
            >
              <v-icon left small>{{ getStatusIcon(item.status) }}</v-icon>
              {{ getStatusLabel(item.status) }}
            </v-chip>
          </template>

          <template v-slot:[`item.startTime`]="{ item }">
            {{ item.startTime | formatDateTime }}
          </template>

          <template v-slot:[`item.duration`]="{ item }">
            <span v-if="item.duration">{{ formatDuration(item.duration) }}</span>
            <span v-else class="text--secondary">-</span>
          </template>

          <template v-slot:[`item.metadata`]="{ item }">
            <v-tooltip bottom v-if="item.metadata && Object.keys(item.metadata).length">
              <template v-slot:activator="{ on, attrs }">
                <v-icon small color="info" v-bind="attrs" v-on="on">
                  mdi-information
                </v-icon>
              </template>
              <div>
                <div v-for="(value, key) in item.metadata" :key="key">
                  <strong>{{ key }}:</strong> {{ formatMetadataValue(value) }}
                </div>
              </div>
            </v-tooltip>
            <span v-else class="text--secondary">-</span>
          </template>

          <template v-slot:[`item.action`]="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  @click="viewDetails(item)"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon small>mdi-eye</v-icon>
                </v-btn>
              </template>
              <span>Ver detalles</span>
            </v-tooltip>
            <v-tooltip bottom v-if="item.status === 'error'">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  color="error"
                  @click="viewError(item)"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon small>mdi-alert-circle</v-icon>
                </v-btn>
              </template>
              <span>Ver error</span>
            </v-tooltip>
          </template>

          <template v-slot:no-data>
            <v-alert type="info" :value="true">
              No hay ejecuciones registradas
            </v-alert>
          </template>
        </v-data-table>

        <v-col cols="12" sm="12">
          <span>
            <strong>Mostrando:</strong>
            {{
              $store.state.itemsPerPage > executions.length
                ? executions.length
                : $store.state.itemsPerPage
            }}
            de {{ executions.length }} registros
          </span>
        </v-col>
        <div class="text-center pt-2">
          <v-pagination v-model="page" :length="pageCount"></v-pagination>
        </div>
      </material-card>
    </v-row>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="700px">
      <v-card v-if="selectedExecution">
        <v-card-title class="primary white--text">
          <v-icon color="white" class="mr-2">mdi-information</v-icon>
          Detalles de Ejecución
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12">
              <div class="subtitle-1 font-weight-bold">Rutina</div>
              <div>{{ selectedExecution.routineName }}</div>
            </v-col>
            <v-col cols="6">
              <div class="subtitle-1 font-weight-bold">Estado</div>
              <v-chip
                :color="getStatusColor(selectedExecution.status)"
                small
                text-color="white"
              >
                {{ getStatusLabel(selectedExecution.status) }}
              </v-chip>
            </v-col>
            <v-col cols="6">
              <div class="subtitle-1 font-weight-bold">Duración</div>
              <div v-if="selectedExecution.duration">
                {{ formatDuration(selectedExecution.duration) }}
              </div>
              <div v-else class="text--secondary">-</div>
            </v-col>
            <v-col cols="6">
              <div class="subtitle-1 font-weight-bold">Inicio</div>
              <div>{{ selectedExecution.startTime | formatDateTime }}</div>
            </v-col>
            <v-col cols="6">
              <div class="subtitle-1 font-weight-bold">Fin</div>
              <div v-if="selectedExecution.endTime">
                {{ selectedExecution.endTime | formatDateTime }}
              </div>
              <div v-else class="text--secondary">-</div>
            </v-col>
            <v-col cols="12" v-if="selectedExecution.routineType && selectedExecution.routineType.length">
              <div class="subtitle-1 font-weight-bold">Tipos de Rutina</div>
              <v-chip
                v-for="(type, index) in selectedExecution.routineType"
                :key="index"
                small
                class="mr-1 mt-1"
              >
                {{ getRoutineTypeLabel(type) }}
              </v-chip>
            </v-col>
            <v-col cols="12" v-if="selectedExecution.metadata && Object.keys(selectedExecution.metadata).length">
              <div class="subtitle-1 font-weight-bold">Metadata</div>
              <v-simple-table dense>
                <template v-slot:default>
                  <tbody>
                    <tr v-for="(value, key) in selectedExecution.metadata" :key="key">
                      <td class="font-weight-bold">{{ key }}</td>
                      <td>{{ formatMetadataValue(value) }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="detailsDialog = false">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Error Dialog -->
    <v-dialog v-model="errorDialog" max-width="700px">
      <v-card v-if="selectedExecution">
        <v-card-title class="error white--text">
          <v-icon color="white" class="mr-2">mdi-alert-circle</v-icon>
          Error de Ejecución
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12">
              <div class="subtitle-1 font-weight-bold">Rutina</div>
              <div>{{ selectedExecution.routineName }}</div>
            </v-col>
            <v-col cols="12">
              <div class="subtitle-1 font-weight-bold">Fecha</div>
              <div>{{ selectedExecution.startTime | formatDateTime }}</div>
            </v-col>
            <v-col cols="12" v-if="selectedExecution.errorMessage">
              <div class="subtitle-1 font-weight-bold">Mensaje de Error</div>
              <v-alert type="error" outlined class="mt-2">
                {{ selectedExecution.errorMessage }}
              </v-alert>
            </v-col>
            <v-col cols="12" v-if="selectedExecution.errorStack">
              <div class="subtitle-1 font-weight-bold">Stack Trace</div>
              <v-card outlined class="mt-2">
                <v-card-text>
                  <pre style="white-space: pre-wrap; word-wrap: break-word; font-size: 12px;">{{ selectedExecution.errorStack }}</pre>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="errorDialog = false">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { format } from "date-fns";
import MaterialCard from "@/components/material/Card";

export default {
  components: {
    MaterialCard,
  },
  filters: {
    formatDateTime: function (value) {
      if (!value) return "-";
      return format(new Date(value), "dd/MM/yyyy HH:mm:ss");
    },
  },
  data: () => ({
    page: 1,
    pageCount: 0,
    loading: false,
    search: "",
    searchTimeout: null,
    statusFilter: null,
    routineFilter: null,
    detailsDialog: false,
    errorDialog: false,
    selectedExecution: null,
    headers: [
      {
        text: "Rutina",
        align: "left",
        sortable: false,
        value: "routineName",
      },
      {
        text: "Estado",
        align: "center",
        sortable: false,
        value: "status",
      },
      {
        text: "Inicio",
        align: "left",
        sortable: false,
        value: "startTime",
      },
      {
        text: "Duración",
        align: "center",
        sortable: false,
        value: "duration",
      },
      {
        text: "Metadata",
        align: "center",
        sortable: false,
        value: "metadata",
      },
      {
        text: "Acciones",
        align: "center",
        sortable: false,
        value: "action",
      },
    ],
    executions: [],
    routines: [],
    stats: {
      totalExecutions: 0,
      byStatus: []
    },
    statusOptions: [
      { text: "En ejecución", value: "running" },
      { text: "Exitosa", value: "success" },
      { text: "Error", value: "error" },
    ],
    routineTypeLabels: {
      reels: "Reels",
      stories: "Historias",
      meta_catalog_shut_down_products: "Meta - Apagar productos",
      meta_catalog_turn_on_products: "Meta - Prender productos",
      meta_label_products: "Meta - Etiquetar productos",
      todofull_catalogs: "Catálogos Todofull",
    },
  }),

  computed: {
    // Safe access to stats
    safeStats() {
      return this.stats || {
        totalExecutions: 0,
        byStatus: []
      };
    },
  },

  async mounted() {
    this.$store.commit("loadingModule/showLoading");
    await this.initialize();
    this.$store.commit("loadingModule/showLoading", false);
  },

  methods: {
    async initialize() {
      await Promise.all([
        this.loadRoutines(),
        this.loadExecutions(),
        this.loadStats(),
      ]);
    },

    async loadRoutines() {
      await this.$store.dispatch("telegramRoutinesModule/list", {
        companies: [
          this.$store.getters["authModule/getCurrentCompany"].company._id,
        ],
      });
      this.routines = this.$store.state.telegramRoutinesModule.routines;
    },

    async loadExecutions() {
      this.loading = true;
      try {
        const query = {
          companies: [
            this.$store.getters["authModule/getCurrentCompany"].company._id,
          ],
          sort: "startTime",
          order: "-1",
        };

        if (this.statusFilter) {
          query.status = this.statusFilter;
        }
        if (this.routineFilter) {
          query.telegramRoutineId = this.routineFilter;
        }
        if (this.search) {
          query.filter = this.search;
        }

        await this.$store.dispatch("routineExecutionsModule/list", query);
        this.executions = this.$deepCopy(
          this.$store.state.routineExecutionsModule.executions
        );
      } finally {
        this.loading = false;
      }
    },

    async loadStats() {
      const query = {
        companies: [
          this.$store.getters["authModule/getCurrentCompany"].company._id,
        ],
      };
      if (this.routineFilter) {
        query.telegramRoutineId = this.routineFilter;
      }
      await this.$store.dispatch("routineExecutionsModule/getStats", query);
      this.stats = this.$store.state.routineExecutionsModule.stats;
    },

    handleSearch() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      this.searchTimeout = setTimeout(() => {
        this.loadExecutions();
      }, 500);
    },

    viewDetails(item) {
      this.selectedExecution = item;
      this.detailsDialog = true;
    },

    viewError(item) {
      this.selectedExecution = item;
      this.errorDialog = true;
    },

    getStatusColor(status) {
      const colors = {
        running: "info",
        success: "success",
        error: "error",
      };
      return colors[status] || "grey";
    },

    getStatusIcon(status) {
      const icons = {
        running: "mdi-loading mdi-spin",
        success: "mdi-check-circle",
        error: "mdi-alert-circle",
      };
      return icons[status] || "mdi-help-circle";
    },

    getStatusLabel(status) {
      const labels = {
        running: "En ejecución",
        success: "Exitosa",
        error: "Error",
      };
      return labels[status] || status;
    },

    getStatusCount(status) {
      if (!this.safeStats.byStatus) return 0;
      const statusData = this.safeStats.byStatus.find((s) => s._id === status);
      return statusData ? statusData.count : 0;
    },

    getRoutineTypeLabel(type) {
      return this.routineTypeLabels[type] || type;
    },

    formatDuration(ms) {
      if (!ms) return "-";
      const seconds = Math.floor(ms / 1000);
      if (seconds < 60) {
        return `${seconds}s`;
      }
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (minutes < 60) {
        return `${minutes}m ${remainingSeconds}s`;
      }
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
    },

    formatMetadataValue(value) {
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      if (typeof value === "object" && value !== null) {
        return JSON.stringify(value);
      }
      return value;
    },
  },
};
</script>

<style scoped>
.v-chip {
  margin-top: 2px;
}
</style>
