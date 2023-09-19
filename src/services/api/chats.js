import axios from "axios";
export default {
  list(query = { sort: "name", order: "1", limit: 10, page: 1 }) {
    return axios.get("/api/chats", { params: query });
  },
  update(id, payload) {
    return axios.put(`/api/chats/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/chats", payload);
  },
  delete(id) {
    return axios.delete(`/api/chats/${id}`);
  },
  getAllByCleanLeadId(cleanLeadId) {
    return axios.get(
      `/api/chats/get_all_by_cleanlead_id?cleanLeadId=${cleanLeadId}`
    );
  },
};
