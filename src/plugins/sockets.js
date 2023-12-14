import io from "socket.io-client";
import environment from "@/environment";

let socketUrl =
  environment === "local"
    ? "http://localhost:3000"
    : environment === "development"
    ? "https://dev.chatbot.todofull.club"
    : "https://chatbotmujeron.herokuapp.com";
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
      createdAt: new Date().toUTCString(),
      updatedAt: new Date().toUTCString(),
    });
  }
  // updating last message
  const chatToUpdate = chats.find((chat) => chat._id === data.chatId);
  if (chatToUpdate) {
    if (!chatToUpdate.lastMessage) chatToUpdate.lastMessage = { text: "" };
    chatToUpdate.lastMessage.text = data.text;
    chatToUpdate.updatedAt = new Date().toUTCString();
    // aumentando contador mensajes sin leer
    if (data.from === "Cliente") {
      chatToUpdate.pending_messages_count += 1;
    }
    chatsModule.chats = chatsModule.chats.slice();
  }
});

socket.on("NEW_CHAT", (data) => {
  store.default.commit("chatsModule/addChat", data);
});

socket.on("DELETED_MESSAGE", (data) => {
  store.default.commit("chatsModule/deletedMessage", data);
});

export default socket;
