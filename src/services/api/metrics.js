import axios from "axios";

/**
 * Metrics API service
 */
export default {
  /**
   * Get messages count by channel by month
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @returns {Promise<import('axios').AxiosResponse<import('../../types/metrics').MetricsApiResponse>>} API response
   */
  getMessagesByChannelByMonth(params) {
    return axios
      .post(`/api/metrics/messages_by_channel_by_month`, params)
      .catch((error) => {
        console.error("Error fetching messages by channel metrics:", error);
        throw error;
      });
  },

  /**
   * Get cleanLeads count by channel by month
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').CleanLeadsByChannelItem[]}>} API response
   */
  getCleanLeadsByChannelByMonth(params) {
    return axios
      .post(`/api/metrics/cleanleads_by_channel_by_month`, params)
      .catch((error) => {
        console.error("Error fetching cleanLeads by channel metrics:", error);
        throw error;
      });
  },

  /**
   * Get chat metrics by month with coverage information
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').ChatsCoverageItem[]}>} API response
   */
  getChatsCoverageByMonth(params) {
    return axios
      .post(`/api/metrics/chats_coverage_by_month`, params)
      .catch((error) => {
        console.error("Error fetching chats coverage metrics:", error);
        throw error;
      });
  },

  /**
   * Get total messages count by date range
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').TotalMessagesResponse}>} API response
   */
  getTotalMessagesByDateRange(params) {
    return axios.post(`/api/metrics/total_messages`, params).catch((error) => {
      console.error("Error fetching total messages metrics:", error);
      throw error;
    });
  },

  /**
   * Get new chats count by date range
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').NewChatsResponse}>} API response
   */
  getNewChatsByDateRange(params) {
    return axios.post(`/api/metrics/new_chats`, params).catch((error) => {
      console.error("Error fetching new chats metrics:", error);
      throw error;
    });
  },

  /**
   * Get new users count by date range
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').NewUsersResponse}>} API response
   */
  getNewUsersByDateRange(params) {
    return axios.post(`/api/metrics/new_users`, params).catch((error) => {
      console.error("Error fetching new users metrics:", error);
      throw error;
    });
  },

  /**
   * Get consultation motives counts
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').ConsultationMotivesCountsResponse}>} API response
   */
  getConsultationMotivesCounts(params) {
    return axios
      .post(`/api/metrics/consultation_motives_counts`, params)
      .catch((error) => {
        console.error("Error fetching consultation motives counts:", error);
        throw error;
      });
  },

  /**
   * Get sentiment analysis metrics
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').SentimentAnalysisResponse}>} API response
   */
  getSentimentAnalysisCounts(params) {
    return axios
      .post(`/api/metrics/sentiment_analysis_counts`, params)
      .catch((error) => {
        console.error(
          "Error fetching sentiment analysis counts metrics:",
          error
        );
        throw error;
      });
  },

  /**
   * Get conversation quality metrics
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').ConversationQualityResponse}>} API response
   */
  getConversationQualityMetrics(params) {
    return axios
      .post(`/api/metrics/conversation_quality`, params)
      .catch((error) => {
        console.error("Error fetching conversation quality metrics:", error);
        throw error;
      });
  },

  /**
   * Get sales analysis metrics
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').SalesAnalysisResponse}>} API response
   */
  getSalesAnalysisCounts(params) {
    return axios
      .post(`/api/metrics/sales_analysis_counts`, params)
      .catch((error) => {
        console.error("Error fetching sales analysis metrics:", error);
        throw error;
      });
  },

  /**
   * Get AI categories and topics metrics
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').AICategoriesResponse}>} API response
   */
  getAICategoriesMetrics(params) {
    return axios.post(`/api/metrics/ai_categories`, params).catch((error) => {
      console.error("Error fetching AI categories metrics:", error);
      throw error;
    });
  },

  /**
   * Get combined dashboard metrics for CEO
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').CEODashboardResponse}>} API response
   */
  getCEODashboardMetrics(params) {
    return axios.post(`/api/metrics/ceo_dashboard`, params).catch((error) => {
      console.error("Error fetching CEO dashboard metrics:", error);
      throw error;
    });
  },
};
