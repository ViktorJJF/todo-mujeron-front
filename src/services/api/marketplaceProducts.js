import axios from "axios";

export default {

  listAll() {
    return axios.get(`/api/marketplace-products`)
  },

  updateVariation(productId, variationId, data) {
    return axios.patch(`/api/marketplace-products/${productId}/variations/${variationId}`, data)
  }
};
