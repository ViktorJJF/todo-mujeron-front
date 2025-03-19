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
  name: "UnifiedBarChart",

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
      default: "mdi-chart-bar",
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
      ],
    },
    horizontal: {
      type: Boolean,
      default: true,
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
          trigger: this.horizontal ? "axis" : "item",
          axisPointer: {
            type: "shadow",
          },
          formatter: (params) => {
            if (Array.isArray(params)) {
              const value = params[0].value;
              const percentage = this.calculatePercentage(value).toFixed(2);
              return `${params[0].name}: ${value} (${percentage}%)`;
            } else {
              const value = params.value;
              const percentage = this.calculatePercentage(value).toFixed(2);
              return `${params.name}: ${value} (${percentage}%)`;
            }
          },
        },
        grid: {
          left: "3%",
          right: "8%",
          bottom: "3%",
          top: "3%",
          containLabel: true,
        },
        [this.horizontal ? "xAxis" : "yAxis"]: {
          type: "value",
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              color: "rgba(0, 0, 0, 0.05)",
            },
          },
        },
        [this.horizontal ? "yAxis" : "xAxis"]: {
          type: "category",
          data: this.data.map((item) => item.value),
          axisLabel: {
            interval: 0,
            color: "#333",
            fontWeight: 500,
            fontSize: 12,
            width: 100,
            overflow: "truncate",
            ellipsis: "...",
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
        },
        series: [
          {
            name: this.title,
            type: "bar",
            data: this.data.map((item, index) => ({
              value: item.count,
              itemStyle: {
                color: this.getColor(index),
                borderRadius: 4,
              },
            })),
            barWidth: this.horizontal ? "55%" : "40%",
            label: {
              show: true,
              position: this.horizontal ? "right" : "top",
              formatter: (params) => {
                const percentage = this.calculatePercentage(
                  params.value
                ).toFixed(1);
                return `${params.value} (${percentage}%)`;
              },
              fontSize: 12,
              fontWeight: "bold",
              color: "#333",
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.2)",
              },
            },
            animationDelay: (idx) => idx * 50,
          },
        ],
        animationType: "scale",
        animationEasing: "elasticOut",
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
