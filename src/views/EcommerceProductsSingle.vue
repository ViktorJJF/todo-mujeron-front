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
          items-per-page="50"
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
              {{ item.attributesFormatted.talla ? item.attributesFormatted.talla.options.join(', ') : '' }}
            </span>
            <span class="format-breaklines" v-else>
              {{ item.attributesFormatted.talla ? item.attributesFormatted.talla.option : '' }}
            </span>
          </template>
          <template v-slot:item.color="{ index, item }">
            <span class="format-breaklines" v-if="index!==0">
              {{ item.attributesFormatted.color ? item.attributesFormatted.color.option : '' }}
            </span>
          </template>
          <template v-slot:item.stock_quantity="{ item }">
            <v-edit-dialog v-if="item.id"
              large
              persistent
              @save="handleStockSave(item)"
              @open="currentStock = item.stock_quantity"
            >
              <div>{{ item.stock_quantity }}</div>
              <template v-slot:input>
                <div class="mt-4 text-h6">
                  Modificar Stock
                </div>
                <v-text-field
                  ref="stockTextEdit"
                  v-model="currentStock"
                  label="Edit"
                  type="number"
                  min="0"
                  :rules="stockRules" 
                  single-line
                  autofocus
                ></v-text-field>
              </template>
            </v-edit-dialog>
          </template>
        </v-data-table>
      </material-card>
    </v-row>
  </v-container>
</template>

<script>
import MaterialCard from "@/components/material/Card";
import EcommercesApi from '@/services/api/ecommerces'
import ecommerces from '@/services/api/ecommerces';

export default {
  components: { MaterialCard },
  data() {
    return {
      product: null,
      variations: [],
      switchLoading: [],
      currentStock: 0,
      stockRules: [
        val => /^[0-9]*$/.test(val) || "Debe ser un número",
        val => val >=0 || "No puede ser negativo",
        val => !!val || "El campo es requerido"
      ],
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
      let product = res.data.payload

      Object.assign(product, {
        attributesFormatted: this.getFormatAttributes(product.attributes)
      })

      const variations = product.variations.map(variation => ({
        ...variation,
        attributesFormatted: this.getFormatAttributes(variation.attributes)
      }))

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
    getFormatAttributes(attributes) {
      return attributes.reduce((attributes, current) => ({
        ...attributes,
        [current.name.toLowerCase()]: current
      }), {})
    },
    async changeItemStatus(active, item) {
      const id = item.id || item.idEcommerce
      if(this.switchLoading.indexOf(id) !== -1) {
        return;
      }

      this.switchLoading.push(id)

      const stock_status = active === true ? 'instock' : 'outofstock'
      const stock_quantity = active === true ? 1 : 0
      let changes = { stock_status, stock_quantity, status: active === true ? 'publish' : 'draft', }

      const isProduct = 'idEcommerce' in item
      if(isProduct) {
        let productChanges = {
          ...changes,
          catalog_visibility: active === true ? 'visible' : 'hidden',
        }

        await ecommerces.update(item._id, productChanges)

        Object.assign(item, {
          ...productChanges,
          stock_quantity: null,
        })
        
        this.switchLoading = this.switchLoading.filter(v => v !== id)

        if(active === false) {
          this.switchLoading = this.variations.map(variation => variation.id)

          // disable variations when product is being disabled
          let payload = this.variations.map(variation => ({
            id: variation.id,
            ...changes
          }))

          await ecommerces.updateVariationBatch(this.product._id, payload)

          this.switchLoading = []

          this.variations = this.variations.map(variation => ({ ...variation, ...changes }))
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
    },
    getAttributes(active) {
      let attributes = [...this.product.attributes]

      const index = attributes.findIndex(attr => attr.name.toLowerCase() === 'talla')
      const talla = attributes[index]

      let options = []
      
      if(active) {
        for(const variation of this.variations) {
          if(variation.stock_status === 'instock') {
            options.push(variation.attributesFormatted.talla.option)
          }
        }
      }

      attributes[index] = { ...talla, options }

      return attributes;
    },
    async handleStockSave(item) {
      if(this.$refs.stockTextEdit.valid) {
        this.switchLoading.push(item.id)
        const changes = {
          stock_quantity: this.currentStock,
          stock_status: this.currentStock > 0 ? 'instock' : 'outofstock',
          status: this.currentStock > 0 ? 'publish' : 'draft'
        }
        Object.assign(item, changes)
        await ecommerces.updateVariation(this.product._id, item.id, changes)
        this.switchLoading = this.switchLoading.filter(v => v !== item.id)
      }
    }
  },
}
</script>

<style>

</style>