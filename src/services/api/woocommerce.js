import axios from "axios";
export default {
  categoryById(woocommerceId,categoryId) {
    return axios.get(`/api/woocommerce/category_by_id/${woocommerceId}/${categoryId}`);
  },
  productById(woocommerceId,productId) {
    return axios.get(`/api/woocommerce/product_by_id/${woocommerceId}/${productId}`);
  }
};
