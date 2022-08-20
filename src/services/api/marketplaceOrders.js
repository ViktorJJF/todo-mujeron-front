import axios from "axios";

export default {

  listAll() {
    return axios.get(`/api/marketplace-orders`)
  },
  
  listItems(id) {
    return axios.get(`/api/marketplace-orders/${id}/items`)
  },

  listDocument(id, DocumentType) {
    return axios.get(`/api/marketplace-orders/${id}/documents`, { params: { DocumentType } })
  },

  genialRetry(id) {
    return axios.post(`/api/marketplace-orders/${id}/genial-retry`)
  }
};
