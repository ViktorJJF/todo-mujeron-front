import axios from "axios";
export default {
  async listCategories() {
    const res = await axios.get("/api/multimedia/categories");
    return res.data.payload
  },
};
