// ENUMS

export type FrequencyEnum =
  | "once"
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "yearly"
  | "custom";

// BASE INTERFACES

export type KeyMap<T, U> = { [K in keyof T]: U };

export interface ParameterInterface {
  parameterId: string;
  parameterName: string;
  value: number;
  key: string;
  description?: string;
  // Foreign keys
  userId: string;
}

export type ParameterInterfaceMap<T> = KeyMap<T, ParameterInterface>;

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
