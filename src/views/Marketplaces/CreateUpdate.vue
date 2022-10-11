<template>
  <v-card>
    <v-card-title>
      <v-icon color="primary" class="mr-1">mdi-update</v-icon>
      <span class="headline">{{ formTitle }}</span>
    </v-card-title>
    <v-divider></v-divider>
    <ValidationObserver ref="obs" v-slot="{ passes }">
      <v-container class="pa-5">
        <v-row dense class="mb-2">
          <v-col cols="12" sm="12" md="12">
            <h3 class="mt-1">Datos generales</h3>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <div class="body-1 font-weight-bold">Tipo</div>
            <v-select
              :items="typeOptions"
              v-model="editedItem.type"
              hide-details
              outlined
              dense
              placeholder="Seleccionar Tipo"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="12" md="12">
            <div class="body-1 font-weight-bold">Nombre</div>
            <VTextFieldWithValidation
              rules="required"
              v-model="editedItem.name"
              label="Ingresa el nombre"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="12" md="12">
            <div class="body-1 font-weight-bold">Dominio</div>
            <VTextFieldWithValidation
              rules="required"
              v-model="editedItem.domain"
              label="Ingresa el domínio"
            />
          </v-col>
        </v-row>
        <v-row>
            <v-col colas="6">
              <div class="body-1 font-weight-bold">Pais</div>
              <countrySelect :model="editedItem.country" />
            </v-col>
          </v-row>

        <v-row dense class="my-3">
          <v-col cols="12" sm="12" md="12">
            <h3 class="mt-1">Datos de Marketplace</h3>
          </v-col>
        </v-row>
        <template v-if="editedItem.type === 'woocommerce'">
          <v-row>
            <v-col>
              <div class="body-1 font-weight-bold">Consumer Key</div>
              <VTextFieldWithValidation
                rules="required"
                v-model="editedItem.woocommerce.consumerKey"
                label="Ingresa código"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="body-1 font-weight-bold">Consumer Secret</div>
              <VTextFieldWithValidation
                rules="required"
                v-model="editedItem.woocommerce.consumerSecret"
                label="Ingresa código"
              />
            </v-col>
          </v-row>
        </template>

        <template v-if="editedItem.type === 'mercadolibre'">
          <v-row>
            <v-col>
              <div class="body-1 font-weight-bold">App ID</div>
              <VTextFieldWithValidation
                rules="required"
                v-model="editedItem.mercadolibreApp.appId"
                label="Ingresa código"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="body-1 font-weight-bold">Client Secret</div>
              <VTextFieldWithValidation
                rules="required"
                v-model="editedItem.mercadolibreApp.clientSecret"
                label="Ingresa código"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="body-1 font-weight-bold">Redirect Uri</div>
              <VTextFieldWithValidation
                rules="required"
                v-model="editedItem.mercadolibreApp.redirectUri"
                label="Ingresa código"
              />
            </v-col>
          </v-row>
        </template>

        <template v-if="editedItem.type === 'sellercenter'">
          <v-row>
            <v-col>
              <div class="body-1 font-weight-bold">API Key</div>
              <VTextFieldWithValidation
                rules="required"
                v-model="editedItem.sellercenterApp.apiKey"
                label="Ingresa código"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="body-1 font-weight-bold">User ID</div>
              <VTextFieldWithValidation
                rules="required"
                v-model="editedItem.sellercenterApp.userID"
                label="Ingresa código"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="body-1 font-weight-bold">API Url</div>
              <VTextFieldWithValidation
                rules="required"
                v-model="editedItem.sellercenterApp.url"
                label="Ingresa url"
              />
            </v-col>
          </v-row>
        </template>
      </v-container>
      <v-card-actions rd-actions>
        <div class="flex-grow-1"></div>
        <v-btn :loading="loadingButton" color="success" @click="passes(save)"
          >Guardar</v-btn
        >
      </v-card-actions>
    </ValidationObserver>
  </v-card>
</template>

<script>
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import CountrySelect from "@/components/CountrySelect.vue";

export default {
  components: { VTextFieldWithValidation, CountrySelect },
  props: {
    marketplace: {
      type: Object,
    },
  },
  data() {
    return {
      loadingButton: false,
      editedItem: null,
      typeOptions: [
        { text: "Woocommerce", value: "woocommerce" },
        { text: "Mercadolibre", value: "mercadolibre" },
        { text: "SellerCenter", value: "sellercenter" },
      ],
    };
  },
  computed: {
    formTitle() {
      return "Agregar Marketplace";
    },
  },
  methods: {
    getMarketplaceDefaults() {
      return {
        type: "",
        name: "",
        domain: "",
        woocommerce: {
          consumerKey: "",
          consumerSecret: "",
        },
        mercadolibreApp: {
          appId: "",
          clientSecret: "",
          code: "",
          redirectUri: "",
        },
        sellercenterApp: {
          apiKey: "",
          userID: "",
          url: "",
        },
      };
    },
    async save() {
      this.loadingButton = true;

      const { woocommerce, mercadolibreApp, sellercenterApp, ...data } = this.editedItem;
      if (data.type === "woocommerce") {
        Object.assign(data, { woocommerce });
      }
      if (data.type === "mercadolibre") {
        mercadolibreApp;
        // Object.assign(data, { mercadolibreApp });
      }
      if (data.type === "sellercenter") {
        sellercenterApp;
        // Object.assign(data, { sellercenterApp });
      }

      if (this.editedItem._id) {
        await this.$store.dispatch("marketplacesModule/update", {
          id: this.marketplace._id,
          data,
        });
        this.$emit("save", { updated: true, item: this.editedItem });
      } else {
        let newItem = await this.$store.dispatch(
          "marketplacesModule/create",
          data
        );
        this.$emit("save", { updated: false, item: newItem });
      }

      this.loadingButton = false;
    },
  },
  watch: {
    marketplace: {
      immediate: true,
      handler: function (val) {
        this.editedItem = val ? { ...val } : this.getMarketplaceDefaults();
      },
    },
  },
};
</script>

<style>
</style>