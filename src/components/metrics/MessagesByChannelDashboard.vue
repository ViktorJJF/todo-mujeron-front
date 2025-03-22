<template>
  <div class="messages-by-channel-dashboard">
    <v-card class="px-4 py-3 mb-4">
      <v-card-title class="headline">
        {{ $t("metrics.MESSAGES_BY_CHANNEL.TITLE") }}
      </v-card-title>
      <v-card-subtitle>
        {{ $t("metrics.MESSAGES_BY_CHANNEL.DATA_PERIOD") }}:
        {{ formatDateRange }}
      </v-card-subtitle>

      <unified-date-filter
        @filter-applied="handleFilterApplied"
        :selected-quick-filter="selectedQuickFilter"
        :title="$t('metrics.MESSAGES_BY_CHANNEL.FILTER_TITLE')"
        :description="$t('metrics.MESSAGES_BY_CHANNEL.SELECT_DATE_RANGE')"
        :start-label="$t('metrics.MESSAGES_BY_CHANNEL.START_DATE')"
        :end-label="$t('metrics.MESSAGES_BY_CHANNEL.END_DATE')"
        :button-label="$t('metrics.MESSAGES_BY_CHANNEL.APPLY_FILTER')"
        :quick-filter-label="$t('metrics.MESSAGES_BY_CHANNEL.QUICK_FILTERS')"
      />

      <!-- Loading Status Bar -->
      <v-card-text v-if="isLoading" class="pa-0 mt-2">
        <v-alert dense type="info" class="mb-0">
          <div class="d-flex align-center">
            <v-progress-circular
              indeterminate
              size="24"
              width="2"
              color="primary"
              class="mr-3"
            ></v-progress-circular>
            <div>
              <div class="subtitle-1">{{ loadingMessage }}</div>
              <div class="caption">
                <template v-if="loadingMessages">
                  <v-icon small color="primary" class="mr-1"
                    >mdi-loading</v-icon
                  >
                  <span class="mr-3">Métricas generales</span>
                </template>
                <template v-else-if="messagesLoaded">
                  <v-icon small color="success" class="mr-1">mdi-check</v-icon>
                  <span class="mr-3">Métricas generales</span>
                </template>

                <template v-if="loadingLeads">
                  <v-icon small color="primary" class="mr-1"
                    >mdi-loading</v-icon
                  >
                  <span class="mr-3">Leads por Mes</span>
                </template>
                <template v-else-if="leadsLoaded">
                  <v-icon small color="success" class="mr-1">mdi-check</v-icon>
                  <span class="mr-3">Leads por Mes</span>
                </template>

                <template v-if="loadingCleanLeads">
                  <v-icon small color="primary" class="mr-1"
                    >mdi-loading</v-icon
                  >
                  <span>Clean Leads</span>
                </template>
                <template v-else-if="cleanLeadsLoaded">
                  <v-icon small color="success" class="mr-1">mdi-check</v-icon>
                  <span>Clean Leads</span>
                </template>
              </div>
            </div>
          </div>
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Messages by Channel Section -->
    <v-card class="px-4 py-3 mb-4">
      <v-card-title>{{
        $t("metrics.MESSAGES_BY_CHANNEL.OVERVIEW_TITLE")
      }}</v-card-title>

      <v-skeleton-loader
        v-if="loadingMessages"
        type="card"
        class="mb-4"
      ></v-skeleton-loader>

      <template v-else-if="monthlyData && monthlyData.length > 0">
        <unified-summary-card
          :stats="summaryStats"
          :title="$t('metrics.MESSAGES_BY_CHANNEL.SUMMARY_TITLE')"
        />
      </template>

      <v-alert v-else type="info" class="text-center">
        {{ $t("metrics.NO_DATA_AVAILABLE") }}
      </v-alert>
    </v-card>

    <!-- Messages by Channel Monthly Trend -->
    <v-card class="px-4 py-3 mb-4">
      <v-card-title>{{
        $t("metrics.MESSAGES_BY_CHANNEL.MONTHLY_TREND_TITLE")
      }}</v-card-title>
      <v-card-subtitle>{{
        $t("metrics.MESSAGES_BY_CHANNEL.MONTHLY_TREND_TEXT")
      }}</v-card-subtitle>

      <v-skeleton-loader
        v-if="loadingMessages"
        type="image"
        height="400"
      ></v-skeleton-loader>

      <template v-else-if="monthlyData && monthlyData.length > 0">
        <unified-line-chart
          :labels="monthlyLabels"
          :datasets="channelDatasets"
          :chartData="monthlyData"
          :title="$t('metrics.MESSAGES_BY_CHANNEL.CHART_TITLE')"
          style="height: 400px"
        />
      </template>

      <v-alert v-else type="info" class="text-center">
        {{ $t("metrics.NO_DATA_AVAILABLE") }}
      </v-alert>
    </v-card>

    <!-- Messages by Channel Distribution -->
    <v-card class="px-4 py-3 mb-4">
      <v-card-title>{{
        $t("metrics.MESSAGES_BY_CHANNEL.DISTRIBUTION_TITLE")
      }}</v-card-title>
      <v-card-subtitle>{{
        $t("metrics.MESSAGES_BY_CHANNEL.DISTRIBUTION_TEXT")
      }}</v-card-subtitle>

      <v-skeleton-loader
        v-if="loadingMessages"
        type="image"
        height="400"
      ></v-skeleton-loader>

      <template v-else-if="monthlyData && monthlyData.length > 0">
        <div ref="pieChart" style="width: 100%; height: 400px"></div>
      </template>

      <v-alert v-else type="info" class="text-center">
        {{ $t("metrics.NO_DATA_AVAILABLE") }}
      </v-alert>
    </v-card>

    <!-- Leads by Month Section -->
    <!-- Leads Statistics -->
    <v-card class="px-4 py-3 mb-4" v-if="leadsData && leadsData.length > 0">
      <v-card-title>{{
        $t("metrics.LEADS_BY_MONTH.OVERVIEW_TITLE")
      }}</v-card-title>

      <v-skeleton-loader
        v-if="loadingLeads"
        type="card"
        class="mb-4"
      ></v-skeleton-loader>

      <template v-else>
        <unified-summary-card
          :stats="leadsSummaryStats"
          :title="$t('metrics.LEADS_BY_MONTH.SUMMARY_TITLE')"
        />
      </template>
    </v-card>
    <v-card class="px-4 py-3 mb-4">
      <v-card-title>{{ $t("metrics.LEADS_BY_MONTH.TITLE") }}</v-card-title>
      <v-card-subtitle>{{
        $t("metrics.LEADS_BY_MONTH.SUBTITLE")
      }}</v-card-subtitle>

      <v-skeleton-loader
        v-if="loadingLeads"
        type="image"
        height="400"
      ></v-skeleton-loader>

      <template v-else-if="leadsData && leadsData.length > 0">
        <unified-line-chart
          :labels="leadsLabels"
          :datasets="leadsDatasets"
          :chartData="leadsData"
          :title="$t('metrics.LEADS_BY_MONTH.CHART_TITLE')"
          style="height: 400px"
        />
      </template>

      <v-alert v-else type="info" class="text-center">
        {{ $t("metrics.NO_DATA_AVAILABLE") }}
      </v-alert>
    </v-card>

    <!-- CleanLeads Section -->
    <!-- CleanLeads Statistics -->
    <v-card
      class="px-4 py-3 mb-4"
      v-if="cleanLeadsData && cleanLeadsData.length > 0"
    >
      <v-card-title>{{
        $t("metrics.CLEAN_LEADS.OVERVIEW_TITLE")
      }}</v-card-title>

      <v-skeleton-loader
        v-if="loadingCleanLeads"
        type="card"
        class="mb-4"
      ></v-skeleton-loader>

      <template v-else>
        <unified-summary-card
          :stats="cleanLeadsSummaryStats"
          :title="$t('metrics.CLEAN_LEADS.SUMMARY_TITLE')"
        />
      </template>
    </v-card>
    <v-card class="px-4 py-3 mb-4">
      <v-card-title>{{ $t("metrics.CLEAN_LEADS.TITLE") }}</v-card-title>
      <v-card-subtitle>{{
        $t("metrics.CLEAN_LEADS.SUBTITLE")
      }}</v-card-subtitle>

      <v-skeleton-loader
        v-if="loadingCleanLeads"
        type="image"
        height="400"
      ></v-skeleton-loader>

      <template v-else-if="cleanLeadsData && cleanLeadsData.length > 0">
        <unified-line-chart
          :labels="cleanLeadsLabels"
          :datasets="cleanLeadsDatasets"
          :chartData="cleanLeadsData"
          :title="$t('metrics.CLEAN_LEADS.CHART_TITLE')"
          style="height: 400px"
        />
      </template>

      <v-alert v-else type="info" class="text-center">
        {{ $t("metrics.NO_DATA_AVAILABLE") }}
      </v-alert>
    </v-card>
  </div>
