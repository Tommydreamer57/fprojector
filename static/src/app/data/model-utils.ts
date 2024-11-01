import {
  ParameterInterface,
  SegmentInterface,
  StreamInterface,
  AccountInterface,
} from "@/app/data/model";
import { v4 as uuid } from "uuid";

// PARAMETERS

type ParametersMap<T> = {
  [K in keyof T]: ParameterInterface;
};

type ParameterParams = Omit<
  ParameterInterface,
  "parameterId" | "symbol" | "userId"
>;

type ParameterParamsMap<T> = {
  [K in keyof T]: ParameterParams;
};

export const defineParameters = <T>(
  userId: string,
  parameters: ParameterParamsMap<T>
): ParametersMap<T> => {
  const result: Partial<ParametersMap<T>> = {};

  for (const key in parameters) {
    if (parameters.hasOwnProperty(key)) {
      result[key] = {
        ...parameters[key],
        symbol: key,
        userId,
        parameterId: uuid(),
      };
    }
  }

  return result as ParametersMap<T>;
};

// SEGMENT

type SegmentParams = Omit<
  SegmentInterface,
  | "segmentId"
  | "valueParameter"
  | "expirationSumParameter"
  | "userId"
  | "accountId"
  | "streamId"
  | "previousSegmentId"
  | "nextSegmentId"
> & {
  valueParameter: ParameterInterface;
  expirationSumParameter?: ParameterInterface;
};

const defineSegment = (
  ids: {
    userId: string;
    accountId: string;
    streamId: string;
  },
  { valueParameter, expirationSumParameter, ...segment }: SegmentParams
): SegmentInterface => ({
  ...segment,
  ...ids,
  segmentId: uuid(),
  valueParameter: valueParameter.symbol,
  ...(expirationSumParameter && {
    expirationSumParameter: expirationSumParameter.symbol,
  }),
});

// STREAM

type StreamParams = Omit<
  StreamInterface,
  "streamId" | "expirationSumParameter" | "userId" | "accountId" | "segments"
> & {
  expirationSumParameter?: ParameterInterface;
  segments: SegmentParams[];
};

const defineStream = (
  ids: {
    userId: string;
    accountId: string;
  },
  { expirationSumParameter, segments, ...stream }: StreamParams
): StreamInterface => {
  const nestedIds = {
    ...ids,
    streamId: uuid(),
  };

  return {
    ...stream,
    ...nestedIds,
    ...(expirationSumParameter && {
      expirationSumParameter: expirationSumParameter.symbol,
    }),
    segments: segments.map((segment) => defineSegment(nestedIds, segment)),
  };
};

// ACCOUNT

type AccountParams = Omit<
  AccountInterface,
  "accountId" | "startValueParameter" | "userId" | "streams"
> & {
  startValueParameter: ParameterInterface;
  streams: StreamParams[];
};

export const defineAccount = (
  userId: string,
  { streams: streamParams, ...account }: AccountParams
): AccountInterface => {
  const ids = {
    userId,
    accountId: uuid(),
  };

  const streams = streamParams.map((stream) => defineStream(ids, stream));

  return {
    ...account,
    ...ids,
    startValueParameter: account.startValueParameter.parameterId,
    streams,
  };
};

// DATASET

type DatasetParams = {
  userId: string;
  parameters: ParameterParamsMap<T>;
  accountData: (params: ParametersMap<T>) => AccountParams;
};

export const defineDataset = <T>({
  userId,
  parameters: parameterParams,
  accountData: accountDataFromParameters,
}: DatasetParams): AccountInterface =>
  defineAccount(
    userId,
    accountDataFromParameters(defineParameters(userId, parameterParams))
  );
