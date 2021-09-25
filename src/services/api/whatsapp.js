import axios from "axios";
export default {
  restartWhatsapp() {
    return axios.post("https://todo-full.digital/api/restart-whatsapp");
  },
  restartSoftWhatsapp() {
    return axios.post("https://todo-full.digital/api/restart-soft-whatsapp");
  },
  getStatus() {
    return axios.post("https://todo-full.digital/api/whatsapp/status");
  },
};
