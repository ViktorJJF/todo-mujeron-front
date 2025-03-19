<template>
  <v-card class="mb-6 chart-card">
    <v-card-title class="chart-title">
      <v-icon left color="primary">{{ icon }}</v-icon>
      {{ title }}
    </v-card-title>
    <v-card-subtitle v-if="subtitle" class="chart-subtitle">
      {{ subtitle }}
    </v-card-subtitle>
    <v-card-text>
      <div ref="chart" class="chart-container" style="height: 350px"></div>
      <div class="d-flex flex-wrap justify-center mt-4">
        <div
          v-for="(item, index) in data"
          :key="index"
          class="legend-item pa-2 d-flex align-center"
        >
          <div
            class="legend-color mr-2"
            :style="{
              backgroundColor: getColor(index),
              width: '16px',
              height: '16px',
              borderRadius: '4px',
            }"
          ></div>
          <div class="legend-label">
            {{ item.value }}: {{ item.count }} ({{
              calculatePercentage(item.count).toFixed(2)
            }}%)
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import * as echarts from "echarts";

export default {
  name: "UnifiedPieChart",

  props: {
    data: {
      type: Array,
      required: true,
      default: () => [],
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "mdi-chart-pie",
    },
    colors: {
      type: Array,
      default: () => [
        "#4CAF50", // Green
        "#2196F3", // Blue
        "#FFC107", // Amber
        "#FF5722", // Deep Orange
        "#9C27B0", // Purple
        "#607D8B", // Blue Grey
        "#795548", // Brown
        "#3F51B5", // Indigo
        "#00BCD4", // Cyan
        "#8BC34A", // Light Green
        "#FF9800", // Orange
        "#E91E63", // Pink
        "#9E9E9E", // Grey
      ],
    },
    donut: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      chart: null,
    };
  },

  mounted() {
    this.initChart();
    window.addEventListener("resize", this.resizeChart);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.resizeChart);
    if (this.chart) {
      this.chart.dispose();
    }
  },

  methods: {
    initChart() {
      const chartDom = this.$refs.chart;
      this.chart = echarts.init(chartDom);
      this.updateChart();
    },

    updateChart() {
      if (!this.chart || !this.data || this.data.length === 0) return;

      const option = {
        tooltip: {
          trigger: "item",
          formatter: (params) => {
            const value = params.value;
            const percentage = this.calculatePercentage(value).toFixed(2);
            return `${params.name}: ${value} (${percentage}%)`;
          },
        },
        legend: {
          show: false,
        },
        series: [
          {
            name: this.title,
            type: "pie",
            radius: this.donut ? ["40%", "70%"] : "70%",
            center: ["50%", "50%"],
            data: this.data.map((item, index) => ({
              name: item.value,
              value: item.count,
              itemStyle: {
                color: this.getColor(index),
              },
            })),
            label: {
              show: true,
              position: "inside",
              formatter: (params) => {
                const percent = params.percent.toFixed(1);
                if (percent < 5) return "";
                return `${percent}%`;
              },
              fontSize: 14,
              fontWeight: "bold",
              color: "#fff",
              textShadow: "0 0 3px rgba(0, 0, 0, 0.5)",
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
              label: {
                show: true,
                fontSize: 14,
                fontWeight: "bold",
              },
            },
            animationType: "scale",
            animationEasing: "elasticOut",
            animationDelay: (idx) => idx * 50,
          },
        ],
      };

      this.chart.setOption(option);
    },

    resizeChart() {
      if (this.chart) {
        this.chart.resize();
      }
    },

    getColor(index) {
      return this.colors[index % this.colors.length];
    },

    calculatePercentage(value) {
      if (!this.total || this.total === 0) return 0;
      return (value / this.total) * 100;
    },
  },

  watch: {
    data: {
      handler() {
        this.$nextTick(() => {
          this.updateChart();
        });
      },
      deep: true,
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

.chart-subtitle {
  opacity: 0.8;
  font-size: 0.9rem !important;
}

.legend-item {
  min-width: 120px;
  max-width: 300px;
  margin-right: 8px;
  margin-bottom: 8px;
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
</style>
