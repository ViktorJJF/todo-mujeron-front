import { format } from "date-fns";
import { es } from "date-fns/locale";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

const CHILE_TIME_ZONE = "America/Santiago";

function asDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function chileWallClock(value) {
  const date = asDate(value);
  if (!date) return null;
  return utcToZonedTime(date, CHILE_TIME_ZONE);
}

/** `yyyy-MM-ddTHH:mm` typed as Chile time, returned as a UTC Date. */
function chileInputToUtc(chileLocalText) {
  const normalized = String(chileLocalText).trim().replace("T", " ");
  return zonedTimeToUtc(normalized, CHILE_TIME_ZONE);
}

/** UTC instant as the `datetime-local` value a person in Chile would type. */
function utcToChileInput(value) {
  const zoned = value ? chileWallClock(value) : null;
  if (!zoned) return "";
  return format(zoned, "yyyy-MM-dd'T'HH:mm");
}

/** UTC instant rendered in Chile, for chips and the history list. */
function formatChile(value, pattern = "EEE d MMM, HH:mm") {
  const zoned = value ? chileWallClock(value) : null;
  if (!zoned) return "";
  return format(zoned, pattern, { locale: es });
}

const MODE_LABEL = {
  normal: "Normal",
  graduada: "Responde sola",
  nunca_sola: "Nunca responde sola",
};

/** Chip text for the bots table. An expired end date reads as «Venció», not as Normal. */
function replyPresentation(autoReply, now = new Date()) {
  const mode = (autoReply && autoReply.mode) || "normal";
  if (mode === "normal") return { text: "Normal", tone: "normal" };
  const until = autoReply.until ? asDate(autoReply.until) : null;
  // WHY: the API treats an unreadable end date as normal. Formatting it would throw.
  if (autoReply.until && !until) return { text: "Normal", tone: "normal" };
  const inForce = !until || until > now;
  const label = MODE_LABEL[mode] || mode;
  if (!inForce) return { text: `Venció el ${formatChile(until)}`, tone: "expired" };
  if (!until) return { text: `${label} · sin término`, tone: mode };
  return { text: `${label} hasta ${formatChile(until)}`, tone: mode };
}

export {
  CHILE_TIME_ZONE,
  MODE_LABEL,
  chileInputToUtc,
  utcToChileInput,
  formatChile,
  replyPresentation,
};
