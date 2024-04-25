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
        <v-container>
          <v-row>
            <v-col>
              <v-form class="form" @submit.prevent="handleBulkUpdate">
                <h2>Modificar productos</h2>
                <v-textarea
                  outlined
                  v-model="rawItems"
                  hide-details
                  :placeholder="'SKU \t Stock\nSKU \t Stock'"
                  @input="handleRawItemsChange"
                />
                <v-btn
                  type="submit"
                  color="primary"
                  :loading="loading"
                  :disabled="!canSubmitProducts"
                >
                  Enviar
                </v-btn>
              </v-form>
            </v-col>

            <v-col>
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Cantidad</th>
                      <th>Marketplaces</th>
                      <th>Woocommerce</th>
                      <th>Shopify</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item of items" :key="item.sku">
                      <td>{{ item.sku }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>
                        <div v-if="!item.response"></div>
                        <div
                          v-else-if="item.response.marketplace.success === true"
                        >
                          <v-icon color="green">mdi-check</v-icon>
                        </div>
                        <v-tooltip v-else bottom color="error">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn icon color="error" v-bind="attrs" v-on="on">
                              <v-icon>mdi-alert-circle-outline</v-icon>
                            </v-btn>
                          </template>
                          <span>{{ item.response.marketplace.message }}</span>
                        </v-tooltip>
                      </td>
                      <td>
                        <div v-if="!item.response"></div>
                        <div
                          v-else-if="item.response.woocommerce.success === true"
                        >
                          <v-icon color="green">mdi-check</v-icon>
                        </div>
                        <v-tooltip v-else bottom color="error">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn icon color="error" v-bind="attrs" v-on="on">
                              <v-icon>mdi-alert-circle-outline</v-icon>
                            </v-btn>
                          </template>
                          <span>{{ item.response.woocommerce.message }}</span>
                        </v-tooltip>
                      </td>
                      <td>
                        <div v-if="!item.response"></div>
                        <div v-else-if="item.response.shopify.success === true">
                          <v-icon color="green">mdi-check</v-icon>
                        </div>
                        <v-tooltip v-else bottom color="error">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn icon color="error" v-bind="attrs" v-on="on">
                              <v-icon>mdi-alert-circle-outline</v-icon>
                            </v-btn>
                          </template>
                          <span>{{ item.response.shopify.message }}</span>
                        </v-tooltip>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>
        </v-container>
      </material-card>
    </v-row>
  </v-container>
</template>

<script>
import MaterialCard from "@/components/material/Card";
import stockService from "@/services/api/stock";

export default {
  components: { MaterialCard },
  data() {
    return {
      items: [],
      rawItems: "",
      loading: false,
    };
  },
  computed: {
    canSubmitProducts() {
      return this.rawItems.length;
    },
  },
  methods: {
    handleRawItemsChange() {
      const items = [];
      const match = this.rawItems.matchAll(/^(\S+)\s+(\d+)$/gm); //sku  quantity
      for (const row of match) {
        const [, sku, quantity] = row;
        items.push({ sku, quantity });
      }
      this.items = items;
    },
    async handleBulkUpdate() {
      if (this.loading) return;

      this.loading = true;

      const data = {
        products: this.items,
        company: this.$store.getters["authModule/getCurrentCompany"].company._id,
      };

      try {
        const res = await stockService.bulkUpdate(data);
        if (res.data && Array.isArray(res.data.payload)) {
          this.items = this.items.map((item) => {
            item.response = res.data.payload.find(
              (itemRes) => itemRes.sku === item.sku
            );
            return item;
          });
        }
      } catch (error) {
        console.error(error);
        const errorMessage =
          "Ocurrió un error al intentar modificar los productos";
        this.$store.commit("errorModule/error", errorMessage, { root: true });
        this.$store.commit("errorModule/showError", true, { root: true });
      }
      this.loading = false;
    },
  },
};
</script>

<style scoped>
.wrapper {
  padding: 20px;
  display: flex;
  gap: 20px;
  justify-content: center;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

.theme--light.v-btn.v-btn--disabled {
  background-color: #ccc !important;
}
</style>
