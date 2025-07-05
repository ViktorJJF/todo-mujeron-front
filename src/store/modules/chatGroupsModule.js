import chatGroupsApi from "@/services/api/chatGroups";

const state = {
  chatGroups: [],
};

const getters = {
  chatGroups: (state) => state.chatGroups,
};

const actions = {
  async list({ commit }, params) {
    try {
      const res = await chatGroupsApi.list(params);
      commit("SET_CHAT_GROUPS", res.data.payload);
      return res.data.payload;
    } catch (error) {
      console.error("Error fetching chat groups", error);
    }
  },
  async create({ dispatch }, data) {
    try {
      const res = await chatGroupsApi.create(data);
      await dispatch("list");
      return res.data;
    } catch (error) {
      console.error("Error creating chat group", error);
      throw error;
    }
  },
  async update({ dispatch }, { id, data }) {
    try {
      const res = await chatGroupsApi.update(id, data);
      await dispatch("list");
      return res.data;
    } catch (error) {
      console.error("Error updating chat group", error);
      throw error;
    }
  },
  async remove({ dispatch }, id) {
    try {
      const res = await chatGroupsApi.remove(id);
      await dispatch("list");
      return res.data;
    } catch (error) {
      console.error("Error deleting chat group", error);
      throw error;
    }
  },
};

const mutations = {
  SET_CHAT_GROUPS(state, chatGroups) {
    state.chatGroups = chatGroups;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
