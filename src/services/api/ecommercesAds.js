import axios from "axios";

export default {
  updateResources(productId) {
    return axios.post(`/api/ecommerces-ads/product/${productId}/resources`);
  },
};
