<template>
  <div class="cmf">
    <div class="cmf-headline">
      <span class="cmf-total">{{ formatNumber(total) }}</span>
      <span class="cmf-label">total</span>
    </div>
    <div class="cmf-rows" v-if="total > 0">
      <v-tooltip
        v-for="step in visibleSteps"
        :key="step.status"
        bottom
        open-delay="120"
      >
        <template v-slot:activator="{ on }">
          <div class="cmf-row" v-on="on">
            <v-icon x-small :color="step.iconColor" class="cmf-icon">
              {{ step.icon }}
            </v-icon>
            <span class="cmf-row-status">{{ step.status }}</span>
            <span
              class="cmf-row-value"
              :class="{ 'cmf-row-value--alert': step.alert && step.value > 0 }"
            >
              {{ formatNumber(step.value) }}
            </span>
            <span class="cmf-row-pct">{{ step.percentage }}%</span>
          </div>
        </template>
        <span>{{ step.tooltip }}</span>
      </v-tooltip>
    </div>
  </div>
</template>

<script>
const STATUS_DEFS = [
  {
    status: "sent",
    icon: "mdi-send",
    iconColor: "blue darken-1",
    tooltip: "Enviado a WhatsApp, sin confirmación de entrega aún",
    alwaysShow: true,
  },
  {
    status: "delivered",
    icon: "mdi-check",
    iconColor: "teal darken-1",
    tooltip: "Entregado al dispositivo, no leído todavía",
    alwaysShow: true,
  },
  {
    status: "read",
    icon: "mdi-check-all",
    iconColor: "light-blue darken-2",
    tooltip: "Leído por el destinatario",
    alwaysShow: true,
  },
  {
    status: "with_response",
    icon: "mdi-reply",
    iconColor: "green darken-2",
    tooltip: "Respondió al mensaje",
    alwaysShow: false,
  },
  {
    status: "invalid_number",
    icon: "mdi-phone-off",
    iconColor: "orange darken-2",
    tooltip: "Número no existe en WhatsApp",
    alwaysShow: false,
    alert: true,
  },
  {
    status: "error",
    icon: "mdi-alert-circle",
    iconColor: "red darken-1",
    tooltip: "Error al enviar",
    alwaysShow: false,
    alert: true,
  },
];

export default {
  name: "CampaignMetricsFunnel",
  props: {
    metrics: {
      type: Object,
      required: true,
    },
  },
  computed: {
    total() {
      return this.metrics.total || 0;
    },
    visibleSteps() {
      return STATUS_DEFS.filter((def) => {
        const value = this.metrics[def.status] || 0;
        return def.alwaysShow || value > 0;
      }).map((def) => {
        const value = this.metrics[def.status] || 0;
        const percentage =
          this.total > 0 ? Math.round((value / this.total) * 100) : 0;
        return { ...def, value, percentage };
      });
    },
  },
  methods: {
    formatNumber(value) {
      return new Intl.NumberFormat("es-CL").format(value);
    },
  },
};
</script>

<style scoped>
.cmf {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  min-width: 180px;
  padding: 2px 0;
}

.cmf-headline {
  display: flex;
  align-items: baseline;
  gap: 6px;
  line-height: 1.1;
}

.cmf-total {
  font-size: 16px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  letter-spacing: -0.2px;
  font-variant-numeric: tabular-nums;
}

.cmf-label {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.5);
  letter-spacing: 0.2px;
}

.cmf-rows {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-top: 3px;
}

.cmf-row {
  display: grid;
  grid-template-columns: 14px minmax(70px, auto) minmax(28px, auto) 36px;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  line-height: 1.5;
  cursor: default;
}

.cmf-icon {
  justify-self: center;
}

.cmf-row-status {
  color: rgba(0, 0, 0, 0.62);
  font-family: "SF Mono", "Monaco", "Menlo", "Consolas", monospace;
  font-size: 11px;
  letter-spacing: 0.1px;
}

.cmf-row-value {
  font-weight: 600;
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: rgba(0, 0, 0, 0.82);
}

.cmf-row-value--alert {
  color: #c62828;
}

.cmf-row-pct {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.42);
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
