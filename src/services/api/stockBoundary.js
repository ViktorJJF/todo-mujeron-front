import axios from "axios";

export default {
  findByTarget(query) {
    return axios.get(`/api/stock-boundary`, { params: query });
  },
  update(data) {
    return axios.put(`/api/stock-boundary`, data);
  },
};