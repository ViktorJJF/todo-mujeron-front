<template>
  <material-card
    color="warning"
    icon="mdi-alert-circle-outline"
    :title="$t('metrics.SENTIMENT_ANALYSIS.DISSATISFACTION_TITLE')"
    :text="$t('metrics.SENTIMENT_ANALYSIS.DISSATISFACTION_TEXT')"
  >
    <apexchart
      type="bar"
      height="350"
      :options="chartOptions"
      :series="chartSeries"
    ></apexchart>
  </material-card>
</template>

<script>
import MaterialCard from "@/components/material/Card";

export default {
  name: "DissatisfactionOriginChart",

  components: {
    MaterialCard,
  },

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
  },

  computed: {
    chartSeries() {
      return [
        {
          name: "Count",
          data: this.data.map((item) => item.count),
        },
      ];
    },

    chartOptions() {
      return {
        chart: {
          type: "bar",
          fontFamily: "Roboto, sans-serif",
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            horizontal: true,
            dataLabels: {
              position: "top",
            },
            borderRadius: 4,
            barHeight: "70%",
          },
        },
        colors: ["#FF9800"],
        dataLabels: {
          enabled: true,
          formatter: (val) => {
            const percentage = ((val / this.total) * 100).toFixed(1);
            return `${val} (${percentage}%)`;
          },
          style: {
            fontSize: "12px",
            fontFamily: "Roboto, sans-serif",
            colors: ["#333"],
          },
          offsetX: 30,
        },
        xaxis: {
          categories: this.data.map((item) => item.value),
          labels: {
            style: {
              fontSize: "12px",
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              fontSize: "12px",
            },
          },
        },
        tooltip: {
          y: {
            formatter: (val) => {
              const percentage = ((val / this.total) * 100).toFixed(1);
              return `${val} (${percentage}%)`;
            },
          },
        },
        grid: {
          borderColor: "#f1f1f1",
        },
      };
    },
  },
};
</script>
