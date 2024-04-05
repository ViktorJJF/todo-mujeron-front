import axios from 'axios'

export default {
  listAll() {
    return axios.get(`/api/marketplace-products`)
  },

  listVariations(query) {
    if (query && !query.sort && !query.order) {
      query.sort = 'createdAt'
      query.order = 'desc'
    }
    return axios.get(`/api/marketplace-products/variations`, { params: query })
  },

  listProductVariations(productId) {
    return axios.get(`/api/marketplace-products/${productId}/variations`)
  },

  updateVariation(variationId, data) {
    return axios.patch(
      `/api/marketplace-products/variations/${variationId}`,
      data
    )
  },

  getProductsCrossover(country) {
    return axios.get(`/api/marketplace-products/crossover/country/${country}`)
  },

  syncVariation(variationId) {
    return axios.post(
      `/api/marketplace-products/variations/${variationId}/sync`
    )
  },
}
