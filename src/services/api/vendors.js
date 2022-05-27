import axios from "axios";

export default {
  list(query = { sort: "name", order: "1" }) {
    return axios.get("/api/vendors", { params: query });
  }
};