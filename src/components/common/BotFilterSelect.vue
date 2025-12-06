<template>
  <v-select
    dense
    hide-details
    v-model="selectedBotId"
    :items="botSelectItems"
    item-value="value"
    item-text="text"
    :placeholder="placeholder"
    single-line
    outlined
    clearable
    :loading="loading"
  ></v-select>
</template>

<script>
export default {
  name: "BotFilterSelect",
  props: {
    value: {
      type: String,
      default: null,
    },
    platforms: {
      type: Array,
      default: () => [],
      validator: (value) => {
        // Allow empty array (all platforms) or array of platform strings
        return (
          Array.isArray(value) &&
          value.every(
            (platform) =>
              typeof platform === "string" &&
              (platform === "whatsapp_automated" || platform === "whatsapp")
          )
        );
      },
    },
    placeholder: {
      type: String,
      default: "Filtrar por bot",
    },
    showAllOption: {
      type: Boolean,
      default: true,
    },
    allOptionText: {
      type: String,
      default: "Todos los bots",
    },
  },
  data() {
    return {
      bots: [],
      loading: false,
    };
  },
  computed: {
    selectedBotId: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
    filteredBots() {
      if (!this.platforms || this.platforms.length === 0) {
        return this.bots;
      }
      return this.bots.filter((bot) =>
        this.platforms.includes(bot.platform)
      );
    },
    botSelectItems() {
      const items = [];
      if (this.showAllOption) {
        items.push({
          text: this.allOptionText,
          value: null,
        });
      }
      if (this.filteredBots && this.filteredBots.length > 0) {
        this.filteredBots.forEach((bot) => {
          items.push({
            text: `${bot.phone} (${
              bot.platform === "whatsapp_automated"
                ? "WhatsApp Imagina"
                : "Whatsapp Cloud"
            })`,
            value: bot._id,
          });
        });
      }
      return items;
    },
  },
  async mounted() {
    await this.initialize();
  },
  methods: {
    async initialize() {
      this.loading = true;
      try {
        await this.$store.dispatch("botsModule/list", {
          companies: [
            this.$store.getters["authModule/getCurrentCompany"].company._id,
          ],
        });
        this.bots = this.$store.state.botsModule.bots;
      } catch (error) {
        console.error("Error loading bots:", error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>

