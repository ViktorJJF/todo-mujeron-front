<template>
  <v-select
    dense
    hide-details
    v-model="selectedCampaignId"
    :items="campaignSelectItems"
    item-value="value"
    item-text="text"
    :placeholder="placeholder"
    :label="label"
    single-line
    outlined
    clearable
    :loading="loading"
  ></v-select>
</template>

<script>
export default {
  name: "CampaignFilterSelect",
  props: {
    value: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: "Seleccione una campaña",
    },
    label: {
      type: String,
      default: "Campaña",
    },
    showAllOption: {
      type: Boolean,
      default: true,
    },
    allOptionText: {
      type: String,
      default: "Todas las campañas",
    },
  },
  data() {
    return {
      campaigns: [],
      loading: false,
    };
  },
  computed: {
    selectedCampaignId: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
    campaignSelectItems() {
      const items = [];
      if (this.showAllOption) {
        items.push({
          text: this.allOptionText,
          value: null,
        });
      }
      if (this.campaigns && this.campaigns.length > 0) {
        this.campaigns.forEach((campaign) => {
          items.push({
            text: campaign.name || `Campaña ${campaign._id}`,
            value: campaign._id,
          });
        });
      }
      return items;
    },
  },
  async mounted() {
    await this.loadCampaigns();
  },
  methods: {
    async loadCampaigns() {
      this.loading = true;
      try {
        await this.$store.dispatch("marketingCampaignsModule/list", {
          companies: [
            this.$store.getters["authModule/getCurrentCompany"].company._id,
          ],
          includeCount: false,
          limit: 1000, // Load a reasonable number of campaigns
        });
        this.campaigns = this.$store.state.marketingCampaignsModule.marketingCampaigns;
      } catch (error) {
        console.error("Error loading campaigns:", error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>

