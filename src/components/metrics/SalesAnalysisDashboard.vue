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

      <!-- Date Range Info -->
      <v-row>
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
  </div>
</template>

<script>
import metricsApi from "@/services/api/metrics";
import UnifiedDateFilter from "@/components/metrics/UnifiedDateFilter";
import UnifiedSummaryCard from "@/components/metrics/UnifiedSummaryCard";
import UnifiedBarChart from "@/components/metrics/UnifiedBarChart";

export default {
  name: "SalesAnalysisDashboard",

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
      selectedQuickFilter: 9,
      activeQuickFilterLabel: "Todo el tiempo",
      chartColors: {
        origin: ["#4CAF50", "#2196F3", "#9C27B0", "#FF9800", "#607D8B"],
        payment: ["#F44336", "#3F51B5", "#009688", "#FFC107"],
        noSale: ["#E91E63", "#673AB7", "#00BCD4", "#FF5722", "#795548"],
        loyalty: ["#9C27B0", "#3F51B5", "#8BC34A", "#FF9800", "#607D8B"],
        result: ["#4CAF50", "#FF5722", "#F44336", "#FFC107", "#2196F3"],
        lostOpp: ["#F44336", "#FF9800", "#E91E63"],
        time: ["#4CAF50", "#8BC34A", "#FFC107", "#FF9800"],
        assistance: ["#607D8B", "#9E9E9E", "#2196F3", "#3F51B5"],
      },
    };
  },

  computed: {
    formatDateRange() {
      if (!this.dashboardData) return "";

      const { startDate, endDate } = this.dashboardData.dateRange;
      if (startDate === "all time" && endDate === "all time") {
        return "Todo el tiempo";
      }

      return `${startDate} hasta ${endDate}`;
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
  },

  mounted() {
    this.fetchData();
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
</style>
