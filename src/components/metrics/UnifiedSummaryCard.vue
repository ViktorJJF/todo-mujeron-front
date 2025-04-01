<template>
  <v-card class="mb-6 chart-card">
    <v-card-title class="chart-title">
      <v-icon left :color="color">{{ icon }}</v-icon>
      {{ title }}
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col
          v-for="(stat, index) in stats"
          :key="index"
          :cols="12"
          :md="12 / stats.length"
          :sm="stats.length > 2 ? 6 : 12 / stats.length"
        >
          <div class="stat-card pa-4 text-center">
            <div
              class="stat-value text-h3 font-weight-bold"
              :class="`${stat.color}--text`"
            >
              <span
                v-if="stat.suffix === '%' && typeof stat.value === 'number'"
              >
                {{ stat.value.toFixed(2) }}%
              </span>
              <span v-else-if="typeof stat.value === 'number'">
                {{ formatNumber(stat.value) }}
              </span>
              <span v-else>{{ stat.value }}</span>
            </div>
            <div class="stat-label text-subtitle-1 mt-2">
              {{ stat.label }}
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "UnifiedSummaryCard",

  props: {
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "mdi-information-outline",
    },
    color: {
      type: String,
      default: "primary",
    },
    stats: {
      type: Array,
      required: true,
      default: () => [],
      /* 
        Expected format:
        [
          { 
            value: 100, 
            label: 'Total Chats',
            color: 'primary', // Optional, defaults to primary
            suffix: '' // Optional, can be '%' for percentage values
          }
        ]
      */
    },
  },

  methods: {
    formatNumber(value) {
      return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    },
  },
};
</script>

<style scoped>
.chart-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15) !important;
}

.chart-title {
  font-size: 1.25rem !important;
  font-weight: 500 !important;
  padding-bottom: 8px;
}

.stat-card {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  background-color: rgba(0, 0, 0, 0.04);
}

.stat-value {
  line-height: 1.2;
  font-size: 2rem !important;
  color: var(--v-primary-base) !important;
}

.stat-label {
  color: rgba(0, 0, 0, 0.6);
}
</style>
