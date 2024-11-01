// ENUMS

export enum FrequencyEnum {
  ONCE = "once",
  DAILY = "daily",
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
  CUSTOM = "custom",
}

// BASE INTERFACES

export interface ParameterInterface {
  parameterId: string;
  parameterName: string;
  value: number;
  symbol: string;
  description?: string;
  // Foreign keys
  userId: string;
}

export interface SegmentInterface {
  segmentId: string;
  segmentName?: string;
  startDate?: string;
  frequencyInterval: Frequency;
  customFrequencyIntervalDays?: number;
  // Parameters
  valueParameter: string;
  expirationSumParameter?: string;
  // Expiration
  expirationDate?: string;
  expirationDays?: number;
  expirationIntervals?: number;
  // Foreign keys
  userId: string;
  accountId: string;
  streamId: string;
  previousSegmentId?: string;
  nextSegmentId?: string;
}

export interface StreamInterface {
  streamId: string;
  streamName?: string;
  // Parameters
  expirationSumParameter?: string;
  // Expiration
  expirationDate?: string;
  expirationDays?: number;
  // Foreign keys
  userId: string;
  accountId: string;
  // References
  segments: Segment[];
}

export interface AccountInterface {
  accountId: string;
  accountName: string;
  startDate: string;
  // Parameters
  startValueParameter: string;
  // Foreign keys
  userId: string;
  // References
  streams: Stream[];
}
