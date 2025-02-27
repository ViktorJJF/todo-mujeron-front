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
  getAllByLeadId(leadId, platform) {
    return axios.get(
      `/api/chats/get_all_by_lead_id?leadId=${leadId}&platform=${platform}`
    );
  },
  getChats(query = { sort: "name", order: "1", limit: 10, page: 1 }) {
    return axios.get(`/api/chats/get_chats`, { params: query });
  },
  getRecentChats(query = { sort: "name", order: "1", limit: 10, page: 1 }) {
    return axios.get(`/api/chats/recent_chats`, { params: query });
  },
  sendMassiveMessage(payload) {
    return axios.post(`/api/chats/send_massive_message`, payload);
  },
};
