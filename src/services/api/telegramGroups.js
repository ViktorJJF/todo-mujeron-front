import axios from "axios";
export default {
  list(query = { sort: "createdAt", order: "1" }) {
    return axios.get("/api/telegram-groups", { params: query });
  },
  listOne(id) {
    return axios.get(`/api/telegram-groups/${id}`);
  },
  update(id, payload) {
    return axios.put(`/api/telegram-groups/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/telegram-groups", payload);
  },
  delete(id) {
    return axios.delete(`/api/telegram-groups/${id}`);
  },
};
