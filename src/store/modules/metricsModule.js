import { format, subDays } from "date-fns";
import metricsApi from "@/services/api/metrics";

const state = {
  metricsData: [],
  loading: false,
  error: null,
  // Shared date range so the selection persists across every metrics tab.
  // Defaults to the last 30 days; quickFilterIndex 3 = "Últimos 30 días" preset.
  dateRange: {
    startDate: format(subDays(new Date(), 29), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    quickFilterIndex: 3,
    activeFilterLabel: "Últimos 30 días",
  },
};

const getters = {
  getMetricsData: (state) => state.metricsData,
  isLoading: (state) => state.loading,
  getError: (state) => state.error,
  getDateRange: (state) => state.dateRange,
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
  SET_DATE_RANGE(state, payload) {
    state.dateRange = { ...state.dateRange, ...payload };
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
