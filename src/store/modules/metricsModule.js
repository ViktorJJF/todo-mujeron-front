import metricsApi from "@/services/api/metrics";

const state = {
  metricsData: [],
  loading: false,
  error: null,
};

const getters = {
  getMetricsData: (state) => state.metricsData,
  isLoading: (state) => state.loading,
  getError: (state) => state.error,
};

const actions = {
  async fetchMessagesByChannelByMonth({ commit }, params) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      const response = await metricsApi.getMessagesByChannelByMonth(params);
      commit("SET_METRICS_DATA", response.data.payload);
      return response.data.payload;
    } catch (error) {
      console.error("Error fetching metrics data:", error);
      commit(
        "SET_ERROR",
        "Error al cargar los datos. Por favor, intente nuevamente."
      );
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },
};

const mutations = {
  SET_METRICS_DATA(state, data) {
    state.metricsData = data;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
