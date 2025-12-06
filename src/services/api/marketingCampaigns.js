import axios from "axios";

export const PROGRAMMED_CHUNK_STATUSES = Object.freeze({
  PENDING: "pending",
  PROCESSING: "processing",
  SENT: "sent",
  ERROR: "error",
  SENT_WITH_SOME_ERRORS: "sent_with_some_errors",
});

export default {
  list(params) {
    return axios.get("/api/marketing-campaigns", { params });
  },
  listOne(id) {
    return axios.get(`/api/marketing-campaigns/${id}`);
  },
  update(id, payload) {
    return axios.put(`/api/marketing-campaigns/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/marketing-campaigns", payload);
  },
  sendChunk(
    chunkPage,
    chunkSize,
    segment,
    campaign,
    scheduleAPIOptions = null
  ) {
    let payload = {
      chunkPage,
      chunkSize,
      segment,
      campaign,
    };
    if (scheduleAPIOptions) {
      payload = {
        ...payload,
        ...scheduleAPIOptions,
      };
    }
    return axios.post("/api/marketing-campaigns/send_chunk", payload);
  },
  chunkDetail(chunkPage, chunkSize, segment, campaign) {
    const payload = {
      chunkPage,
      chunkSize,
      segment,
      campaign,
    };
    
    // Extract campaignId from campaign object if it exists
    if (campaign && campaign._id) {
      payload.campaignId = campaign._id;
    }
    
    return axios.post("/api/marketing-campaigns/chunk_detail", payload);
  },
  delete(id) {
    return axios.delete(`/api/marketing-campaigns/${id}`);
  },
  stopScheduledChunk(campaignId, chunkPage) {
    return axios.post(`/api/marketing-campaigns/stop_scheduled_chunk`, {
      campaignId,
      chunkPage,
    });
  },
  stopAllScheduledChunksForCampaign(campaignId) {
    return axios.post(
      `/api/marketing-campaigns/stop_all_scheduled_chunks_for_campaign`,
      { campaignId }
    );
  },
  getProgrammedChunks(campaignId) {
    return axios.get(
      `/api/marketing-campaigns/${campaignId}/programmed-chunks`
    );
  },
  stopManuallyChunk(campaignId, chunkPage) {
    return axios.post(`/api/marketing-campaigns/stop_manually_chunk`, {
      campaignId,
      chunkPage,
    });
  },
  simulateBotSelection(campaignId, chunkPage) {
    return axios.post(`/api/marketing-campaigns/simulate_bot_selection`, {
      campaignId,
      chunkPage,
    });
  },
};
