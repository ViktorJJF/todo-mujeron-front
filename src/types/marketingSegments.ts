export interface TodofullLabelsCondition {
  type: "include" | "exclude";
  labels: string[]; // ObjectId references
}

export interface LabelGroup {
  operator: "and" | "or";
  conditions: TodofullLabelsCondition[];
}

export interface TodofullLabelsFilter {
  operator: "and" | "or";
  groups: LabelGroup[];
}

export interface CatalogFilter {
  type: "is" | "all" | "any" | null;
  catalogs: string[]; // ObjectId references to CloudStorageLinks
  timeInterval:
    | "any_time"
    | "last_month"
    | "last_3_months"
    | "last_6_months"
    | "last_year";
}

export interface CampaignFilter {
  type:
    | "any"
    | "last_5"
    | "last_10"
    | "last_20"
    | "last_50"
    | "all_last_5"
    | "all_last_10"
    | "all_last_20"
    | "all_last_50"
    | "is"
    | "is_not"
    | null;
  campaigns: string[]; // ObjectId references to MarketingCampaigns
  timeInterval:
    | "any_time"
    | "last_month"
    | "last_3_months"
    | "last_6_months"
    | "last_year";
}

export interface MarketingSegmentFilters {
  includeWithChats: boolean;
  includeWithSales: boolean;
  includeWithEmail: boolean;
  includeWithoutEmail: boolean;
  includeWithIDGenial: boolean;
  includeWithoutIDGenial: boolean;
  minSaleOrderCount: number;
  minPosOrderCount: number;
  minSalePosOrderCount: number;
  saleOrderCountRange: {
    min: number | null;
    max: number | null;
  };
  posOrderCountRange: {
    min: number | null;
    max: number | null;
  };
  salePosOrderCountRange: {
    min: number | null;
    max: number | null;
  };
  rfmScores: string[];
  salesTeams: string[];
  campaignInteraction:
    | "sent"
    | "not_sent"
    | "opened"
    | "not_opened"
    | "clicked"
    | "not_clicked"
    | "replied"
    | "not_replied"
    | null;
  campaignFilter: CampaignFilter;
  hasChatInteractionLast24h: boolean;
  platforms?: string[];
  catalogInteraction: "sent" | "not_sent" | null;
  catalogFilter: CatalogFilter;
  cloudStorageLinkId?: string; // ObjectId reference to CloudStorageLinks
}

export interface MarketingSegment {
  _id?: string;
  name: string;
  description?: string;
  type: "static" | "dynamic";
  cleanLeadIds?: string[]; // ObjectId references to CleanLeads (for static segments)
  todofullLabelsFilter: TodofullLabelsFilter;
  target_countries?: string[]; // ['Peru', 'Chile', 'Colombia']
  company: string; // ObjectId reference to Companies
  dateFrom?: Date;
  dateTo?: Date;
  filters: MarketingSegmentFilters;
  botIds: string[]; // ObjectId references to Bots
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CloudStorageLink {
  _id: string;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
