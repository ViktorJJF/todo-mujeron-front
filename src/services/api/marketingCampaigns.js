import axios from "axios";

export const PROGRAMMED_CHUNK_STATUSES = Object.freeze({
  PENDING: "pending",
  PROCESSING: "processing",
  SENT: "sent",
  ERROR: "error",
  SENT_WITH_SOME_ERRORS: "sent_with_some_errors",
});

// WHY: persisting a PROGRAMMED chunk is a ~50-100ms DB write, so a stall means the
// network/proxy is broken — surface it in seconds instead of hiding behind the 60s
// global axios timeout. NOT applied to immediate sends: those legitimately run the
// ~45-min per-lead loop before responding.
const SCHEDULE_SEND_CHUNK_TIMEOUT_MS = 30000;

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
    // Bound the wait only for the fast programmed (scheduling) path; immediate
    // sends keep the global timeout because their server loop can take ~45 min.
    const requestConfig = scheduleAPIOptions?.isProgrammed
      ? { timeout: SCHEDULE_SEND_CHUNK_TIMEOUT_MS }
      : undefined;
    return axios.post(
      "/api/marketing-campaigns/send_chunk",
      payload,
      requestConfig
    );
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
