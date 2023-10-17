import axios from "axios";

export default {
  findByTarget(target) {
    return axios.get(`/api/stock-boundary/target/${target}`);
  },
  update(data) {
    return axios.put(`/api/stock-boundary`, data);
  },
};