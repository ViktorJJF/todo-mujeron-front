/**
 * @typedef {Object} MessagesByChannelItem
 * @property {number} month - The month number (1-12)
 * @property {number} year - The year
 * @property {string} monthName - The name of the month (e.g., "January")
 * @property {string} platform - The platform/channel name (e.g., "facebook", "instagram")
 * @property {number} count - The count of messages
 */

/**
 * @typedef {Object} CleanLeadsByChannelItem
 * @property {number} month - The month number (1-12)
 * @property {number} year - The year
 * @property {string} monthName - The name of the month (e.g., "January")
 * @property {string} channel - The channel name (e.g., "MAILCHIMP", "CHATBOT")
 * @property {number} count - The count of cleanLeads
 */

/**
 * @typedef {Object} ChatsCoverageItem
 * @property {number} month - The month number (1-12)
 * @property {number} year - The year
 * @property {string} monthName - The name of the month (e.g., "January")
 * @property {number} totalChats - Total number of chats
 * @property {number} attendedChats - Number of chats with at least one agent message
 * @property {number} unattendedChats - Number of chats with no agent messages
 * @property {number} coveragePercentage - Percentage of chats that were attended
 */

/**
 * @typedef {Object} DailyBreakdownItem
 * @property {string} date - Date in YYYY-MM-DD format
 * @property {number} count - Count of items on that date
 */

/**
 * @typedef {Object} TotalMessagesResponse
 * @property {number} totalMessages - Total number of messages
 * @property {Array<DailyBreakdownItem>} dailyBreakdown - Daily breakdown of message counts
 * @property {Object} dateRange - Date range used for the query
 */

/**
 * @typedef {Object} NewChatsResponse
 * @property {number} totalNewChats - Total number of new chats
 * @property {Array<DailyBreakdownItem>} dailyBreakdown - Daily breakdown of new chat counts
 * @property {Object} dateRange - Date range used for the query
 */

/**
 * @typedef {Object} NewUsersResponse
 * @property {number} totalNewUsers - Total number of new users
 * @property {Array<DailyBreakdownItem>} dailyBreakdown - Daily breakdown of new user counts
 * @property {Object} dateRange - Date range used for the query
 */

/**
 * @typedef {Object} CategoryDataItem
 * @property {string} value - Value (option) of the data point
 * @property {number} count - Count of occurrences
 */

/**
 * @typedef {Object} CategoryItem
 * @property {string} category - Category name
 * @property {Array<CategoryDataItem>} data - Data points for the category
 */

/**
 * @typedef {Object} ConsultationMotivesResponse
 * @property {Array<CategoryItem>} categories - Array of category metrics
 * @property {Object} reflections - Information about reflection texts
 * @property {number} reflections.count - Count of reflections
 * @property {Object} dateRange - Date range used for the query
 */

/**
 * @typedef {Object} SentimentItem
 * @property {string} sentiment - Sentiment category
 * @property {number} count - Count of occurrences
 */

/**
 * @typedef {Object} OriginItem
 * @property {string} origin - Origin category
 * @property {number} count - Count of occurrences
 */

/**
 * @typedef {Object} BooleanMetricItem
 * @property {string} field - Field name
 * @property {Array} data - Data for the field
 */

/**
 * @typedef {Object} SentimentAnalysisResponse
 * @property {Array<SentimentItem>} sentiments - Array of sentiment metrics
 * @property {Array<OriginItem>} dissatisfactionOrigins - Array of dissatisfaction origin metrics
 * @property {Array<BooleanMetricItem>} booleanMetrics - Array of boolean metrics
 * @property {Object} reflections - Information about reflection texts
 * @property {Object} dateRange - Date range used for the query
 */

/**
 * @typedef {Object} ResolutionCategoryItem
 * @property {string} category - Category name
 * @property {number} count - Count of occurrences
 */

/**
 * @typedef {Object} FallbackMetrics
 * @property {number} averageFallbacks - Average fallbacks per chat
 * @property {number} maxFallbacks - Maximum fallbacks in a chat
 * @property {number} minFallbacks - Minimum fallbacks in a chat
 * @property {number} totalChats - Total chats with fallback data
 */

