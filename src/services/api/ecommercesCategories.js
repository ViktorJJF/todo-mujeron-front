import axios from "axios";
export default {
  list(query) {
    if (query && !query.sort && !query.order) {
      (query.sort = "createdAt"), (query.order = "desc");
    }
    return axios.get("/api/ecommerces-categories", { params: query });
  },
  update(id, payload) {
    return axios.put(`/api/ecommerces-categories/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/ecommerces-categories", payload);
  },
  delete(id) {
    return axios.delete(`/api/ecommerces-categories/${id}`);
  },
};
