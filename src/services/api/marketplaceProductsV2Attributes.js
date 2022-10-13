import axios from "axios";
export default {
  list(query = { sort: "createdAt", order: "1" }) {
    return axios.get("/api/marketplace-products-v2-attributes", { params: query });
  },
  listByProduct(productId, extra) {
    const query = { sort: 'createdAt', order: "1", product: productId, ...extra }
    return axios.get("/api/marketplace-products-v2-attributes", { params: query });
  },
  listOne(id) {
    return axios.get("/api/marketplace-products-v2-attributes/" + id);
  },
  update(id, payload) {
    return axios.put(`/api/marketplace-products-v2-attributes/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/marketplace-products-v2-attributes", payload);
  },
  delete(id) {
    return axios.delete(`/api/marketplace-products-v2-attributes/${id}`);
  },
};
