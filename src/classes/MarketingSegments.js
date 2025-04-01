export default () => ({
  name: "",
  description: "",
  todofullLabels: [],
  todofullLabelsFilter: {
    operator: "or",
    groups: [
      {
        operator: "and",
        conditions: [],
      },
    ],
  },
  filters: {
    includeWithEmail: true,
    includeWithoutEmail: true,
    includeWithChats: true,
    includeWithSales: false,
    includeWithIDGenial: true,
    includeWithoutIDGenial: true,
    // Legacy fields for backward compatibility
    minSaleOrderCount: 0,
    minPosOrderCount: 0,
    minSalePosOrderCount: 0,
    // New range fields
    saleOrderCountRange: {
      min: null,
      max: null,
    },
    posOrderCountRange: {
      min: null,
      max: null,
    },
    salePosOrderCountRange: {
      min: null,
      max: null,
    },
    salesTeams: [],
    rfmScores: [],
    campaignFilter: {
      type: null,
      campaigns: [],
      timeInterval: "any_time",
    },
    markMessagesAsRead: false,
    hasChatInteractionLast24h: false,
    platforms: [],
  },
  botIds: [],
  type: "dynamic",
});
