const PLATFORMS = {
  whatsapp: { icon: "mdi-whatsapp", name: "WhatsApp" },
  whatsapp_automated: { icon: "mdi-whatsapp", name: "WhatsApp" },
  instagram: { icon: "mdi-instagram", name: "Instagram" },
  facebook: { icon: "mdi-facebook-messenger", name: "Messenger" },
  telegram: { icon: "mdi-send", name: "Telegram" },
};

/** Icon and display name of a chat's channel (Chats.platform). */
export const chatPlatform = (platform) =>
  PLATFORMS[platform] || { icon: "mdi-chat-outline", name: platform || "Chat" };
