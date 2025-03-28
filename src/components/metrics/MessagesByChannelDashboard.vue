<template>
  <div class="messages-by-channel-dashboard">
    <v-card class="px-4 py-3 mb-4">
      <v-card-title class="headline"> Mensajes por Canal </v-card-title>
      <v-card-subtitle>
        Período de datos:
        {{ formatDateRange }}
      </v-card-subtitle>

      <unified-date-filter
        @filter-applied="handleFilterApplied"
        :selected-quick-filter="selectedQuickFilter"
        :title="'Filtro de fecha de mensajes'"
        :description="'Seleccione rango de fechas'"
        :start-label="'Fecha de inicio'"
        :end-label="'Fecha de fin'"
        :button-label="'Aplicar filtro'"
        :quick-filter-label="'Filtros rápidos'"
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

                <template v-if="loadingSales">
                  <v-icon small color="primary" class="mr-1"
                    >mdi-loading</v-icon
                  >
                  <span>Ventas</span>
                </template>
              </div>
            </div>
          </div>
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Messages by Channel Section -->
    <v-card class="px-4 py-3 mb-4">
      <v-card-title>Resumen General</v-card-title>

      <v-skeleton-loader
        v-if="loadingMessages"
        type="card"
        class="mb-4"
      ></v-skeleton-loader>

      <template v-else-if="monthlyData && monthlyData.length > 0">
        <unified-summary-card
          :stats="summaryStats"
          :title="'Resumen de Mensajes'"
        />
      </template>

      <v-alert v-else type="info" class="text-center">
        No hay datos disponibles para el período seleccionado
      </v-alert>
    </v-card>

    <!-- Messages by Channel Monthly Trend -->
    <v-card class="px-4 py-3 mb-4">
      <v-card-title>Tendencia Mensual</v-card-title>
      <v-card-subtitle
        >Evolución de mensajes por canal a lo largo del tiempo</v-card-subtitle
      >

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
          :title="'Mensajes por Canal'"
          style="height: auto; margin-bottom: 20px"
        />
      </template>

      <v-alert v-else type="info" class="text-center">
        No hay datos disponibles para el período seleccionado
      </v-alert>
    </v-card>

    <!-- Messages by Channel Distribution -->
    <v-card class="px-4 py-3 mb-4">
      <v-card-title>Distribución por Canal</v-card-title>
      <v-card-subtitle
        >Porcentaje de mensajes por cada canal de comunicación</v-card-subtitle
      >

      <v-skeleton-loader
        v-if="loadingMessages"
        type="image"
        height="400"
      ></v-skeleton-loader>

      <template v-else-if="monthlyData && monthlyData.length > 0">
        <div ref="pieChart" style="width: 100%; height: 400px"></div>
      </template>

      <v-alert v-else type="info" class="text-center">
        No hay datos disponibles para el período seleccionado
      </v-alert>
    </v-card>

    <!-- Leads by Month Section -->
    <!-- Leads Statistics -->
    <v-card
      class="px-4 py-3 mb-4"
      v-if="(leadsData && leadsData.length > 0) || loadingLeads"
    >
      <v-card-title>Resumen de Leads</v-card-title>

      <v-skeleton-loader
        v-if="loadingLeads"
        type="card"
        class="mb-4"
      ></v-skeleton-loader>

      <template v-else>
        <unified-summary-card
          :stats="leadsSummaryStats"
          :title="'Resumen de Leads'"
        />
      </template>
    </v-card>
    <v-card class="px-4 py-3 mb-4">
      <v-card-title>Leads por Mes</v-card-title>
      <v-card-subtitle
        >Evolución de leads generados mensualmente</v-card-subtitle
      >

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
          :title="'Leads por Mes'"
          style="height: auto; margin-bottom: 20px"
        />
      </template>

      <v-alert v-else type="info" class="text-center">
        No hay datos disponibles para el período seleccionado
      </v-alert>
    </v-card>

    <!-- CleanLeads Section -->
    <!-- CleanLeads Statistics -->
    <v-card
      class="px-4 py-3 mb-4"
      v-if="(cleanLeadsData && cleanLeadsData.length > 0) || loadingCleanLeads"
    >
      <v-card-title>Resumen de Clean Leads</v-card-title>

      <v-skeleton-loader
        v-if="loadingCleanLeads"
        type="card"
        class="mb-4"
      ></v-skeleton-loader>

      <template v-else>
        <unified-summary-card
          :stats="cleanLeadsSummaryStats"
          :title="'Resumen de Clean Leads'"
        />
      </template>
    </v-card>
    <v-card class="px-4 py-3 mb-4">
      <v-card-title>Clean Leads</v-card-title>
      <v-card-subtitle
        >Evolución de clean leads generados mensualmente</v-card-subtitle
      >

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
          :title="'Clean Leads'"
          style="height: auto; margin-bottom: 20px"
        />
      </template>

      <v-alert v-else type="info" class="text-center">
        No hay datos disponibles para el período seleccionado
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
import axios from "axios";

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
      selectedQuickFilter: 8, // Default to "Año 2024"
      activeQuickFilterLabel: "Año 2024",

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

      // Sales data
      loadingSales: false,
      salesData: null,

      // Request cancellation tokens
      messagesAxiosCancelToken: null,
      leadsAxiosCancelToken: null,
      cleanLeadsAxiosCancelToken: null,
      salesAxiosCancelToken: null,

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
      salesLoaded: false,
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

      // Create datasets for each platform
      const platformDatasets = allPlatforms.map((platform) => {
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

        const channelColor = this.getChannelColor(channelName);

        // Calculate percentage for each data point (for tooltip only)
        const totalByMonth = {};
        this.monthlyData.forEach((item) => {
          const key = `${item.monthName} ${item.year}`;
          if (!totalByMonth[key]) totalByMonth[key] = 0;
          totalByMonth[key] += item.count;
        });

        const percentage = uniqueMonthYears.map((monthYear, idx) => {
          const total = totalByMonth[monthYear] || 0;
          return total > 0 ? ((data[idx] / total) * 100).toFixed(1) : "0.0";
        });

        return {
          label: channelName,
          data: data,
          percentage: percentage, // Keep percentage for tooltips
          borderColor: channelColor,
          backgroundColor: channelColor,
          // ECharts-specific properties - Clean line only
          lineStyle: {
            width: 3,
            color: channelColor,
            type: "solid",
          },
          itemStyle: {
            color: channelColor,
          },
          symbol: "circle",
          symbolSize: 6,
        };
      });

      // Add sales dataset if available
      if (this.salesData && this.salesData.length > 0) {
        // Map month names to their numerical representation for matching
        const monthNameToNumber = {
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

        // Prepare sales data for each month in the messages chart
        const salesData = uniqueMonthYears.map((monthYear) => {
          const [monthName, yearStr] = monthYear.split(" ");
          const year = parseInt(yearStr);
          const month = monthNameToNumber[monthName.toLowerCase()];

          const saleEntry = this.salesData.find(
            (item) => item.month === month && item.year === year
          );

          return saleEntry ? saleEntry.total : 0;
        });

        // Calculate percentage (not really meaningful for sales vs messages, but kept for tooltip consistency)
        const totalSales = salesData.reduce((sum, value) => sum + value, 0);
        const salesPercentage = salesData.map((value) =>
          totalSales > 0 ? ((value / totalSales) * 100).toFixed(1) : "0.0"
        );

        // Add the sales dataset
        platformDatasets.push({
          label: "Ventas",
          data: salesData,
          percentage: salesPercentage,
          borderColor: "#9C27B0", // Purple
          backgroundColor: "#9C27B0",
          lineStyle: {
            width: 3,
            color: "#9C27B0",
            type: "solid",
          },
          itemStyle: {
            color: "#9C27B0",
          },
          symbol: "diamond",
          symbolSize: 7,
        });
      }

      return platformDatasets;
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
          label: "Total de mensajes",
          color: "primary",
        },
        {
          value: this.monthlyData.length,
          label: "Meses analizados",
          color: "info",
        },
        {
          value: topChannel.channel,
          label: "Canal principal",
          color: "success",
        },
        {
          value: topChannel.total,
          label: "Mensajes en canal principal",
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

      const datasets = [];

      // Calculate total leads for percentage calculation (for tooltip only)
      const totalLeads = this.totalLeads;
      const percentage = this.leadsData.map((item) =>
        totalLeads > 0 ? ((item.count / totalLeads) * 100).toFixed(1) : "0.0"
      );

      // Add leads dataset
      datasets.push({
        label: "Leads",
        data: this.leadsData.map((item) => item.count),
        percentage: percentage, // Keep percentage for tooltips
        borderColor: "#4CAF50",
        backgroundColor: "#4CAF50",
        // ECharts-specific properties - Clean line only
        lineStyle: {
          width: 3,
          color: "#4CAF50",
          type: "solid",
        },
        itemStyle: {
          color: "#4CAF50",
        },
        symbol: "circle",
        symbolSize: 6,
      });

      // Add sales dataset if available
      if (
        this.salesData &&
        this.salesData.length > 0 &&
        this.leadsData.length > 0
      ) {
        // Map month names to their numerical representation for matching
        const monthNameToNumber = {
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

        // Get months from leads data
        const leadsMonths = this.leadsLabels.map((label) => {
          const [monthName, yearStr] = label.split(" ");
          return {
            month: monthNameToNumber[monthName.toLowerCase()],
            year: parseInt(yearStr),
          };
        });

        // Match sales data to leads months
        const salesData = leadsMonths.map(({ month, year }) => {
          const saleEntry = this.salesData.find(
            (item) => item.month === month && item.year === year
          );
          return saleEntry ? saleEntry.total : 0;
        });

        // Calculate percentage
        const totalSales = salesData.reduce((sum, value) => sum + value, 0);
        const salesPercentage = salesData.map((value) =>
          totalSales > 0 ? ((value / totalSales) * 100).toFixed(1) : "0.0"
        );

        // Add to datasets
        datasets.push({
          label: "Ventas",
          data: salesData,
          percentage: salesPercentage,
          borderColor: "#9C27B0", // Purple
          backgroundColor: "#9C27B0",
          lineStyle: {
            width: 3,
            color: "#9C27B0",
            type: "solid",
          },
          itemStyle: {
            color: "#9C27B0",
          },
          symbol: "diamond",
          symbolSize: 7,
        });
      }

      return datasets;
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
          label: "Total de leads",
          color: "primary",
        },
        {
          value: this.leadsData.length,
          label: "Meses analizados",
          color: "info",
        },
        {
          value: avgLeadsPerMonth,
          label: "Promedio mensual",
          color: "warning",
        },
        {
          value: `${highestLeadMonth.monthName} ${highestLeadMonth.year} (${highestLeadMonth.count})`,
          label: "Mejor mes",
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

      const datasets = [];

      // Calculate total clean leads for percentage calculation (for tooltip only)
      const totalCleanLeads = this.totalCleanLeads;
      const percentage = this.cleanLeadsData.map((item) =>
        totalCleanLeads > 0
          ? ((item.count / totalCleanLeads) * 100).toFixed(1)
          : "0.0"
      );

      // Add clean leads dataset
      datasets.push({
        label: "Clean Leads",
        data: this.cleanLeadsData.map((item) => item.count),
        percentage: percentage, // Keep percentage for tooltips
        borderColor: "#FF5722", // Deep Orange
        backgroundColor: "#FF5722",
        // ECharts-specific properties - Clean line only
        lineStyle: {
          width: 3,
          color: "#FF5722",
          type: "solid",
        },
        itemStyle: {
          color: "#FF5722",
        },
        symbol: "circle",
        symbolSize: 6,
      });

      // Add sales dataset if available
      if (
        this.salesData &&
        this.salesData.length > 0 &&
        this.cleanLeadsData.length > 0
      ) {
        // Map month names to their numerical representation for matching
        const monthNameToNumber = {
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

        // Get months from clean leads data
        const cleanLeadsMonths = this.cleanLeadsLabels.map((label) => {
          const [monthName, yearStr] = label.split(" ");
          return {
            month: monthNameToNumber[monthName.toLowerCase()],
            year: parseInt(yearStr),
          };
        });

        // Match sales data to clean leads months
        const salesData = cleanLeadsMonths.map(({ month, year }) => {
          const saleEntry = this.salesData.find(
            (item) => item.month === month && item.year === year
          );
          return saleEntry ? saleEntry.total : 0;
        });

        // Calculate percentage
        const totalSales = salesData.reduce((sum, value) => sum + value, 0);
        const salesPercentage = salesData.map((value) =>
          totalSales > 0 ? ((value / totalSales) * 100).toFixed(1) : "0.0"
        );

        // Add to datasets
        datasets.push({
          label: "Ventas",
          data: salesData,
          percentage: salesPercentage,
          borderColor: "#9C27B0", // Purple
          backgroundColor: "#9C27B0",
          lineStyle: {
            width: 3,
            color: "#9C27B0",
            type: "solid",
          },
          itemStyle: {
            color: "#9C27B0",
          },
          symbol: "diamond",
          symbolSize: 7,
        });
      }

      return datasets;
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
          label: "Total de clean leads",
          color: "primary",
        },
        {
          value: this.cleanLeadsData.length,
          label: "Meses analizados",
          color: "info",
        },
        {
          value: avgCleanLeadsPerMonth,
          label: "Promedio mensual",
          color: "warning",
        },
        {
          value: `${highestCleanLeadsMonth.monthName} ${highestCleanLeadsMonth.year} (${highestCleanLeadsMonth.count})`,
          label: "Mejor mes",
          color: "deep-orange",
        },
      ];
    },

    // Sales computed properties
    salesLabels() {
      if (!this.salesData) return [];

      const monthNames = {
        1: "enero",
        2: "febrero",
        3: "marzo",
        4: "abril",
        5: "mayo",
        6: "junio",
        7: "julio",
        8: "agosto",
        9: "septiembre",
        10: "octubre",
        11: "noviembre",
        12: "diciembre",
      };

      return this.salesData.map(
        (item) => `${monthNames[item.month]} ${item.year}`
      );
    },

    // Common loading states
    isLoading() {
      return (
        this.loadingMessages ||
        this.loadingLeads ||
        this.loadingCleanLeads ||
        this.loadingSales
      );
    },

    loadingMessage() {
      let loadingItems = [];
      if (this.loadingMessages) loadingItems.push("mensajes");
      if (this.loadingLeads) loadingItems.push("leads");
      if (this.loadingCleanLeads) loadingItems.push("clean leads");
      if (this.loadingSales) loadingItems.push("ventas");

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

    formatNumber(value) {
      // Return the full number without K suffix
      return value.toString();
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

      // Handle "Todo el tiempo" filter (index 12) explicitly
      if (quickFilterIndex === 12) {
        this.startDate = null;
        this.endDate = null;
      } else {
        // Update the date range for other filters
        this.startDate = startDate;
        this.endDate = endDate;
      }

      this.activeQuickFilterLabel = activeFilterLabel || "Todo el tiempo";

      if (quickFilterIndex !== undefined) {
        this.selectedQuickFilter = quickFilterIndex;
      }

      // If date range changed or forceRefresh is true, clear cached data to force refresh
      if (dateRangeChanged || forceRefresh) {
        // Reset data
        this.monthlyData = null;
        this.leadsData = null;
        this.cleanLeadsData = null;
        this.salesData = null;

        // Reset loaded flags
        this.messagesLoaded = false;
        this.leadsLoaded = false;
        this.cleanLeadsLoaded = false;
        this.salesLoaded = false;

        // Set loading flags
        this.loadingMessages = true;
        this.loadingLeads = true;
        this.loadingCleanLeads = true;
        this.loadingSales = true;
      }

      // Log current state for debugging
      console.log("Filter applied:", {
        startDate: this.startDate,
        endDate: this.endDate,
        quickFilterIndex,
        activeFilterLabel: this.activeQuickFilterLabel,
      });

      // Cancel any existing requests
      this.cancelPendingRequests();

      // Fetch data independently
      this.fetchMessagesData();
      this.fetchLeadsData();
      this.fetchCleanLeadsData();
      this.fetchSalesData();
    },

    cancelPendingRequests() {
      // Cancel any pending requests
      if (this.messagesAxiosCancelToken) {
        this.messagesAxiosCancelToken.cancel(
          "Operation canceled due to new request"
        );
      }
      if (this.leadsAxiosCancelToken) {
        this.leadsAxiosCancelToken.cancel(
          "Operation canceled due to new request"
        );
      }
      if (this.cleanLeadsAxiosCancelToken) {
        this.cleanLeadsAxiosCancelToken.cancel(
          "Operation canceled due to new request"
        );
      }
      if (this.salesAxiosCancelToken) {
        this.salesAxiosCancelToken.cancel(
          "Operation canceled due to new request"
        );
      }

      // Create new cancel tokens
      this.messagesAxiosCancelToken = axios.CancelToken.source();
      this.leadsAxiosCancelToken = axios.CancelToken.source();
      this.cleanLeadsAxiosCancelToken = axios.CancelToken.source();
      this.salesAxiosCancelToken = axios.CancelToken.source();
    },

    async fetchMessagesData() {
      this.loadingMessages = true;
      this.messagesLoaded = false;
      try {
        const company =
          this.$store.getters["authModule/getCurrentCompany"].company._id;

        // Build request params - only company ID by default
        const params = { company };

        // Only add date parameters if they're not null or undefined
        if (this.startDate !== null && this.startDate !== undefined) {
          params.startDate = this.startDate;
        }

        if (this.endDate !== null && this.endDate !== undefined) {
          params.endDate = this.endDate;
        }

        console.log("Messages API request params:", params);

        const response = await metricsApi.getMessagesByChannelByMonth(params, {
          cancelToken: this.messagesAxiosCancelToken.token,
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
        if (!axios.isCancel(error)) {
          console.error("Error fetching message channel data:", error);
        }
      } finally {
        this.loadingMessages = false;
      }
    },

    async fetchLeadsData() {
      this.loadingLeads = true;
      this.leadsLoaded = false;
      try {
        const company =
          this.$store.getters["authModule/getCurrentCompany"].company._id;

        // Build request params - only company ID by default
        const params = { company };

        // Only add date parameters if they're not null or undefined
        if (this.startDate !== null && this.startDate !== undefined) {
          params.startDate = this.startDate;
        }

        if (this.endDate !== null && this.endDate !== undefined) {
          params.endDate = this.endDate;
        }

        console.log("Leads API request params:", params);

        const response = await metricsApi.getLeadsByMonth(params, {
          cancelToken: this.leadsAxiosCancelToken.token,
        });

        if (response.data && response.data.ok) {
          this.leadsData = response.data.payload || [];
          this.leadsLoaded = true;
        } else {
          console.error("Error in leads response:", response);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error fetching leads data:", error);
        }
      } finally {
        this.loadingLeads = false;
      }
    },

    async fetchCleanLeadsData() {
      this.loadingCleanLeads = true;
      this.cleanLeadsLoaded = false;
      try {
        const company =
          this.$store.getters["authModule/getCurrentCompany"].company._id;

        // Build request params - only company ID by default
        const params = { company };

        // Only add date parameters if they're not null or undefined
        if (this.startDate !== null && this.startDate !== undefined) {
          params.startDate = this.startDate;
        }

        if (this.endDate !== null && this.endDate !== undefined) {
          params.endDate = this.endDate;
        }

        console.log("CleanLeads API request params:", params);

        const response = await metricsApi.getCleanLeadsByChannelByMonth(
          params,
          { cancelToken: this.cleanLeadsAxiosCancelToken.token }
        );

        if (response.data && response.data.ok) {
          this.cleanLeadsData = response.data.payload || [];
          this.cleanLeadsLoaded = true;
        } else {
          console.error("Error in clean leads response:", response);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error fetching clean leads data:", error);
        }
      } finally {
        this.loadingCleanLeads = false;
      }
    },

    async fetchSalesData() {
      this.loadingSales = true;
      this.salesLoaded = false;
      try {
        const company =
          this.$store.getters["authModule/getCurrentCompany"].company._id;

        // Build request params - only company ID by default
        const params = { company };

        // Only add date parameters if they're not null or undefined
        if (this.startDate !== null && this.startDate !== undefined) {
          params.startDate = this.startDate;
        }

        if (this.endDate !== null && this.endDate !== undefined) {
          params.endDate = this.endDate;
        }

        console.log("Sales API request params:", params);

        const response = await metricsApi.getSheetSalesByMonth(params, {
          cancelToken: this.salesAxiosCancelToken.token,
        });

        if (response.data && response.data.ok) {
          this.salesData = response.data.payload || [];
          this.salesLoaded = true;
        } else {
          console.error("Error in sales response:", response);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error fetching sales data:", error);
        }
      } finally {
        this.loadingSales = false;
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
              name: "Distribución por Canal",
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
        // Delay resize slightly to ensure DOM is ready
        setTimeout(() => {
          this.pieChart.resize();
        }, 100);
      }
    },

    fetchAllData() {
      // Force a data fetch regardless of cached data state
      // This ensures data is loaded when the component is mounted
      this.monthlyData = null;
      this.leadsData = null;
      this.cleanLeadsData = null;
      this.salesData = null;

      this.fetchMessagesData();
      this.fetchLeadsData();
      this.fetchCleanLeadsData();
      this.fetchSalesData();
    },

    mounted() {
      // Initialize with 2024 date range
      this.startDate = "2024-01-01";
      this.endDate = "2024-12-31";
      this.activeQuickFilterLabel = "Año 2024";

      this.initializeChartComponents();
      this.initializeData();

      // Listen for resizing events to redraw charts
      window.addEventListener("resize", this.handleWindowResize);

      // Emit component ready event so parent can know this component is loaded
      this.$emit("component-ready");

      // If we should load with a specific filter
      if (this.selectedQuickFilter === 12) {
        // No specific filter - load data with 2024 filter instead
        this.selectedQuickFilter = 8;
      }

      // Initialize cancel tokens
      this.messagesAxiosCancelToken = axios.CancelToken.source();
      this.leadsAxiosCancelToken = axios.CancelToken.source();
      this.cleanLeadsAxiosCancelToken = axios.CancelToken.source();
      this.salesAxiosCancelToken = axios.CancelToken.source();

      // Set loading states to true before fetching data
      this.loadingMessages = true;
      this.loadingLeads = true;
      this.loadingCleanLeads = true;
      this.loadingSales = true;

      // Initial data fetch - fetch each endpoint independently
      this.fetchAllData();
    },

    beforeDestroy() {
      // Cleanup chart instance
      if (this.pieChart) {
        this.pieChart.dispose();
        this.pieChart = null;
      }

      // Cancel any pending requests
      this.cancelPendingRequests();

      // Remove event listener
      window.removeEventListener("resize", this.handleResize);
    },

    created() {
      // Notify parent that component is ready to be displayed
      this.$nextTick(() => {
        this.$emit("component-ready");
      });
    },
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
