<template>
  <v-card class="mb-6 chart-card">
    <v-card-title class="chart-title">
      <v-icon left color="primary">{{ icon }}</v-icon>
      {{ title }}
    </v-card-title>
    <v-card-text>
      <v-row align="center" justify="center">
        <v-col cols="12" md="6">
          <div ref="chart" class="gauge-chart" style="height: 240px"></div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="boolean-metrics">
            <div
              v-for="(item, i) in data"
              :key="i"
              class="boolean-item"
              :class="
                item.value === 'Sí' ? 'boolean-item-yes' : 'boolean-item-no'
              "
            >
              <div class="d-flex align-center">
                <v-icon
                  size="24"
                  class="mr-3"
                  :color="item.value === 'Sí' ? 'success' : 'grey'"
                >
                  {{
                    item.value === "Sí"
                      ? "mdi-check-circle"
                      : "mdi-close-circle"
                  }}
                </v-icon>
                <div>
                  <div class="boolean-value">{{ item.value }}</div>
                  <div class="boolean-count">
                    {{ item.count }} ({{
                      calculatePercentage(item.count).toFixed(2)
                    }}%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import * as echarts from "echarts";

export default {
  name: "UnifiedBooleanMetric",

  props: {
    data: {
      type: Array,
      required: true,
      default: () => [],
    },
    title: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    icon: {
      type: String,
      default: "mdi-chart-donut",
    },
  },

  data() {
    return {
      chart: null,
    };
  },

  computed: {
    yesPercentage() {
      const yesItem = this.data.find((item) => item.value === "Sí");
      if (!yesItem || this.total === 0) return 0;
      return (yesItem.count / this.total) * 100;
    },
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
      if (!this.chart) return;

      const option = {
        series: [
          {
            type: "gauge",
            startAngle: 90,
            endAngle: -270,
            pointer: {
              show: false,
            },
            progress: {
              show: true,
              overlap: false,
              roundCap: true,
              clip: false,
              itemStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: "#4CAF50",
                    },
                    {
                      offset: 1,
                      color: "#8BC34A",
                    },
                  ],
                },
              },
            },
            axisLine: {
              lineStyle: {
                width: 20,
                color: [[1, "#f5f5f5"]],
              },
            },
            splitLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            data: [
              {
                value: this.yesPercentage,
                name: "Sí",
                title: {
                  offsetCenter: ["0%", "0%"],
                },
                detail: {
                  valueAnimation: true,
                  offsetCenter: ["0%", "0%"],
                },
              },
            ],
            title: {
              fontSize: 14,
              color: "#333",
              fontWeight: "normal",
            },
            detail: {
              width: 50,
              height: 14,
              fontSize: 28,
              color: "#333",
              fontWeight: "bold",
              formatter: function (value) {
                return value.toFixed(2) + "%";
              },
            },
            animationDuration: 1500,
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

.boolean-metrics {
  padding: 16px;
}

.boolean-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.03);
  transition: transform 0.2s, box-shadow 0.2s;
}

.boolean-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.boolean-item-yes {
  background-color: rgba(76, 175, 80, 0.1);
}

.boolean-item-no {
  background-color: rgba(158, 158, 158, 0.1);
}

.boolean-value {
  font-size: 1rem;
  font-weight: 500;
}

.boolean-count {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
}
</style>
