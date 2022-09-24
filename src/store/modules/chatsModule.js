import api from "@/services/api/chats";
import {
  buildSuccess,
  handleError,
  buildQueryWithPagination,
} from "@/utils/utils.js";

const module = {
  namespaced: true,
  state: {
    chats: [],
    messages: [],
    selectedChat: null,
    total: 0,
    totalPages: 0,
  },
  actions: {
    list({ commit }, query) {
      let finalQuery = buildQueryWithPagination(query);
      commit("loadingModule/showLoading", true, { root: true });
      return new Promise((resolve, reject) => {
        api
          .list(finalQuery)
          .then((response) => {
            commit("loadingModule/showLoading", false, { root: true });
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
      state.chats = data;
    },
    totalItems(state, data) {
      state.total = data;
    },
    totalPages(state, data) {
      state.totalPages = data;
    },
    create(state, data) {
      state.chats.push(data);
    },
    update(state, { id, data }) {
      let indexToUpdate = state.chats.findIndex((member) => member._id == id);
      state.chats.splice(indexToUpdate, 1, {
        ...data,
      });
    },
    delete(state, id) {
      let indexToDelete = state.chats.findIndex((member) => member._id == id);
      state.chats.splice(indexToDelete, 1);
      state.total -= 1;
    },
    setChats(state, data) {
      state.chats = data;
    },
    setSelectedChat(state, data) {
      state.selectedChat = data;
    },
    addChat(state, data) {
      state.chats.unshift(data);
    },
    deletedMessage(state, data) {
      let message = state.messages.find((el) => el.mid === data.mid);
      if (message) {
        console.log("BORRANDO MENSAJE");
        message.isActive = false;
      }
    },

    setMessages(state, data) {
      state.messages = data;
    },
    addMessage(state, data) {
      state.messages.push(data);
    },
  },
  getters: {
    getChatById: (state) => (chatId) => {
      return state.chats.filter((chat) => chat._id === chatId);
    },
  },
};

export default module;
