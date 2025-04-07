import axios from "axios";

/**
 * Metrics API service
 */
export default {
  /**
   * Get messages count by channel by month
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @param {Object} [options] - Request options including cancelToken
   * @returns {Promise<import('axios').AxiosResponse<import('../../types/metrics').MetricsApiResponse>>} API response
   */
  getMessagesByChannelByMonth(params, options = {}) {
    // Ensure params is an object
    const requestParams = params || {};

    return axios
      .post(`/api/metrics/messages_by_channel_by_month`, requestParams, options)
      .catch((error) => {
        if (axios.isCancel(error)) {
          // Request was cancelled, this is normal
          return Promise.reject(error);
        }
        console.error("Error fetching messages by channel metrics:", error);
        throw error;
      });
  },

  /**
   * Get cleanLeads count by channel by month
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @param {Object} [options] - Request options including cancelToken
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').CleanLeadsByChannelItem[]}>} API response
   */
  getCleanLeadsByChannelByMonth(params, options = {}) {
    // Ensure params is an object
    const requestParams = params || {};

    return axios
      .post(`/api/metrics/cleanleads_by_month`, requestParams, options)
      .catch((error) => {
        if (axios.isCancel(error)) {
          // Request was cancelled, this is normal
          return Promise.reject(error);
        }
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
    // Ensure params is an object
    const requestParams = params || {};

    return axios
      .post(`/api/metrics/chats_coverage_by_month`, requestParams)
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
    // Ensure params is an object
    const requestParams = params || {};

    return axios
      .post(`/api/metrics/total_messages`, requestParams)
      .catch((error) => {
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
    // Ensure params is an object
    const requestParams = params || {};

    return axios
      .post(`/api/metrics/new_chats`, requestParams)
      .catch((error) => {
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
    // Ensure params is an object
    const requestParams = params || {};

    return axios
      .post(`/api/metrics/new_users`, requestParams)
      .catch((error) => {
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
    // Ensure params is an object
    const requestParams = params || {};

    return axios
      .post(`/api/metrics/consultation_motives_counts`, requestParams)
      .catch((error) => {
        console.error("Error fetching consultation motives counts:", error);
        throw error;
      });
  },

  /**
   * Get consultation motives by month
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').ConsultationMotivesByMonthResponse}>} API response
   */
  getConsultationMotivesByMonth(params) {
    // Ensure params is an object
    const requestParams = params || {};

    return axios
      .post(`/api/metrics/consultation_motives_by_month`, requestParams)
      .catch((error) => {
        console.error(
          "Error fetching consultation motives by month metrics:",
          error
        );
        throw error;
      });
  },

  /**
   * Get sentiment analysis metrics
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').SentimentAnalysisResponse}>} API response
   */
  getSentimentAnalysisCounts(params) {
    // Ensure params is an object
    const requestParams = params || {};

    return axios
      .post(`/api/metrics/sentiment_analysis_counts`, requestParams)
      .catch((error) => {
        console.error(
          "Error fetching sentiment analysis counts metrics:",
          error
        );
        throw error;
      });
  },

  /**
   * Get sentiment analysis metrics by month
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').SentimentAnalysisByMonthResponse}>} API response
   */
  getSentimentAnalysisByMonth(params) {
    // Ensure params is an object
    const requestParams = params || {};

    return axios
      .post(`/api/metrics/sentiment_analysis_by_month`, requestParams)
      .catch((error) => {
        console.error(
          "Error fetching sentiment analysis by month metrics:",
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
    // Ensure params is an object
    const requestParams = params || {};

    return axios
      .post(`/api/metrics/conversation_quality`, requestParams)
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
    // Ensure params is an object
    const requestParams = params || {};

    return axios
      .post(`/api/metrics/sales_analysis_counts`, requestParams)
      .catch((error) => {
        console.error("Error fetching sales analysis metrics:", error);
        throw error;
      });
  },

  /**
   * Get sales analysis metrics by month
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').SalesAnalysisByMonthResponse}>} API response
   */
  getSalesAnalysisByMonth(params) {
    // Ensure params is an object
    const requestParams = params || {};

    return axios
      .post(`/api/metrics/sales_analysis_by_month`, requestParams)
      .catch((error) => {
        console.error("Error fetching sales analysis by month metrics:", error);
        throw error;
      });
  },

  /**
   * Get AI categories and topics metrics
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').AICategoriesResponse}>} API response
   */
  getAICategoriesMetrics(params) {
    // Ensure params is an object
    const requestParams = params || {};

    return axios
      .post(`/api/metrics/ai_categories`, requestParams)
      .catch((error) => {
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
    // Ensure params is an object
    const requestParams = params || {};

    return axios
      .post(`/api/metrics/ceo_dashboard`, requestParams)
      .catch((error) => {
        console.error("Error fetching CEO dashboard metrics:", error);
        throw error;
      });
  },

  /** Another metrics */
  /**
   * Get leads by month
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @param {Object} [options] - Request options including cancelToken
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').LeadsByMonthResponse}>>} API response
   */
  getLeadsByMonth(params, options = {}) {
    // Ensure params is an object
    const requestParams = params || {};

    return axios
      .post(`/api/metrics/leads_by_month`, requestParams, options)
      .catch((error) => {
        if (axios.isCancel(error)) {
          // Request was cancelled, this is normal
          return Promise.reject(error);
        }
        console.error("Error fetching leads by month metrics:", error);
        throw error;
      });
  },
  /**
   * Get Sentiment Analysis metrics
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').SentimentAnalysisResponse}>>} API response
   */
  getSentimentAnalysis(params) {
    // Ensure params is an object
    const requestParams = params || {};

    return axios
      .post(`/api/metrics/sentiment_analysis`, requestParams)
      .catch((error) => {
        console.error("Error fetching sentiment analysis metrics:", error);
        throw error;
      });
  },
  /**
   * Get Sheet Sales by Month metrics
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').SheetSalesByMonthResponse}>>} API response
   */
  getSheetSalesByMonth(params) {
    // Ensure params is an object
    const requestParams = params || {};

    return axios
      .post(`/api/metrics/sales_by_month`, requestParams)
      .catch((error) => {
        console.error("Error fetching sheet sales by month metrics:", error);
        throw error;
      });
  },

  /**
   * Get Meta Ads Spend metrics
   * @param {import('../../types/metrics').DateRangeParams} params - Date range parameters
   * @param {Object} [options] - Request options including cancelToken
   * @returns {Promise<import('axios').AxiosResponse<{ok: boolean, payload: import('../../types/metrics').MetaAdSpendResponse}>>} API response
   */
  getMetaAdSpend(params, options = {}) {
    // Ensure params is an object
    const requestParams = params || {};

    return axios
      .post(`/api/metrics/meta_ad_spend`, requestParams, options)
      .catch((error) => {
        if (axios.isCancel(error)) {
          // Request was cancelled, this is normal
          return Promise.reject(error);
        }
        console.error("Error fetching meta ads spend metrics:", error);
        throw error;
      });
  },
};
