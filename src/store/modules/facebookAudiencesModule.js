//usar esto para consultar en base de datos sin paginacion del server
import api from "@/services/api/facebookAudiences";
import {
  buildSuccess,
  handleError,
  buildQueryWithPagination,
} from "@/utils/utils.js";

const module = {
  namespaced: true,
  state: {
    facebookAudiences: [],
  },
  actions: {
    list({ commit }, query) {
      let finalQuery = buildQueryWithPagination(query);
      commit("loadingModule/showLoading", true, { root: true });
      return new Promise((resolve, reject) => {
        api
          .list(finalQuery)
          .then((response) => {
            commit("list", response.data.payload);
            commit("loadingModule/showLoading", false, { root: true });
            resolve(response.data.payload);
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
            commit("loadingModule/showLoading", true, { root: true });
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
        commit("loadingModule/showLoading", true, { root: true });
        api
          .update(id, data)
          .then((res) => {
            commit("loadingModule/showLoading", false, { root: true });
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
            commit("loadingModule/showLoading", true, { root: true });
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
      state.facebookAudiences = data;
    },
    create(state, data) {
      state.facebookAudiences.unshift(data);
    },
    update(state, { id, data }) {
      let indexToUpdate = state.facebookAudiences.findIndex(
        (member) => member._id == id
      );
      state.facebookAudiences.splice(indexToUpdate, 1, {
        ...data,
      });
    },
    delete(state, id) {
      let indexToDelete = state.facebookAudiences.findIndex(
        (member) => member._id == id
      );
      state.facebookAudiences.splice(indexToDelete, 1);
    },
  },
  getters: {},
};

export default module;
