const module = {
  namespaced: true,
  state: {
    chats: [],
    messages: [],
    selectedChat: null,
  },
  actions: {},
  mutations: {
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