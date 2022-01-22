import api from "@/services/api/orders";
import { handleError } from "@/utils/utils.js";

const module = {
  namespaced: true,
  state: {
    orders: [],
    total: 0,
    totalPages: 0,
  },
  actions: {
    list({ commit }, { catalog }) {
      return new Promise((resolve, reject) => {
        let resPromise = catalog
          ? api.list(catalog)
          : api.listAll()

        resPromise.then((response) => {
          console.log(response.data.payload)
          commit("list", response.data.payload);
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
    list(state, data) {
      state.orders = data;
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
