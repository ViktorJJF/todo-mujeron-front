<template>
  <div class="metrics-container">
    <v-card class="metrics-card">
      <v-card-title class="headline d-flex align-center primary--text">
        <v-icon large class="mr-2">mdi-chart-bar</v-icon>
        {{ $t("metrics.DASHBOARD_TITLE") }}
      </v-card-title>

      <div class="custom-tabs-wrapper">
        <v-tabs
          v-model="activeTab"
          slider-color="black"
          class="custom-tabs"
          fixed-tabs
          background-color="white"
        >
          <v-tab
            v-for="(tab, index) in tabs"
            :key="index"
            :class="{ 'custom-tab': true, active: activeTab === index }"
          >
            <v-icon class="tab-icon">{{ tab.icon }}</v-icon>
            <span class="tab-text">{{ tab.text }}</span>
          </v-tab>
        </v-tabs>
      </div>

      <v-tabs-items v-model="activeTab">
        <v-tab-item>
          <messages-by-channel-dashboard @component-ready="onComponentReady" />
        </v-tab-item>
        <v-tab-item>
          <sentiment-analysis-dashboard />
        </v-tab-item>
        <v-tab-item>
          <sales-analysis-dashboard />
        </v-tab-item>
        <v-tab-item>
          <consultation-motives-dashboard />
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </div>
</template>

<script>
import SentimentAnalysisDashboard from "@/components/metrics/SentimentAnalysisDashboard";
import SalesAnalysisDashboard from "@/components/metrics/SalesAnalysisDashboard";
import ConsultationMotivesDashboard from "@/components/metrics/ConsultationMotivesDashboard";
import MessagesByChannelDashboard from "@/components/metrics/MessagesByChannelDashboard";

export default {
  name: "MetricsView",

  components: {
    SentimentAnalysisDashboard,
    SalesAnalysisDashboard,
    ConsultationMotivesDashboard,
    MessagesByChannelDashboard,
  },

  data() {
    return {
      activeTab: 0,
      tabs: [
        {
          icon: "mdi-message-text-outline",
          text: "Métricas generales",
        },
        {
          icon: "mdi-emoticon-outline",
          text: this.$t("metrics.SENTIMENT_ANALYSIS.TITLE"),
        },
        {
          icon: "mdi-cash-register",
          text: "Análisis de Ventas",
        },
        {
          icon: "mdi-help-circle-outline",
          text: "Motivos de Consulta",
        },
      ],
    };
  },

  methods: {
    onComponentReady() {
      // Component is loaded and ready
      console.log("MessagesByChannelDashboard ready and loading data");
      // Make sure we're on the first tab
      this.activeTab = 0;
    },
  },
};
</script>

<style scoped>
.metrics-container {
  padding: 16px;
}

.metrics-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1) !important;
}

.custom-tabs-wrapper {
  position: relative;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #ccc; /* Added Border */
}

.custom-tabs {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  padding: 0 16px;
}

.custom-tabs::-webkit-scrollbar {
  display: none;
}

.v-tab {
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  min-width: fit-content;
  text-transform: none !important;
  color: #333 !important; /* Default Text Color (Blackish) */
}

.v-tab:hover {
  background-color: rgba(0, 0, 0, 0.05); /* Light Gray hover */
}

.v-tab--active {
  color: black !important; /* Active Text Color (Black) */
}

.tab-icon {
  margin-right: 8px;
  font-size: 22px;
  color: black;
}

.tab-text {
  white-space: nowrap;
  font-size: 16px;
  letter-spacing: 0.5px;
  color: black; /* Explicitly setting text color to black */
}
</style>
