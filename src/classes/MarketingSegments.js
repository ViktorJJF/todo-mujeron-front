export default () => ({
  name: "",
  description: "",
  todofullLabels: [],
  filters: {
    includeWithEmail: true,
    includeWithoutEmail: true,
    includeWithChats: true,
    includeWithSales: false,
    includeWithIDGenial: true,
    includeWithoutIDGenial: true,
    minSaleOrderCount: 0,
    minPosOrderCount: 0,
    minSalePosOrderCount: 0,
  },
  target_countries: [],
  botIds: [],
  type: "static",
});
