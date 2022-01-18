import axios from "axios";
export default {
  list(query = { sort: "name", order: "1" }) {
    return axios.get("/api/groups", { params: query });
  },
  listOne(id){
    return axios.get(`/api/groups/${id}`)
  },
  update(id, payload) {
    return axios.put(`/api/groups/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/groups", payload);
  },
  delete(id) {
    return axios.delete(`/api/groups/${id}`);
  },
  listGroupUsers(id) {
    return axios.get(`/api/groups/${id}/users`);
  },
  editGroupUsers(id, payload){
    return axios.put(`/api/groups/${id}/users/`, payload);
  },


};