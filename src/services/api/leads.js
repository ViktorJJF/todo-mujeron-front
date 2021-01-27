import axios from "axios";
export default {
  list(query = { sort: "createdAt", order: "1" }) {
    console.log("el query: ", query);
    if (query.telefonoId === null) query.telefonoId = "";
    return axios.get("/api/leads", { params: query });
  },
  listOne(id) {
    return axios.get("/api/leads/" + id);
  },
  update(id, payload) {
    return axios.put(`/api/leads/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/leads", payload);
  },
  delete(id) {
    return axios.delete(`/api/leads/${id}`);
  },
};
