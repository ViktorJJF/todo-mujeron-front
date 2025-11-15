import api from "@/services/api/routineExecutions";
import { buildSuccess, handleError } from "@/utils/utils.js";

const module = {
  namespaced: true,
  state: {
    executions: [],
    stats: {
      totalExecutions: 0,
      byStatus: []
    },
    total: 0,
    totalPages: 0,
  },
  actions: {
    list({ commit }, query) {
      return new Promise((resolve, reject) => {
        api
          .list(query)
          .then((response) => {
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
    getStats({ commit }, query) {
      return new Promise((resolve, reject) => {
        api
          .getStats(query)
          .then((response) => {
            commit("setStats", response.data);
            resolve(response.data);
          })
          .catch((error) => {
            handleError(error, commit, reject);
          });
      });
    },
    create({ commit }, data) {
      return new Promise((resolve, reject) => {
        api
          .create(data)
          .then((res) => {
            buildSuccess("Registro guardado con éxito", commit);
            commit("create", res.data.payload);
            resolve(res.data.payload);
          })
          .catch((error) => {
            handleError(error, commit, reject);
          });
      });
    },
    update({ commit }, { id, data }) {
      return new Promise((resolve, reject) => {
        api
          .update(id, data)
          .then((res) => {
            buildSuccess("Registro actualizado con éxito", commit);
            commit("update", {
              id,
              data: res.data.payload,
            });
            resolve(res.data.payload);
          })
          .catch((error) => {
            handleError(error, commit, reject);
          });
      });
    },
    delete({ commit }, id) {
      return new Promise((resolve, reject) => {
        api
          .delete(id)
          .then(() => {
            buildSuccess("Registro eliminado con éxito", commit);
            commit("delete", id);
            resolve();
          })
          .catch((error) => {
            handleError(error, commit, reject);
          });
      });
    },
  },
  mutations: {
    list(state, data) {
      state.executions = data;
    },
    setStats(state, data) {
      state.stats = data;
    },
    totalItems(state, data) {
      state.total = data;
    },
    totalPages(state, data) {
      state.totalPages = data;
    },
    create(state, data) {
      state.executions.unshift(data);
    },
    update(state, { id, data }) {
      let indexToUpdate = state.executions.findIndex(
        (exec) => exec._id == id
      );
      state.executions.splice(indexToUpdate, 1, {
        ...data,
      });
    },
    delete(state, id) {
      let indexToDelete = state.executions.findIndex(
        (exec) => exec._id == id
      );
      state.executions.splice(indexToDelete, 1);
      state.total -= 1;
    },
  },
  getters: {},
};

export default module;
