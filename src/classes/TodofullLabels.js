export default () => ({
  name: "",
  description: "",
  webTags: [],
  //retailRocketTags: [],
  messengerTags: [],
  company: {},
  // Label rules (Hito 3.1)
  displayName: null,
  labelType: null,
  expiresAfterDays: null,
  renewsOnReapply: false,
  exclusiveGroup: null,
  replacesLabelIds: [],
  isProtected: false,
  excludesFromCampaigns: false,
  pausesBot: false,
});

// Label types (Hito 3): name, color, and the rules the form proposes when one is chosen.
export const TODOFULL_LABEL_TYPES = [
  {
    value: "interest",
    text: "Interés",
    description: "Lo que la clienta pregunta en el chat",
    color: "green",
    defaultRules: { expiresAfterDays: 90, renewsOnReapply: true, isProtected: false },
  },
  {
    value: "follow_up",
    text: "Seguimiento con plazo",
    description: "Un paso que se cierra solo",
    color: "deep-purple",
    defaultRules: { expiresAfterDays: 7, renewsOnReapply: false, isProtected: false },
  },
  {
    value: "campaign",
    text: "Campaña",
    description: "Participó en una promoción",
    color: "orange",
    defaultRules: { expiresAfterDays: 90, renewsOnReapply: false, isProtected: false },
  },
  {
    value: "origin",
    text: "Origen",
    description: "Por dónde llegó; no cambia",
    color: "cyan",
    defaultRules: { expiresAfterDays: null, renewsOnReapply: false, isProtected: false },
  },
  {
    value: "flag",
    text: "Bandera",
    description: "La pone y la quita una persona",
    color: "red",
    defaultRules: { expiresAfterDays: null, renewsOnReapply: false, isProtected: true },
  },
  {
    value: "other",
    text: "Otro",
    description: "Sin reglas especiales",
    color: "blue-grey",
    defaultRules: { expiresAfterDays: null, renewsOnReapply: false, isProtected: false },
  },
];

/** The type entry of a label type value, or undefined for a label without type. */
export const findTodofullLabelType = (labelTypeValue) =>
  TODOFULL_LABEL_TYPES.find((labelType) => labelType.value === labelTypeValue);
