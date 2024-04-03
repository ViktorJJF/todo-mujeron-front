import axios from "axios";

export default {
  place({ items, customer, shippment }, catalog) {
    return axios.post("/api/orders/place", { items, customer, shippment, catalog });
  },

  /* list(catalog) {
    return axios.get(`/api/orders/catalog/${catalog}`);
  },*/

  list(query = { sort: "updatedAt", order: "-1" }) {
    return axios.get("/api/orders", { params: query });
  },

  listAll() {
    return axios.get(`/api/orders/all`)
  }
};
