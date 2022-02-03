import api from "@/services/api/gravityForms";
import { buildSuccess, handleError } from "@/utils/utils.js";

const module = {
  namespaced: true,
  state: {
    gravityForms: [],
  },
  actions: {
    list({ commit }, query) {
      return new Promise((resolve, reject) => {
        api
          .list(query)
          .then((response) => {
            commit("list", response.data.payload);
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
        api
          .update(id, data)
          .then((res) => {
            commit("loadingModule/showLoading", true, { root: true });
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
      state.gravityForms = data;
    },
    create(state, data) {
      state.gravityForms.push(data);
    },
    update(state, { id, data }) {
      let indexToUpdate = state.gravityForms.findIndex(
        (member) => member._id == id
      );
      state.gravityForms.splice(indexToUpdate, 1, {
        ...data,
      });
    },
    delete(state, id) {
      let indexToDelete = state.gravityForms.findIndex(
        (member) => member._id == id
      );
      state.gravityForms.splice(indexToDelete, 1);
    },
  },
  getters: {},
};

export default module;
