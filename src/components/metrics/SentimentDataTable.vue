<template>
  <material-card color="success" :title="title" icon="mdi-table-large">
    <v-data-table
      :headers="headers"
      :items="tableItems"
      :items-per-page="10"
      :footer-props="{
        'items-per-page-options': [5, 10, 15, -1],
        'items-per-page-text': 'Rows per page:',
      }"
      class="elevation-1"
      dense
    >
      <template v-slot:[`item.percentage`]="{ item }">
        {{ item.percentage }}%
      </template>

      <template v-slot:[`item.count`]="{ item }">
        <v-chip small :color="item.color" text-color="white" class="px-2">
          {{ item.count }}
        </v-chip>
      </template>
    </v-data-table>
  </material-card>
</template>

<script>
import MaterialCard from "@/components/material/Card";

export default {
  name: "SentimentDataTable",

  components: {
    MaterialCard,
  },

  props: {
    data: {
      type: Array,
      required: true,
      default: () => [],
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    title: {
      type: String,
      default: "Data Distribution",
    },
  },

  computed: {
    headers() {
      return [
        {
          text: "Value",
          align: "start",
          sortable: true,
          value: "value",
        },
        { text: "Count", value: "count", sortable: true },
        { text: "Percentage", value: "percentage", sortable: true },
      ];
    },

    tableItems() {
      return this.data.map((item) => {
        const percentage = this.total
          ? ((item.count / this.total) * 100).toFixed(1)
          : 0;

        return {
          ...item,
          percentage,
          color: this.getItemColor(item.value),
        };
      });
    },
  },

  methods: {
    getItemColor(value) {
      // Define color map for sentiment values
      const sentimentColors = {
        Satisfecho: "green",
        "Emoción/Entusiasmo": "light-green",
        Neutro: "grey",
        Insatisfecho: "red",
        Confusión: "orange",
        Fustracion: "pink",
        Tóxico: "purple",
        "Evasivo/Desconfiado": "blue-grey",
        // Dissatisfaction origins
        "Error de la compañía": "deep-orange",
        "Error que no controlamos": "amber",
        "Su error al seleccionar el producto comprado": "brown",
        "Sin insatisfacción": "teal",
      };

      return sentimentColors[value] || "grey";
    },
  },
};
</script>
