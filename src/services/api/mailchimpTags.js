import axios from "axios";
export default {
  list(query) {
    return axios.get("/api/mailchimp-tags", { params: query });
  },
  update(id, payload) {
    return axios.put(`/api/mailchimp-tags/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/mailchimp-tags", payload);
  },
  delete(id) {
    return axios.delete(`/api/mailchimp-tags/${id}`);
  },
};
