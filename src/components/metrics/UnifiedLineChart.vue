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
      <div v-else>
        <apexchart
          type="line"
          height="400"
          :options="chartOptions"
          :series="chartSeries"
        ></apexchart>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import VueApexCharts from "vue-apexcharts";

export default {
  name: "UnifiedLineChart",

  components: {
    apexchart: VueApexCharts,
  },

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

  computed: {
    chartSeries() {
      if (!this.datasets) return [];

      return this.datasets.map((dataset) => ({
        name: dataset.label,
        data: dataset.data,
        percentage: dataset.percentage,
        totalChats: dataset.totalChats,
      }));
    },

    chartOptions() {
      return {
        chart: {
          type: "line",
          zoom: {
            enabled: true,
          },
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true,
            },
          },
        },
        colors: this.datasets.map((dataset) => dataset.borderColor),
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "smooth",
          width: 2,
        },
        markers: {
          size: 4,
          hover: {
            size: 6,
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (val, { seriesIndex, dataPointIndex, w }) {
              const series = w.config.series[seriesIndex];
              const percentage = series.percentage
                ? series.percentage[dataPointIndex]
                : 0;
              const totalChats = series.totalChats
                ? series.totalChats[dataPointIndex]
                : 0;
              return `${val} (${percentage}% de ${totalChats} chats)`;
            },
          },
        },
        grid: {
          borderColor: "#e0e0e0",
          strokeDashArray: 5,
        },
        xaxis: {
          categories: this.labels,
          labels: {
            style: {
              fontSize: "12px",
            },
          },
        },
        yaxis: {
          title: {
            text: "Cantidad",
          },
          labels: {
            formatter: function (val) {
              return val.toFixed(0);
            },
          },
          min: 0,
        },
        fill: {
          opacity: 0.3,
          type: "gradient",
          gradient: {
            shade: "light",
            type: "vertical",
            shadeIntensity: 0.25,
            gradientToColors: undefined,
            inverseColors: true,
            opacityFrom: 0.7,
            opacityTo: 0.15,
            stops: [0, 100],
          },
        },
        legend: {
          position: "top",
          horizontalAlign: "center",
        },
      };
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
</style>
