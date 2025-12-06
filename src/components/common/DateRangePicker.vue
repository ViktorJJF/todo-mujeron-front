<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    min-width="auto"
    :disabled="disabled"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="dateRangeText"
        :label="label"
        prepend-icon="mdi-calendar"
        readonly
        v-bind="attrs"
        v-on="on"
        :disabled="disabled"
        outlined
        dense
        hide-details
        clearable
        @click:clear="clearDates"
      ></v-text-field>
    </template>
    <v-date-picker
      v-model="dates"
      range
      no-title
      scrollable
      :max="maxDate"
      @input="onDateInput"
    >
      <v-spacer></v-spacer>
      <v-btn text color="primary" @click="menu = false">Cancelar</v-btn>
      <v-btn text color="primary" @click="saveDates">OK</v-btn>
    </v-date-picker>
  </v-menu>
</template>

<script>
export default {
  name: "DateRangePicker",
  props: {
    label: {
      type: String,
      default: "Rango de fechas",
    },
    value: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    maxDate: {
      type: String,
      default: new Date().toISOString().substr(0, 10),
    },
  },
  data() {
    return {
      menu: false,
      dates: [],
    };
  },
  computed: {
    dateRangeText() {
      return this.dates.join(" ~ ");
    },
  },
  watch: {
    value: {
      handler(newVal) {
        if (Array.isArray(newVal) && newVal.length > 0) {
          // Expecting UTC strings from parent, converting to local YYYY-MM-DD for display/picker
          // But usually picker just needs YYYY-MM-DD string.
          // If parent passes simplified dates, just use them.
          // If parent passes full ISO strings, we might need to extract YYYY-MM-DD
          this.dates = newVal.map((d) => d.substring(0, 10));
        } else {
          this.dates = [];
        }
      },
      immediate: true,
    },
  },
  methods: {
    onDateInput() {
      // Wait for user to select range or just keep menu open?
      // Vuetify range picker keeps 'dates' updated.
      // We let user click OK to confirm.
    },
    saveDates() {
      this.menu = false;
      this.emitDates();
    },
    emitDates() {
      if (this.dates.length === 0) {
        this.$emit("input", []);
        return;
      }

      // Sort dates to ensure start is first
      const sortedDates = [...this.dates].sort();

      // Process dates to send UTC ISO strings
      // Start date: 00:00:00 local -> UTC
      // End date: 23:59:59 local -> UTC

      const startDateStr = sortedDates[0];
      const endDateStr = sortedDates[1] || sortedDates[0]; // If only one selected, use it as both or single? Usually range implies 2.

      // Construct local dates
      // We treat the selected date as "Start of day" in local time for the start date
      // And "End of day" in local time for the end date

      const startDateLocal = new Date(`${startDateStr}T00:00:00`);
      const endDateLocal = new Date(`${endDateStr}T23:59:59.999`);

      // Convert to UTC
      // toISOString() automatically converts to UTC
      const startDateUTC = startDateLocal.toISOString();
      const endDateUTC = endDateLocal.toISOString();

      this.$emit("input", [startDateUTC, endDateUTC]);
    },
    clearDates() {
      this.dates = [];
      this.$emit("input", []);
    },
  },
};
</script>
