import api from "@/services/api/marketplaceProducts";
import { handleError } from "@/utils/utils.js";

const module = {
  namespaced: true,
  state: {
    products: [],
    variations: [],
    total: 0,
    totalPages: 0,
  },
  actions: {
    list({ commit }) {
      return new Promise((resolve, reject) => {
        api.listAll().then((response) => {
          commit("setProducts", response.data.payload);
          commit("totalItems", response.data.totalDocs);
          commit("totalPages", response.data.totalPages);
          resolve(response.data.payload);
        })
        .catch((error) => {
          handleError(error, commit, reject);
        });
      });
    },
    fetchVariations({ commit }) {
      return new Promise((resolve, reject) => {
        api.listVariations().then((response) => {
          commit("setVariations", response.data.payload);
          commit("totalItems", response.data.totalDocs);
          commit("totalPages", response.data.totalPages);
          resolve(response.data.payload);
        })
        .catch((error) => {
          handleError(error, commit, reject);
        });
      });
    },
  },
  mutations: {
    setProducts(state, data) {
      state.products = data;
    },
    setVariations(state, data) {
      state.variations = data;
    },
    totalItems(state, data) {
      state.total = data;
    },
    totalPages(state, data) {
      state.totalPages = data;
    },
  },
  getters: {},
};

export default module;
