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
          <v-col cols="12" sm="12" md="12">
            <div class="body-1 font-weight-bold">Nombre</div>
            <VTextFieldWithValidation
              rules="required"
              v-model="editedItem.name"
              placeholder="Ingresa el nombre"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="body-1 font-weight-bold">Marca Padre</div>
            <v-select
              :items="brands"
              v-model="editedItem.parent"
              item-text="name"
              item-value="_id"
              outlined
              dense
              hide-details
              clearable
            />
          </v-col>
        </v-row>
      </v-container>
      <v-card-actions rd-actions>
        <div class="flex-grow-1"></div>
        <v-btn
          :loading="loadingButton"
          color="success"
          @click="passes(save)"
          >Guardar</v-btn
        >
      </v-card-actions>
    </ValidationObserver>
  </v-card>
</template>

<script>
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";

export default {
  components: { VTextFieldWithValidation },
  props: {
    brand: {
      type: Object
    },
    brands: {
      type: Array
    }
  },
  data() {
    return {
      loadingButton: false,
      editedItem: null
    }
  },
  computed: {
    formTitle() {
      const actionText = this.editedItem._id ? 'Modificar ' : 'Crear Nueva'
      return `${actionText} Marca / Linea`;
    }
  },
  methods: {
    async save() {
      this.loadingButton = true;
      if(this.editedItem._id) {
        await this.$store.dispatch("marketplaceBrandsModule/update", {
          id: this.brand._id,
          data: this.editedItem,
        });
        this.$emit('save', { updated: true, item: this.editedItem })
      } else {
        let newItem = await this.$store.dispatch(
          "marketplaceBrandsModule/create",
          this.editedItem
        );
        this.$emit('save', { updated: false, item: newItem })
      }
      
      this.loadingButton = false
    }
  },
  watch: {
    brand: {
      immediate: true,
      handler: function(val) {
        this.editedItem = val ? { ...val } : {
          name: '',
          parent: null
        }
      }
    }
  }
}
</script>

<style>

</style>