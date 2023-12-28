import api from "@/services/api/users";
import { buildSuccess, handleError } from "@/utils/utils.js";

const module = {
  namespaced: true,
  state: {
    users: [],
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

    listOne({ commit }, { id, query }) {
      console.log("🚀 Aqui *** -> id", id);
      return new Promise((resolve, reject) => {
        api
          .listOne(id, query)
          .then((response) => {
            commit("list", response.data.payload);
            resolve(response.data.payload);
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
    createCorporation({ commit }, data) {
      return new Promise((resolve, reject) => {
        api
          .createCorporation(data)
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
      state.users = data;
    },
    create(state, data) {
      state.users.push(data);
    },
    delete(state, id) {
      let indexToDelete = state.users.findIndex((member) => member._id == id);
      state.users.splice(indexToDelete, 1);
    },
    update() {
      // let indexToUpdate = state.users.findIndex((member) => {
      //   return member._id == id;
      // });
      // state.users.splice(indexToUpdate, 1, {
      //   ...data,
      // });
    },
  },
  getters: {},
};

export default module;
