<template>
  <div class="consultation-motives-dashboard">
    <unified-date-filter
      title="Análisis de Motivos de Consulta"
      title-icon="mdi-help-circle-outline"
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
      <!-- Total Chats with Motives Summary Card -->
      <unified-summary-card
        title="Resumen de Motivos de Consulta"
        icon="mdi-help-circle-outline"
        color="primary"
        :stats="[
          {
            value: dashboardData.totalChatsWithMotives,
            label: 'Total de Chats Analizados',
            color: 'primary',
          },
          {
            value: topConsultationCategory ? topConsultationCategory.name : '',
            label: 'Categoría Principal de Consulta',
            color: 'info',
          },
        ]"
      />

      <!-- Product and Stock Queries Chart -->
      <unified-bar-chart
        :data="getCategoryData('consultas_sobre_productos_y_stock')"
        :total="getTotalForCategory('consultas_sobre_productos_y_stock')"
        title="Consultas sobre Productos y Stock"
        icon="mdi-package-variant-closed"
        :colors="chartColors.products"
        :horizontal="true"
      />

      <!-- Size Queries Chart -->
      <unified-bar-chart
        :data="getCategoryData('consultas_sobre_tallas')"
        :total="getTotalForCategory('consultas_sobre_tallas')"
        title="Consultas sobre Tallas"
        icon="mdi-tshirt-crew-outline"
        :colors="chartColors.sizes"
        :horizontal="true"
      />

      <!-- Location Queries Chart -->
      <unified-bar-chart
        :data="getCategoryData('consultas_sobre_ubicacion')"
        :total="getTotalForCategory('consultas_sobre_ubicacion')"
        title="Consultas sobre Ubicación"
        icon="mdi-map-marker-outline"
        :colors="chartColors.location"
        :horizontal="true"
      />

      <!-- Shipping Queries Chart -->
      <unified-bar-chart
        :data="getCategoryData('consultas_sobre_despachos')"
        :total="getTotalForCategory('consultas_sobre_despachos')"
        title="Consultas sobre Despachos"
        icon="mdi-truck-delivery-outline"
        :colors="chartColors.shipping"
        :horizontal="true"
      />

      <!-- Money Return Queries Chart -->
      <unified-bar-chart
        :data="getCategoryData('consultas_sobre_devolucion_de_dinero')"
        :total="getTotalForCategory('consultas_sobre_devolucion_de_dinero')"
        title="Consultas sobre Devolución de Dinero"
        icon="mdi-cash-refund"
        :colors="chartColors.returns"
        :horizontal="true"
      />

      <!-- Exchanges and Warranties Queries Chart -->
      <unified-bar-chart
        :data="getCategoryData('consultas_sobre_cambios_y_garantias')"
        :total="getTotalForCategory('consultas_sobre_cambios_y_garantias')"
        title="Consultas sobre Cambios y Garantías"
        icon="mdi-swap-horizontal"
        :colors="chartColors.warranties"
        :horizontal="true"
      />

      <!-- Supplier Queries Chart -->
      <unified-bar-chart
        :data="getCategoryData('consultas_sobre_como_convertirse_en_proveedor')"
        :total="
          getTotalForCategory('consultas_sobre_como_convertirse_en_proveedor')
        "
        title="Consultas sobre cómo Convertirse en Proveedor"
        icon="mdi-account-hard-hat"
        :colors="chartColors.supplier"
        :horizontal="true"
      />

      <!-- Boolean Categories -->
      <v-row>
        <v-col
          cols="12"
          v-for="(category, index) in dashboardData.booleanCategories"
          :key="index"
        >
          <unified-boolean-metric
            :data="category.data"
            :title="formatCategoryTitle(category.category)"
            :total="category.total"
            icon="mdi-information-outline"
          />
        </v-col>
      </v-row>

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
            Seleccione un rango de fechas para ver los análisis de motivos de
            consulta
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
import UnifiedBooleanMetric from "@/components/metrics/UnifiedBooleanMetric";

export default {
  name: "ConsultationMotivesDashboard",

  components: {
    UnifiedDateFilter,
    UnifiedSummaryCard,
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
      chartColors: {
        products: ["#4CAF50", "#2196F3", "#9C27B0", "#FF9800"],
        sizes: ["#F44336", "#3F51B5", "#009688"],
        location: ["#E91E63", "#673AB7", "#00BCD4", "#FF5722"],
        shipping: ["#9C27B0", "#3F51B5"],
        returns: ["#F44336", "#FF9800"],
        warranties: ["#4CAF50", "#FF5722"],
        supplier: ["#2196F3", "#9C27B0"],
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

    topConsultationCategory() {
      if (!this.dashboardData || !this.dashboardData.arrayCategories)
        return null;

      // Count total values for each category
      const categoryCounts = this.dashboardData.arrayCategories.map(
        (category) => {
          const totalCount = category.data.reduce(
            (sum, item) => sum + item.count,
            0
          );
          return {
            name: this.formatCategoryTitle(category.category),
            count: totalCount,
          };
        }
      );

      // Find the category with the highest count
      return categoryCounts.sort((a, b) => b.count - a.count)[0] || null;
    },
  },

  methods: {
    handleFilterApplied({ startDate, endDate, activeFilterLabel }) {
      this.startDate = startDate;
      this.endDate = endDate;
      this.activeQuickFilterLabel = activeFilterLabel;
      this.fetchData();
    },

    formatCategoryTitle(category) {
      // Convert snake_case to Title Case with spaces
      return category
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },

    calculatePercentage(value, total) {
      if (!total) return 0;
      return Math.round((value / total) * 100);
    },

    getBooleanCategoryYesCount(category) {
      const yesItem = category.data.find((item) => item.value === "Sí");
      return yesItem ? yesItem.count : 0;
    },

    getBooleanCategoryNoCount(category) {
      const noItem = category.data.find((item) => item.value === "No");
      return noItem ? noItem.count : 0;
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
        const response = await metricsApi.getConsultationMotivesCounts(payload);

        if (response.data && response.data.ok) {
          this.dashboardData = response.data.payload;
        } else {
          console.error(
            "Error in consultation motives data response:",
            response
          );
        }
      } catch (error) {
        console.error("Failed to fetch consultation motives data:", error);
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
  },

  mounted() {
    this.fetchData();
  },
};
</script>

<style scoped>
.consultation-motives-dashboard {
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
