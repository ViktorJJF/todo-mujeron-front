<template>
  <material-card
    color="purple"
    :icon="getIconForField(field)"
    :title="getFieldDisplayName(field)"
  >
    <v-row align="center" justify="center">
      <v-col cols="12" md="6">
        <apexchart
          type="radialBar"
          height="280"
          :options="chartOptions"
          :series="chartSeries"
        ></apexchart>
      </v-col>
      <v-col cols="12" md="6">
        <v-list dense>
          <v-list-item v-for="(item, i) in data" :key="i">
            <v-list-item-icon>
              <v-icon :color="item.value === 'Sí' ? 'success' : 'grey'">
                {{
                  item.value === "Sí" ? "mdi-check-circle" : "mdi-close-circle"
                }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ item.value }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ item.count }} chats ({{
                  ((item.count / total) * 100).toFixed(1)
                }}%)
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </material-card>
</template>

<script>
import MaterialCard from "@/components/material/Card";

export default {
  name: "BooleanMetricCard",

  components: {
    MaterialCard,
  },

  props: {
    data: {
      type: Array,
      required: true,
      default: () => [],
    },
    field: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
  },

  computed: {
    chartSeries() {
      // Find the "Sí" (Yes) value and calculate its percentage
      const yesItem = this.data.find((item) => item.value === "Sí");
      if (!yesItem) return [0];

      return [Math.round((yesItem.count / this.total) * 100)];
    },

    chartOptions() {
      return {
        chart: {
          type: "radialBar",
          fontFamily: "Roboto, sans-serif",
        },
        plotOptions: {
          radialBar: {
            hollow: {
              size: "70%",
            },
            dataLabels: {
              show: true,
              name: {
                show: true,
                fontSize: "16px",
                fontWeight: 600,
                offsetY: -10,
              },
              value: {
                show: true,
                fontSize: "30px",
                fontWeight: 500,
                formatter: (val) => `${val}%`,
              },
              total: {
                show: true,
                label: this.$t("metrics.SENTIMENT_ANALYSIS.YES_RESPONSES"),
                formatter: () => {
                  const yesItem = this.data.find((item) => item.value === "Sí");
                  if (!yesItem) return "0";
                  return yesItem.count.toString();
                },
              },
            },
          },
        },
        labels: [this.$t("metrics.SENTIMENT_ANALYSIS.YES_RESPONSES")],
        colors: ["#9C27B0"],
      };
    },
  },

  methods: {
    getFieldDisplayName(field) {
      // Map field names to display names
      const fieldMap = {
        venta_cruzada_efectiva: this.$t(
          "metrics.SENTIMENT_ANALYSIS.CROSS_SELLING"
        ),
        promociones_personalizadas: this.$t(
          "metrics.SENTIMENT_ANALYSIS.PERSONALIZED_PROMOS"
        ),
      };

      return fieldMap[field] || field;
    },

    getIconForField(field) {
      // Map field names to icons
      const iconMap = {
        venta_cruzada_efectiva: "mdi-cart-plus",
        promociones_personalizadas: "mdi-sale",
      };

      return iconMap[field] || "mdi-chart-bar";
    },
  },
};
</script>
