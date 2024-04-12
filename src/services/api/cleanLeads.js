import axios from "axios";

export default {
  list(query = { sort: "createdAt", order: "1" }) {
    console.log("🚀 Aqui *** -> query", query);
    if (query.telefonoId === null) query.telefonoId = "";
    if (query.todofullLabels) {
      query.todofullLabels = JSON.stringify(query.todofullLabels);
    }
    if (query.countries) {
      query.countries = JSON.stringify(query.countries);
    }
    return axios.get("/api/clean-leads", { params: query });
  },
  listWithAdvanceFilter(query = { sort: "createdAt", order: "1" }) {
    if (query.telefonoId === null) query.telefonoId = "";
    if (query.todofullLabels) {
      query.todofullLabels = JSON.stringify(query.todofullLabels);
    }
    if (query.countries) {
      query.countries = JSON.stringify(query.countries);
    }
    return axios.get("/api/clean-leads/list_with_advance_filter", {
      params: query,
    });
  },
  listAll(query = { sort: "createdAt", order: "1" }) {
    if (query.telefonoId === null) query.telefonoId = "";
    return axios.get("/api/clean-leads/all", { params: query });
  },
  listOne(id) {
    return axios.get("/api/clean-leads/" + id);
  },
  getByTodofullLabels(todoFullLabels, country, audienceId, showMissingLeads) {
    return axios.get("/api/clean-leads/get-by-todofulllabels", {
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
    return axios.post("/api/clean-leads/send-to-audience", {
      audienceId,
      facebookAudienceId,
      todoFullLabels,
      showMissingLeads,
      country,
    });
  },
  update(id, payload) {
    return axios.put(`/api/clean-leads/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/clean-leads", payload);
  },
  delete(id) {
    return axios.delete(`/api/clean-leads/${id}`);
  },
  getLeadOdooValues() {
    return axios.get("/api/clean-leads/get_lead_odoo_values", {
      params: {},
    });
  },
};
