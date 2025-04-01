<template>
  <v-card class="mt-4 mb-4 chart-card" elevation="2">
    <v-card-title class="chart-title">
      <v-icon left :color="iconColor || 'primary'">{{ icon }}</v-icon>
      {{ title }}
    </v-card-title>
    <v-card-subtitle v-if="subtitle" class="pb-0">{{
      subtitle
    }}</v-card-subtitle>
    <v-card-text>
      <div v-if="loading" class="chart-loading-container">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </div>
      <div
        v-else-if="!chartData || chartData.length === 0"
        class="text-center pa-4"
      >
        <v-icon large color="grey lighten-1">mdi-chart-line-variant</v-icon>
        <div class="text-subtitle-1 grey--text mt-2">
          {{ $t("metrics.NO_DATA_AVAILABLE") }}
        </div>
      </div>
      <div v-else ref="chartContainer" class="chart-container"></div>
    </v-card-text>
  </v-card>
</template>

<script>
import * as echarts from "echarts";

export default {
  name: "UnifiedLineChart",

  props: {
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
      default: "mdi-chart-line",
    },
    iconColor: {
      type: String,
      default: "primary",
    },
    chartData: {
      type: Array,
      required: true,
    },
    labels: {
      type: Array,
      required: true,
    },
    datasets: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      chart: null,
    };
  },

  watch: {
    datasets: {
      handler() {
        this.$nextTick(() => {
          this.renderChart();
        });
      },
      deep: true,
    },
    labels: {
      handler() {
        this.$nextTick(() => {
          this.renderChart();
        });
      },
      deep: true,
    },
  },

  mounted() {
    this.initChart();
    window.addEventListener("resize", this.handleResize);
  },

  updated() {
    this.$nextTick(() => {
      if (this.chart) {
        this.chart.resize();
      }
    });
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    if (this.chart) {
      this.chart.off("legendselectchanged", this.handleLegendSelectChanged);
      this.chart.dispose();
      this.chart = null;
    }
  },

  methods: {
    initChart() {
      if (!this.chartData || this.chartData.length === 0) return;

      this.$nextTick(() => {
        const container = this.$refs.chartContainer;
        if (!container) return;

        // Initialize chart if it doesn't exist yet
        if (!this.chart) {
          this.chart = echarts.init(container);
          // Add event listener for legend changes
          this.chart.on("legendselectchanged", this.handleLegendSelectChanged);
        }

        this.renderChart();
      });
    },

    renderChart() {
      if (!this.chart || !this.datasets || this.datasets.length === 0) return;

      // Special handling for single data point
      const hasSingleDataPoint = this.labels.length === 1;

      // Separate sales data from other datasets
      const salesDataset = this.datasets.find((d) => d.label === "Ventas");
      const metaAdsDataset = this.datasets.find(
        (d) => d.label === "Inversión Ads"
      );
      const regularDatasets = this.datasets.filter(
        (d) => d.label !== "Ventas" && d.label !== "Inversión Ads"
      );

      // Calculate maximum values for proper y-axis scaling
      let maxRegularValue = 0;
      if (regularDatasets.length > 0) {
        maxRegularValue = regularDatasets.reduce((max, dataset) => {
          const datasetMax = Math.max(...dataset.data);
          return datasetMax > max ? datasetMax : max;
        }, 0);
      }

      let maxSalesValue = 0;
      if (salesDataset) {
        maxSalesValue = Math.max(...salesDataset.data);
      }

      let maxAdsValue = 0;
      if (metaAdsDataset) {
        maxAdsValue = Math.max(...metaAdsDataset.data);
      }

      // Add a 20% padding for better visualization
      const yAxisMaxRegular = maxRegularValue * 1.2;
      const yAxisMaxSales = maxSalesValue * 1.2;
      const yAxisMaxAds = maxAdsValue * 1.2;

      // Create series for sales data
      const salesSeries = salesDataset
        ? [
            {
              name: salesDataset.label,
              type: "bar",
              barWidth: "40%",
              data: salesDataset.data,
              yAxisIndex: 1,
              itemStyle: {
                color: salesDataset.borderColor || "#9C27B0",
                borderRadius: [3, 3, 0, 0],
                opacity: 0.75,
              },
              z: 1,
              emphasis: {
                itemStyle: {
                  opacity: 0.9,
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: "rgba(0, 0, 0, 0.3)",
                },
              },
              label: {
                show: false,
              },
            },
          ]
        : [];

      // Create series for regular data
      const regularSeries = regularDatasets.map((dataset) => ({
        name: dataset.label,
        type: "line",
        smooth: !hasSingleDataPoint,
        data: dataset.data,
        yAxisIndex: 0,
        lineStyle: {
          width: 3,
          color: dataset.borderColor,
          type: dataset.lineStyle?.type || "solid",
          cap: "round",
          join: "round",
          shadowBlur: 0,
        },
        itemStyle: {
          color: dataset.borderColor,
          borderWidth: 2,
        },
        symbol: dataset.symbol || "circle",
        symbolSize: dataset.symbolSize || (hasSingleDataPoint ? 8 : 6),
        z: 2,
        emphasis: {
          scale: true,
          focus: "series",
          itemStyle: {
            borderWidth: 3,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.3)",
          },
          lineStyle: {
            width: 4,
          },
        },
        label: {
          show: false,
        },
      }));

      // Create series for Meta Ads data
      const adsSeries = metaAdsDataset
        ? [
            {
              name: metaAdsDataset.label,
              type: "line",
              smooth: !hasSingleDataPoint,
              data: metaAdsDataset.data,
              yAxisIndex: 2,
              lineStyle: {
                width: 3,
                color: metaAdsDataset.borderColor || "#1E88E5",
                type: "dashed",
                dashOffset: 0,
                cap: "round",
                join: "round",
                dash: [4, 4],
                shadowBlur: 0,
              },
              itemStyle: {
                color: metaAdsDataset.borderColor || "#1E88E5",
                borderWidth: 2,
              },
              symbol: "circle",
              symbolSize: 6,
              z: 10,
              silent: false,
              emphasis: false,
              hoverAnimation: false,
              tooltip: {
                show: true,
              },
              animation: false,
              label: {
                show: false,
              },
            },
          ]
        : [];

      // Combine the series
      const series = [...regularSeries, ...salesSeries, ...adsSeries];

      const option = {
        tooltip: {
          trigger: "axis",
          formatter: (params) => {
            let tooltipText = `${params[0].axisValue}<br/>`;

            params.forEach((param) => {
              const seriesIndex = this.datasets.findIndex(
                (d) => d.label === param.seriesName
              );
              const dataset = this.datasets[seriesIndex];

              if (!dataset) return;

              // Handle sales data differently
              if (param.seriesName === "Ventas") {
                // Format sales value with thousands separators
                const salesValue = this.formatCurrency(param.value);
                tooltipText += `<div style="display: flex; align-items: center; margin: 5px 0;">
                  <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; margin-right: 5px;"></span>
                  <span style="font-weight: bold; color: ${param.color}">${param.seriesName}: ${salesValue}</span>
                </div>`;
              }
              // Handle Meta Ads data differently
              else if (param.seriesName === "Inversión Ads") {
                // Format ads value with thousands separators
                const adsValue = this.formatCurrency(param.value);
                tooltipText += `<div style="display: flex; align-items: center; margin: 5px 0;">
                  <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 5px;"></span>
                  <span style="font-weight: bold; color: ${param.color}">${param.seriesName}: ${adsValue}</span>
                </div>`;
              } else {
                // For regular metrics
                const percentage = dataset.percentage
                  ? dataset.percentage[param.dataIndex]
                  : "0.0";
                const color = param.color;
                const value = param.value;

                tooltipText += `<div style="display: flex; align-items: center; margin: 5px 0;">
                  <span style="display: inline-block; width: 10px; height: 10px; background-color: ${color}; border-radius: 50%; margin-right: 5px;"></span>
                  <span>${param.seriesName}: ${value} (${percentage}%)</span>
                </div>`;
              }
            });

            return tooltipText;
          },
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderColor: "#ddd",
          borderWidth: 1,
          textStyle: {
            color: "#333",
            fontSize: 13,
          },
          extraCssText: "box-shadow: 0 4px 8px rgba(0,0,0,0.1);",
          axisPointer: {
            type: "shadow",
            shadowStyle: {
              color: "rgba(0, 0, 0, 0.05)",
            },
          },
        },
        grid: {
          left: "5%",
          right: "15%",
          bottom: "15%",
          top: 60,
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: true,
          data: this.labels,
          axisLine: {
            lineStyle: {
              color: "#ddd",
            },
          },
          axisTick: {
            show: true,
            alignWithLabel: true,
          },
          axisLabel: {
            fontSize: 12,
            color: "#666",
            rotate: this.labels.length > 6 ? 30 : 0,
            margin: 14,
          },
        },
        yAxis: [
          {
            type: "value",
            max: yAxisMaxRegular,
            axisLine: {
              show: true,
              lineStyle: {
                color:
                  regularDatasets.length > 0
                    ? regularDatasets[0].borderColor
                    : "#666",
              },
            },
            axisLabel: {
              formatter: (value) => {
                return value;
              },
              color: "#666",
            },
            splitLine: {
              lineStyle: {
                color: "rgba(0, 0, 0, 0.05)",
                type: "dashed",
              },
            },
          },
          {
            type: "value",
            name: "Ventas",
            nameLocation: "end",
            nameTextStyle: {
              color: salesDataset ? salesDataset.borderColor : "#9C27B0",
              padding: [0, 0, 0, 20],
              fontWeight: "bold",
            },
            max: yAxisMaxSales,
            position: "right",
            offset: 0,
            axisLine: {
              show: true,
              lineStyle: {
                color: salesDataset ? salesDataset.borderColor : "#9C27B0",
                width: 2,
              },
            },
            axisLabel: {
              color: salesDataset ? salesDataset.borderColor : "#9C27B0",
              formatter: (value) => {
                // Format with K/M for thousands/millions
                if (value >= 1000000) {
                  return (value / 1000000).toFixed(1) + "M";
                } else if (value >= 1000) {
                  return (value / 1000).toFixed(0) + "K";
                }
                return value;
              },
            },
            splitLine: {
              show: false,
            },
          },
          {
            type: "value",
            name: "Inversión Ads",
            nameLocation: "end",
            nameTextStyle: {
              color: metaAdsDataset ? metaAdsDataset.borderColor : "#1E88E5",
              padding: [0, 0, 0, 20],
              fontWeight: "bold",
            },
            max: yAxisMaxAds,
            position: "right",
            offset: 60,
            axisLine: {
              show: true,
              lineStyle: {
                color: metaAdsDataset ? metaAdsDataset.borderColor : "#1E88E5",
                width: 2,
              },
            },
            axisLabel: {
              color: metaAdsDataset ? metaAdsDataset.borderColor : "#1E88E5",
              formatter: (value) => {
                // Format with K/M for thousands/millions
                if (value >= 1000000) {
                  return (value / 1000000).toFixed(1) + "M";
                } else if (value >= 1000) {
                  return (value / 1000).toFixed(0) + "K";
                }
                return value;
              },
            },
            splitLine: {
              show: false,
            },
          },
        ],
        legend: {
          data: this.datasets.map((dataset) => dataset.label),
          top: 0,
          textStyle: {
            color: "#333",
            fontSize: 12,
          },
        },
        series: series,
        color: this.datasets.map((dataset) => dataset.borderColor),
        animation: !hasSingleDataPoint,
      };

      this.chart.setOption(option);
    },

    handleResize() {
      if (this.chart) {
        // Delay resize to ensure DOM is updated
        setTimeout(() => {
          this.chart.resize();
        }, 100);
      }
    },

    formatCurrency(value) {
      // Format number with thousand separators
      return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0,
      }).format(value);
    },

    handleLegendSelectChanged(params) {
      if (!this.chart || !this.datasets) return;

      const selected = params.selected;
      const visibleDatasetLabels = Object.keys(selected).filter(
        (name) => selected[name]
      );

      // Filter datasets based on visibility
      const visibleDatasets = this.datasets.filter((d) =>
        visibleDatasetLabels.includes(d.label)
      );

      // Separate visible datasets
      const visibleSalesDataset = visibleDatasets.find(
        (d) => d.label === "Ventas"
      );
      const visibleAdsDataset = visibleDatasets.find(
        (d) => d.label === "Inversión Ads"
      );
      const visibleRegularDatasets = visibleDatasets.filter(
        (d) => d.label !== "Ventas" && d.label !== "Inversión Ads"
      );

      // Recalculate maximum values for visible data
      let maxRegularValue = 0;
      if (visibleRegularDatasets.length > 0) {
        maxRegularValue = visibleRegularDatasets.reduce((max, dataset) => {
          // Ensure dataset.data is not empty before calculating max
          const datasetMax =
            dataset.data.length > 0 ? Math.max(...dataset.data) : 0;
          return datasetMax > max ? datasetMax : max;
        }, 0);
      }

      let maxSalesValue = 0;
      if (visibleSalesDataset && visibleSalesDataset.data.length > 0) {
        maxSalesValue = Math.max(...visibleSalesDataset.data);
      }

      let maxAdsValue = 0;
      if (visibleAdsDataset && visibleAdsDataset.data.length > 0) {
        maxAdsValue = Math.max(...visibleAdsDataset.data);
      }

      // Add padding, handle cases where max is 0 or very small
      const yAxisMaxRegular =
        visibleRegularDatasets.length > 0
          ? Math.max(10, maxRegularValue * 1.2)
          : 10; // Ensure a minimum axis range
      const yAxisMaxSales = visibleSalesDataset
        ? Math.max(1000, maxSalesValue * 1.2)
        : 1000; // Ensure a minimum axis range for sales
      const yAxisMaxAds = visibleAdsDataset
        ? Math.max(100, maxAdsValue * 1.2)
        : 1000; // Ensure a minimum axis range for ads

      // Update the chart's yAxis options
      this.chart.setOption({
        yAxis: [
          {
            max: yAxisMaxRegular, // Update left axis max
          },
          {
            max: yAxisMaxSales, // Update right axis max for sales
          },
          {
            max: yAxisMaxAds, // Update right axis max for ads
          },
        ],
      });
    },
  },
};
</script>

<style scoped>
.chart-card {
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15) !important;
}

.chart-title {
  display: flex;
  align-items: center;
}

.chart-loading-container {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  width: 100%;
  height: 450px;
  margin: 0 auto;
}
</style>
