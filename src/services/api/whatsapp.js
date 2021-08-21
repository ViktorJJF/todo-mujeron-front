import axios from "axios";
export default {
  restartWhatsapp() {
    return axios.post("https://todo-full.digital/api/restart-whatsapp");
  },
};
