import axios from "axios";

export default {

  listAll() {
    return axios.get(`/api/marketplace-products`)
  },

  listVariations() {
    return axios.get(`/api/marketplace-products/variations`)
  },

  listProductVariations(productId) {
    return axios.get(`/api/marketplace-products/${productId}/variations`)
  },

  updateVariation(variationId, data) {
    return axios.patch(`/api/marketplace-products/variations/${variationId}`, data)
  }
};
