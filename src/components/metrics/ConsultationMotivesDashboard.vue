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
    </template>

    <template v-else-if="viewMode === VIEW_MODES.MONTHLY && monthlyData">
      <!-- Monthly consultation motives summary card -->
      <unified-summary-card
        title="Resumen de Tendencias Mensuales de Motivos de Consulta"
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
            value: topMonthlyCategory ? topMonthlyCategory.name : '',
            label: 'Categoría Principal de Consulta',
            color: 'success',
          },        ]"
      />

      <!-- Monthly Trend Chart for Products and Stock -->
      <unified-line-chart
        :chart-data="monthlyData.monthlyData"
        :labels="monthlyLabels"
        :datasets="productsDatasets"
        title="Tendencia Mensual de Consultas sobre Productos y Stock"
        subtitle="Evolución mensual de consultas sobre productos y ventas"
        icon="mdi-package-variant-closed"
        :loading="loading"
      />

      <!-- Monthly Trend Chart for Sizes -->
      <unified-line-chart
        :chart-data="monthlyData.monthlyData"
        :labels="monthlyLabels"
        :datasets="sizesDatasets"
        title="Tendencia Mensual de Consultas sobre Tallas"
        subtitle="Evolución mensual de consultas sobre tallas y ventas"
        icon="mdi-tshirt-crew-outline"
        :loading="loading"
      />

      <!-- Monthly Trend Chart for Location -->
      <unified-line-chart
        :chart-data="monthlyData.monthlyData"
        :labels="monthlyLabels"
        :datasets="locationDatasets"
        title="Tendencia Mensual de Consultas sobre Ubicación"
        subtitle="Evolución mensual de consultas sobre ubicación y ventas"
        icon="mdi-map-marker-outline"
        :loading="loading"
      />

      <!-- Monthly Trend Chart for Shipping -->
      <unified-line-chart
        :chart-data="monthlyData.monthlyData"
        :labels="monthlyLabels"
        :datasets="shippingDatasets"
        title="Tendencia Mensual de Consultas sobre Despachos"
        subtitle="Evolución mensual de consultas sobre despachos y ventas"
        icon="mdi-truck-delivery-outline"
        :loading="loading"
      />

      <!-- Monthly Trend Chart for Warranties and Changes -->
      <unified-line-chart
        :chart-data="monthlyData.monthlyData"
        :labels="monthlyLabels"
        :datasets="warrantiesDatasets"
        title="Tendencia Mensual de Consultas sobre Cambios y Garantías"
        subtitle="Evolución mensual de consultas sobre cambios y garantías con ventas"
        icon="mdi-swap-horizontal"
        :loading="loading"
      />

      <!-- Monthly Trend Chart for Supplier -->
      <unified-line-chart
        :chart-data="monthlyData.monthlyData"
        :labels="monthlyLabels"
        :datasets="supplierDatasets"
        title="Tendencia Mensual de Consultas sobre Proveedores"
        subtitle="Evolución mensual de consultas sobre como convertirse en proveedor con ventas"
        icon="mdi-account-hard-hat"
        :loading="loading"
      />

      <!-- Monthly Trend Chart for Promotions and Discounts -->
      <unified-line-chart
        :chart-data="monthlyData.monthlyData"
        :labels="monthlyLabels"
        :datasets="promotionsDatasets"
        title="Tendencia Mensual de Aclaraciones sobre Promociones"
        subtitle="Evolución mensual de aclaraciones sobre promociones y descuentos con ventas"
        icon="mdi-tag-multiple"
        :loading="loading"
      />
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
import UnifiedBooleanMetric from "@/components/metrics/UnifiedBooleanMetric";
import UnifiedLineChart from "@/components/metrics/UnifiedLineChart";

// Constants for view modes
const VIEW_MODES = {
  COUNTS: "counts",
  MONTHLY: "monthly",
};

