<template>
  <v-container class="pa-5">
    <v-row>
      <v-col cols="3">
        <v-select
          :items="attributesOptions"
          v-model="selectedAttribute"
          hide-details
          return-object
          item-text="name"
          outlined
          dense
          placeholder="Selecciona el atributo"
        />
      </v-col>
      <v-col cols="1">
        <v-btn @click="handleAddAttribute">Añadir</v-btn>
      </v-col>
    </v-row>

    <v-divider class="my-5" />

    <template v-for="attribute of attributes">
      <v-row :key="attribute._id">
        <v-col cols="4">
          <div class="body-1 font-weight-bold">{{attribute.name}}</div>
          <v-select 
            :items="attribute.terms"
            item-text="name"
            return-object
            v-model="attribute.options"
            hide-details=""
            outlined
            dense
            chips
            multiple
            clearable
          />
          <div class="mt-2">
            <v-btn @click="attribute.options = [...attribute.terms]">Seleccionar Todos</v-btn>
          </div>
          <div>
            <v-checkbox
              label="Visible en la pagina de productos"
              v-model="attribute.visible"
              hide-details
            />
          </div>
          <div>
            <v-checkbox
              label="Utilizado para variaciones"
              v-model="attribute.variation"
              hide-details
            />
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-5" :key="'d-'+attribute._id" />
    </template>

    <v-card-actions rd-actions>
      <div class=""></div>
      <v-btn color="success">
        Guardar
      </v-btn>
    </v-card-actions>
  </v-container>
</template>

<script>
import marketplaceAttributesApi from '@/services/api/marketplaceAttributes'

export default {
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      attributes: [],
      attributesOptions: [],
      selectedAttribute: null,
    }
  },
  created() {
    marketplaceAttributesApi.list().then(res => {
      this.attributesOptions = res.data.payload;
    })
  },
  methods: {
    handleAddAttribute() {
      const alreadyAdded = this.attributes.find(attr => attr._id === this.selectedAttribute._id)
      if(!alreadyAdded) {
        this.attributes.push({ ...this.selectedAttribute, options: [], variation: false, visible: true })
      }
      this.selectedAttribute = null;
    }
  }
}
</script>

<style>

</style>