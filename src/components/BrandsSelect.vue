<template>
  <div>
    <VTextFieldWithValidation
      readonly
      :value="textFieldValue"
      @click.stop="isOpen = true"
      v-bind="attrs"
    />
    <v-dialog v-model="isOpen" scrollable max-width="300px" @input="handleDialogChange">
      <v-card>
        <v-card-title>Seleccionar Marcas</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="px-0" style="height: 300px;">
          <v-treeview
            :items="brandsTree"
            item-key="_id"
            selectable
            selection-type="independent"
            v-model="selected"
            return-object
          />
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="handleCancel">
            Cancelar
          </v-btn>
          <v-btn color="blue darken-1" text @click="handleSave">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import marketplaceCategoriesApi from "@/services/api/marketplaceCategories";

export default {
  components: { VTextFieldWithValidation },
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isOpen: false,
      brands: [],
      brandsTree: [],
      selected: [],
      localValue: []
    };
  },
  created() {
    this.fetchCategories().then(() => {
      this.localValue = this.parseValue(this.value)
    })
  },
  computed: {
    textFieldValue() {
      return this.localValue.map(cat => cat.name).join(', ')
    },
    attrs: function() {
      return Object.assign(
        {},
        //Default attributes
        {
          outlined: true,
          hideDetails: true,
          dense: true,
          placeholder: "Seleccionar Marcas",
        },
        // We add all attrs from the parent and override defaults
        this.$attrs
      );
    },
  },
  methods: {
    async fetchCategories() {
      const res = await marketplaceCategoriesApi.list()
      const brands = res.data.payload;
      this.brands = brands
      // pass array by value to avoid mutation
      this.brandsTree = this.buildTreeItems(brands.slice());
    },
    handleSave() {
      const value = []

      for(const brand of this.selected) {
        value.push(brand)
        let parentId = brand.parent
        while(parentId) {
          const item = this.brands.find(c => c._id === parentId)
          value.push(item)
          parentId = item.parent
        }
      }
      
      this.localValue = value;
      this.$emit("input", value);
      this.isOpen = false;
    },
    handleCancel() {
      this.isOpen = false;
    },
    handleDialogChange(value) {
      // clear unsaved changes
      if(value === false) {
        this.selected = this.localValue
      }
    },
    parseValue(value) {
      const parseValue = []
      for(const item of value) {
        const brand = typeof item === 'string'
          ? this.brands.find(el => el._id === item)
          : item

        if(brand) {
          parseValue.push(brand)
        }
      }

      return parseValue;
    },
    buildTreeItems(brands) {
      const items = [];
      // find roots brands and remove them from base array
      for (const [index, brand] of brands.entries()) {
        if (brand.parent === null) {
          brands.splice(index, 1);
          // mutating the object to avoid creating new space in memory
          Object.assign(brand, { children: this.getChildren(brand, brands)})
          items.push(brand);
        }
      }

      return items;
    },
    getChildren(brand, list) {
      const childrens = [];
      for (const [index, item] of list.entries()) {
        if (brand._id === item.parent) {
          list.splice(index, 1);
          // mutating the object to avoid creating new space in memory
          Object.assign(item, { children: this.getChildren(item, list) })
          childrens.push(item);
        }
      }

      return childrens;
    },
  },
  watch: {
    value: function(val) {
      this.localValue = this.parseValue(val)
    }
  }
};
</script>

<style></style>