export default {
  name: "ConsultationMotivesDashboard",

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
      loading: false,
      startDate: null,
      endDate: null,
      dashboardData: null,
      selectedQuickFilter: 8,
      activeQuickFilterLabel: "Todo el tiempo",
      viewMode: VIEW_MODES.COUNTS,
      monthlyData: null,
      salesData: null,
      chartColors: {
        products: ["#4CAF50", "#2196F3", "#FF5722", "#FF9800"],
        sizes: ["#F44336", "#3F51B5", "#009688"],
        location: ["#E91E63", "#673AB7", "#00BCD4", "#FF5722"],
        shipping: ["#FF5722", "#3F51B5"],
        returns: ["#F44336", "#FF9800"],
        warranties: ["#4CAF50", "#FF5722"],
        supplier: ["#2196F3", "#FF9800"],
        sales: "#9C27B0",
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

    monthlyLabels() {
      if (!this.monthlyData || !this.monthlyData.monthlyData) return [];

      return this.monthlyData.monthlyData.map(
        (month) =>
          `${month.monthName} ${month.year} (${month.totalChatsWithMotives} chats)`
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

    topMonthlyCategory() {
      if (!this.monthlyData || !this.monthlyData.monthlyData) return null;

      // Count total values for each category across all months
      const categoryTotals = {};

      this.monthlyData.monthlyData.forEach((month) => {
        month.arrayCategories.forEach((category) => {
          if (!categoryTotals[category.category]) {
            categoryTotals[category.category] = 0;
          }
          categoryTotals[category.category] += category.total;
        });
      });

      // Find category with highest total
      let maxCount = 0;
      let topCategory = null;

      for (const [category, count] of Object.entries(categoryTotals)) {
        if (count > maxCount) {
          maxCount = count;
          topCategory = category;
        }
      }

      return topCategory
        ? { name: this.formatCategoryTitle(topCategory) }
        : null;
    },

    // Datasets for products and stock monthly chart
    productsDatasets() {
      if (!this.monthlyData || !this.monthlyData.monthlyData.length === 0)
        return [];

      const productTypes = [
        {
          label: "Consulta por Nuevas Colecciones",
          color: "#2196F3",
        },
        {
          label: "Sugerencias de Nuevos Productos",
          color: "#FF9800",
        },
      ];

      const typesDatasets = this.createDatasetsByCategory(
        "consultas_sobre_productos_y_stock",
        productTypes
      );

      // Add sales dataset if available
      if (this.salesData && this.salesData.length > 0) {
        const salesDataset = this.createSalesDataset();
        return [...typesDatasets, salesDataset];
      }

      return typesDatasets;
    },

    // Datasets for sizes monthly chart
    sizesDatasets() {
      if (!this.monthlyData || !this.monthlyData.monthlyData.length === 0)
        return [];

      const sizeTypes = [
        {
          label: "Como saber su talla de Fajas",
          color: "#F44336",
        },
        {
          label: "Como saber su talla de Jeans",
          color: "#3F51B5",
        },
        {
          label: "Como saber su talla en otros productos",
          color: "#009688",
        },
      ];

      const typesDatasets = this.createDatasetsByCategory(
        "consultas_sobre_tallas",
        sizeTypes
      );

      // Add sales dataset if available
      if (this.salesData && this.salesData.length > 0) {
        const salesDataset = this.createSalesDataset();
        return [...typesDatasets, salesDataset];
      }

      return typesDatasets;
    },

    // Datasets for location monthly chart
    locationDatasets() {
      if (!this.monthlyData || !this.monthlyData.monthlyData.length === 0)
        return [];

      const locationTypes = [
        {
          label: "Consulta por Ubicacion de la tienda",
          color: "#E91E63",
        },
        {
          label: "Horarios y saber si esta abierto ahora",
          color: "#673AB7",
        },
        {
          label: "Pregunta si hay alguna sucursal en otras ciudades",
          color: "#00BCD4",
        },
        {
          label: "Consultas sobre Disponibilidad Internacional o otros paises",
          color: "#FF5722",
        },
      ];

      const typesDatasets = this.createDatasetsByCategory(
        "consultas_sobre_ubicacion",
        locationTypes
      );

      // Add sales dataset if available
      if (this.salesData && this.salesData.length > 0) {
        const salesDataset = this.createSalesDataset();
        return [...typesDatasets, salesDataset];
      }

      return typesDatasets;
    },

    // Datasets for shipping monthly chart
    shippingDatasets() {
      if (!this.monthlyData || !this.monthlyData.monthlyData.length === 0)
        return [];

      const shippingTypes = [
        {
          label: "Consultas sobre Estado del Pedido",
          color: "#FF5722",
        },
        {
          label: "Pregunta si hacemos despachos y cuanto tarda",
          color: "#3F51B5",
        },
      ];

      const typesDatasets = this.createDatasetsByCategory(
        "consultas_sobre_despachos",
        shippingTypes
      );

      // Add sales dataset if available
      if (this.salesData && this.salesData.length > 0) {
        const salesDataset = this.createSalesDataset();
        return [...typesDatasets, salesDataset];
      }

      return typesDatasets;
    },

    // Datasets for warranties monthly chart
    warrantiesDatasets() {
      if (!this.monthlyData || !this.monthlyData.monthlyData.length === 0)
        return [];

      const warrantyTypes = [
        {
          label: "Consultas sobre Cambios y Garantías Antes de comprar",
          color: "#4CAF50",
        },
        {
          label: "Consultas sobre Cambios y Garantías despues de comprar",
          color: "#FF5722",
        },
      ];

      const typesDatasets = this.createDatasetsByCategory(
        "consultas_sobre_cambios_y_garantias",
        warrantyTypes
      );

      // Add sales dataset if available
      if (this.salesData && this.salesData.length > 0) {
        const salesDataset = this.createSalesDataset();
        return [...typesDatasets, salesDataset];
      }

      return typesDatasets;
    },

    // Datasets for supplier monthly chart
    supplierDatasets() {
      if (!this.monthlyData || !this.monthlyData.monthlyData.length === 0)
        return [];

      const supplierTypes = [
        {
          label: "Quiere que compremos sus producto y convertirse en Proveedor",
          color: "#2196F3",
        },
        {
          label: "Quiere Ser Influencer o rostro de la marca",
          color: "#FF9800",
        },
      ];

      const typesDatasets = this.createDatasetsByCategory(
        "consultas_sobre_como_convertirse_en_proveedor",
        supplierTypes
      );

      // Add sales dataset if available
      if (this.salesData && this.salesData.length > 0) {
        const salesDataset = this.createSalesDataset();
        return [...typesDatasets, salesDataset];
      }

      return typesDatasets;
    },

    // Datasets for promotions monthly chart
    promotionsDatasets() {
      if (!this.monthlyData || !this.monthlyData.monthlyData.length === 0)
        return [];

      const data = this.monthlyData.monthlyData.map((month) => {
        const category = month.booleanCategories.find(
          (c) => c.category === "aclaraciones_sobre_promociones_y_descuentos"
        );
        if (!category) return 0;
        const trueItem = category.data.find((item) => item.value === "true");
        return trueItem ? trueItem.count : 0;
      });

      // Get total chats with motives for each month for reference
      const totalChatsData = this.monthlyData.monthlyData.map(
        (month) => month.totalChatsWithMotives || 0
      );

      // Calculate percentages for each month
      const percentageData = this.monthlyData.monthlyData.map(
        (month, index) => {
          const totalChatsAnalyzed = month.totalChatsWithMotives || 1; // Avoid division by zero
          const count = data[index];
          return parseFloat(((count / totalChatsAnalyzed) * 100).toFixed(1));
        }
      );

      const typesDatasets = [
        {
          label: "Aclaraciones sobre Promociones y Descuentos",
          data: data,
          percentage: percentageData,
          totalChats: totalChatsData, // Add total chats for reference
          borderColor: "#FFC107",
          backgroundColor: "#FFC10733", // Add transparency
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        },
      ];

      // Add sales dataset if available
      if (this.salesData && this.salesData.length > 0) {
        const salesDataset = this.createSalesDataset();
        return [...typesDatasets, salesDataset];
      }

      return typesDatasets;
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
        // Always clear sales data when date range changes
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

        // Make sure we have sales data when switching to monthly view
        if (!this.salesData) {
          this.fetchSalesData();
        }
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

        // Fetch sales data if we're in monthly view
        if (!this.salesData) {
          await this.fetchSalesData();
        }
      }
    },

    async fetchCountsData() {
      // If we already have data, no need to fetch again
      if (this.dashboardData) {
        return;
      }

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

    formatTotalSales(salesData) {
      if (!salesData || salesData.length === 0) return "0";

      // Calculate total sales
      const totalSales = salesData.reduce((sum, item) => sum + item.total, 0);

      // Format with currency
      return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0,
      }).format(totalSales);
    },

    getBooleanCategoryYesCount(category) {
      const yesItem = category.data.find((item) => item.value === "Sí");
      return yesItem ? yesItem.count : 0;
    },

    getBooleanCategoryNoCount(category) {
      const noItem = category.data.find((item) => item.value === "No");
      return noItem ? noItem.count : 0;
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

        const response = await metricsApi.getConsultationMotivesByMonth(
          payload
        );

        if (response.data && response.data.ok) {
          this.monthlyData = response.data.payload;
        } else {
          console.error(
            "Error in consultation motives monthly data response:",
            response
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch consultation motives monthly data:",
          error
        );
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
          this.salesData = response.data.payload;
        } else {
          console.error("Error in sales data response:", response);
        }
      } catch (error) {
        console.error("Failed to fetch sales data:", error);
      }
    },

    createSalesDataset() {
      // Create a map of year-month combinations from the monthly consultation data
      const monthKeys = this.monthlyData.monthlyData.map(
        (month) => `${month.year}-${month.month}`
      );

      // Filter sales data to match the months we have in monthly consultation data
      const matchedSalesData = [];

      monthKeys.forEach((key) => {
        const [year, month] = key.split("-").map(Number);
        const salesItem = this.salesData.find(
          (item) => item.year === year && item.month === month
        );

        if (salesItem) {
          matchedSalesData.push(salesItem.total);
        } else {
          // If no matching sales data for this month, use 0
          matchedSalesData.push(0);
        }
      });

      return {
        label: "Ventas",
        data: matchedSalesData,
        borderColor: this.chartColors.sales,
        backgroundColor: `${this.chartColors.sales}33`,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        yAxisID: "y-axis-sales", // This tells Chart.js to use the secondary y-axis
        type: "line", // Ensure it's a line chart
        order: 0, // Lower order means it appears in front
      };
    },

    createDatasetsByCategory(categoryName, typeOptions) {
      if (!this.monthlyData || !this.monthlyData.monthlyData.length === 0)
        return [];

      return typeOptions.map((typeOption) => {
        // Get data for each month for this specific type
        const data = this.monthlyData.monthlyData.map((month) => {
          const categoryData = month.arrayCategories.find(
            (cat) => cat.category === categoryName
          );
          if (!categoryData) return 0;

          const matchingItem = categoryData.data.find(
            (item) => item.value === typeOption.label
          );
          return matchingItem ? matchingItem.count : 0;
        });

        // Get total chats with motives for each month for reference
        const totalChatsData = this.monthlyData.monthlyData.map(
          (month) => month.totalChatsWithMotives || 0
        );

        // Calculate percentages based on total chats analyzed for each month
        const percentageData = this.monthlyData.monthlyData.map(
          (month, index) => {
            const totalChatsAnalyzed = month.totalChatsWithMotives || 1; // Avoid division by zero
            const count = data[index];
            return parseFloat(((count / totalChatsAnalyzed) * 100).toFixed(1));
          }
        );

        return {
          label: typeOption.label,
          data: data,
          percentage: percentageData,
          totalChats: totalChatsData, // Add total chats for reference
          borderColor: typeOption.color,
          backgroundColor: `${typeOption.color}33`, // Add transparency
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        };
      });
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
        // Also fetch sales data if we don't have it yet
        if (!this.salesData) {
          this.fetchSalesData();
        }
      } else if (this.viewMode === VIEW_MODES.MONTHLY && !this.dashboardData) {
        this.fetchCountsData();
      }
    }, 1000); // Delay to ensure main view loads first
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
