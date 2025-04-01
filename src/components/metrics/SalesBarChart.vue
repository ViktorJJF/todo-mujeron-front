<template>
  <v-card class="pa-4 mb-6">
    <v-card-title class="text-h6 font-weight-medium">
      {{ title }}
    </v-card-title>
    <v-card-text>
      <div ref="chart" class="chart-container" style="height: 300px"></div>
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
              calculatePercentage(item.count)
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
  name: "SalesBarChart",

  props: {
    data: {
      type: Array,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    colors: {
      type: Array,
      default: () => ["#4CAF50", "#8BC34A", "#FFC107", "#FF9800"],
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
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: (params) => {
            const value = params[0].value;
            const percentage = this.calculatePercentage(value);
            return `${params[0].name}: ${value} (${percentage}%)`;
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "value",
          axisLine: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              color: "rgba(0, 0, 0, 0.05)",
            },
          },
        },
        yAxis: {
          type: "category",
          data: this.data.map((item) => item.value),
          axisLabel: {
            inside: false,
            color: "#333",
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
              },
            })),
            label: {
              show: true,
              position: "right",
              formatter: "{c}",
            },
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
      return Math.round((value / this.total) * 100);
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
.legend-item {
  min-width: 200px;
  max-width: 300px;
  margin-right: 8px;
  margin-bottom: 8px;
}

.legend-label {
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
