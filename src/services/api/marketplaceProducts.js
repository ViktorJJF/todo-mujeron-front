import axios from "axios";

export default {

  listAll() {
    return axios.get(`/api/marketplace-products`)
  },

  listProductVariations(productId) {
    return axios.get(`/api/marketplace-products/${productId}/variations`)
  },

  updateVariation(variationId, data) {
    return axios.patch(`/api/marketplace-products/variations/${variationId}`, data)
  }
};
