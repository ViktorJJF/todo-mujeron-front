export type ProgrammedChunkStatus = 'pending' | 'processing' | 'sent' | 'error' | 'sent_with_some_errors';

export interface ProgrammedChunk {
  _id?: string;
  chunkPage: number;
  chunkSize: number;
  sendAt: Date | string;
  segmentId: string;
  campaignId: string;
  status: ProgrammedChunkStatus;
  errorPhones?: string[];
  errorMessage?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface MarketingCampaign {
  _id: string;
  name: string;
  description?: string;
  programmedChunks?: ProgrammedChunk[];
  // Add other campaign properties as needed
} 