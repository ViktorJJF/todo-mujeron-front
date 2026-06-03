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
          <v-col cols="12" sm="8" md="7" lg="5">
            <v-menu
              v-model="dateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  :value="dateRangeText"
                  :label="rangeLabel"
                  prepend-icon="mdi-calendar-range"
                  readonly
                  clearable
                  v-bind="attrs"
                  v-on="on"
                  :disabled="loading"
                  outlined
                  dense
                  @click:clear="clearRange"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="dateRange"
                range
                no-title
                scrollable
                :max="maxDate"
                @change="onRangeChange"
              ></v-date-picker>
            </v-menu>
          </v-col>

          <v-col cols="12" sm="4" md="3" lg="2">
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
      default: 3, // Default to 'Últimos 30 días'
    },
    startLabel: {
      type: String,
      default: "Start Date",
    },
    endLabel: {
      type: String,
      default: "End Date",
    },
    rangeLabel: {
      type: String,
      default: "Rango de fechas",
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
      localStartDate: this.startDate || null,
      localEndDate: this.endDate || null,
      dateMenu: false,
      dateRange: this.startDate && this.endDate ? [this.startDate, this.endDate] : [],
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
          label: "Año 2023",
          getDateRange: () => {
            return {
              startDate: "2023-01-01",
              endDate: "2023-12-31",
            };
          },
        },
        {
          label: "Año 2022",
          getDateRange: () => {
            return {
              startDate: "2022-01-01",
              endDate: "2022-12-31",
            };
          },
        },
        {
          label: "Año 2021",
          getDateRange: () => {
            return {
              startDate: "2021-01-01",
              endDate: "2021-12-31",
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

  created() {
    // Emit the initial range on creation so the parent loads data.
    setTimeout(() => {
      if (
        this.defaultSelectedFilter != null &&
        this.filters[this.defaultSelectedFilter]
      ) {
        // A quick-filter preset is active: apply it.
        this.selectQuickFilter(this.defaultSelectedFilter);
      } else if (this.startDate || this.endDate) {
        // A custom range is active (no preset): reflect it and emit so the
        // parent still fetches without relying on a preset.
        this.localStartDate = this.startDate;
        this.localEndDate = this.endDate;
        this.dateRange =
          this.startDate && this.endDate
            ? [this.startDate, this.endDate]
            : [];
        this.selectedQuickFilter = null;
        this.$emit("filter-applied", {
          forceRefresh: true,
          activeFilterLabel: null,
          startDate: this.startDate,
          endDate: this.endDate,
        });
      }
    }, 0);
  },

  methods: {
    applyDateFilter() {
      const payload = {
        forceRefresh: true,
        activeFilterLabel: null,
      };

      // Convert empty strings to null
      const startDate =
        this.localStartDate && this.localStartDate.trim() !== ""
          ? this.localStartDate
          : null;
      const endDate =
        this.localEndDate && this.localEndDate.trim() !== ""
          ? this.localEndDate
          : null;

      // Only add date parameters if they are not null or empty
      if (startDate !== null) {
        payload.startDate = startDate;
      }

      if (endDate !== null) {
        payload.endDate = endDate;
      }

      this.$emit("filter-applied", payload);
    },

    selectQuickFilter(index) {
      this.selectedQuickFilter = index;

      const selectedFilter = this.filters[index];
      if (!selectedFilter) return;

      const { startDate, endDate } = selectedFilter.getDateRange();
      this.localStartDate = startDate;
      this.localEndDate = endDate;
      this.dateRange = startDate && endDate ? [startDate, endDate] : [];

      // Create payload with filter information
      const payload = {
        activeFilterLabel: selectedFilter.label,
        quickFilterIndex: index,
      };

      // For "Todo el tiempo" filter (index 12), keep dates out of the payload
      if (index !== 12) {
        if (startDate !== null && startDate !== undefined) {
          payload.startDate = startDate;
        }

        if (endDate !== null && endDate !== undefined) {
          payload.endDate = endDate;
        }
      }

      this.$emit("filter-applied", payload);
    },

    onRangeChange(value) {
      if (!value || value.length < 2) {
        // Only the start date has been picked so far; wait for the second click.
        return;
      }

      // v-date-picker range can return the two dates in reverse order.
      let [startDate, endDate] = value;
      if (startDate > endDate) {
        [startDate, endDate] = [endDate, startDate];
      }

      this.dateRange = [startDate, endDate];
      this.localStartDate = startDate;
      this.localEndDate = endDate;
      this.selectedQuickFilter = null; // custom range deselects every preset
      this.dateMenu = false;

      this.$emit("filter-applied", {
        forceRefresh: true,
        activeFilterLabel: null,
        startDate,
        endDate,
      });
    },

    clearRange() {
      this.dateRange = [];
      this.localStartDate = null;
      this.localEndDate = null;
      this.selectedQuickFilter = null;
    },
  },

  watch: {
    startDate(newVal) {
      this.localStartDate = newVal;
      this.dateRange =
        newVal && this.localEndDate ? [newVal, this.localEndDate] : [];
    },
    endDate(newVal) {
      this.localEndDate = newVal;
      this.dateRange =
        this.localStartDate && newVal ? [this.localStartDate, newVal] : [];
    },
    // Keep the highlighted preset in sync when the range is changed from another tab.
    defaultSelectedFilter(newVal) {
      this.selectedQuickFilter = newVal;
    },
  },

  computed: {
    quickFiltersAvailable() {
      return this.filters && this.filters.length > 0;
    },

    canApplyFilter() {
      return !this.loading;
    },

    dateRangeText() {
      if (this.localStartDate && this.localEndDate) {
        return `${this.localStartDate} ~ ${this.localEndDate}`;
      }
      return this.localStartDate || "";
    },

    maxDate() {
      return format(new Date(), "yyyy-MM-dd");
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
  background-color: #28156c;
  color: white;
  border: 1px solid #28156c;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
</style>
