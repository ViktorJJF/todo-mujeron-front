import axios from "axios";
export default {
  createLabel(payload) {
    return axios.post("/api/graph-api/labels", { payload });
  },
  createMetaIntegration(fb_exchange_token) {
    return axios.post("/api/graph-api/create-meta-integration", {
      fb_exchange_token,
    });
  },
  getUserInformation(accessToken) {
    return axios.get(
      "/api/graph-api/get_user_information?access_token=" + accessToken
    );
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
  getLongUserToken(fb_exchange_token) {
    return axios.post(`/api/graph-api/get_long_user_token`, {
      fb_exchange_token,
    });
  },
  getBusinessPages(access_token) {
    return axios.get(
      `/api/graph-api/get_business_pages?access_token=${access_token}`
    );
  },
  getCatalogs() {
    return axios.get(`/api/graph-api/get_catalogs`);
  },
};