/**
 * @typedef {Object} ConversationQualityResponse
 * @property {Array<ResolutionCategoryItem>} resolutionCategories - Array of resolution category metrics
 * @property {FallbackMetrics} fallbackMetrics - Metrics about fallback counts
 * @property {Array<BooleanMetricItem>} booleanMetrics - Array of boolean metrics
 * @property {Object} reflections - Information about reflection texts
 * @property {Object} dateRange - Date range used for the query
 */

/**
 * @typedef {Object} ArrayMetricItem
 * @property {string} field - Field name
 * @property {Array<CategoryDataItem>} data - Data for the field
 */

/**
 * @typedef {Object} EnumMetricItem
 * @property {string} field - Field name
 * @property {Array} data - Data for the field
 */

/**
 * @typedef {Object} SalesAnalysisResponse
 * @property {Array<ArrayMetricItem>} arrayMetrics - Array of metrics for array fields
 * @property {Array<EnumMetricItem>} enumMetrics - Array of metrics for enum fields
 * @property {Object} reflections - Information about reflection texts
 * @property {Object} dateRange - Date range used for the query
 */

/**
 * @typedef {Object} CategoryCount
 * @property {string} category - Category name
 * @property {number} count - Count of occurrences
 */

/**
 * @typedef {Object} TopicCount
 * @property {string} topic - Topic name
 * @property {number} count - Count of occurrences
 */

/**
 * @typedef {Object} AICategoriesResponse
 * @property {Array<CategoryCount>} categories - Array of AI category metrics
 * @property {Array<TopicCount>} topics - Array of AI topic metrics
 * @property {Object} dateRange - Date range used for the query
 */

/**
 * @typedef {Object} OverviewMetrics
 * @property {number} totalChats - Total number of chats
 * @property {number} attendedChats - Number of attended chats
 * @property {number} totalCoveragePercentage - Percentage of chat coverage
 * @property {number} totalMessages - Total number of messages
 * @property {number} averageFallbacks - Average fallbacks per chat
 */

/**
 * @typedef {Object} SentimentSummary
 * @property {Array<SentimentItem>} topSentiments - Top sentiment categories
 */

/**
 * @typedef {Object} ConsultationSummary
 * @property {Array<CategoryItem>} topCategories - Top consultation categories
 */

/**
 * @typedef {Object} SalesSummary
 * @property {Array<CategoryDataItem>} purchaseOrigins - Top purchase origins
 * @property {Array<CategoryDataItem>} purchaseResults - Top purchase results
 * @property {Array<CategoryDataItem>} nonPurchaseReasons - Top reasons for not purchasing
 */

/**
 * @typedef {Object} ConversationQualitySummary
 * @property {Array<ResolutionCategoryItem>} resolutionMetrics - Top resolution metrics
 * @property {FallbackMetrics} fallbackMetrics - Fallback metrics
 */

/**
 * @typedef {Object} AISummary
 * @property {Array<CategoryCount>} topAICategories - Top AI categories
 * @property {Array<TopicCount>} topAITopics - Top AI topics
 */

/**
 * @typedef {Object} CEODashboardResponse
 * @property {OverviewMetrics} overview - Overview metrics
 * @property {SentimentSummary} sentimentSummary - Sentiment analysis summary
 * @property {ConsultationSummary} consultationSummary - Consultation motives summary
 * @property {SalesSummary} salesSummary - Sales analysis summary
 * @property {ConversationQualitySummary} conversationQualitySummary - Conversation quality summary
 * @property {AISummary} aiSummary - AI categories summary
 * @property {Object} dateRange - Date range used for the query
 */

/**
 * @typedef {Object} DateRangeParams
 * @property {string} startDate - Start date in YYYY-MM-DD format (UTC)
 * @property {string} endDate - End date in YYYY-MM-DD format (UTC)
 */

/**
 * @typedef {Object} MetricsApiResponse
 * @property {boolean} ok - Whether the request was successful
 * @property {Array<MessagesByChannelItem>} payload - The data payload
 */

export {};
