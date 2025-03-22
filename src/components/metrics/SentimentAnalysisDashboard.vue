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
    >
      <template v-slot:after-title>
        <div class="view-mode-container">
          <span class="view-mode-label mr-2"
            >{{ $t("metrics.SENTIMENT_ANALYSIS.VIEW_TYPE") }}:</span
          >
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
              {{ $t("metrics.SENTIMENT_ANALYSIS.COUNTS_VIEW") }}
            </v-btn>
            <v-btn small :value="VIEW_MODES.MONTHLY" class="view-mode-btn">
              <v-icon small left>mdi-chart-line</v-icon>
              {{ $t("metrics.SENTIMENT_ANALYSIS.MONTHLY_VIEW") }}
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
      <unified-bar-chart
        :data="findEnumMetricData('calificacion_del_sentimiento')"
        :total="dashboardData.totalChatsWithSentiment"
        :title="$t('metrics.SENTIMENT_ANALYSIS.DISTRIBUTION_TITLE')"
        :subtitle="$t('metrics.SENTIMENT_ANALYSIS.DISTRIBUTION_TEXT')"
        icon="mdi-emoticon-outline"
        :colors="getSentimentColors()"
        :horizontal="true"
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
    </template>

    <template v-else-if="viewMode === VIEW_MODES.MONTHLY && monthlyData">
      <!-- Monthly sentiment trends summary card -->
      <unified-summary-card
        :title="$t('metrics.SENTIMENT_ANALYSIS.MONTHLY_OVERVIEW_TITLE')"
        icon="mdi-chart-timeline-variant"
        color="primary"
        :stats="[
          {
            value: totalMonthlyChats,
            label: $t('metrics.SENTIMENT_ANALYSIS.TOTAL_CHATS'),
            color: 'primary',
          },
          {
            value: monthsCount,
            label: $t('metrics.SENTIMENT_ANALYSIS.MONTHS_ANALYZED'),
            color: 'info',
          },
          {
            value: monthlySentimentStats
              ? monthlySentimentStats.avgPositive
              : 0,
            label: $t('metrics.SENTIMENT_ANALYSIS.AVG_POSITIVE_SENTIMENT'),
            color: 'success',
            suffix: '%',
          },
        ]"
      />

      <!-- Monthly Trend Chart for Sentiment -->
      <unified-line-chart
        :chart-data="monthlyData.monthlyData"
        :labels="monthlyLabels"
        :datasets="sentimentDatasets"
        :title="$t('metrics.SENTIMENT_ANALYSIS.MONTHLY_TREND_TITLE')"
        :subtitle="$t('metrics.SENTIMENT_ANALYSIS.MONTHLY_TREND_TEXT')"
        icon="mdi-chart-line"
        :loading="loading"
      />

      <!-- Monthly Trend Chart for Dissatisfaction Origin -->
      <unified-line-chart
        :chart-data="monthlyData.monthlyData"
        :labels="monthlyLabels"
        :datasets="dissatisfactionDatasets"
        :title="$t('metrics.SENTIMENT_ANALYSIS.MONTHLY_DISSATISFACTION_TITLE')"
        :subtitle="
          $t('metrics.SENTIMENT_ANALYSIS.MONTHLY_DISSATISFACTION_TEXT')
        "
        icon="mdi-chart-areaspline"
        :loading="loading"
      />

      <!-- Monthly Boolean Metrics Chart (Cross-selling and Personalized Promos) -->
      <unified-line-chart
        :chart-data="monthlyData.monthlyData"
        :labels="monthlyLabels"
        :datasets="booleanMetricsDatasets"
        :title="$t('metrics.SENTIMENT_ANALYSIS.MONTHLY_BOOLEAN_METRICS_TITLE')"
        :subtitle="
          $t('metrics.SENTIMENT_ANALYSIS.MONTHLY_BOOLEAN_METRICS_TEXT')
        "
        icon="mdi-chart-box-outline"
        :loading="loading"
      />
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

    <!-- Date Range Info -->
    <v-row v-if="dashboardData || monthlyData">
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
import UnifiedBarChart from "@/components/metrics/UnifiedBarChart";
import UnifiedBooleanMetric from "@/components/metrics/UnifiedBooleanMetric";
import UnifiedLineChart from "@/components/metrics/UnifiedLineChart";

// Constants for view modes
const VIEW_MODES = {
  COUNTS: "counts",
  MONTHLY: "monthly",
};

