import axios from "axios";

export default {

  listAll() {
    return axios.get(`/api/marketplace-products`)
  },
};
