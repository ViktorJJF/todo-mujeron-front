<template>
  <v-container>
    <v-row justify="center">
      <v-expansion-panels accordion>
        <v-expansion-panel
          v-for="marketplace in marketplaces"
          :key="marketplace.id"
        >
          <v-expansion-panel-header>{{marketplace.name}}</v-expansion-panel-header>
          <v-expansion-panel-content v-if="marketplace.type === 'woocommerce'">
            <v-row v-for="field in woocommerceFields" :key="field.name">
              <v-col :cols="field.cols || 12">
                <div class="body-1 font-weight-bold">{{ field.label }}</div>
                  <dynamic-input :field="field"/>
              </v-col>
            </v-row>
          </v-expansion-panel-content>

          <v-expansion-panel-content v-if="marketplace.type === 'mercadolibre'">
            <v-row v-for="field in mercadolibreFields" :key="field.name">
              <v-col :cols="field.cols || 12">
                <div class="body-1 font-weight-bold">{{ field.label }}</div>
                <dynamic-input :field="field"/>
              </v-col>
            </v-row>
          </v-expansion-panel-content>

          <v-expansion-panel-content v-if="marketplace.type === 'sellercenter'">
            <v-row v-for="field in sellercenterFields" :key="field.name">
              <v-col :cols="field.cols || 12">
                <div class="body-1 font-weight-bold">{{ field.label }}</div>
                <dynamic-input :field="field"/>
              </v-col>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-row>
  </v-container>
</template>


<script>
import marketplacesApi from "@/services/api/marketplaces";
import DynamicInput from '../DynamicInput.vue'

export default {
  components: { DynamicInput },
  data() {
    return {
      marketplaces: [],
      woocommerceFields: [
        {
          name: "status",
          type: "select",
          label: "Estado",
          cols: "3",
          options: [
            { text: 'Público', value: 'publish' },
            { text: 'Borrador', value: 'draft' },
            { text: 'Pendiente', value: 'pending' },
            { text: 'Privado', value: 'private' },
          ],
        },
        { name: "name", type: "text", label: "Nombre" },
        { name: "description", type: "textarea", label: "Descripción" },
        { name: "shortDescription", type: "text", label: "Descripción Corta" },
        { name: "price", type: "number", label: "Precio", cols: "2" },
        { name: "whight", type: "number", label: "Peso", cols: "2" },
      ],
      mercadolibreFields: [
        {
          name: "status",
          type: "select",
          label: "Estado",
          cols: "3",
          options: [
            { text: 'Activo', vale: 'active' },
            { text: 'Inactivo', vale: 'inactive' },
          ],
        },
        { name: "title", type: "text", label: "Título" },
        { name: "subtitle", type: "text", label: "Subtítulo" },
        { name: "price", type: "number", label: "Precio", cols: "2" },
        { name: "currency_id", type: "text", label: "Moneda" },
        {
          name: "condition",
          label: "Condición",
          type: "select",
          options: [
            { text: "Nuevo", value: "new" },
            { text: "Usado", value: "used" },
          ],
        },
        {
          name: "buying_mode",
          label: "Modo de compra",
          type: "select",
          options: [{ text: "buy_it_now", value: "buy_it_now" }],
        },
      ],
      sellercenterFields: [
        {
          name: "status",
          type: "select",
          label: "Estado",
          cols: "3",
          options: [
            { text: 'Activo', vale: 'active' },
            { text: 'Inactivo', vale: 'inactive' },
            { text: 'Eliminado', vale: 'deleted' },
          ],
        },
        { name: "Name", type: "text", label: "Nombre" },
        { name: "Descripcion", type: "text", label: "Descripción" },
        { name: "Brand", type: "text", label: "Marca", rules: "required", cols: "2" },
        { name: "Price", type: "number", label: "Precio", cols: "2" },
      ],
    };
  },
  created() {
    marketplacesApi.list().then((res) => {
      this.marketplaces = res.data.payload;
    });
  },
};
</script>

<style>
</style>