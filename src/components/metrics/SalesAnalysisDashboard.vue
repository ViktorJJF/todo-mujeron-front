<template>
  <div class="sales-analysis-dashboard">
    <unified-date-filter
      title="Análisis de Ventas"
      title-icon="mdi-cash-register"
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
      <!-- Total Chats with Sales Summary Card -->
      <unified-summary-card
        title="Resumen de Análisis de Ventas"
        icon="mdi-cash-register"
        color="primary"
        :stats="[
          {
            value: dashboardData.totalChatsWithSalesAnalysis,
            label: 'Total de Chats Analizados',
            color: 'primary',
          },
          {
            value: salesStats ? salesStats.conversionRate : 0,
            label: 'Tasa de Conversión',
            color: 'success',
            suffix: '%',
          },
          {
            value: salesStats ? salesStats.lostOpportunities : 0,
            label: 'Oportunidades Perdidas',
            color: 'error',
            suffix: '%',
          },
        ]"
      />

      <!-- Origin and Destination Chart -->
      <unified-bar-chart
        :data="getCategoryData('origen_y_destino_de_la_compra')"
        :total="getTotalForCategory('origen_y_destino_de_la_compra')"
        title="Origen y Destino de la Compra"
        icon="mdi-map-marker-path"
        :colors="chartColors.origin"
        :horizontal="true"
      />

      <!-- Payment Methods Chart -->
      <unified-bar-chart
        :data="getCategoryData('metodo_de_pago')"
        :total="getTotalForCategory('metodo_de_pago')"
        title="Métodos de Pago"
        icon="mdi-credit-card-outline"
        :colors="chartColors.payment"
        :horizontal="true"
      />

      <!-- Reasons for Not Buying Chart -->
      <unified-bar-chart
        :data="getCategoryData('motivos_de_no_compra')"
        :total="getTotalForCategory('motivos_de_no_compra')"
        title="Motivos de No Compra"
        icon="mdi-cart-remove"
        :colors="chartColors.noSale"
        :horizontal="true"
      />

      <!-- Loyalty and Repurchase Chart -->
      <unified-bar-chart
        :data="getCategoryData('fidelizacion_y_recompra')"
        :total="getTotalForCategory('fidelizacion_y_recompra')"
        title="Fidelización y Recompra"
        icon="mdi-refresh"
        :colors="chartColors.loyalty"
        :horizontal="true"
      />

      <!-- Final Result Chart -->
      <unified-bar-chart
        :data="getCategoryData('resultado_final_y_seguimiento')"
        :total="getTotalForCategory('resultado_final_y_seguimiento')"
        title="Resultado Final y Seguimiento"
        icon="mdi-flag-checkered"
        :colors="chartColors.result"
        :horizontal="true"
      />

      <!-- Lost Sales Opportunity Chart -->
      <unified-bar-chart
        :data="getCategoryData('perdida_de_oportunidad_de_venta')"
        :total="getTotalForCategory('perdida_de_oportunidad_de_venta')"
        title="Pérdida de Oportunidad de Venta"
        icon="mdi-alert-circle-outline"
        :colors="chartColors.lostOpp"
        :horizontal="true"
      />

      <!-- Time to Conversion Chart -->
      <unified-bar-chart
        :data="getStringEnumCategoryData('tiempo_de_conversion')"
        :total="getTotalForStringEnumCategory('tiempo_de_conversion')"
        title="Tiempo de Conversión"
        icon="mdi-clock-outline"
        :colors="chartColors.time"
      />

      <!-- Assistance Level Chart -->
      <unified-bar-chart
        :data="getStringEnumCategoryData('nivel_de_asistencia_en_la_compra')"
        :total="
          getTotalForStringEnumCategory('nivel_de_asistencia_en_la_compra')
        "
        title="Nivel de Asistencia en la Compra"
        icon="mdi-account-question-outline"
        :colors="chartColors.assistance"
      />
    </template>

    <template v-else-if="viewMode === VIEW_MODES.MONTHLY && monthlyData">
      <!-- Monthly sales trends summary card -->
      <unified-summary-card
        title="Resumen de Tendencias Mensuales de Ventas"
        icon="mdi-chart-timeline-variant"
        color="primary"
        :stats="[
          {
            value: totalMonthlyChats,
            label: 'Total de Chats Analizados',
            color: 'primary',
          },
          {
            value: monthsCount,
            label: 'Meses Analizados',
            color: 'info',
          },
          {
            value: monthlySalesStats ? monthlySalesStats.avgConversionRate : 0,
            label: 'Tasa de Conversión Promedio',
            color: 'success',
            suffix: '%',
          },
        ]"
      />

      <!-- Monthly Trend Chart for Sales Results -->
      <unified-line-chart
        :chart-data="monthlyData.monthlyData"
        :labels="monthlyLabels"
        :datasets="resultDatasets"
        title="Tendencia Mensual de Resultados de Venta"
        subtitle="Evolución mensual de los resultados de ventas"
        icon="mdi-chart-line"
        :loading="loading"
      />

      <!-- Monthly Trend Chart for Origin and Destination -->
      <unified-line-chart
        :chart-data="monthlyData.monthlyData"
        :labels="monthlyLabels"
        :datasets="originDatasets"
        title="Tendencia Mensual de Origen de Compra"
        subtitle="Evolución mensual del origen y destino de las compras"
        icon="mdi-map-marker-path"
        :loading="loading"
      />

      <!-- Monthly Trend Chart for Lost Opportunities -->
      <unified-line-chart
        :chart-data="monthlyData.monthlyData"
        :labels="monthlyLabels"
        :datasets="lostOpportunityDatasets"
        title="Tendencia Mensual de Oportunidades Perdidas"
        subtitle="Evolución mensual de las razones de pérdida de oportunidades de venta"
        icon="mdi-alert-circle-outline"
        :loading="loading"
      />
    </template>

    <v-row v-else>
      <v-col cols="12" class="text-center">
        <v-card class="pa-6 empty-state-card">
          <v-icon large color="grey lighten-1">mdi-chart-line</v-icon>
          <div class="text-h6 grey--text text--darken-1 mt-3">
            Seleccione un rango de fechas para ver los análisis de ventas
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Date Range Info -->
    <v-row v-if="dashboardData || monthlyData">
      <v-col cols="12">
        <v-card class="pa-3 text-center date-info-card">
          <span class="text-subtitle-1 grey--text">
            Período de datos:
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
import metricsApi from "@/services/api/metrics";
import UnifiedDateFilter from "@/components/metrics/UnifiedDateFilter";
import UnifiedSummaryCard from "@/components/metrics/UnifiedSummaryCard";
import UnifiedBarChart from "@/components/metrics/UnifiedBarChart";
import UnifiedLineChart from "@/components/metrics/UnifiedLineChart";

