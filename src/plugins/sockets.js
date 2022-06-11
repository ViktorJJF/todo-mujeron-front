import io from "socket.io-client";
import environment from "@/environment";

let socketUrl =
  environment === "development"
    ? "http://localhost:3000"
    : "https://todofull.club";
const socket = io(socketUrl);
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
      mid: data.mid,
      text: data.text,
      from: data.from,
      type: "text",
      chatId,
      isActive: true,
      payload: data.payload,
    });
  }
  // actualizando ultima fecha mensaje recibido
  let lastChat = chats.find((el) => el._id === data.chatId);
  if (lastChat && lastChat.last_message) {
    lastChat.last_message[0].createdAt = new Date();
  }
});

socket.on("NEW_CHAT", (data) => {
  store.default.commit("chatsModule/addChat", data);
});

socket.on("DELETED_MESSAGE", (data) => {
  store.default.commit("chatsModule/deletedMessage", data);
});

export default socket;
