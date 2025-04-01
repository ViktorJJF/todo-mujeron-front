import { format, parseISO, subMonths } from "date-fns";

/**
 * Format a date string to a readable format
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @param {string} formatString - Format string (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, formatString = "MMM dd, yyyy") => {
  if (!dateString) return "";
  return format(parseISO(dateString), formatString);
};

/**
 * Get a date from N months ago in UTC
 * @param {number} months - Number of months to subtract
 * @param {string} formatString - Format string (default: 'yyyy-MM-dd')
 * @returns {string} Formatted date string in UTC
 */
export const getDateMonthsAgo = (months, formatString = "yyyy-MM-dd") => {
  const date = subMonths(new Date(), months);
  // Set time to start of day in UTC
  date.setUTCHours(0, 0, 0, 0);
  return format(date, formatString);
};

/**
 * Get today's date in UTC
 * @param {string} formatString - Format string (default: 'yyyy-MM-dd')
 * @returns {string} Formatted date string in UTC
 */
export const getTodayDate = (formatString = "yyyy-MM-dd") => {
  const date = new Date();
  // Set time to end of day in UTC
  date.setUTCHours(23, 59, 59, 999);
  return format(date, formatString);
};

/**
 * Sort months chronologically
 * @param {Array<string>} monthsData - Array of month strings in format "MonthName Year"
 * @returns {Array<string>} Sorted array of month strings
 */
export const sortMonthsChronologically = (monthsData) => {
  return [...monthsData].sort((a, b) => {
    const [aMonth, aYear] = a.split(" ");
    const [bMonth, bYear] = b.split(" ");

    if (aYear !== bYear) {
      return parseInt(aYear) - parseInt(bYear);
    }

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months.indexOf(aMonth) - months.indexOf(bMonth);
  });
};
