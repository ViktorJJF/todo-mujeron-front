import axios from "axios";
export default {
  restartWhatsapp() {
    return axios.post("https://todo-full.digital/api/restart-whatsapp");
  },
  restartSoftWhatsapp() {
    return axios.post("http://localhost:3000/api/restart-soft-whatsapp");
  },
  getStatus() {
    return axios.post("http://localhost:3000/api/whatsapp/status");
  },
};
