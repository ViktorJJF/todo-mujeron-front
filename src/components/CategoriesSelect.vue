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
        <v-card-title>Seleccionar Categorias</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="" style="height: 300px;">
          <v-treeview
            :items="categoriesTree"
            item-key="_id"
            selectable
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
      categories: [],
      categoriesTree: [],
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
          placeholder: "Seleccionar Categorias",
        },
        // We add all attrs from the parent and override defaults
        this.$attrs
      );
    },
  },
  methods: {
    async fetchCategories() {
      const res = await marketplaceCategoriesApi.list()
      const categories = res.data.payload;
      this.categories = categories
      // pass array by value to avoid mutation
      this.categoriesTree = this.buildTreeItems(categories.slice());
    },
    handleSave() {
      const value = []

      for(const category of this.selected) {
        value.push(category)
        let parentId = category.parent
        while(parentId) {
          const item = this.categories.find(c => c._id === parentId)
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
        const category = typeof item === 'string'
          ? this.categories.find(cat => cat._id === item)
          : item

        if(category) {
          parseValue.push(category)
        }
      }

      return parseValue;
    },
    buildTreeItems(categories) {
      const items = [];
      // find roots categories and remove them from base array
      for (const [index, category] of categories.entries()) {
        if (category.parent === null) {
          categories.splice(index, 1);
          // mutating the object to avoid creating new space in memory
          Object.assign(category, { children: this.getChildren(category, categories)})
          items.push(category);
        }
      }

      return items;
    },
    getChildren(category, list) {
      const childrens = [];
      for (const [index, item] of list.entries()) {
        if (category._id === item.parent) {
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
