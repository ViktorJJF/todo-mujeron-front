<template>
  <div>
    <VTextFieldWithValidation
      readonly
      :value="textFieldValue"
      @click.stop="isOpen = true"
      v-bind="attrs"
    />
    <v-dialog v-model="isOpen" scrollable max-width="300px">
      <v-card>
        <v-card-title>Seleccionar Categorias</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="" style="height: 300px;">
          <v-treeview
            :items="categoriesTree"
            v-model="selected"
            item-key="_id"
            selectable
          />
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="dialog = false">
            Cancelar
          </v-btn>
          <v-btn color="blue darken-1" text @click="dialog = false">
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
  data() {
    return {
      categoriesTree: [],
      isOpen: false,
      textFieldValue: "",
      selected: []
    };
  },
  created() {
    marketplaceCategoriesApi.list().then((res) => {
      const tree = this.buildTreeItems(res.data.payload);
      for(let i=0 ; i< 20 ; i++) {
        this.categoriesTree.push(...tree)
      }
    });
  },
  computed: {
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
    handleSave() {
      this.$emit("input", []);
    },
    buildTreeItems(categories) {
      const items = [];
      // Find roots categories and remove them from base array
      for (const [index, category] of categories.entries()) {
        if (category.parent === null) {
          categories.splice(index, 1);
          items.push({
            ...category,
            children: this.getChildren(category, categories),
          });
        }
      }

      return items;
    },
    getChildren(category, list) {
      const childrens = [];
      for (const [index, item] of list.entries()) {
        if (category._id === item.parent) {
          list.splice(index, 1);
          childrens.push({ ...item, children: this.getChildren(item, list) });
        }
      }

      return childrens;
    },
  },
  watch: {
    selected: function(val) {
      console.log(val)
    }
  }
};
</script>

<style></style>
