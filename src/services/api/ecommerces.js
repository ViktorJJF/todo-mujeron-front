import axios from "axios";
export default {
  list(query) {
    if (query && !query.sort && !query.order) {
      (query.sort = "createdAt"), (query.order = "desc");
    }
    return axios.get("/api/ecommerces", { params: query });
  },
  listOne(id, params) {
    return axios.get(`/api/ecommerces/${id}`, { params });
  },
  listSizes(query) {
    return axios.get(`/api/ecommerces/sizes`, { params: query });
  },
  listCategories(query) {
    return axios.get(`/api/ecommerces/categories`, { params: query });
  },
  listAttributes(query) {
    return axios.get(`/api/ecommerces/attributes`, { params: query });
  },
  update(id, payload) {
    return axios.put(`/api/ecommerces/${id}`, payload);
  },
  updateVariation(id, variation, payload) {
    return axios.put(`/api/ecommerces/${id}/variations/${variation}`, payload);
  },
  updateVariationBatch(id, payload) {
    return axios.post(`/api/ecommerces/${id}/variations/batch`, payload);
  },
  create(payload) {
    return axios.post("/api/ecommerces", payload);
  },
  delete(id) {
    return axios.delete(`/api/ecommerces/${id}`);
  },
  syncAll() {
    return axios.post(`/api/ecommerces/sync-all`);
  },
  syncSelected(payload) {
    return axios.post(`/api/ecommerces/sync-selected`, payload);
  },
};
