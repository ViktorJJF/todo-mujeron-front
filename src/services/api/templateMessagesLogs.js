import axios from "axios";
export default {
  list(query = { sort: "createdAt", order: "1" }) {
    if (query.telefonoId === null) query.telefonoId = "";
    return axios.get("/api/template-messages-logs", { params: query });
  },
  listOne(id) {
    return axios.get("/api/template-messages-logs/" + id);
  },
  update(id, payload) {
    return axios.put(`/api/template-messages-logs/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/template-messages-logs", payload);
  },
  delete(id) {
    return axios.delete(`/api/template-messages-logs/${id}`);
  },
};