export default {
  name: "SentimentAnalysisDashboard",

  components: {
    UnifiedDateFilter,
    UnifiedSummaryCard,
    UnifiedBarChart,
    UnifiedBooleanMetric,
    UnifiedLineChart,
  },

  data() {
    return {
      VIEW_MODES,
      viewMode: VIEW_MODES.COUNTS,
      loading: false,
      startDate: null,
      endDate: null,
      dashboardData: null,
      monthlyData: null,
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
      if (this.viewMode === VIEW_MODES.COUNTS && this.dashboardData) {
        const { startDate, endDate } = this.dashboardData.dateRange;
        if (startDate === "all time" && endDate === "all time") {
          return this.$t("metrics.SENTIMENT_ANALYSIS.ALL_TIME");
        }
        return `${startDate} to ${endDate}`;
      } else if (
        this.viewMode === VIEW_MODES.MONTHLY &&
        this.monthlyData &&
        this.monthlyData.monthlyData.length > 0
      ) {
        const firstMonth = this.monthlyData.monthlyData[0];
        const lastMonth =
          this.monthlyData.monthlyData[this.monthlyData.monthlyData.length - 1];
        return `${firstMonth.monthName} ${firstMonth.year} - ${lastMonth.monthName} ${lastMonth.year}`;
      }

      return "";
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

    // Monthly data computations
    monthlyLabels() {
      if (!this.monthlyData || !this.monthlyData.monthlyData) return [];

      return this.monthlyData.monthlyData.map(
        (month) =>
          `${month.monthName} ${month.year} (${month.totalChatsWithSentiment} chats)`
      );
    },

    sentimentDatasets() {
      if (!this.monthlyData || !this.monthlyData.monthlyData) return [];

      // Create datasets for each sentiment type
      const sentimentTypes = [
        { label: "Satisfecho", color: "#4CAF50" },
        { label: "Emoción/Entusiasmo", color: "#8BC34A" },
        { label: "Neutro", color: "#9E9E9E" },
        { label: "Insatisfecho", color: "#F44336" },
        { label: "Confusión", color: "#FF9800" },
        { label: "Fustracion", color: "#E91E63" },
        { label: "Tóxico", color: "#7B1FA2" },
        { label: "Evasivo/Desconfiado", color: "#607D8B" },
      ];

      return sentimentTypes.map((sentimentType) => {
        const data = this.monthlyData.monthlyData.map((month) => {
          const sentimentMetric = month.enumMetrics.find(
            (m) => m.field === "calificacion_del_sentimiento"
          );

          if (!sentimentMetric) return 0;

          const sentimentValue = sentimentMetric.data.find(
            (d) => d.value === sentimentType.label
          );

          return sentimentValue ? sentimentValue.count : 0;
        });

        // Get total chats with sentiment for each month for reference
        const totalChatsData = this.monthlyData.monthlyData.map(
          (month) => month.totalChatsWithSentiment || 0
        );

        // Calculate percentages for each month
        const percentageData = this.monthlyData.monthlyData.map(
          (month, index) => {
            const totalWithSentiment = month.totalChatsWithSentiment || 1; // Avoid division by zero
            const count = data[index];
            return parseFloat(((count / totalWithSentiment) * 100).toFixed(1));
          }
        );

        return {
          label: sentimentType.label,
          data: data,
          percentage: percentageData, // Add percentage data
          totalChats: totalChatsData, // Add total chats for reference
          borderColor: sentimentType.color,
          backgroundColor: sentimentType.color + "33", // Add transparency
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        };
      });
    },

    dissatisfactionDatasets() {
      if (!this.monthlyData || !this.monthlyData.monthlyData) return [];

      // Create datasets for dissatisfaction origins
      const dissatisfactionTypes = [
        { label: "Error de la compañía", color: "#FF9800" },
        { label: "Error que no controlamos", color: "#FF5722" },
        {
          label: "Su error al seleccionar el producto comprado",
          color: "#F44336",
        },
        { label: "Sin insatisfacción", color: "#4CAF50" },
      ];

      return dissatisfactionTypes.map((dissType) => {
        const data = this.monthlyData.monthlyData.map((month) => {
          const dissMetric = month.enumMetrics.find(
            (m) => m.field === "origen_de_la_insatisfaccion"
          );

          if (!dissMetric) return 0;

          const dissValue = dissMetric.data.find(
            (d) => d.value === dissType.label
          );

          return dissValue ? dissValue.count : 0;
        });

        // Get total chats with sentiment for each month for reference
        const totalChatsData = this.monthlyData.monthlyData.map(
          (month) => month.totalChatsWithSentiment || 0
        );

        // Calculate percentages for each month
        const percentageData = this.monthlyData.monthlyData.map(
          (month, index) => {
            const totalWithSentiment = month.totalChatsWithSentiment || 1; // Avoid division by zero
            const count = data[index];
            return parseFloat(((count / totalWithSentiment) * 100).toFixed(1));
          }
        );

        return {
          label: dissType.label,
          data: data,
          percentage: percentageData, // Add percentage data
          totalChats: totalChatsData, // Add total chats for reference
          borderColor: dissType.color,
          backgroundColor: dissType.color + "33", // Add transparency
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        };
      });
    },

    booleanMetricsDatasets() {
      if (!this.monthlyData || !this.monthlyData.monthlyData) return [];

      // Create datasets for boolean metrics
      const booleanMetrics = [
        {
          field: "venta_cruzada_efectiva",
          label: this.$t("metrics.SENTIMENT_ANALYSIS.CROSS_SELLING"),
          color: "#4CAF50",
        },
        {
          field: "promociones_personalizadas",
          label: this.$t("metrics.SENTIMENT_ANALYSIS.PERSONALIZED_PROMOS"),
          color: "#8BC34A",
        },
      ];

      return booleanMetrics.map((metric) => {
        const data = this.monthlyData.monthlyData.map((month) => {
          // Look for the boolean metrics in each month's data
          const booleanMetric = month.booleanMetrics
            ? month.booleanMetrics.find((m) => m.field === metric.field)
            : null;

          if (!booleanMetric) return 0;

          // Get the count of true values (representing positive cross-selling or personalized promos)
          const trueCount = booleanMetric.data.filter(
            (item) => item.value === true
          ).length;
          return trueCount;
        });

        // Get total chats with sentiment for each month for reference
        const totalChatsData = this.monthlyData.monthlyData.map(
          (month) => month.totalChatsWithSentiment || 0
        );

        // Calculate percentages for each month
        const percentageData = this.monthlyData.monthlyData.map(
          (month, index) => {
            const totalChats = month.totalChatsWithSentiment || 1; // Avoid division by zero
            const count = data[index];
            return parseFloat(((count / totalChats) * 100).toFixed(1));
          }
        );

        return {
          label: metric.label,
          data: data,
          percentage: percentageData,
          totalChats: totalChatsData, // Add total chats for reference
          borderColor: metric.color,
          backgroundColor: metric.color + "33", // Add transparency
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        };
      });
    },

    totalChatsDataset() {
      if (!this.monthlyData || !this.monthlyData.monthlyData) return [];

      const totalChatsData = this.monthlyData.monthlyData.map(
        (month) => month.totalChats
      );
      const totalChatsWithSentimentData = this.monthlyData.monthlyData.map(
        (month) => month.totalChatsWithSentiment
      );

      // Calculate percentages of chats with sentiment
      const sentimentPercentageData = this.monthlyData.monthlyData.map(
        (month) => {
          const totalChats = month.totalChats || 1; // Avoid division by zero
          return parseFloat(
            ((month.totalChatsWithSentiment / totalChats) * 100).toFixed(1)
          );
        }
      );

      return [
        {
          label: this.$t("metrics.SENTIMENT_ANALYSIS.TOTAL_CHATS"),
          data: totalChatsData,
          totalChats: totalChatsData, // Self reference for consistency
          borderColor: "#1976D2",
          backgroundColor: "#1976D233",
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        },
        {
          label: this.$t(
            "metrics.SENTIMENT_ANALYSIS.TOTAL_CHATS_WITH_SENTIMENT"
          ),
          data: totalChatsWithSentimentData,
          percentage: sentimentPercentageData,
          totalChats: totalChatsData, // Add total chats for reference
          borderColor: "#9C27B0",
          backgroundColor: "#9C27B033",
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        },
      ];
    },

    totalMonthlyChats() {
      if (!this.monthlyData || !this.monthlyData.monthlyData) return 0;
      return this.monthlyData.monthlyData.reduce(
        (total, month) => total + month.totalChats,
        0
      );
    },

    monthsCount() {
      if (!this.monthlyData || !this.monthlyData.monthlyData) return 0;
      return this.monthlyData.monthlyData.length;
    },

    monthlySentimentStats() {
      if (!this.monthlyData || !this.monthlyData.monthlyData.length === 0)
        return null;

      // Calculate average positive sentiment across all months
      let totalPositive = 0;
      let totalNegative = 0;

      this.monthlyData.monthlyData.forEach((month) => {
        const sentimentMetric = month.enumMetrics.find(
          (m) => m.field === "calificacion_del_sentimiento"
        );

        if (sentimentMetric) {
          const total = month.totalChatsWithSentiment;

          // Positive sentiments
          const positiveCount = sentimentMetric.data
            .filter((item) =>
              ["Satisfecho", "Emoción/Entusiasmo"].includes(item.value)
            )
            .reduce((sum, item) => sum + item.count, 0);

          // Negative sentiments
          const negativeCount = sentimentMetric.data
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

          totalPositive += (positiveCount / total) * 100;
          totalNegative += (negativeCount / total) * 100;
        }
      });

      const monthCount = this.monthlyData.monthlyData.length;

      return {
        avgPositive: parseFloat((totalPositive / monthCount).toFixed(2)),
        avgNegative: parseFloat((totalNegative / monthCount).toFixed(2)),
      };
    },
  },

  methods: {
    handleFilterApplied({
      startDate,
      endDate,
      activeFilterLabel,
      forceRefresh,
    }) {
      // Store the previous date range to check if it changed
      const dateRangeChanged =
        this.startDate !== startDate || this.endDate !== endDate;

      // Update the date range
      this.startDate = startDate;
      this.endDate = endDate;
      this.activeQuickFilterLabel = activeFilterLabel;

      // If date range changed or forceRefresh is true, clear cached data to force refresh
      if (dateRangeChanged || forceRefresh) {
        if (this.viewMode === VIEW_MODES.COUNTS) {
          this.dashboardData = null;
        } else if (this.viewMode === VIEW_MODES.MONTHLY) {
          this.monthlyData = null;
        }
      }

      // Fetch data based on current view mode
      this.fetchData();
    },

    handleViewModeChange() {
      // If data for the selected view mode is already available, don't fetch again
      if (this.viewMode === VIEW_MODES.COUNTS && this.dashboardData) {
        this.loading = false; // Ensure loading is off since we're using cached data
        return;
      } else if (this.viewMode === VIEW_MODES.MONTHLY && this.monthlyData) {
        this.loading = false; // Ensure loading is off since we're using cached data
        return;
      }

      // If we don't have the data already, fetch it
      this.loading = true;

      if (this.viewMode === VIEW_MODES.COUNTS) {
        this.fetchCountsData();
      } else if (this.viewMode === VIEW_MODES.MONTHLY) {
        this.fetchMonthlyData();
      }
    },

    async fetchData() {
      // For initial data load, we'll fetch based on the current view mode
      if (this.viewMode === VIEW_MODES.COUNTS && !this.dashboardData) {
        await this.fetchCountsData();
      } else if (this.viewMode === VIEW_MODES.MONTHLY && !this.monthlyData) {
        await this.fetchMonthlyData();
      }
    },

    async fetchCountsData() {
      this.loading = true;
      try {
        let payload = {
          company:
            this.$store.getters["authModule/getCurrentCompany"].company._id,
        };
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

    async fetchMonthlyData() {
      this.loading = true;
      try {
        let payload = {
          company:
            this.$store.getters["authModule/getCurrentCompany"].company._id,
        };
        if (this.startDate) {
          payload.startDate = this.startDate;
        }
        if (this.endDate) {
          payload.endDate = this.endDate;
        }
        const response = await metricsApi.getSentimentAnalysisByMonth(payload);

        if (response.data && response.data.ok) {
          this.monthlyData = response.data.payload;
        } else {
          console.error(
            "Error in monthly sentiment analysis data response:",
            response
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch monthly sentiment analysis data:",
          error
        );
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
    // Initially, fetch data based on the current view mode
    this.fetchData();

    // For better user experience, also prefetch the other view's data
    // with lower priority (after a delay)
    setTimeout(() => {
      if (this.viewMode === VIEW_MODES.COUNTS && !this.monthlyData) {
        this.fetchMonthlyData();
      } else if (this.viewMode === VIEW_MODES.MONTHLY && !this.dashboardData) {
        this.fetchCountsData();
      }
    }, 1000); // Delay to ensure main view loads first
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

.view-mode-container {
  display: flex;
  align-items: center;
}

.view-mode-label {
  font-weight: 500;
}

.view-mode-toggle {
  margin-left: auto !important;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.view-mode-btn {
  margin: 0 4px;
}
</style>
