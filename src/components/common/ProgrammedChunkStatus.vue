<template>
  <div class="status-badge-container">
    <div class="status-badge" :class="badgeClass">
      <span class="status-icon" v-if="showIcon">
        <i :class="iconClass"></i>
      </span>
      <span class="status-text">{{ statusDisplay }}</span>
      <span
        v-if="status === 'pending' && scheduledDateTime"
        class="scheduled-time"
      >
        <i class="fa fa-clock"></i> {{ formatScheduledTime(scheduledDateTime) }}
      </span>
    </div>

    <div
      v-if="
        hasErrors && (status === 'error' || status === 'sent_with_some_errors')
      "
      class="error-details"
    >
      <div v-if="errorMessage" class="error-message">
        <i class="fa fa-exclamation-triangle"></i> {{ errorMessage }}
      </div>
      <div v-if="errorPhones && errorPhones.length" class="error-phones">
        <div class="error-phones-title">
          Teléfonos con Error ({{ errorPhones.length }}):
        </div>
        <div class="error-phones-list">
          <div
            v-for="(phone, index) in errorPhones.slice(
              0,
              showAllPhones ? errorPhones.length : 3
            )"
            :key="index"
            class="error-phone"
          >
            {{ phone }}
          </div>
          <div
            v-if="!showAllPhones && errorPhones.length > 3"
            class="show-more"
            @click="showAllPhones = true"
          >
            Mostrar {{ errorPhones.length - 3 }} más...
          </div>
          <div
            v-if="showAllPhones && errorPhones.length > 3"
            class="show-less"
            @click="showAllPhones = false"
          >
            Mostrar menos
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { PROGRAMMED_CHUNK_STATUSES } from "@/services/api/marketingCampaigns";

export default {
  name: "ProgrammedChunkStatus",
  props: {
    status: {
      type: String,
      required: true,
      validator: (value) =>
        Object.values(PROGRAMMED_CHUNK_STATUSES).includes(value),
    },
    errorMessage: {
      type: String,
      default: "",
    },
    errorPhones: {
      type: Array,
      default: () => [],
    },
    scheduledDateTime: {
      type: [Date, String],
      default: null,
    },
  },
  data() {
    return {
      showAllPhones: false,
    };
  },
  computed: {
    hasErrors() {
      return (
        this.errorMessage || (this.errorPhones && this.errorPhones.length > 0)
      );
    },
    badgeClass() {
      const statusMap = {
        [PROGRAMMED_CHUNK_STATUSES.PENDING]: "status-pending",
        [PROGRAMMED_CHUNK_STATUSES.PROCESSING]: "status-processing",
        [PROGRAMMED_CHUNK_STATUSES.SENT]: "status-sent",
        [PROGRAMMED_CHUNK_STATUSES.ERROR]: "status-error",
        [PROGRAMMED_CHUNK_STATUSES.SENT_WITH_SOME_ERRORS]: "status-partial",
      };

      return statusMap[this.status] || "status-unknown";
    },
    showIcon() {
      return this.status !== PROGRAMMED_CHUNK_STATUSES.PENDING;
    },
    iconClass() {
      const iconMap = {
        [PROGRAMMED_CHUNK_STATUSES.PROCESSING]: "fa fa-spinner fa-spin",
        [PROGRAMMED_CHUNK_STATUSES.SENT]: "fa fa-check",
        [PROGRAMMED_CHUNK_STATUSES.ERROR]: "fa fa-times",
        [PROGRAMMED_CHUNK_STATUSES.SENT_WITH_SOME_ERRORS]: "fa fa-exclamation",
      };

      return iconMap[this.status] || "";
    },
    statusDisplay() {
      const displayMap = {
        [PROGRAMMED_CHUNK_STATUSES.PENDING]: "Pendiente",
        [PROGRAMMED_CHUNK_STATUSES.PROCESSING]: "Procesando",
        [PROGRAMMED_CHUNK_STATUSES.SENT]: "Enviado",
        [PROGRAMMED_CHUNK_STATUSES.ERROR]: "Error",
        [PROGRAMMED_CHUNK_STATUSES.SENT_WITH_SOME_ERRORS]:
          "Enviado con Errores",
      };

      return displayMap[this.status] || this.status;
    },
  },
  methods: {
    formatScheduledTime(date) {
      if (!date) return "";

      const scheduledDate = new Date(date);
      const now = new Date();
      const diffMs = scheduledDate - now;

      // If scheduled in the past
      if (diffMs < 0) {
        return "Pasado";
      }

      // If scheduled today
      if (scheduledDate.setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0)) {
        return `Hoy a las ${new Date(date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      }

      // If scheduled tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (
        scheduledDate.setHours(0, 0, 0, 0) === tomorrow.setHours(0, 0, 0, 0)
      ) {
        return `Mañana a las ${new Date(date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      }

      // Otherwise use date and time
      return new Date(date).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
</script>

<style scoped>
.status-badge-container {
  margin-bottom: 10px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
}

.status-icon {
  margin-right: 6px;
}

.scheduled-time {
  margin-left: 6px;
  background-color: rgba(0, 0, 0, 0.15);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.scheduled-time i {
  margin-right: 4px;
}

.status-pending {
  background-color: #f39c12;
}

.status-processing {
  background-color: #3498db;
}

.status-sent {
  background-color: #2ecc71;
}

.status-error {
  background-color: #e74c3c;
}

.status-partial {
  background-color: #f39c12; /* Use a warning color like amber */
}

.status-unknown {
  background-color: #95a5a6;
}

.error-details {
  margin-top: 8px;
  padding: 10px;
  border-radius: 4px;
  background-color: #fff5f5;
  border: 1px solid #ffcccc;
}

.error-message {
  color: #e74c3c;
  margin-bottom: 10px;
  font-weight: 500;
}

.error-phones-title {
  font-weight: 500;
  margin-bottom: 5px;
}

.error-phone {
  padding: 2px 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 4px;
  font-family: monospace;
}

.show-more,
.show-less {
  color: #3498db;
  cursor: pointer;
  padding: 4px 0;
  font-size: 0.85rem;
}

.show-more:hover,
.show-less:hover {
  text-decoration: underline;
}
</style>
