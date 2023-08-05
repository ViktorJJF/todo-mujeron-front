import axios from "axios";

export default {
  list(query = { sort: "createdAt", order: "0" }) {
    return axios.get(`/api/marketplace-orders`, { params: query });
  },

  listItems(id) {
    return axios.get(`/api/marketplace-orders/${id}/items`);
  },

  listDocument(id, DocumentType) {
    return axios.get(`/api/marketplace-orders/${id}/documents`, {
      params: { DocumentType },
    });
  },

  async genialRetry(id) {
    const res =  await axios.post(`/api/marketplace-orders/${id}/genial-retry`);
    return res.data
  },
};
