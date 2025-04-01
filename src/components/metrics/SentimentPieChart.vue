<template>
  <material-card
    color="info"
    icon="mdi-emoticon-outline"
    :title="$t('metrics.SENTIMENT_ANALYSIS.DISTRIBUTION_TITLE')"
    :text="$t('metrics.SENTIMENT_ANALYSIS.DISTRIBUTION_TEXT')"
  >
    <apexchart
      type="pie"
      height="350"
      :options="chartOptions"
      :series="chartSeries"
    ></apexchart>
  </material-card>
</template>

<script>
import MaterialCard from "@/components/material/Card";

export default {
  name: "SentimentPieChart",

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
      return this.data.map((item) => item.count);
    },

    chartOptions() {
      return {
        chart: {
          type: "pie",
          fontFamily: "Roboto, sans-serif",
        },
        labels: this.data.map((item) => item.value),
        colors: this.getSentimentColors(),
        legend: {
          position: "bottom",
          horizontalAlign: "center",
          fontSize: "14px",
          markers: {
            width: 12,
            height: 12,
            radius: 12,
          },
          itemMargin: {
            horizontal: 10,
            vertical: 5,
          },
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: "100%",
              },
              legend: {
                position: "bottom",
              },
            },
          },
        ],
        tooltip: {
          y: {
            formatter: (val) => {
              const percentage = ((val / this.total) * 100).toFixed(1);
              return `${val} (${percentage}%)`;
            },
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => {
            if (val < 5) return "";
            return `${Math.round(val)}%`;
          },
          style: {
            fontSize: "14px",
            fontFamily: "Roboto, sans-serif",
            fontWeight: "normal",
          },
          dropShadow: {
            enabled: false,
          },
        },
      };
    },
  },

  methods: {
    getSentimentColors() {
      // Define color map for sentiment values
      const colorMap = {
        Satisfecho: "#4CAF50", // Green
        "Emoción/Entusiasmo": "#8BC34A", // Light Green
        Neutro: "#9E9E9E", // Grey
        Insatisfecho: "#F44336", // Red
        Confusión: "#FF9800", // Orange
        Fustracion: "#E91E63", // Pink
        Tóxico: "#7B1FA2", // Purple
        "Evasivo/Desconfiado": "#607D8B", // Blue Grey
      };

      // Return colors in the same order as data entries
      return this.data.map((item) => colorMap[item.value] || "#9E9E9E");
    },
  },
};
</script>
