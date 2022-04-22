import axios from "axios";

export default {

  listAll() {
    return axios.get(`/api/sc-orders`)
  },
  
  listItems(id) {
    return axios.get(`/api/sc-orders/${id}/items`)
  }

};
