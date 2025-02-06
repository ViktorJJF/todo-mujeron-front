import axios from "axios";
export default {
  list(query = { sort: "createdAt", order: "1" }) {
    if (query.telefonoId === null) query.telefonoId = "";
    return axios.get("/api/massive-messages-logs", { params: query });
  },
  listOne(id) {
    return axios.get("/api/massive-messages-logs/" + id);
  },
  update(id, payload) {
    return axios.put(`/api/massive-messages-logs/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/massive-messages-logs", payload);
  },
  delete(id) {
    return axios.delete(`/api/massive-messages-logs/${id}`);
  },
};