</template>

<script>
import * as echarts from "echarts";
import metricsApi from "@/services/api/metrics";
import UnifiedDateFilter from "@/components/metrics/UnifiedDateFilter";
import UnifiedSummaryCard from "@/components/metrics/UnifiedSummaryCard";
import UnifiedLineChart from "@/components/metrics/UnifiedLineChart";

export default {
  name: "MessagesByChannelDashboard",

  components: {
    UnifiedDateFilter,
    UnifiedSummaryCard,
    UnifiedLineChart,
  },

  data() {
    return {
      // Shared data
      startDate: null,
      endDate: null,
      selectedQuickFilter: 9,
      activeQuickFilterLabel: "Todo el tiempo",

      // Messages by channel data
      loadingMessages: false,
      monthlyData: null,
      channelTotals: [],
      pieChart: null,

      // Leads by month data
      loadingLeads: false,
      leadsData: null,

      // CleanLeads data
      loadingCleanLeads: false,
      cleanLeadsData: null,

      // Colors for charts
      channelColors: {
        WhatsApp: "#25D366",
        Whatsapp: "#25D366",
        whatsapp: "#25D366",
        Whatsapp_automated: "#128C7E", // Darker WhatsApp color for automated
        whatsapp_automated: "#128C7E",
        Messenger: "#0084FF",
        messenger: "#0084FF",
        Instagram: "#E1306C",
        instagram: "#E1306C",
        Facebook: "#1877F2", // Updated Facebook blue
        facebook: "#1877F2",
        Web: "#007BFF",
        web: "#007BFF",
        Email: "#D44638",
        email: "#D44638",
        SMS: "#FFCC00",
        sms: "#FFCC00",
        Phone: "#FF6B00",
        phone: "#FF6B00",
        Other: "#9E9E9E",
        other: "#9E9E9E",
        Telegram: "#0088CC",
        telegram: "#0088CC",
        Twitter: "#1DA1F2",
        twitter: "#1DA1F2",
      },
      defaultColors: [
        "#4CAF50", // Green
        "#2196F3", // Blue
        "#FFC107", // Amber
        "#FF5722", // Deep Orange
        "#9C27B0", // Purple
        "#607D8B", // Blue Grey
        "#795548", // Brown
        "#3F51B5", // Indigo
      ],

      // Loading states
      messagesLoaded: false,
      leadsLoaded: false,
      cleanLeadsLoaded: false,
    };
  },

  computed: {
    formatDateRange() {
      if (!this.monthlyData || this.monthlyData.length === 0) {
        if (!this.leadsData || this.leadsData.length === 0) {
          if (!this.cleanLeadsData || this.cleanLeadsData.length === 0) {
            return "";
          }
          const firstMonth = this.cleanLeadsData[0];
          const lastMonth = this.cleanLeadsData[this.cleanLeadsData.length - 1];
          return `${firstMonth.monthName} ${firstMonth.year} - ${lastMonth.monthName} ${lastMonth.year}`;
        }
        const firstMonth = this.leadsData[0];
        const lastMonth = this.leadsData[this.leadsData.length - 1];
        return `${firstMonth.monthName} ${firstMonth.year} - ${lastMonth.monthName} ${lastMonth.year}`;
      }

      const firstMonth = this.monthlyData[0];
      const lastMonth = this.monthlyData[this.monthlyData.length - 1];
      return `${firstMonth.monthName} ${firstMonth.year} - ${lastMonth.monthName} ${lastMonth.year}`;
    },

    // Messages by channel computed properties
    monthlyLabels() {
      if (!this.monthlyData) return [];

      // Get unique month-year combinations
      const uniqueMonths = [
        ...new Set(
          this.monthlyData.map((item) => `${item.monthName} ${item.year}`)
        ),
      ];
      return uniqueMonths.sort((a, b) => {
        const [aMonthName, aYear] = a.split(" ");
        const [bMonthName, bYear] = b.split(" ");

        // Compare years first
        if (aYear !== bYear) return aYear - bYear;

        // If years are equal, compare months
        const monthOrder = {
          enero: 1,
          febrero: 2,
          marzo: 3,
          abril: 4,
          mayo: 5,
          junio: 6,
          julio: 7,
          agosto: 8,
          septiembre: 9,
          octubre: 10,
          noviembre: 11,
          diciembre: 12,
        };

        return monthOrder[aMonthName] - monthOrder[bMonthName];
      });
    },

    channelDatasets() {
      if (!this.monthlyData) return [];

      // Identify all unique platforms across all data points
      const allPlatforms = [
        ...new Set(this.monthlyData.map((item) => item.platform)),
      ];

      // Get sorted unique month-year combinations
      const uniqueMonthYears = this.monthlyLabels;

      return allPlatforms.map((platform) => {
        // For each month-year, find the corresponding count for this platform
        const data = uniqueMonthYears.map((monthYear) => {
          const [monthName, year] = monthYear.split(" ");
          const monthData = this.monthlyData.find(
            (item) =>
              item.platform === platform &&
              item.monthName === monthName &&
              item.year.toString() === year
          );
          return monthData ? monthData.count : 0;
        });

        // Map platform to proper channel name for color mapping
        const channelName =
          platform.charAt(0).toUpperCase() + platform.slice(1);

        return {
          label: channelName,
          data: data,
          borderColor: this.getChannelColor(channelName),
          backgroundColor: this.getChannelColor(channelName) + "33", // Add transparency
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        };
      });
    },

    totalMessages() {
      if (!this.channelTotals.length) return 0;
      return this.channelTotals.reduce(
        (total, channel) => total + channel.total,
        0
      );
    },

    summaryStats() {
      if (!this.monthlyData) return [];

      // Create a copy of the channel totals to avoid mutating the original
      const topChannelData = [...this.channelTotals].sort(
        (a, b) => b.total - a.total
      );

      const topChannel =
        topChannelData.length > 0
          ? topChannelData[0]
          : { channel: "", total: 0 };

      return [
        {
          value: this.totalMessages,
          label: this.$t("metrics.MESSAGES_BY_CHANNEL.TOTAL_MESSAGES"),
          color: "primary",
        },
        {
          value: this.monthlyData.length,
          label: this.$t("metrics.MESSAGES_BY_CHANNEL.MONTHS_ANALYZED"),
          color: "info",
        },
        {
          value: topChannel.channel,
          label: this.$t("metrics.MESSAGES_BY_CHANNEL.MAIN_CHANNEL"),
          color: "success",
        },
        {
          value: topChannel.total,
          label: this.$t("metrics.MESSAGES_BY_CHANNEL.MESSAGES_IN_CHANNEL"),
          color: "success",
        },
      ];
    },

    // Leads by month computed properties
    leadsLabels() {
      if (!this.leadsData) return [];
      return this.leadsData.map((item) => `${item.monthName} ${item.year}`);
    },

    leadsDatasets() {
      if (!this.leadsData) return [];

      // Calculate total leads for percentage calculation
      const totalLeads = this.totalLeads;
      const percentage = this.leadsData.map((item) =>
        totalLeads > 0 ? ((item.count / totalLeads) * 100).toFixed(1) : "0.0"
      );

      return [
        {
          label: "Leads",
          data: this.leadsData.map((item) => item.count),
          percentage: percentage, // Add percentage data for tooltip
          borderColor: "#4CAF50",
          backgroundColor: "#4CAF5033",
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        },
      ];
    },

    totalLeads() {
      if (!this.leadsData) return 0;
      return this.leadsData.reduce((total, item) => total + item.count, 0);
    },

    leadsSummaryStats() {
      if (!this.leadsData) return [];

      // Find month with highest leads
      const highestLeadMonth = [...this.leadsData].sort(
        (a, b) => b.count - a.count
      )[0] || { monthName: "", year: "", count: 0 };

      // Calculate average leads per month
      const avgLeadsPerMonth = this.leadsData.length
        ? Math.round(this.totalLeads / this.leadsData.length)
        : 0;

      return [
        {
          value: this.totalLeads,
          label: this.$t("metrics.LEADS_BY_MONTH.TOTAL_LEADS"),
          color: "primary",
        },
        {
          value: this.leadsData.length,
          label: this.$t("metrics.LEADS_BY_MONTH.MONTHS_ANALYZED"),
          color: "info",
        },
        {
          value: avgLeadsPerMonth,
          label: this.$t("metrics.LEADS_BY_MONTH.AVERAGE_MONTHLY"),
          color: "warning",
        },
        {
          value: `${highestLeadMonth.monthName} ${highestLeadMonth.year} (${highestLeadMonth.count})`,
          label: this.$t("metrics.LEADS_BY_MONTH.BEST_MONTH"),
          color: "success",
        },
      ];
    },

    // CleanLeads computed properties
    cleanLeadsLabels() {
      if (!this.cleanLeadsData) return [];
      return this.cleanLeadsData.map(
        (item) => `${item.monthName} ${item.year}`
      );
    },

    cleanLeadsDatasets() {
      if (!this.cleanLeadsData) return [];

      // Calculate total clean leads for percentage calculation
      const totalCleanLeads = this.totalCleanLeads;
      const percentage = this.cleanLeadsData.map((item) =>
        totalCleanLeads > 0
          ? ((item.count / totalCleanLeads) * 100).toFixed(1)
          : "0.0"
      );

      return [
        {
          label: "Clean Leads",
          data: this.cleanLeadsData.map((item) => item.count),
          percentage: percentage, // Add percentage data for tooltip
          borderColor: "#FF5722", // Deep Orange
          backgroundColor: "#FF572233", // With transparency
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        },
      ];
    },

    totalCleanLeads() {
      if (!this.cleanLeadsData) return 0;
      return this.cleanLeadsData.reduce((total, item) => total + item.count, 0);
    },

    cleanLeadsSummaryStats() {
      if (!this.cleanLeadsData) return [];

      // Find month with highest clean leads
      const highestCleanLeadsMonth = [...this.cleanLeadsData].sort(
        (a, b) => b.count - a.count
      )[0] || { monthName: "", year: 0, count: 0 };

      // Calculate average clean leads per month
      const avgCleanLeadsPerMonth = this.cleanLeadsData.length
        ? Math.round(this.totalCleanLeads / this.cleanLeadsData.length)
        : 0;

      return [
        {
          value: this.totalCleanLeads,
          label: this.$t("metrics.CLEAN_LEADS.TOTAL_CLEAN_LEADS"),
          color: "primary",
        },
        {
          value: this.cleanLeadsData.length,
          label: this.$t("metrics.CLEAN_LEADS.MONTHS_ANALYZED"),
          color: "info",
        },
        {
          value: avgCleanLeadsPerMonth,
          label: this.$t("metrics.CLEAN_LEADS.AVERAGE_MONTHLY"),
          color: "warning",
        },
        {
          value: `${highestCleanLeadsMonth.monthName} ${highestCleanLeadsMonth.year} (${highestCleanLeadsMonth.count})`,
          label: this.$t("metrics.CLEAN_LEADS.BEST_MONTH"),
          color: "deep-orange",
        },
      ];
    },

    // Common loading states
    isLoading() {
      return (
        this.loadingMessages || this.loadingLeads || this.loadingCleanLeads
      );
    },

    loadingMessage() {
      let loadingItems = [];
      if (this.loadingMessages) loadingItems.push("mensajes");
      if (this.loadingLeads) loadingItems.push("leads");
      if (this.loadingCleanLeads) loadingItems.push("clean leads");

      if (loadingItems.length > 0) {
        return `Cargando datos de ${loadingItems.join(" y ")}...`;
      }

      return "Cargando datos...";
    },
  },

  methods: {
    getChannelColor(channel) {
      // Try to find a direct match first (case-sensitive)
      if (this.channelColors[channel]) {
        return this.channelColors[channel];
      }

      // Try to match with lowercase
      const lowercaseChannel = channel.toLowerCase();
      if (this.channelColors[lowercaseChannel]) {
        return this.channelColors[lowercaseChannel];
      }

      // Check if it's a variation of an existing platform
      for (const [key, value] of Object.entries(this.channelColors)) {
        if (lowercaseChannel.includes(key.toLowerCase())) {
          return value;
        }
      }

      // If no match found, use the random color function
      return this.getRandomColor(channel);
    },

    getRandomColor(channel) {
      // Use a hash function to consistently generate the same color for the same channel
      let hash = 0;
      for (let i = 0; i < channel.length; i++) {
        hash = channel.charCodeAt(i) + ((hash << 5) - hash);
      }

      // Use the hash to pick a color from our default colors
      const index = Math.abs(hash) % this.defaultColors.length;
      return this.defaultColors[index];
    },

    calculatePercentage(value) {
      if (!this.totalMessages) return 0;
      return ((value / this.totalMessages) * 100).toFixed(1);
    },

    handleFilterApplied({
      startDate,
      endDate,
      activeFilterLabel,
      quickFilterIndex,
      forceRefresh,
    }) {
      // Store the previous date range to check if it changed
      const dateRangeChanged =
        this.startDate !== startDate || this.endDate !== endDate;

      // Update the date range and filter properties
      this.startDate = startDate;
      this.endDate = endDate;
      this.activeQuickFilterLabel = activeFilterLabel;
      this.selectedQuickFilter = quickFilterIndex;

      // If date range changed or forceRefresh is true, clear cached data to force refresh
      if (dateRangeChanged || forceRefresh) {
        this.monthlyData = null;
        this.leadsData = null;
        this.cleanLeadsData = null;
      }

      // Fetch data independently
      this.fetchMessagesData();
      this.fetchLeadsData();
      this.fetchCleanLeadsData();
    },

    async fetchMessagesData() {
      // Check if we should fetch data (either no data or forced refresh)
      if (this.startDate && this.endDate) {
        this.loadingMessages = true;
        this.messagesLoaded = false;
        try {
          const company =
            this.$store.getters["authModule/getCurrentCompany"].company._id;

          const response = await metricsApi.getMessagesByChannelByMonth({
            startDate: this.startDate,
            endDate: this.endDate,
            company: company,
          });

          if (response.data && response.data.ok) {
            this.monthlyData = response.data.payload || [];

            // Calculate totals by platform for summary stats
            const platformMap = new Map();

            if (this.monthlyData && this.monthlyData.length > 0) {
              this.monthlyData.forEach((item) => {
                const platform = item.platform;
                const count = item.count;

                if (platformMap.has(platform)) {
                  platformMap.set(platform, platformMap.get(platform) + count);
                } else {
                  platformMap.set(platform, count);
                }
              });

              this.channelTotals = Array.from(platformMap.entries())
                .map(([platform, total]) => ({
                  channel: platform.charAt(0).toUpperCase() + platform.slice(1), // Capitalize first letter
                  total,
                }))
                .sort((a, b) => b.total - a.total);

              this.$nextTick(() => {
                this.renderPieChart();
              });
            } else {
              this.channelTotals = [];
            }

            this.messagesLoaded = true;
          } else {
            console.error("Error in messages by channel response:", response);
          }
        } catch (error) {
          console.error("Error fetching message channel data:", error);
        } finally {
          this.loadingMessages = false;
        }
      } else if (this.monthlyData) {
        // Data already loaded
        this.messagesLoaded = true;
      }
    },

    async fetchLeadsData() {
      // Check if we should fetch data
      if (this.startDate && this.endDate) {
        this.loadingLeads = true;
        this.leadsLoaded = false;
        try {
          const company =
            this.$store.getters["authModule/getCurrentCompany"].company._id;

          const response = await metricsApi.getLeadsByMonth({
            startDate: this.startDate,
            endDate: this.endDate,
            company: company,
          });

          if (response.data && response.data.ok) {
            this.leadsData = response.data.payload || [];
            this.leadsLoaded = true;
          } else {
            console.error("Error in leads response:", response);
          }
        } catch (error) {
          console.error("Error fetching leads data:", error);
        } finally {
          this.loadingLeads = false;
        }
      } else if (this.leadsData) {
        // Data already loaded
        this.leadsLoaded = true;
      }
    },

    async fetchCleanLeadsData() {
      // Check if we should fetch data
      if (this.startDate && this.endDate) {
        this.loadingCleanLeads = true;
        this.cleanLeadsLoaded = false;
        try {
          const company =
            this.$store.getters["authModule/getCurrentCompany"].company._id;

          const response = await metricsApi.getCleanLeadsByChannelByMonth({
            startDate: this.startDate,
            endDate: this.endDate,
            company: company,
          });

          if (response.data && response.data.ok) {
            this.cleanLeadsData = response.data.payload || [];
            this.cleanLeadsLoaded = true;
          } else {
            console.error("Error in clean leads response:", response);
          }
        } catch (error) {
          console.error("Error fetching clean leads data:", error);
        } finally {
          this.loadingCleanLeads = false;
        }
      } else if (this.cleanLeadsData) {
        // Data already loaded
        this.cleanLeadsLoaded = true;
      }
    },

    renderPieChart() {
      if (this.pieChart) {
        this.pieChart.dispose();
      }

      if (!this.channelTotals || !this.channelTotals.length) return;

      const chartDom = this.$refs.pieChart;
      if (!chartDom) return;

      try {
        this.pieChart = echarts.init(chartDom);

        const option = {
          tooltip: {
            trigger: "item",
            formatter: "{b}: {c} ({d}%)",
            textStyle: {
              fontSize: 14,
            },
          },
          legend: {
            orient: "vertical",
            right: 10,
            top: "center",
            data: this.channelTotals.map((item) => item.channel),
            textStyle: {
              fontSize: 14,
              fontWeight: 500,
            },
            formatter: (name) => {
              const item = this.channelTotals.find((c) => c.channel === name);
              if (item) {
                const percentage = (
                  (item.total / this.totalMessages) *
                  100
                ).toFixed(1);
                return `${name} (${percentage}%)`;
              }
              return name;
            },
            icon: "circle",
          },
          series: [
            {
              name: this.$t("metrics.MESSAGES_BY_CHANNEL.DISTRIBUTION_TITLE"),
              type: "pie",
              radius: ["40%", "70%"],
              avoidLabelOverlap: true,
              itemStyle: {
                borderRadius: 10,
                borderColor: "#fff",
                borderWidth: 2,
              },
              label: {
                show: false,
                position: "center",
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 18,
                  fontWeight: "bold",
                },
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: "rgba(0, 0, 0, 0.5)",
                },
              },
              labelLine: {
                show: false,
              },
              data: this.channelTotals.map((item) => ({
                name: item.channel,
                value: item.total,
                itemStyle: {
                  color: this.getChannelColor(item.channel),
                },
              })),
            },
          ],
        };

        this.pieChart.setOption(option);
      } catch (error) {
        console.error("Error rendering pie chart:", error);
      }
    },

    handleResize() {
      if (this.pieChart) {
        this.pieChart.resize();
      }
    },

    fetchAllData() {
      // Force a data fetch regardless of cached data state
      // This ensures data is loaded when the component is mounted
      this.monthlyData = null;
      this.leadsData = null;
      this.cleanLeadsData = null;

      this.fetchMessagesData();
      this.fetchLeadsData();
      this.fetchCleanLeadsData();
    },
  },

  mounted() {
    // Set initial dates if not already set
    if (!this.startDate || !this.endDate) {
      // Default to last 90 days
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 90);

      this.startDate = start.toISOString().split("T")[0];
      this.endDate = end.toISOString().split("T")[0];
    }

    // Set loading states to true before fetching data
    this.loadingMessages = true;
    this.loadingLeads = true;
    this.loadingCleanLeads = true;

    // Initial data fetch - fetch each endpoint independently
    this.fetchAllData();

    // Add window resize event listener
    window.addEventListener("resize", this.handleResize);
  },

  beforeDestroy() {
    // Cleanup chart instance
    if (this.pieChart) {
      this.pieChart.dispose();
      this.pieChart = null;
    }

    // Remove event listener
    window.removeEventListener("resize", this.handleResize);
  },

  created() {
    // Notify parent that component is ready to be displayed
    this.$nextTick(() => {
      this.$emit("component-ready");
    });

    // Add fallback translations if they don't exist
    const fallbackTranslations = {
      "metrics.MESSAGES_BY_CHANNEL.FILTER_TITLE": "Message Date Filter",
      "metrics.MESSAGES_BY_CHANNEL.SUMMARY_TITLE": "Messages Summary",
      "metrics.MESSAGES_BY_CHANNEL.CHART_TITLE": "Messages by Channel",
      "metrics.LEADS_BY_MONTH.CHART_TITLE": "Leads by Month",
      "metrics.LEADS_BY_MONTH.SUMMARY_TITLE": "Leads Summary",
      "metrics.CLEAN_LEADS.CHART_TITLE": "Clean Leads",
      "metrics.CLEAN_LEADS.SUMMARY_TITLE": "Clean Leads Summary",
      "metrics.NO_DATA_AVAILABLE": "No data available for the selected period",
    };

    // Check if i18n exists and add fallbacks if needed
    if (this.$i18n && this.$i18n.mergeLocaleMessage) {
      this.$i18n.mergeLocaleMessage("es", fallbackTranslations);
      this.$i18n.mergeLocaleMessage("en", fallbackTranslations);
    }
  },
};
</script>

<style scoped>
.messages-by-channel-dashboard {
  padding: 16px;
  background-color: #f5f5f5;
}

.date-info-card,
.chart-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  transition: transform 0.3s, box-shadow 0.3s;
}

.date-info-card:hover,
.chart-card:hover {
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

.chart-title {
  font-size: 1.25rem !important;
  font-weight: 500 !important;
  padding-bottom: 8px;
}

.chart-subtitle {
  opacity: 0.8;
  font-size: 0.9rem !important;
}

.legend-item {
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  transition: background-color 0.2s;
}

.legend-item:hover {
  background-color: rgba(0, 0, 0, 0.07);
}

.legend-label {
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v-alert .v-icon.v-icon {
  font-size: 16px;
}

.caption {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}
</style>
