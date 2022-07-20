import axios from "axios";
import store from "@/store";

export default {
  list(query = { sort: "createdAt", order: "1" }) {
    console.log("🚀 Aqui *** -> query", query);
    if (query.telefonoId === null) query.telefonoId = "";
    if (query.todofullLabels) {
      query.todofullLabels = JSON.stringify(query.todofullLabels);
    }
    if (query.pais) {
      //filtro pais
      let filterCountries = "";
      for (const paisIndex of query.pais) {
        filterCountries += "pais=" + store.state.countries[paisIndex] + "&";
      }
      return axios.get("/api/clean-leads?" + filterCountries, {
        params: query,
      });
    }
    return axios.get("/api/clean-leads", { params: query });
  },
  listAll(query = { sort: "createdAt", order: "1" }) {
    if (query.telefonoId === null) query.telefonoId = "";
    if (query.pais) {
      //filtro pais
      let filterCountries = "";
      for (const paisIndex of query.pais) {
        filterCountries += "pais=" + store.state.countries[paisIndex] + "&";
      }
      return axios.get("/api/clean-leads/all?" + filterCountries, {
        params: query,
      });
    }
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
};
