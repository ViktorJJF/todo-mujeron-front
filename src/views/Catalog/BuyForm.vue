<template>
  <v-card>
    <v-card-title class="text-h5 grey lighten-2">
      Datos Generales
    </v-card-title>

    <ValidationObserver ref="obs" v-slot="{ passes }">
      <v-container class="pa-5">
        <v-row>
          <v-col>
            <v-row dense class="mb-3">
              <v-col>
                <v-img
                  src="/images/mercadopago1.png"
                  max-height="150"
                  contain
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="12" md="12">
            <div class="body-1 font-weight-bold">Nombre</div>
            <VTextFieldWithValidation
              rules="required"
              v-model="customer.name"
              label="Ingresa el nombre"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="12" md="12">
            <div class="body-1 font-weight-bold">Teléfono</div>
            <VTextFieldWithValidation
              rules="required"
              v-model="customer.phone"
              label="Ingresa el teléfono"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="12" md="12">
            <div class="body-1 font-weight-bold">Correo Electrónico</div>
            <VTextFieldWithValidation
              rules="required"
              v-model="customer.email"
              label="Ingrese el correo"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="12" md="12">
            <v-checkbox
              v-model="withShippment"
              :label="`Incluye envio?`"
            ></v-checkbox>
          </v-col>
        </v-row>
        <template v-if="withShippment">
          <v-row>
            <v-col cols="12" sm="12" md="12">
              <div class="body-1 font-weight-bold">Dirección</div>
              <VTextFieldWithValidation
                rules="required"
                v-model="shippment.address"
                label="Ingrese la dirección"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="12" md="12">
              <div class="body-1 font-weight-bold">Comuna</div>
              <VTextFieldWithValidation
                rules="required"
                v-model="shippment.comuna"
                label="Ingrese comuna"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="12" md="12">
              <div class="body-1 font-weight-bold">Ciudad</div>
              <VTextFieldWithValidation
                rules="required"
                v-model="shippment.city"
                label="Ingrese la ciudad"
              />
            </v-col>
          </v-row>
        </template>
      </v-container>
      <v-card-actions rd-actions>
        <div class="flex-grow-1"></div>
        <v-btn outlined color="error" text @click="buyModal = false">
          Cancelar
        </v-btn>
        <v-btn
          :loading="loading"
          color="success"
          @click="passes(handleBuy)">
            Guardar
          </v-btn>
      </v-card-actions>
    </ValidationObserver>
  </v-card>    
</template>

<script>
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import OrderApi from '@/services/api/orders'

export default {
  components: { VTextFieldWithValidation },
  props: {
    items: {
      type: Array
    },
    catalog: {
      type: Object
    }
  },
  data() {
    return {
      loading: false,
      customer: {
        name: '',
        phone: '',
        email: '',
      },
      withShippment: false,
      shippment: {
        address: '',
        comuna: '',
        city: '',
      }
    }
  },
  methods: {
    async handleBuy() {
      this.loading = true;

      let items = this.items.map(item => ({
        ...item,
        product: item.product.idEcommerce
      }))

      const form = {
        items,
        customer: this.customer,
        shippment: this.withShippment ? this.shippment : undefined
      }

      let res = await OrderApi.place(form, this.catalog._id)

      this.loading = false;

      window.open(res.data.sandbox_init_point, '_blank');
    },
  }
}
</script>

<style>

</style>