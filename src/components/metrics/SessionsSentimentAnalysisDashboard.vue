<template>
  <div class="sessions-sentiment-analysis-dashboard">
    <unified-date-filter
      title="Análisis de Sentimiento - Sesiones"
      title-icon="mdi-emoticon-outline"
      :start-date="startDate"
      :end-date="endDate"
      :loading="loading"
      start-label="Fecha de Inicio"
      end-label="Fecha de Fin"
      apply-button-text="Aplicar Filtro"
      quick-filters-label="Filtros Rápidos"
      :default-selected-filter="selectedQuickFilter"
      @filter-applied="handleFilterApplied"
    >
      <template v-slot:after-title>
        <div class="view-mode-container">
          <span class="view-mode-label mr-2">Tipo de Vista:</span>
          <v-btn-toggle
            v-model="viewMode"
            mandatory
            dense
            class="view-mode-toggle"
            @change="handleViewModeChange"
            color="primary"
          >
            <v-btn small :value="VIEW_MODES.COUNTS" class="view-mode-btn">
              <v-icon small left>mdi-chart-bar</v-icon>
              Conteos
            </v-btn>
            <v-btn small :value="VIEW_MODES.MONTHLY" class="view-mode-btn">
              <v-icon small left>mdi-chart-line</v-icon>
              Tendencia Mensual
            </v-btn>
          </v-btn-toggle>
        </div>
      </template>
    </unified-date-filter>

    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
      </v-col>
    </v-row>

    <template v-else-if="viewMode === VIEW_MODES.COUNTS && dashboardData">
      <!-- Summary Card -->
      <unified-summary-card
        title="Resumen de Sesiones con Análisis de Sentimiento"
        icon="mdi-emoticon-outline"
        color="primary"
        :stats="[
          {
            value: dashboardData.totalSessionsWithSentiment || 0,
            label: 'Total de Sesiones Analizadas',
            color: 'primary',
          },
        ]"
      />

      <!-- Enum Metrics Charts -->
      <v-row v-if="dashboardData.enumMetrics">
        <v-col
          cols="12"
          v-for="(metric, index) in dashboardData.enumMetrics"
          :key="'enum-' + index"
        >
          <unified-bar-chart
            :data="metric.data"
            :total="metric.total"
            :title="formatFieldTitle(metric.field)"
            icon="mdi-chart-bar"
            :horizontal="true"
          />
        </v-col>
      </v-row>
    </template>

    <template v-else-if="viewMode === VIEW_MODES.MONTHLY && monthlyData">
      <!-- Monthly Summary Card -->
      <unified-summary-card
        title="Resumen de Tendencias Mensuales - Análisis de Sentimiento"
        icon="mdi-chart-timeline-variant"
        color="primary"
        :stats="[
          {
            value: totalMonthlyChats,
            label: 'Total de Sesiones Analizadas',
            color: 'primary',
          },
          {
            value: monthsCount,
            label: 'Meses Analizados',
            color: 'info',
          },
        ]"
      />

      <!-- Monthly Trend Charts for Enum Metrics -->
      <div v-for="(datasets, field) in groupedMonthlyDatasets" :key="field">
        <unified-line-chart
          :chart-data="monthlyData.monthlyData"
          :labels="monthlyLabels"
          :datasets="datasets"
          :title="'Tendencia Mensual - ' + formatFieldTitle(field)"
          :icon="'mdi-chart-line'"
          :loading="loading"
        />
      </div>
    </template>

    <v-row v-else>
      <v-col cols="12" class="text-center">
        <v-card class="pa-6 empty-state-card">
          <v-icon large color="grey lighten-1">mdi-chart-line</v-icon>
          <div class="text-h6 grey--text text--darken-1 mt-3">
            Seleccione un rango de fechas para ver el análisis de sentimiento
            de sesiones
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Date Range Info -->
    <v-row v-if="dashboardData || monthlyData">
      <v-col cols="12">
        <v-card class="pa-3 text-center date-info-card">
          <span class="text-subtitle-1 grey--text">
            Período de datos: {{ formatDateRange }}
            <span v-if="activeQuickFilterLabel" class="ml-2"
              >({{ activeQuickFilterLabel }})</span
            >
          </span>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import metricsApi from "@/services/api/metrics";
import UnifiedDateFilter from "@/components/metrics/UnifiedDateFilter";
import UnifiedSummaryCard from "@/components/metrics/UnifiedSummaryCard";
import UnifiedBarChart from "@/components/metrics/UnifiedBarChart";
import UnifiedLineChart from "@/components/metrics/UnifiedLineChart";

const VIEW_MODES = {
  COUNTS: "counts",
  MONTHLY: "monthly",
};

const COLORS = [
  "#2196F3",
  "#4CAF50",
  "#FF9800",
  "#F44336",
  "#9C27B0",
  "#00BCD4",
  "#FF5722",
  "#3F51B5",
  "#009688",
  "#E91E63",
];

