import axios from "axios";
export default {
  list(query = { sort: "createdAt", order: "1" }) {
    if (query.telefonoId === null) query.telefonoId = "";
    return axios.get("/api/leads", { params: query });
  },
  listAll(query = { sort: "createdAt", order: "1" }) {
    if (query.telefonoId === null) query.telefonoId = "";
    return axios.get("/api/leads/all", { params: query });
  },
  listOne(id) {
    return axios.get("/api/leads/" + id);
  },
  getByTodofullLabels(todoFullLabels, country, audienceId, showMissingLeads) {
    return axios.get("/api/leads/get-by-todofulllabels", {
      params: {
        todoFullLabels: JSON.stringify(todoFullLabels),
        country,
        audienceId,
        showMissingLeads,
      },
    });
  },
  sendLeadsToAudience(
    audienceId,
    facebookAudienceId,
    todoFullLabels,
    showMissingLeads,
    country
  ) {
    return axios.post("/api/leads/send-to-audience", {
      audienceId,
      facebookAudienceId,
      todoFullLabels,
      showMissingLeads,
      country,
    });
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
