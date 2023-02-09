//usar esto para consultar en base de datos sin paginacion del server
import api from "@/services/api/templateMessagesLogs";
import { buildSuccess, handleError } from "@/utils/utils.js";
import store from "@/store";

const module = {
  namespaced: true,
  state: {
    templateMessagesLogs: [],
  },
  actions: {
    list({ commit }, query) {
      commit("loadingModule/showLoading", true, { root: true });
      return new Promise((resolve, reject) => {
        api
          .list(query)
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
      state.templateMessagesLogs = data;
    },
    create(state, data) {
      state.templateMessagesLogs.unshift(data);
    },
    update(state, { id, data }) {
      let indexToUpdate = state.templateMessagesLogs.findIndex(
        (member) => member._id == id
      );
      function searchLabelsInfoById(id) {
        //buscar info en fuentes de datos categorias/etiquetas/todofull
        let data = [
          ...store.state.ecommercesCategoriesModule.ecommercesCategories,
          ...store.state.ecommercesTagsModule.ecommercesTags,
          ...store.state.todofullLabelsModule.todofullLabels,
        ];
        return data.find((el) => el._id == id);
      }
      data.foreignLabelId = searchLabelsInfoById(data.foreignLabelId);
      state.templateMessagesLogs.splice(indexToUpdate, 1, {
        ...data,
      });
    },
    delete(state, id) {
      let indexToDelete = state.templateMessagesLogs.findIndex(
        (member) => member._id == id
      );
      state.templateMessagesLogs.splice(indexToDelete, 1);
    },
  },
  getters: {
    getLabelsByCategoryId: (state) => (categoryId) => {
      return state.templateMessagesLogs.filter(
        (label) => label.foreignLabelId == categoryId
      );
    },
  },
};

export default module;
