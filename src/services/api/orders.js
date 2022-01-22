import axios from "axios";

export default {
  place({ items, customer, shippment }, catalog) {
    return axios.post("/api/orders/place", { items, customer, shippment, catalog });
  },

  list(catalog) {
    return axios.get(`/api/orders/catalog/${catalog}`);
  },

  listAll() {
    return axios.get(`/api/orders`)
  }
};
