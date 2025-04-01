/**
 * @typedef {Object} SentimentItem
 * @property {string} value - Sentiment value (e.g., "Satisfecho", "Neutro")
 * @property {number} count - Count of occurrences
 */

/**
 * @typedef {Object} DissatisfactionOriginItem
 * @property {string} value - Origin value (e.g., "Error de la compañía")
 * @property {number} count - Count of occurrences
 */

/**
 * @typedef {Object} BooleanMetricDataItem
 * @property {string} value - Value ("Sí" or "No")
 * @property {number} count - Count of occurrences
 */

/**
 * @typedef {Object} BooleanMetricItem
 * @property {string} field - Field name (e.g., "venta_cruzada_efectiva")
 * @property {Array<BooleanMetricDataItem>} data - Data for the metric
 * @property {number} total - Total occurrences
 */

/**
 * @typedef {Object} EnumMetricItem
 * @property {string} field - Field name (e.g., "calificacion_del_sentimiento")
 * @property {Array<SentimentItem|DissatisfactionOriginItem>} data - Data for the metric
 * @property {number} total - Total occurrences
 */

/**
 * @typedef {Object} DateRange
 * @property {string} startDate - Start date (format: YYYY-MM-DD or "all time")
 * @property {string} endDate - End date (format: YYYY-MM-DD or "all time")
 */

/**
 * @typedef {Object} SentimentAnalysisResponse
 * @property {number} totalChatsWithSentiment - Total number of chats with sentiment analysis
 * @property {Array<EnumMetricItem>} enumMetrics - Array of enum metrics
 * @property {Array<BooleanMetricItem>} booleanMetrics - Array of boolean metrics
 * @property {Object} reflections - Information about reflection texts
 * @property {number} reflections.count - Count of reflections
 * @property {DateRange} dateRange - Date range used for the query
 */

export {};
