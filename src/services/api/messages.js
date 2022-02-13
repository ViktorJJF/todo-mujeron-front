import axios from "axios";
export default {
  list(query = { sort: "name", order: "1" }) {
    return axios.get("/api/messages", { params: query });
  },
  listByChat(query = { sort: "name", order: "1" }) {
    return axios.get("/api/messages/list-by-chat", { params: query });
  },
  update(id, payload) {
    return axios.put(`/api/messages/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/messages", payload);
  },
  delete(id) {
    return axios.delete(`/api/messages/${id}`);
  },
};
