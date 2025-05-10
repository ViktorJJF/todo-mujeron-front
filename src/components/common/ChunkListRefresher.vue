<template>
  <div class="chunk-refresher">
    <div class="refresh-header">
      <h3 class="chunk-title">{{ title }}</h3>
      <button
        class="refresh-button"
        @click="refreshData"
        :disabled="isLoading"
        :title="lastUpdatedText"
      >
        <i class="fa fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
        <span class="refresh-text">{{
          isLoading ? "Refreshing..." : "Refresh"
        }}</span>
      </button>
    </div>
    <div v-if="lastUpdated" class="last-updated">
      Last updated: {{ lastUpdatedText }}
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "ChunkListRefresher",
  props: {
    title: {
      type: String,
      default: "Programmed Chunks",
    },
    campaignId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isLoading: false,
      lastUpdated: null,
    };
  },
  computed: {
    lastUpdatedText() {
      if (!this.lastUpdated) return "";

      // Format the date nicely
      const now = new Date();
      const updated = new Date(this.lastUpdated);
      const diffMs = now - updated;

      // If less than a minute ago
      if (diffMs < 60000) {
        return "just now";
      }

      // If less than an hour ago
      if (diffMs < 3600000) {
        const minutes = Math.floor(diffMs / 60000);
        return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
      }

      // If today
      if (updated.setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0)) {
        return `Hoy a las ${updated.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      }

      // Otherwise show full date
      return updated.toLocaleString();
    },
  },
  methods: {
    async refreshData() {
      if (this.isLoading) return;

      this.isLoading = true;
      try {
        // Emit event for parent component to handle the refresh
        this.$emit("refresh", this.campaignId);
        this.lastUpdated = new Date();
      } catch (error) {
        console.error("Error refreshing data:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.chunk-refresher {
  margin-bottom: 20px;
}

.refresh-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.chunk-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.refresh-button {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-button:hover {
  background-color: #2980b9;
}

.refresh-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.refresh-text {
  margin-left: 6px;
}

.last-updated {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 12px;
}
</style>
