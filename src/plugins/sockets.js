import io from "socket.io-client";

const socket = io("https://todo-full.digital", { transports: ["websocket"] });
const store = require("@/store/index.js");

socket.on("NEW_MESSAGE", (data) => {
  //   console.log("los mensajes: ", store.default);
  let chatId = store.default.getters["chatsModule/getChatById"](data.chatId);
  let chatsModule = store.default.state.chatsModule;
  let chats = chatsModule.chats;
  let selectedChat = chatsModule.selectedChat;

  // agregando mensaje a chat
  if (selectedChat && data.chatId === selectedChat._id) {
    store.default.commit("chatsModule/addMessage", {
      text: data.text,
      from: data.from,
      type: "text",
      chatId,
    });
  }
  // actualizando ultima fecha mensaje recibido
  chats.find(
    (el) => el._id === data.chatId
  ).last_message[0].createdAt = new Date();
});

socket.on("NEW_CHAT", (data) => {
  store.default.commit("chatsModule/addChat", data);
});

export default socket;
