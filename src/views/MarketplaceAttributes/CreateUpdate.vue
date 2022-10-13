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
            <div class="body-1 font-weight-bold">Nombre atributo</div>
            <VTextFieldWithValidation
              rules="required"
              v-model="editedItem.name"
              placeholder="Ingresa el nombre"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <div class="body-1 font-weight-bold">Tipo</div>
            <v-select
              :items="typeOptions"
              v-model="editedItem.type"
              :rules="[val => !!val || 'El campo es requerido']"
              dense
              outlined
              hide-details
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <div class="body-1 font-weight-bold">Términos</div>
            <v-btn color="primary" @click="handleAddTerm">
              Agregar
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="body-1 font-weight-bold">Nombre</div>
            <v-text-field
              v-model="term.name"
              placeholder="Ingresa el nombre"
              hide-details
              dense
              outlined
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="body-1 font-weight-bold">Descripción</div>
            <v-text-field
              v-model="term.description"
              placeholder="Ingresa el nombre"
              hide-details
              dense
              outlined
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-simple-table class="f">
              <template>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="term of editedItem.terms" :key="term.name">
                    <td>{{term.name}}</td>
                    <td>{{term.description}}</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
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
    attribute: {
      type: Object
    }
  },
  data() {
    return {
      loadingButton: false,
      editedItem: null,
      term: {
        name: '',
        description: ""
      },
      typeOptions: [
        { text: 'Select', value: 'select' },
        { text: 'Text', value: 'text' },
        { text: 'Color Picker', value: 'color' },
      ]
    }
  },
  computed: {
    formTitle() {
      return this.attribute ? 'Modificar Atributo' : 'Agregar Nuevo Atributo'
    }
  },
  methods: {
    handleAddTerm() {
      if(this.term.name.trim().length) {
        this.editedItem.terms.push(this.term)
        this.term = {
          name: '',
          description: ''
        }
      }
    },
    async save() {
      this.loadingButton = true;
      if(this.editedItem._id) {
        await this.$store.dispatch("marketplaceAttributesModule/update", {
          id: this.attribute._id,
          data: this.editedItem,
        });
        this.$emit('save', { updated: true, item: this.editedItem })
      } else {
        let newItem = await this.$store.dispatch(
          "marketplaceAttributesModule/create",
          this.editedItem
        );
        this.$emit('save', { updated: false, item: newItem })
      }
      
      this.loadingButton = false
    }
  },
  watch: {
    attribute: {
      immediate: true,
      handler: function(val) {
        this.editedItem = val ? { ...val } : {
          name: '',
          type: null,
          terms: []
        }
      }
    }
  }
}
</script>

<style>

</style>