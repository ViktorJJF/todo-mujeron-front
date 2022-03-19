import axios from "axios";
export default {
  createLabel(payload) {
    return axios.post("/api/graph-api/labels", payload);
  },
  getUserInformation(accessToken) {
    return axios.post("/api/graph-api/get-user-information", {
      access_token: accessToken,
    });
  },
  deleteLabel(id, fanpageId) {
    return axios.delete(`/api/graph-api/labels/${id}?fanpageId=${fanpageId}`);
  },
};
