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
  nunca_sola: "Sin respuesta sola en feriado",
};

// WHY: spec §3.2 keeps the short «Nunca sola» on the table chip; only the dialog label was renamed
const CHIP_LABEL = { ...MODE_LABEL, nunca_sola: "Nunca sola" };

/** Chip text for the bots table. An expired end date reads as «Venció», not as Normal. */
function replyPresentation(autoReply, now = new Date()) {
  const mode = (autoReply && autoReply.mode) || "normal";
  if (mode === "normal") return { text: "Normal", tone: "normal" };
  const until = autoReply.until ? asDate(autoReply.until) : null;
  // WHY: the API treats an unreadable end date as normal. Formatting it would throw.
  if (autoReply.until && !until) return { text: "Normal", tone: "normal" };
  const inForce = !until || until > now;
  const label = CHIP_LABEL[mode] || mode;
  if (!inForce) return { text: `Venció el ${formatChile(until)}`, tone: "expired" };
  if (!until) return { text: `${label} · sin término`, tone: mode, noEndDate: true };
  return { text: `${label} hasta ${formatChile(until)}`, tone: mode };
}

/** Grey tags next to the chip: a complaint pause in force and the «Nodos graduados» checkbox turned off. */
function replyTags(autoReply, now = new Date()) {
  const current = autoReply || {};
  const pausedUntil = current.pausedUntil ? asDate(current.pausedUntil) : null;
  // WHY: an expired mode already reads «Venció»; the API lets expiry win over a pause
  const isExpired = replyPresentation(current, now).tone === "expired";
  const tags = [];
  // WHY: the API applies the pause to graduada only; a paused nunca_sola keeps its mode
  if (current.mode === "graduada" && !isExpired && pausedUntil && pausedUntil > now) {
    tags.push(`Pausada por quejas hasta ${formatChile(pausedUntil)}`);
  }
  if (current.allowGraduatedNodes === false) tags.push("Sin nodos graduados");
  return tags;
}

/** Comparable key of the fields the panel edits, to tell whether the reply section changed. */
function autoReplyKey(autoReply) {
  const current = autoReply || {};
  const until = current.until ? asDate(current.until) : null;
  return JSON.stringify({
    mode: current.mode || "normal",
    until: until ? until.toISOString() : null,
    reason: current.reason || "",
    allowGraduatedNodes: current.allowGraduatedNodes !== false,
  });
}

export {
  CHILE_TIME_ZONE,
  MODE_LABEL,
  autoReplyKey,
  chileInputToUtc,
  utcToChileInput,
  formatChile,
  replyPresentation,
  replyTags,
};
