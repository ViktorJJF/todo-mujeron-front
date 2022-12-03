import axios from "axios";
export default {
  list(query = { sort: "createdAt", order: "1" }) {
    if (query.telefonoId === null) query.telefonoId = "";
    return axios.get("/api/marketplace-products-v2-variations", { params: query });
  },
  listByProduct(productId, extra) {
    const query = { sort: 'createdAt', order: "1", product: productId, ...extra }
    return axios.get("/api/marketplace-products-v2-variations", { params: query });
  },
  listOne(id) {
    return axios.get("/api/marketplace-products-v2-variations/" + id);
  },
  update(id, payload) {
    return axios.put(`/api/marketplace-products-v2-variations/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/marketplace-products-v2-variations", payload);
  },
  delete(id) {
    return axios.delete(`/api/marketplace-products-v2-variations/${id}`);
  },
};