// Constants for view modes
const VIEW_MODES = {
  COUNTS: "counts",
  MONTHLY: "monthly",
};

export default {
  name: "SalesAnalysisDashboard",

  components: {
    UnifiedDateFilter,
    UnifiedSummaryCard,
    UnifiedBarChart,
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
      salesData: null,
      selectedQuickFilter: 8,
      activeQuickFilterLabel: "Todo el tiempo",
      chartColors: {
        origin: ["#4CAF50", "#2196F3", "#FF5722", "#FF9800", "#607D8B"],
        payment: ["#F44336", "#3F51B5", "#009688", "#FFC107"],
        noSale: ["#E91E63", "#673AB7", "#00BCD4", "#FF5722", "#795548"],
        loyalty: ["#8BC34A", "#3F51B5", "#4CAF50", "#FF9800", "#607D8B"],
        result: ["#4CAF50", "#FF5722", "#F44336", "#FFC107", "#2196F3"],
        lostOpp: ["#F44336", "#FF9800", "#E91E63"],
        time: ["#4CAF50", "#8BC34A", "#FFC107", "#FF9800"],
        assistance: ["#607D8B", "#9E9E9E", "#2196F3", "#3F51B5"],
        monthlySales: ["#4CAF50", "#2196F3", "#FF5722", "#FF9800", "#607D8B"],
        monthlyConversionRate: ["#F44336", "#3F51B5", "#009688", "#FFC107"],
        monthlyLostOpportunities: ["#E91E63", "#673AB7", "#00BCD4", "#FF5722"],
      },
    };
  },

  computed: {
    formatDateRange() {
      if (this.viewMode === VIEW_MODES.COUNTS && this.dashboardData) {
        const { startDate, endDate } = this.dashboardData.dateRange;
        if (startDate === "all time" && endDate === "all time") {
          return "Todo el tiempo";
        }
        return `${startDate} hasta ${endDate}`;
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

    salesStats() {
      if (!this.dashboardData) return null;

      const resultData = this.getCategoryData("resultado_final_y_seguimiento");
      const lostOpportunitiesData = this.getCategoryData(
        "perdida_de_oportunidad_de_venta"
      );

      if (!resultData || !lostOpportunitiesData) return null;

      const total = this.dashboardData.totalChatsWithSalesAnalysis;

      // Conversión: "Compra Concretada y Satisfacción", "Compra Concretada con Reclamos Posteriores", "Venta Parcial"
      const conversions = resultData
        .filter((item) =>
          [
            "Compra Concretada y Satisfacción",
            "Compra Concretada con Reclamos Posteriores",
            "Venta Parcial",
          ].includes(item.value)
        )
        .reduce((sum, item) => sum + item.count, 0);

      // Oportunidades perdidas: suma de todos los valores en perdida_de_oportunidad_de_venta
      const lostOpps = lostOpportunitiesData.reduce(
        (sum, item) => sum + item.count,
        0
      );

      return {
        conversionRate: Math.round((conversions / total) * 100),
        lostOpportunities: Math.round((lostOpps / total) * 100),
      };
    },

    // Monthly data computed properties
    monthlyLabels() {
      if (!this.monthlyData || !this.monthlyData.monthlyData) return [];

      return this.monthlyData.monthlyData.map(
        (month) =>
          `${month.monthName} ${month.year} (${month.totalChatsWithSalesAnalysis} chats)`
      );
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

    // Datasets for monthly charts
    resultDatasets() {
      if (!this.monthlyData || !this.monthlyData.monthlyData) return [];

      // Create datasets for sale results
      const resultTypes = [
        {
          label: "Compra Concretada y Satisfacción",
          color: "#4CAF50",
        },
        {
          label: "Compra Concretada con Reclamos Posteriores",
          color: "#FF9800",
        },
        {
          label: "Venta Parcial",
          color: "#2196F3",
        },
        {
          label: "No Compra",
          color: "#F44336",
        },
        {
          label: "Consulta de Estado Postventa",
          color: "#00BCD4",
        },
      ];

      // Prepare the regular datasets (non-sales)
      const datasets = resultTypes.map((resultType) => {
        const data = this.monthlyData.monthlyData.map((month) => {
          const categoryData = month.arrayCategories.find(
            (c) => c.category === "resultado_final_y_seguimiento"
          );

          if (!categoryData) return 0;

          const resultValue = categoryData.data.find(
            (d) => d.value === resultType.label
          );

          return resultValue ? resultValue.count : 0;
        });

        // Get total chats with sales analysis for each month for reference
        const totalChatsData = this.monthlyData.monthlyData.map(
          (month) => month.totalChatsWithSalesAnalysis || 0
        );

        // Calculate percentages for each month
        const percentageData = this.monthlyData.monthlyData.map(
          (month, index) => {
            const totalWithSales = month.totalChatsWithSalesAnalysis || 1; // Avoid division by zero
            const count = data[index];
            return parseFloat(((count / totalWithSales) * 100).toFixed(1));
          }
        );

        return {
          label: resultType.label,
          data: data,
          percentage: percentageData,
          totalChats: totalChatsData, // Add total chats for reference
          borderColor: resultType.color,
          backgroundColor: resultType.color + "33", // Add transparency
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        };
      });

      // Add a sales dataset if sheet sales data is available
      if (this.salesData && this.salesData.length > 0) {
        const salesData = this.salesData;

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

        // Extract month/year from our chart labels to match with sales data
        const monthsFromLabels = this.monthlyLabels
          .map((label) => {
            // Extract month name and year from the label (format: "Month Year (X chats)")
            const match = label.match(/(\w+)\s+(\d{4})/);
            if (match) {
              return {
                month: monthNameToNumber[match[1].toLowerCase()],
                year: parseInt(match[2]),
              };
            }
            return null;
          })
          .filter(Boolean);

        // Match sales data to the months in our chart
        const matchedSalesData = monthsFromLabels.map(({ month, year }) => {
          const saleEntry = salesData.find(
            (item) => item.month === month && item.year === year
          );
          return saleEntry ? saleEntry.total : 0;
        });

        if (matchedSalesData.length > 0) {
          // Calculate percentage (relative to the total sales)
          const totalSales = matchedSalesData.reduce(
            (sum, value) => sum + value,
            0
          );
          const salesPercentage = matchedSalesData.map((value) =>
            totalSales > 0 ? ((value / totalSales) * 100).toFixed(1) : "0.0"
          );

          // Add sales dataset
          datasets.push({
            label: "Ventas",
            data: matchedSalesData,
            percentage: salesPercentage,
            borderColor: "#9C27B0", // Purple
            backgroundColor: "#9C27B0" + "33",
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
            tension: 0.4,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
          });
        }
      }

      return datasets;
    },

    originDatasets() {
      if (!this.monthlyData || !this.monthlyData.monthlyData) return [];

      // Create datasets for origin and destination
      const originTypes = [
        {
          label: "Compra Directa en la Web, con Seguimiento en Chat",
          color: "#4CAF50",
        },
        {
          label: "Consulta por Chat, Compra Posterior en Web",
          color: "#2196F3",
        },
        {
          label: "Compra Finalizada Directamente desde el Chat",
          color: "#FF5722",
        },
        {
          label: "Consulta en Chat, Compra en Tienda Física",
          color: "#FF9800",
        },
        {
          label: "Compra en Web sin Interacción con el Chat",
          color: "#607D8B",
        },
      ];

      // Prepare regular datasets (non-sales)
      const datasets = originTypes.map((originType) => {
        const data = this.monthlyData.monthlyData.map((month) => {
          const categoryData = month.arrayCategories.find(
            (c) => c.category === "origen_y_destino_de_la_compra"
          );

          if (!categoryData) return 0;

          const originValue = categoryData.data.find(
            (d) => d.value === originType.label
          );

          return originValue ? originValue.count : 0;
        });

        // Get total chats with sales analysis for each month for reference
        const totalChatsData = this.monthlyData.monthlyData.map(
          (month) => month.totalChatsWithSalesAnalysis || 0
        );

        // Calculate percentages for each month
        const percentageData = this.monthlyData.monthlyData.map(
          (month, index) => {
            const totalWithSales = month.totalChatsWithSalesAnalysis || 1; // Avoid division by zero
            const count = data[index];
            return parseFloat(((count / totalWithSales) * 100).toFixed(1));
          }
        );

        return {
          label: originType.label,
          data: data,
          percentage: percentageData,
          totalChats: totalChatsData, // Add total chats for reference
          borderColor: originType.color,
          backgroundColor: originType.color + "33", // Add transparency
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        };
      });

      // Add a sales dataset if sheet sales data is available
      if (this.salesData && this.salesData.length > 0) {
        const salesData = this.salesData;

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

        // Extract month/year from our chart labels to match with sales data
        const monthsFromLabels = this.monthlyLabels
          .map((label) => {
            // Extract month name and year from the label (format: "Month Year (X chats)")
            const match = label.match(/(\w+)\s+(\d{4})/);
            if (match) {
              return {
                month: monthNameToNumber[match[1].toLowerCase()],
                year: parseInt(match[2]),
              };
            }
            return null;
          })
          .filter(Boolean);

        // Match sales data to the months in our chart
        const matchedSalesData = monthsFromLabels.map(({ month, year }) => {
          const saleEntry = salesData.find(
            (item) => item.month === month && item.year === year
          );
          return saleEntry ? saleEntry.total : 0;
        });

        if (matchedSalesData.length > 0) {
          // Calculate percentage (relative to the total sales)
          const totalSales = matchedSalesData.reduce(
            (sum, value) => sum + value,
            0
          );
          const salesPercentage = matchedSalesData.map((value) =>
            totalSales > 0 ? ((value / totalSales) * 100).toFixed(1) : "0.0"
          );

          // Add sales dataset
          datasets.push({
            label: "Ventas",
            data: matchedSalesData,
            percentage: salesPercentage,
            borderColor: "#9C27B0", // Purple
            backgroundColor: "#9C27B0" + "33",
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
            tension: 0.4,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
          });
        }
      }

      return datasets;
    },

    lostOpportunityDatasets() {
      if (!this.monthlyData || !this.monthlyData.monthlyData) return [];

      // Create datasets for lost opportunities
      const lostOppTypes = [
        {
          label: "No se respondio a tiempo",
          color: "#F44336",
        },
        {
          label: "Nos ganó la competencia",
          color: "#FF9800",
        },
        {
          label: "Tiempo de Respuesta",
          color: "#E91E63",
        },
      ];

      // Prepare regular datasets (non-sales)
      const datasets = lostOppTypes.map((lostOppType) => {
        const data = this.monthlyData.monthlyData.map((month) => {
          const categoryData = month.arrayCategories.find(
            (c) => c.category === "perdida_de_oportunidad_de_venta"
          );

          if (!categoryData) return 0;

          const lostOppValue = categoryData.data.find(
            (d) => d.value === lostOppType.label
          );

          return lostOppValue ? lostOppValue.count : 0;
        });

        // Get total chats with sales analysis for each month for reference
        const totalChatsData = this.monthlyData.monthlyData.map(
          (month) => month.totalChatsWithSalesAnalysis || 0
        );

        // Calculate percentages for each month
        const percentageData = this.monthlyData.monthlyData.map(
          (month, index) => {
            const totalWithSales = month.totalChatsWithSalesAnalysis || 1; // Avoid division by zero
            const count = data[index];
            return parseFloat(((count / totalWithSales) * 100).toFixed(1));
          }
        );

        return {
          label: lostOppType.label,
          data: data,
          percentage: percentageData,
          totalChats: totalChatsData, // Add total chats for reference
          borderColor: lostOppType.color,
          backgroundColor: lostOppType.color + "33", // Add transparency
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        };
      });

      // Add a sales dataset if sheet sales data is available
      if (this.salesData && this.salesData.length > 0) {
        const salesData = this.salesData;

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

        // Extract month/year from our chart labels to match with sales data
        const monthsFromLabels = this.monthlyLabels
          .map((label) => {
            // Extract month name and year from the label (format: "Month Year (X chats)")
            const match = label.match(/(\w+)\s+(\d{4})/);
            if (match) {
              return {
                month: monthNameToNumber[match[1].toLowerCase()],
                year: parseInt(match[2]),
              };
            }
            return null;
          })
          .filter(Boolean);

        // Match sales data to the months in our chart
        const matchedSalesData = monthsFromLabels.map(({ month, year }) => {
          const saleEntry = salesData.find(
            (item) => item.month === month && item.year === year
          );
          return saleEntry ? saleEntry.total : 0;
        });

        if (matchedSalesData.length > 0) {
          // Calculate percentage (relative to the total sales)
          const totalSales = matchedSalesData.reduce(
            (sum, value) => sum + value,
            0
          );
          const salesPercentage = matchedSalesData.map((value) =>
            totalSales > 0 ? ((value / totalSales) * 100).toFixed(1) : "0.0"
          );

          // Add sales dataset
          datasets.push({
            label: "Ventas",
            data: matchedSalesData,
            percentage: salesPercentage,
            borderColor: "#9C27B0", // Purple
            backgroundColor: "#9C27B0" + "33",
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
            tension: 0.4,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
          });
        }
      }

      return datasets;
    },

    monthlySalesStats() {
      if (!this.monthlyData || !this.monthlyData.monthlyData.length === 0)
        return null;

      // Calculate average conversion rate across all months
      let totalConversionRate = 0;
      let totalLostOpportunities = 0;

      this.monthlyData.monthlyData.forEach((month) => {
        const resultCategory = month.arrayCategories.find(
          (c) => c.category === "resultado_final_y_seguimiento"
        );

        const lostOppCategory = month.arrayCategories.find(
          (c) => c.category === "perdida_de_oportunidad_de_venta"
        );

        if (resultCategory && lostOppCategory) {
          const total = month.totalChatsWithSalesAnalysis;

          // Count conversions
          const conversions = resultCategory.data
            .filter((item) =>
              [
                "Compra Concretada y Satisfacción",
                "Compra Concretada con Reclamos Posteriores",
                "Venta Parcial",
              ].includes(item.value)
            )
            .reduce((sum, item) => sum + item.count, 0);

          // Count lost opportunities
          const lostOpps = lostOppCategory.data.reduce(
            (sum, item) => sum + item.count,
            0
          );

          totalConversionRate += (conversions / total) * 100;
          totalLostOpportunities += (lostOpps / total) * 100;
        }
      });

      const monthCount = this.monthlyData.monthlyData.length;

      return {
        avgConversionRate: parseFloat(
          (totalConversionRate / monthCount).toFixed(1)
        ),
        avgLostOpportunities: parseFloat(
          (totalLostOpportunities / monthCount).toFixed(1)
        ),
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

        // Reset sales data to fetch with new date range
        this.salesData = null;
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
      this.fetchData();
    },

    async fetchData() {
      // For initial data load, we'll fetch based on the current view mode
      if (this.viewMode === VIEW_MODES.COUNTS && !this.dashboardData) {
        await this.fetchCountsData();
      } else if (this.viewMode === VIEW_MODES.MONTHLY && !this.monthlyData) {
        await this.fetchMonthlyData();
      }

      // Fetch sales data if not already loaded
      if (!this.salesData) {
        await this.fetchSalesData();
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
        const response = await metricsApi.getSalesAnalysisCounts(payload);

        if (response.data && response.data.ok) {
          this.dashboardData = response.data.payload;
        } else {
          console.error("Error in sales analysis data response:", response);
        }
      } catch (error) {
        console.error("Failed to fetch sales analysis data:", error);
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
        const response = await metricsApi.getSalesAnalysisByMonth(payload);

        if (response.data && response.data.ok) {
          this.monthlyData = response.data.payload;
        } else {
          console.error(
            "Error in monthly sales analysis data response:",
            response
          );
        }
      } catch (error) {
        console.error("Failed to fetch monthly sales analysis data:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchSalesData() {
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
        const response = await metricsApi.getSheetSalesByMonth(payload);

        if (response.data && response.data.ok) {
          this.salesData = response.data.payload || [];
        } else {
          console.error("Error in sales data response:", response);
        }
      } catch (error) {
        console.error("Failed to fetch sales data:", error);
      }
    },

    getCategoryData(categoryName) {
      if (!this.dashboardData || !this.dashboardData.arrayCategories) return [];

      const category = this.dashboardData.arrayCategories.find(
        (c) => c.category === categoryName
      );
      return category ? category.data : [];
    },

    getTotalForCategory(categoryName) {
      if (!this.dashboardData || !this.dashboardData.arrayCategories) return 0;

      const category = this.dashboardData.arrayCategories.find(
        (c) => c.category === categoryName
      );
      return category ? category.total : 0;
    },

    getStringEnumCategoryData(categoryName) {
      if (!this.dashboardData || !this.dashboardData.stringEnumCategories)
        return [];

      const category = this.dashboardData.stringEnumCategories.find(
        (c) => c.category === categoryName
      );
      return category ? category.data : [];
    },

    getTotalForStringEnumCategory(categoryName) {
      if (!this.dashboardData || !this.dashboardData.stringEnumCategories)
        return 0;

      const category = this.dashboardData.stringEnumCategories.find(
        (c) => c.category === categoryName
      );
      return category ? category.total : 0;
    },

    getMonthlyData(categoryName) {
      if (!this.dashboardData || !this.dashboardData.monthlyCategories)
        return [];

      const category = this.dashboardData.monthlyCategories.find(
        (c) => c.category === categoryName
      );
      return category ? category.data : [];
    },

    getTotalForMonthly(categoryName) {
      if (!this.dashboardData || !this.dashboardData.monthlyCategories)
        return 0;

      const category = this.dashboardData.monthlyCategories.find(
        (c) => c.category === categoryName
      );
      return category ? category.total : 0;
    },
  },

  mounted() {
    // Initialize with 2024 date range
    this.startDate = "2024-01-01";
    this.endDate = "2024-12-31";
    this.activeQuickFilterLabel = "Año 2024";

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
.sales-analysis-dashboard {
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
