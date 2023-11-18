<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="90%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Marketplaces"
        text="Modificar por lote"
      >
        <div class="wrapper">
          <v-form class="form" @submit.prevent="handleBulkInsert">
            <v-select
              v-model="country"
              :items="countries"
              label="Paise"
              hide-details
              outlined
              dense
            />
            <v-textarea outlined v-model="rawItems" hide-details />
            <v-btn type="submit">Insertar</v-btn>
          </v-form>
        </div>
      </material-card>
    </v-row>
  </v-container>
</template>

<script>
import MaterialCard from '@/components/material/Card'
import stockService from '@/services/api/stock'

export default {
  components: { MaterialCard },
  data() {
    return {
      rawItems: '',
      country: null,
      countries: [
        { text: 'Chile', value: 1 },
        { text: 'Perú', value: 6 },
      ],
    }
  },
  methods: {
    async handleBulkInsert() {
      if (this.country === null) return

      const items = []
      const match = this.rawItems.matchAll(/^(\S+)\s+(\d+)$/gm) //sku  quantity
      for (const row of match) {
        const [, sku, quantity] = row
        items.push({ sku, quantity })
      }

      const data = {
        country: this.country,
        products: items,
      }

      const res = await stockService.bulkUpdate(data)
      const text = res.data.payload.reduce((text, product) => {
        return (
          text +
          `${product.sku}: \n\t Marketplace: ${JSON.stringify(
            product.marketplace
          )} \n\t Woocommerce: ${JSON.stringify(product.woocommerce)}\n`
        )
      }, '')
      alert(text)
    },
  },
}
</script>

<style scoped>
.wrapper {
  padding: 20px;
  display: flex;
  justify-content: center;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 450px;
}
</style>
