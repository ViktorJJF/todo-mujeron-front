import { format } from "date-fns";
import { es } from "date-fns/locale";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

const CHILE_TIME_ZONE = "America/Santiago";

function chileWallClock(value) {
  return utcToZonedTime(new Date(value), CHILE_TIME_ZONE);
}

/** `yyyy-MM-ddTHH:mm` typed as Chile time, returned as a UTC Date. */
function chileInputToUtc(chileLocalText) {
  const normalized = String(chileLocalText).trim().replace("T", " ");
  return zonedTimeToUtc(normalized, CHILE_TIME_ZONE);
}

/** UTC instant as the `datetime-local` value a person in Chile would type. */
function utcToChileInput(value) {
  if (!value) return "";
  return format(chileWallClock(value), "yyyy-MM-dd'T'HH:mm");
}

/** UTC instant rendered in Chile, for chips and the history list. */
function formatChile(value, pattern = "EEE d MMM, HH:mm") {
  if (!value) return "";
  return format(chileWallClock(value), pattern, { locale: es });
}

export { CHILE_TIME_ZONE, chileInputToUtc, utcToChileInput, formatChile };
