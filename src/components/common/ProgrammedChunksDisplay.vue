<template>
  <div class="programmed-chunks-container">
    <chunk-list-refresher
      :campaign-id="campaignId"
      @refresh="refreshChunks"
      :title="title"
    >
      <div v-if="isLoading && !chunks.length" class="loading-state">
        <i class="fa fa-spinner fa-spin"></i> Loading programmed chunks...
      </div>

      <div v-else-if="!chunks.length" class="empty-state">
        No programmed chunks found for this campaign.
      </div>

      <div v-else class="chunks-list">
        <div
          v-for="chunk in chunks"
          :key="`chunk-${chunk.chunkPage}-${chunk.chunkSize}`"
          class="chunk-item"
        >
          <div class="chunk-header">
            <div class="chunk-info">
              <span class="chunk-page">Page {{ chunk.chunkPage }}</span>
              <span class="chunk-size">({{ chunk.chunkSize }} contacts)</span>
            </div>
            <programmed-chunk-status
              :status="chunk.status"
              :error-message="chunk.errorMessage"
              :error-phones="chunk.errorPhones"
              :scheduled-date-time="chunk.sendAt"
            />
          </div>

          <div class="chunk-details">
            <div class="chunk-detail-item">
              <span class="detail-label">Scheduled:</span>
              <span
                class="detail-value"
                :class="{ highlight: chunk.status === 'pending' }"
              >
                {{ formatDate(chunk.sendAt) }}
              </span>
            </div>
            <div class="chunk-detail-item">
              <span class="detail-label">Created:</span>
              <span class="detail-value">{{
                formatDate(chunk.createdAt)
              }}</span>
            </div>
            <div class="chunk-detail-item" v-if="chunk.updatedAt">
              <span class="detail-label">Last Updated:</span>
              <span class="detail-value">{{
                formatDate(chunk.updatedAt)
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </chunk-list-refresher>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import ChunkListRefresher from "./ChunkListRefresher.vue";
import ProgrammedChunkStatus from "./ProgrammedChunkStatus.vue";
import marketingCampaignsApi from "@/services/api/marketingCampaigns";

export default {
  name: "ProgrammedChunksDisplay",
  components: {
    ChunkListRefresher,
    ProgrammedChunkStatus,
  },
  props: {
    campaignId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "Programmed Chunks",
    },
  },
  data() {
    return {
      chunks: [],
      isLoading: false,
    };
  },
  mounted() {
    this.initialize();
  },
  methods: {
    ...mapActions(["showNotification"]),

    async initialize() {
      await this.fetchProgrammedChunks();
    },

    async fetchProgrammedChunks() {
      if (!this.campaignId) return;

      this.isLoading = true;
      try {
        const response = await marketingCampaignsApi.getProgrammedChunks(
          this.campaignId
        );
        this.chunks = response.data || [];
      } catch (error) {
        console.error("Error fetching programmed chunks:", error);
        this.showNotification({
          type: "error",
          message: "Failed to load programmed chunks",
        });
      } finally {
        this.isLoading = false;
      }
    },

    async refreshChunks() {
      await this.fetchProgrammedChunks();
    },

    formatDate(date) {
      if (!date) return "N/A";

      const dateObj = new Date(date);
      return dateObj.toLocaleString();
    },
  },
};
</script>

<style scoped>
.programmed-chunks-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.loading-state,
.empty-state {
  padding: 20px;
  text-align: center;
  color: #7f8c8d;
  background-color: #ecf0f1;
  border-radius: 4px;
}

.chunk-item {
  background-color: white;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chunk-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.chunk-info {
  display: flex;
  align-items: center;
}

.chunk-page {
  font-weight: 600;
  font-size: 1rem;
}

.chunk-size {
  margin-left: 6px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.chunk-details {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
}

.chunk-detail-item {
  display: flex;
  margin-bottom: 4px;
}

.detail-label {
  font-weight: 500;
  width: 100px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.detail-value {
  font-size: 0.9rem;
}

.highlight {
  font-weight: 600;
  color: #f39c12;
}
</style>
