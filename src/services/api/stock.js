import axios from 'axios'

export default {
  bulkUpdate(data) {
    return axios.post('/api/stock/bulk', data, { timeout: 0 })
  },
}
