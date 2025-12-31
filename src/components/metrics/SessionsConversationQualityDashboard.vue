<template>
  <div class="sessions-conversation-quality-dashboard">
    <unified-date-filter
      title="Calidad de Conversación - Sesiones"
      title-icon="mdi-message-check-outline"
      :start-date="startDate"
      :end-date="endDate"
      :loading="loading"
      start-label="Fecha de Inicio"
      end-label="Fecha de Fin"
      apply-button-text="Aplicar Filtro"
      quick-filters-label="Filtros Rápidos"
      :default-selected-filter="selectedQuickFilter"
      @filter-applied="handleFilterApplied"
    />

    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
      </v-col>
    </v-row>

    <template v-else-if="dashboardData">
      <!-- Summary Card -->
      <unified-summary-card
        title="Resumen de Calidad de Conversación"
        icon="mdi-message-check-outline"
        color="primary"
        :stats="[
          {
            value: dashboardData.totalSessionsWithQuality || 0,
            label: 'Total de Sesiones Analizadas',
            color: 'primary',
          },
        ]"
      />

      <!-- Array Categories Charts -->
      <v-row v-if="dashboardData.arrayCategories">
        <v-col
          cols="12"
          v-for="(category, index) in dashboardData.arrayCategories"
          :key="'category-' + index"
        >
          <unified-bar-chart
            :data="category.data"
            :total="category.total"
            :title="formatFieldTitle(category.category)"
            icon="mdi-chart-bar"
            :horizontal="true"
          />
        </v-col>
      </v-row>
    </template>

    <v-row v-else>
      <v-col cols="12" class="text-center">
        <v-card class="pa-6 empty-state-card">
          <v-icon large color="grey lighten-1">mdi-chart-line</v-icon>
          <div class="text-h6 grey--text text--darken-1 mt-3">
            Seleccione un rango de fechas para ver la calidad de conversación
            de sesiones
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Date Range Info -->
    <v-row v-if="dashboardData">
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

export default {
  name: "SessionsConversationQualityDashboard",

  components: {
    UnifiedDateFilter,
    UnifiedSummaryCard,
    UnifiedBarChart,
  },

  data() {
    return {
      loading: false,
      startDate: null,
      endDate: null,
      dashboardData: null,
      selectedQuickFilter: 3,
      activeQuickFilterLabel: "Últimos 30 días",
    };
  },

  computed: {
    formatDateRange() {
      if (this.dashboardData) {
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
      }
      return "";
    },
  },

  methods: {
    async handleFilterApplied({ startDate, endDate, activeFilterLabel }) {
      this.startDate = startDate;
      this.endDate = endDate;
      this.activeQuickFilterLabel = activeFilterLabel;
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

        const response =
          await metricsApi.getSessionsConversationQualityCounts(params);
        this.dashboardData = response.data.payload;
      } catch (error) {
        console.error(
          "Error fetching sessions conversation quality data:",
          error
        );
        this.$toast.error(
          "Error al cargar los datos de calidad de conversación de sesiones"
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
  },
};
</script>

<style scoped>
.sessions-conversation-quality-dashboard {
  padding: 16px;
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
