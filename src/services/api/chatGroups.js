import api from "@/plugins/axios";

const list = (params) => {
  return api.get("/api/users/chat_groups", { params });
};

const create = (data) => {
  return api.post("/api/users/chat_groups", data);
};

const update = (id, data) => {
  return api.put(`/api/users/chat_groups/${id}`, data);
};

const remove = (id) => {
  return api.delete(`/api/users/chat_groups/${id}`);
};

export default {
  list,
  create,
  update,
  remove,
};
