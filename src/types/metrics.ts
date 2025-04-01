// Add MessagesByChannelByMonth response types if the file exists
export interface ChannelMessageCount {
  channelName: string;
  messageCount: number;
}

export interface MonthlyChannelData {
  month: string;
  year: string;
  channels: ChannelMessageCount[];
}

export interface MessagesByChannelResponse {
  ok: boolean;
  payload: MonthlyChannelData[];
}

// Add LeadsByMonth response types
export interface MonthlyLeadData {
  month: string;
  year: string;
  totalLeads: number;
}

export interface LeadsByMonthResponse {
  ok: boolean;
  payload: MonthlyLeadData[];
}

// Add CleanLeadsByChannel response types
export interface MonthlyCleanLeadData {
  month: number;
  year: number;
  monthName: string;
  count: number;
}

export interface CleanLeadsByChannelResponse {
  ok: boolean;
  payload: MonthlyCleanLeadData[];
} 