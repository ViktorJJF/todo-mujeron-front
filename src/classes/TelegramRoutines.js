export default () => ({
  status: "active",
  name: "",
  category: null,
  telegramGroup: null,
  minStock: 0,
  minSize: 0,
  scheduleDays: [],
  scheduleTime: "",
  imagesQuantity: 0,
  bots: [],
  typeOfPosts: [],
  hasUniqueSizes: false,
  action: "create",
  // Frontend fields for form handling
  todofullCategories: [],
  todofullTallas: [],
  todofullBrands: [],
  todofullCatalogs: [], // This will be transformed to object structure when saving
  // Download option for PDF generation
  downloadOption: null,
  // Cloud storage link
  cloudStorageLink: null,
  // Catalog name
  catalogName: "",
});
