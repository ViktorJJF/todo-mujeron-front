<template>
  <div class="sentiment-analysis-dashboard">
    <unified-date-filter
      :title="$t('metrics.SENTIMENT_ANALYSIS.TITLE')"
      title-icon="mdi-emoticon-outline"
      :start-date="startDate"
      :end-date="endDate"
      :loading="loading"
      :start-label="$t('metrics.SENTIMENT_ANALYSIS.START_DATE')"
      :end-label="$t('metrics.SENTIMENT_ANALYSIS.END_DATE')"
      :apply-button-text="$t('metrics.SENTIMENT_ANALYSIS.APPLY_FILTER')"
      :quick-filters-label="$t('metrics.SENTIMENT_ANALYSIS.QUICK_FILTERS')"
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
      <!-- Total Chats with Sentiment Summary Card -->
      <unified-summary-card
        :title="$t('metrics.SENTIMENT_ANALYSIS.OVERVIEW_TITLE')"
        icon="mdi-chart-donut"
        color="primary"
        :stats="[
          {
            value: dashboardData.totalChatsWithSentiment,
            label: $t('metrics.SENTIMENT_ANALYSIS.TOTAL_CHATS'),
            color: 'primary',
          },
          {
            value: sentimentStats ? sentimentStats.positive : 0,
            label: $t('metrics.SENTIMENT_ANALYSIS.POSITIVE_SENTIMENT'),
            color: 'success',
            suffix: '%',
          },
          {
            value: sentimentStats ? sentimentStats.negative : 0,
            label: $t('metrics.SENTIMENT_ANALYSIS.NEGATIVE_SENTIMENT'),
            color: 'error',
            suffix: '%',
          },
        ]"
      />

      <!-- Sentiment Analysis Chart -->
      <unified-pie-chart
        :data="findEnumMetricData('calificacion_del_sentimiento')"
        :total="dashboardData.totalChatsWithSentiment"
        :title="$t('metrics.SENTIMENT_ANALYSIS.DISTRIBUTION_TITLE')"
        :subtitle="$t('metrics.SENTIMENT_ANALYSIS.DISTRIBUTION_TEXT')"
        icon="mdi-emoticon-outline"
        :colors="getSentimentColors()"
      />

      <!-- Dissatisfaction Origin Chart -->
      <unified-bar-chart
        :data="findEnumMetricData('origen_de_la_insatisfaccion')"
        :total="dashboardData.totalChatsWithSentiment"
        :title="$t('metrics.SENTIMENT_ANALYSIS.DISSATISFACTION_TITLE')"
        :subtitle="$t('metrics.SENTIMENT_ANALYSIS.DISSATISFACTION_TEXT')"
        icon="mdi-alert-circle-outline"
        :colors="getDissatisfactionColors()"
        :horizontal="true"
      />

      <!-- Boolean Metrics -->
      <v-row>
        <v-col
          cols="12"
          md="6"
          v-for="(metric, index) in dashboardData.booleanMetrics"
          :key="index"
        >
          <unified-boolean-metric
            :data="metric.data"
            :title="getFieldDisplayName(metric.field)"
            :total="dashboardData.totalChatsWithSentiment"
            :icon="getIconForField(metric.field)"
          />
        </v-col>
      </v-row>

      <!-- Date Range Info -->
      <v-row>
        <v-col cols="12">
          <v-card class="pa-3 text-center date-info-card">
            <span class="text-subtitle-1 grey--text">
              {{ $t("metrics.SENTIMENT_ANALYSIS.DATA_PERIOD") }}:
              {{ formatDateRange }}
              <span v-if="activeQuickFilterLabel" class="ml-2"
                >({{ activeQuickFilterLabel }})</span
              >
            </span>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-row v-else>
      <v-col cols="12" class="text-center">
        <v-card class="pa-6 empty-state-card">
          <v-icon large color="grey lighten-1">mdi-chart-line</v-icon>
          <div class="text-h6 grey--text text--darken-1 mt-3">
            {{ $t("metrics.SENTIMENT_ANALYSIS.SELECT_DATE_RANGE") }}
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {
  format,
  subDays,
  subMonths,
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import metricsApi from "@/services/api/metrics";
import UnifiedDateFilter from "@/components/metrics/UnifiedDateFilter";
import UnifiedSummaryCard from "@/components/metrics/UnifiedSummaryCard";
import UnifiedPieChart from "@/components/metrics/UnifiedPieChart";
import UnifiedBarChart from "@/components/metrics/UnifiedBarChart";
import UnifiedBooleanMetric from "@/components/metrics/UnifiedBooleanMetric";

export default {
  name: "SentimentAnalysisDashboard",

  components: {
    UnifiedDateFilter,
    UnifiedSummaryCard,
    UnifiedPieChart,
    UnifiedBarChart,
    UnifiedBooleanMetric,
  },

  data() {
    return {
      loading: false,
      startDate: null,
      endDate: null,
      dashboardData: null,
      selectedQuickFilter: 9,
      activeQuickFilterLabel: "Todo el tiempo",
      quickFilters: [
        {
          label: "Hoy",
          getDateRange: () => {
            const today = new Date();
            return {
              startDate: format(today, "yyyy-MM-dd"),
              endDate: format(today, "yyyy-MM-dd"),
            };
          },
        },
        {
          label: "Ayer",
          getDateRange: () => {
            const yesterday = subDays(new Date(), 1);
            return {
              startDate: format(yesterday, "yyyy-MM-dd"),
              endDate: format(yesterday, "yyyy-MM-dd"),
            };
          },
        },
        {
          label: "Últimos 7 días",
          getDateRange: () => {
            return {
              startDate: format(subDays(new Date(), 6), "yyyy-MM-dd"),
              endDate: format(new Date(), "yyyy-MM-dd"),
            };
          },
        },
        {
          label: "Últimos 30 días",
          getDateRange: () => {
            return {
              startDate: format(subDays(new Date(), 29), "yyyy-MM-dd"),
              endDate: format(new Date(), "yyyy-MM-dd"),
            };
          },
        },
        {
          label: "Este mes",
          getDateRange: () => {
            const now = new Date();
            return {
              startDate: format(startOfMonth(now), "yyyy-MM-dd"),
              endDate: format(endOfMonth(now), "yyyy-MM-dd"),
            };
          },
        },
        {
          label: "Mes pasado",
          getDateRange: () => {
            const lastMonth = subMonths(new Date(), 1);
            return {
              startDate: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
              endDate: format(endOfMonth(lastMonth), "yyyy-MM-dd"),
            };
          },
        },
        {
          label: "Últimos 6 meses",
          getDateRange: () => {
            return {
              startDate: format(subMonths(new Date(), 6), "yyyy-MM-dd"),
              endDate: format(new Date(), "yyyy-MM-dd"),
            };
          },
        },
        {
          label: "Este año",
          getDateRange: () => {
            const now = new Date();
            return {
              startDate: format(startOfYear(now), "yyyy-MM-dd"),
              endDate: format(endOfYear(now), "yyyy-MM-dd"),
            };
          },
        },
        {
          label: "Año 2023",
          getDateRange: () => {
            return {
              startDate: "2023-01-01",
              endDate: "2023-12-31",
            };
          },
        },
        {
          label: "Todo el tiempo",
          getDateRange: () => {
            return {
              startDate: null,
              endDate: null,
            };
          },
        },
      ],
    };
  },

  computed: {
    formatDateRange() {
      if (!this.dashboardData) return "";

      const { startDate, endDate } = this.dashboardData.dateRange;
      if (startDate === "all time" && endDate === "all time") {
        return this.$t("metrics.SENTIMENT_ANALYSIS.ALL_TIME");
      }

      return `${startDate} to ${endDate}`;
    },

    sentimentStats() {
      if (!this.dashboardData) return null;

      const sentimentData = this.findEnumMetricData(
        "calificacion_del_sentimiento"
      );
      if (!sentimentData) return null;

      const total = this.dashboardData.totalChatsWithSentiment;

      // Positive sentiments: "Satisfecho", "Emoción/Entusiasmo"
      const positiveCount = sentimentData
        .filter((item) =>
          ["Satisfecho", "Emoción/Entusiasmo"].includes(item.value)
        )
        .reduce((sum, item) => sum + item.count, 0);

      // Negative sentiments: "Insatisfecho", "Confusión", "Fustracion", "Tóxico", "Evasivo/Desconfiado"
      const negativeCount = sentimentData
        .filter((item) =>
          [
            "Insatisfecho",
            "Confusión",
            "Fustracion",
            "Tóxico",
            "Evasivo/Desconfiado",
          ].includes(item.value)
        )
        .reduce((sum, item) => sum + item.count, 0);

      return {
        positive: parseFloat(((positiveCount / total) * 100).toFixed(2)),
        negative: parseFloat(((negativeCount / total) * 100).toFixed(2)),
      };
    },
  },

  methods: {
    handleFilterApplied({ startDate, endDate, activeFilterLabel }) {
      this.startDate = startDate;
      this.endDate = endDate;
      this.activeQuickFilterLabel = activeFilterLabel;
      this.fetchData();
    },

    async fetchData() {
      this.loading = true;
      try {
        let payload = {};
        if (this.startDate) {
          payload.startDate = this.startDate;
        }
        if (this.endDate) {
          payload.endDate = this.endDate;
        }
        const response = await metricsApi.getSentimentAnalysisCounts(payload);

        if (response.data && response.data.ok) {
          this.dashboardData = response.data.payload;
        } else {
          console.error("Error in sentiment analysis data response:", response);
        }
      } catch (error) {
        console.error("Failed to fetch sentiment analysis data:", error);
      } finally {
        this.loading = false;
      }
    },

    findEnumMetricData(fieldName) {
      if (!this.dashboardData || !this.dashboardData.enumMetrics) return [];

      const metric = this.dashboardData.enumMetrics.find(
        (m) => m.field === fieldName
      );
      return metric ? metric.data : [];
    },

    getSentimentColors() {
      // Define color map for sentiment values
      return [
        "#4CAF50", // Green - Satisfecho
        "#8BC34A", // Light Green - Emoción/Entusiasmo
        "#9E9E9E", // Grey - Neutro
        "#F44336", // Red - Insatisfecho
        "#FF9800", // Orange - Confusión
        "#E91E63", // Pink - Fustracion
        "#7B1FA2", // Purple - Tóxico
        "#607D8B", // Blue Grey - Evasivo/Desconfiado
      ];
    },

    getDissatisfactionColors() {
      return [
        "#FF9800", // Orange - Primary
        "#FF5722", // Deep Orange - Secondary
        "#F44336", // Red - Tertiary
      ];
    },

    getFieldDisplayName(field) {
      // Map field names to display names
      const fieldMap = {
        venta_cruzada_efectiva: this.$t(
          "metrics.SENTIMENT_ANALYSIS.CROSS_SELLING"
        ),
        promociones_personalizadas: this.$t(
          "metrics.SENTIMENT_ANALYSIS.PERSONALIZED_PROMOS"
        ),
      };

      return fieldMap[field] || field;
    },

    getIconForField(field) {
      // Map field names to icons
      const iconMap = {
        venta_cruzada_efectiva: "mdi-cart-plus",
        promociones_personalizadas: "mdi-sale",
      };

      return iconMap[field] || "mdi-chart-bar";
    },
  },

  mounted() {
    this.fetchData();
  },
};
</script>

<style scoped>
.sentiment-analysis-dashboard {
  padding: 16px;
  background-color: #f5f5f5;
}

.date-info-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  transition: transform 0.3s, box-shadow 0.3s;
}

.date-info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15) !important;
}

.empty-state-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  transition: transform 0.3s, box-shadow 0.3s;
}

.empty-state-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15) !important;
}
</style>