export default {
  name: "SessionsSentimentAnalysisDashboard",

  components: {
    UnifiedDateFilter,
    UnifiedSummaryCard,
    UnifiedBarChart,
    UnifiedLineChart,
  },

  data() {
    return {
      VIEW_MODES,
      loading: false,
      startDate: null,
      endDate: null,
      dashboardData: null,
      selectedQuickFilter: 3,
      activeQuickFilterLabel: "Últimos 30 días",
      viewMode: VIEW_MODES.COUNTS,
      monthlyData: null,
    };
  },

  computed: {
    formatDateRange() {
      if (this.viewMode === VIEW_MODES.COUNTS && this.dashboardData) {
        if (this.startDate && this.endDate) {
          return `${this.startDate} hasta ${this.endDate}`;
        }
        if (this.dashboardData.dateRange) {
          const { startDate, endDate } = this.dashboardData.dateRange;
          if (startDate === "all time" && endDate === "all time") {
            return "Todo el tiempo";
          }
          return `${startDate} hasta ${endDate}`;
        }
      } else if (
        this.viewMode === VIEW_MODES.MONTHLY &&
        this.monthlyData &&
        this.monthlyData.monthlyData &&
        this.monthlyData.monthlyData.length > 0
      ) {
        const firstMonth = this.monthlyData.monthlyData[0];
        const lastMonth =
          this.monthlyData.monthlyData[this.monthlyData.monthlyData.length - 1];
        return `${firstMonth.monthName} ${firstMonth.year} - ${lastMonth.monthName} ${lastMonth.year}`;
      }
      return "";
    },

    monthlyLabels() {
      if (!this.monthlyData || !this.monthlyData.monthlyData) return [];
      return this.monthlyData.monthlyData.map(
        (month) =>
          `${month.monthName} ${month.year} (${month.totalSessionsWithSentiment || 0} sesiones)`
      );
    },

    totalMonthlyChats() {
      if (!this.monthlyData || !this.monthlyData.monthlyData) return 0;
      return this.monthlyData.monthlyData.reduce(
        (total, month) => total + (month.totalSessionsWithSentiment || 0),
        0
      );
    },

    monthsCount() {
      if (!this.monthlyData || !this.monthlyData.monthlyData) return 0;
      return this.monthlyData.monthlyData.length;
    },

    groupedMonthlyDatasets() {
      if (!this.monthlyData || !this.monthlyData.monthlyData) return {};

      const grouped = {};

      if (this.monthlyData.monthlyData.length > 0) {
        const firstMonth = this.monthlyData.monthlyData[0];
        if (firstMonth.sentimentMetrics) {
          firstMonth.sentimentMetrics.forEach((metric) => {
            grouped[metric.field] = this.createDatasetsForField(metric.field);
          });
        }
      }

      return grouped;
    },
  },

  methods: {
    async handleFilterApplied({ startDate, endDate, activeFilterLabel }) {
      this.startDate = startDate;
      this.endDate = endDate;
      this.activeQuickFilterLabel = activeFilterLabel;
      await this.fetchData();
    },

    async handleViewModeChange() {
      await this.fetchData();
    },

    async fetchData() {
      if (!this.startDate || !this.endDate) return;

      this.loading = true;
      try {
        const params = {
          startDate: this.startDate,
          endDate: this.endDate,
        };

        if (this.viewMode === VIEW_MODES.COUNTS) {
          const response =
            await metricsApi.getSessionsSentimentAnalysisCounts(params);
          this.dashboardData = response.data.payload;
        } else {
          const response =
            await metricsApi.getSessionsSentimentAnalysisByMonth(params);
          this.monthlyData = response.data.payload;
        }
      } catch (error) {
        console.error("Error fetching sessions sentiment analysis data:", error);
        this.$toast.error(
          "Error al cargar los datos de análisis de sentimiento de sesiones"
        );
      } finally {
        this.loading = false;
      }
    },

    formatFieldTitle(field) {
      return field
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },

    formatMetricData(data) {
      if (!data) return [];
      return data.map((item) => ({
        name: item.value,
        value: item.count,
      }));
    },

    calculateTotal(data) {
      if (!data) return 0;
      return data.reduce((sum, item) => sum + item.count, 0);
    },

    createDatasetsForField(field) {
      if (!this.monthlyData || !this.monthlyData.monthlyData) return [];

      const datasets = [];
      const valueLabels = new Set();

      this.monthlyData.monthlyData.forEach((month) => {
        const metric = month.sentimentMetrics?.find(
          (m) => m.field === field
        );
        if (metric && metric.data) {
          metric.data.forEach((item) => {
            valueLabels.add(item.value);
          });
        }
      });

      Array.from(valueLabels).forEach((valueLabel, index) => {
        const data = this.monthlyData.monthlyData.map((month) => {
          const metric = month.sentimentMetrics?.find(
            (m) => m.field === field
          );
          if (metric && metric.data) {
            const item = metric.data.find((d) => d.value === valueLabel);
            return item ? item.count : 0;
          }
          return 0;
        });

        datasets.push({
          label: valueLabel,
          data: data,
          borderColor: COLORS[index % COLORS.length],
          backgroundColor: COLORS[index % COLORS.length] + "20",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        });
      });

      return datasets;
    },
  },
};
</script>

<style scoped>
.sessions-sentiment-analysis-dashboard {
  padding: 16px;
}

.view-mode-container {
  display: flex;
  align-items: center;
  margin-left: 16px;
}

.view-mode-label {
  font-weight: 500;
  color: #666;
  font-size: 14px;
}

.view-mode-toggle {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.view-mode-btn {
  text-transform: none !important;
  font-weight: 500;
}

.empty-state-card {
  border-radius: 12px;
}

.date-info-card {
  border-radius: 8px;
  background-color: #f5f5f5;
  margin-top: 16px;
}
</style>
