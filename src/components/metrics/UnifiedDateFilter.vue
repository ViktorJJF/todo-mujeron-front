<template>
  <div class="unified-date-filter">
    <v-card class="mb-4 date-filter-card">
      <v-card-title class="d-flex align-center">
        <v-icon v-if="titleIcon" left>{{ titleIcon }}</v-icon>
        {{ title }}
        <slot name="after-title"></slot>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" sm="5" md="4" lg="3">
            <v-menu
              v-model="startMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="localStartDate"
                  :label="startLabel"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  :disabled="loading"
                  outlined
                  dense
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="localStartDate"
                @input="startMenu = false"
                no-title
                scrollable
              ></v-date-picker>
            </v-menu>
          </v-col>

          <v-col cols="12" sm="5" md="4" lg="3">
            <v-menu
              v-model="endMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="localEndDate"
                  :label="endLabel"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  :disabled="loading"
                  outlined
                  dense
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="localEndDate"
                @input="endMenu = false"
                no-title
                scrollable
              ></v-date-picker>
            </v-menu>
          </v-col>

          <v-col cols="12" sm="2" md="2" lg="1">
            <v-btn
              color="primary"
              :loading="loading"
              @click="applyDateFilter"
              block
              class="mt-1"
              :disabled="!canApplyFilter"
            >
              {{ applyButtonText }}
            </v-btn>
          </v-col>
        </v-row>

        <v-row v-if="quickFiltersAvailable">
          <v-col cols="12">
            <div class="quick-filters-section">
              <div class="quick-filters-label mb-2">
                {{ quickFiltersLabel }}
              </div>
              <div class="quick-filters-container">
                <div
                  v-for="(filter, index) in filters"
                  :key="index"
                  class="quick-filter-pill"
                  :class="{ active: selectedQuickFilter === index }"
                  @click="selectQuickFilter(index)"
                >
                  {{ filter.label }}
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
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

export default {
  name: "UnifiedDateFilter",

  props: {
    title: {
      type: String,
      required: true,
    },
    titleIcon: {
      type: String,
      default: "mdi-chart-timeline-variant",
    },
    startDate: {
      type: String,
      default: null,
    },
    endDate: {
      type: String,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    defaultSelectedFilter: {
      type: Number,
      default: 9, // Default to 'Todo el tiempo' (was 3 - 'Last 30 days')
    },
    startLabel: {
      type: String,
      default: "Start Date",
    },
    endLabel: {
      type: String,
      default: "End Date",
    },
    applyButtonText: {
      type: String,
      default: "Apply Filter",
    },
    quickFiltersLabel: {
      type: String,
      default: "Quick Filters",
    },
  },

  data() {
    return {
      localStartDate: this.startDate,
      localEndDate: this.endDate,
      startMenu: false,
      endMenu: false,
      selectedQuickFilter: this.defaultSelectedFilter,
      filters: [
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
          label: "Año 2024",
          getDateRange: () => {
            return {
              startDate: "2024-01-01",
              endDate: "2024-12-31",
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

  methods: {
    applyDateFilter() {
      this.$emit("filter-applied", {
        startDate: this.localStartDate,
        endDate: this.localEndDate,
        activeFilterLabel: null,
        forceRefresh: true,
      });
    },

    selectQuickFilter(index) {
      this.selectedQuickFilter = index;

      const selectedFilter = this.filters[index];
      if (!selectedFilter) return;

      const { startDate, endDate } = selectedFilter.getDateRange();
      this.localStartDate = startDate;
      this.localEndDate = endDate;

      this.$emit("filter-applied", {
        startDate,
        endDate,
        activeFilterLabel: selectedFilter.label,
      });
    },
  },

  watch: {
    startDate(newVal) {
      this.localStartDate = newVal;
    },
    endDate(newVal) {
      this.localEndDate = newVal;
    },
  },

  computed: {
    quickFiltersAvailable() {
      return this.filters && this.filters.length > 0;
    },

    canApplyFilter() {
      return !this.loading;
    },
  },
};
</script>

<style scoped>
.date-filter-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.date-filter-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15) !important;
}

.date-filter-title {
  font-size: 1.25rem !important;
  font-weight: 500 !important;
  padding-bottom: 8px;
}

.date-field {
  transition: box-shadow 0.2s;
}

.date-field:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-button {
  text-transform: none !important;
  font-weight: 500 !important;
  letter-spacing: 0.5px !important;
}

.quick-filters-section {
  margin-top: 16px;
}

.quick-filters-label {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
}

.quick-filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.quick-filter-pill {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f0f0f0;
  color: rgba(0, 0, 0, 0.7);
  border: 1px solid #ddd;
}

.quick-filter-pill:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.quick-filter-pill.active {
  background-color: var(--v-primary-base);
  color: white;
  border: 1px solid var(--v-primary-base);
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
</style>
