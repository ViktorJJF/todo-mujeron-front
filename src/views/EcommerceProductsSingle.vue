<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="98%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Producto"
        text="Detalles del producto"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          hide-default-footer
          :headers="headers"
          :items="items"
        >
          <template v-slot:item.switch="{ index, item }">
            <span class="format-breaklines">
              <v-switch
                :input-value="item.stock_status === 'instock'"
                :loading="switchLoading.includes(item.id || item.idEcommerce)"
                @change="(val) => changeItemStatus(val, item)"
              />
            </span>
          </template>
          <template v-slot:item.id="{ index, item }">
            <span class="format-breaklines">
              {{ index===0 ? item.idEcommerce : item.id }}
            </span>
          </template>
          <template v-slot:item.title="{ index, item }">
            <span class="format-breaklines" v-if="index===0">
              {{ item.name }}
            </span>
          </template>
          <template v-slot:item.talla="{ index, item }">
            <span class="format-breaklines" v-if="index===0">
              {{ item.attributes.talla.options.join(', ') }}
            </span>
            <span class="format-breaklines" v-else>
              {{ item.attributes.talla.option }}
            </span>
          </template>
          <template v-slot:item.color="{ index, item }">
            <span class="format-breaklines" v-if="index!==0">
              {{ item.attributes.color ? item.attributes.color.option : '' }}
            </span>
          </template>
        </v-data-table>
      </material-card>
    </v-row>
  </v-container>
</template>

<script>
import MaterialCard from "@/components/material/Card";
import EcommercesApi from '@/services/api/ecommerces'
import _ from 'lodash'
import ecommerces from '@/services/api/ecommerces';

export default {
  components: { MaterialCard },
  data() {
    return {
      product: null,
      variations: [],
      switchLoading: [],
      headers: [
        {
          text: "",
          align: "left",
          sortable: false,
          value: "switch",
        },
        {
          text: "ID",
          align: "left",
          sortable: false,
          value: "id",
        },
        {
          text: "Título",
          align: "left",
          sortable: false,
          value: "title",
        },
        {
          text: "SKU",
          align: "left",
          sortable: false,
          value: "sku",
        },
        {
          text: "Stock ",
          align: "left",
          sortable: false,
          value: "stock_quantity",
        },
        {
          text: "Talla",
          align: "left",
          sortable: false,
          value: "talla",
        },
        {
          text: "Color",
          align: "left",
          sortable: false,
          value: "color",
        },
        {
          text: "Stock",
          align: "left",
          sortable: false,
          value: "",
        },
        {
          text: "Stock Estado",
          align: "left",
          sortable: false,
          value: "stock_status",
        },
        {
          text: "Estado",
          align: "left",
          sortable: false,
          value: "status",
        },
        {
          text: "Visibilidad",
          align: "left",
          sortable: false,
          value: "catalog_visibility",
        },
      ]
    }
  },
  created() {
    const productId = this.$route.params.id
    EcommercesApi.listOne(productId, { sync: true })
    .then(res => {
      const product = this.formatAttributes(res.data.payload);

      const variations = product.variations.map(this.formatAttributes)

      Object.assign(this, { product, variations })
    })
  },
  computed: {
    items() {
      if(this.product) {
        return [this.product, ...this.variations]
      }
      
      return []
    },
  },
  methods: {
    formatAttributes(item) {
      return {
        ...item,
        attributes: _.keyBy(item.attributes, 'name')
      }
    },
    async changeItemStatus(active, item) {
      const id = item.id || item.idEcommerce
      if(this.switchLoading.indexOf(id) !== -1) {
        return;
      }

      this.switchLoading.push(id)

      const stock_status = active === true ? 'instock' : 'outofstock'

      let changes = { stock_status }

      const isProduct = 'idEcommerce' in item
      if(isProduct) {
        Object.assign(changes, {
          status: active === true ? 'publish' : 'draft',
          catalog_visibility: active === true ? 'visible' : 'hidden'
        })
        
        await ecommerces.update(item._id, changes)

        Object.assign(item, changes)
        
        this.switchLoading = this.switchLoading.filter(v => v !== id)

        if(active === false) {
          this.switchLoading = this.variations.map(variation => variation.id)

          // disable variations when product is being disabled
          let payload = this.variations.map(variation => ({
            id: variation.id,
            stock_status
          }))

          await ecommerces.updateVariationBatch(this.product._id, payload)

          this.switchLoading = []

          for(let variant of this.variations) {
            Object.assign(variant, { stock_status })
          }
        }

        return;
      }

      // is a variation
      await ecommerces.updateVariation(this.product._id, item.id, changes)

      this.switchLoading = this.switchLoading.filter(v => v !== id)

      Object.assign(item, changes)

      if(active === true) {
        if(this.product.stock_status === 'outofstock') {
          // enable product when variations are being enable
          this.changeItemStatus(true, this.product)
        }
        return;
      }

      const hasStock = !!this.variations.find(variation => variation.stock_status === 'instock')
      if(!hasStock) {
        this.changeItemStatus(false, this.product)
      }

    }
  }
}
</script>

<style>

</style>