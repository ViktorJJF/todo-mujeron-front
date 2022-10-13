import axios from "axios";

export default {

  listAll() {
    return axios.get(`/api/marketplace-products-v2`)
  },

  listOne(id) {
    return axios.get(`/api/marketplace-products-v2/${id}`)
  },

  create(product) {
    return axios.post(`/api/marketplace-products-v2`, product)
  },

  update(id, payload) {
    return axios.put(`/api/marketplace-products-v2/${id}`, payload);
  },
};
