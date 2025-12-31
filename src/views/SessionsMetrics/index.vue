<template>
  <div class="sessions-metrics-container">
    <v-card class="metrics-card">
      <v-card-title class="headline d-flex align-center primary--text">
        <v-icon large class="mr-2">mdi-chat-processing-outline</v-icon>
        Métricas de Sesiones
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
          <sessions-consultation-motives-dashboard />
        </v-tab-item>
        <v-tab-item>
          <sessions-sentiment-analysis-dashboard />
        </v-tab-item>
        <v-tab-item>
          <sessions-conversation-quality-dashboard />
        </v-tab-item>
        <v-tab-item>
          <sessions-sales-analysis-dashboard />
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </div>
</template>

<script>
import SessionsConsultationMotivesDashboard from "@/components/metrics/SessionsConsultationMotivesDashboard";
import SessionsSentimentAnalysisDashboard from "@/components/metrics/SessionsSentimentAnalysisDashboard";
import SessionsConversationQualityDashboard from "@/components/metrics/SessionsConversationQualityDashboard";
import SessionsSalesAnalysisDashboard from "@/components/metrics/SessionsSalesAnalysisDashboard";

export default {
  name: "SessionsMetricsView",

  components: {
    SessionsConsultationMotivesDashboard,
    SessionsSentimentAnalysisDashboard,
    SessionsConversationQualityDashboard,
    SessionsSalesAnalysisDashboard,
  },

  data() {
    return {
      activeTab: 0,
      tabs: [
        {
          icon: "mdi-help-circle-outline",
          text: "Motivos de Consulta",
        },
        {
          icon: "mdi-emoticon-outline",
          text: "Análisis de Sentimiento",
        },
        {
          icon: "mdi-message-check-outline",
          text: "Calidad de Conversación",
        },
        {
          icon: "mdi-cash-register",
          text: "Análisis de Ventas",
        },
      ],
    };
  },
};
</script>

<style scoped>
.sessions-metrics-container {
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
  border-bottom: 1px solid #ccc;
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
  color: #333 !important;
}

.v-tab:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.v-tab--active {
  color: black !important;
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
  color: black;
}
</style>
