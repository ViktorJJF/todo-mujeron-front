import axios from "axios";
export default {
  list(query = { sort: "name", order: "1" }) {
    return axios.get("/api/imagina_template_messages", { params: query });
  },
  update(id, payload) {
    return axios.put(`/api/imagina_template_messages/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/imagina_template_messages", payload);
  },
  delete(id) {
    return axios.delete(`/api/imagina_template_messages/${id}`);
  },
  sendSingleMessage(payload) {
    return axios.post("/api/imagina_template_messages/send_single_message", payload);
  },
  sendBulkMessages(payload) {
    return axios.post("/api/imagina_template_messages/send_bulk_messages", payload);
  },
  sendMassiveMessages(payload) {
    return axios.post("/api/imagina_template_messages/send_massive_messages", payload);
  }
};
