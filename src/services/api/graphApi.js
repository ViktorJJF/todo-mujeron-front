import axios from "axios";
export default {
  createLabel(payload) {
    return axios.post("/api/graph-api/labels", payload);
  },
  getUserInformation(accessToken) {
    return axios.post("/api/graph-api/get-user-information", {
      access_token: accessToken,
    });
  },
  getAudiences() {
    return axios.post("/api/graph-api/getAudiences");
  },
  getInstagramPosts(fanpageId, next_page) {
    return axios.get("/api/graph-api/get-instagram-posts", {
      params: { fanpageId, next_page },
    });
  },
  getFacebookPosts(fanpageId, next_page) {
    return axios.get("/api/graph-api/get-facebook-posts", {
      params: { fanpageId, next_page },
    });
  },
  deleteLabel(id, fanpageId) {
    return axios.delete(`/api/graph-api/labels/${id}?fanpageId=${fanpageId}`);
  },
  getWhatsappMessageTemplates(whats_app_business_account_id) {
    return axios.get(
      `/api/graph-api/whatsapp/message-templates?whats_app_business_account_id=${whats_app_business_account_id}`
    );
  },
  sendWhatsappMessageTemplates(
    to,
    template_name,
    dynamic_parameters,
    bot_id,
    cleanLeadId,
    ecommercesOrderId,
    marketingCampaignId
  ) {
    return axios.post(`/api/graph-api/whatsapp/send-message-templates`, {
      to,
      template_name,
      dynamic_parameters,
      bot_id,
      cleanLeadId,
      ecommercesOrderId,
      marketingCampaignId,
    });
  },
};
