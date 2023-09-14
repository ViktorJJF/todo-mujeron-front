import axios from "axios";

export default {
  getPartnerInfo(odoo_id) {
    return axios.post("/api/odoo/get_partner_info", { id_partner: odoo_id });
  },
};
