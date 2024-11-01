import { Equation } from "@app/data/equation";
import {
  AccountInterface,
  FrequencyEnum,
  ParameterInterface,
  SegmentInterface,
  StreamInterface,
} from "@app/data/model";
import { v4 as uuid } from "uuid";

// PARAMETERS

type KeyMap<T, U> = { [K in keyof T]: U };

type ParameterParamsInterface = Omit<
  ParameterInterface,
  "parameterId" | "key" | "userId"
>;

type ParameterParamsMapInterface<T> = KeyMap<T, ParameterParamsInterface>;

type ParameterMapInterface<T> = KeyMap<T, Parameter>;

export class Parameter implements ParameterInterface {
  parameterId: string;
  parameterName: string;
  value: number;
  key: string;
  description?: string;
  userId: string;

  /**
   * Parameter keys must match the following regex
   * 1. Must start with an alphabetical character
   * 2. Must end with an alphanumerical character
   * 3. May otherwise contain underscores
   * 4. Must contain at least 2 characters
   */
  static keyRegex = /^[a-z][a-z0-9_]*[a-z0-9]$/;

  static validateKey = (key: string): string => {
    if (!key.match(Parameter.keyRegex)) {
      throw new Error(
        `Parameter key "${key}" must match regex: ${Parameter.keyRegex}`
      );
    }
    return key;
  };

  constructor({
    parameterId,
    parameterName,
    value,
    key,
    description,
    userId,
  }: ParameterInterface) {
    this.parameterId = parameterId;
    this.parameterName = parameterName;
    this.value = value;
    this.key = Parameter.validateKey(key);
    this.description = description;
    this.userId = userId;
  }

  toString = () => this.key;

  getScopeObject = (): { [key: string]: number } => ({
    [this.key]: this.value,
  });
}

export class ParameterMap<T> {
  parameters: ParameterMapInterface<T>;
  keys: (keyof T)[];
  parametersList: Parameter[];

  constructor(userId: string, parameters: ParameterParamsMapInterface<T>) {
    this.keys = [];
    this.parametersList = [];
    const paramsPartial: Partial<ParameterMapInterface<T>> = {};
    for (let key in parameters) {
      this.keys.push(key);
      paramsPartial[key] = new Parameter({
        ...parameters[key],
        key,
        userId,
        parameterId: uuid(),
      });
      this.parametersList.push(paramsPartial[key]);
    }
    this.parameters = paramsPartial as ParameterMapInterface<T>;
  }
}

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
  valueParameter: string;
  expirationSumParameter?: string;
};

export class Segment<T> implements SegmentInterface {
  stream: Stream<T>;
  segmentId: string;
  segmentName?: string;
  startDate?: string;
  frequencyInterval: FrequencyEnum;
  customFrequencyIntervalDays?: number;
  valueParameter: string;
  expirationSumParameter?: string;
  expirationDate?: string;
  expirationDays?: number;
  expirationIntervals?: number;
  userId: string;
  accountId: string;
  streamId: string;
  previousSegmentId?: string;
  nextSegmentId?: string;

  evaluatedValue: number;
  evaluatedExpirationSumValue?: number;

  constructor(
    stream: Stream<T>,
    {
      segmentName,
      startDate,
      frequencyInterval,
      customFrequencyIntervalDays,
      valueParameter,
      expirationSumParameter,
      expirationDate,
      expirationDays,
      expirationIntervals,
    }: SegmentParams
  ) {
    this.stream = stream;
    this.userId = stream.userId;
    this.accountId = stream.accountId;
    this.streamId = stream.streamId;
    this.segmentId = uuid();
    this.segmentName = segmentName;
    this.startDate = startDate;
    this.frequencyInterval = frequencyInterval;
    this.customFrequencyIntervalDays = customFrequencyIntervalDays;
    this.valueParameter = valueParameter;
    this.expirationSumParameter = expirationSumParameter;
    this.expirationDate = expirationDate;
    this.expirationDays = expirationDays;
    this.expirationIntervals = expirationIntervals;
    // this.previousSegmentId = previousSegmentId;
    // this.nextSegmentId = nextSegmentId;

    this.evaluatedValue = this.evaluateValue();
    this.evaluatedExpirationSumValue = this.evaluateExpirationSumValue();
  }

  getExpirationSumValueEquation = () => {
    if (this.expirationSumParameter)
      return new Equation(
        this.expirationSumParameter,
        this.stream.account.dataset.parameters
      );
  };

  evaluateExpirationSumValue = () =>
    this.getExpirationSumValueEquation()?.evaluate();

  getValueEquation = () =>
    new Equation(this.valueParameter, this.stream.account.dataset.parameters);

  evaluateValue = () => this.getValueEquation().evaluate();
}

// STREAM

type StreamParams = Omit<
  StreamInterface,
  "streamId" | "expirationSumParameter" | "userId" | "accountId" | "segments"
> & {
  expirationSumParameter?: string;
  segments: SegmentParams[];
};

export class Stream<T> implements StreamInterface {
  account: Account<T>;
  streamId: string;
  streamName?: string;
  expirationSumParameter?: string;
  expirationDate?: string;
  expirationDays?: number;
  userId: string;
  accountId: string;
  segments: Segment<T>[];

  evaluatedExpirationSumValue?: number;

  constructor(
    account: Account<T>,
    {
      streamName,
      expirationSumParameter,
      expirationDate,
      expirationDays,
      segments,
    }: StreamParams
  ) {
    this.account = account;
    this.userId = this.account.userId;
    this.accountId = this.account.accountId;
    this.streamId = uuid();
    this.streamName = streamName;
    this.expirationSumParameter = expirationSumParameter;
    this.expirationDate = expirationDate;
    this.expirationDays = expirationDays;
    this.segments = segments.map(segment => new Segment(this, segment));

    this.evaluatedExpirationSumValue = this.evaluateExpirationSumValue();
  }

  getExpirationSumValueEquation = () => {
    if (this.expirationSumParameter)
      return new Equation(
        this.expirationSumParameter,
        this.account.dataset.parameters
      );
  };

  evaluateExpirationSumValue = () =>
    this.getExpirationSumValueEquation()?.evaluate();
}

// ACCOUNT

type AccountParams = Omit<
  AccountInterface,
  "accountId" | "startValueParameter" | "userId" | "streams"
> & {
  startValueParameter: string;
  streams: StreamParams[];
};

export class Account<T> implements AccountInterface {
  dataset: ParametrizedDataset<T>;
  accountId: string;
  accountName: string;
  startDate: string;
  startValueParameter: string;
  userId: string;
  streams: Stream<T>[];

  evaluatedStartValue: number;

  constructor(
    dataset: ParametrizedDataset<T>,
    { accountName, startDate, startValueParameter, streams }: AccountParams
  ) {
    this.dataset = dataset;
    this.userId = this.dataset.userId;
    this.accountId = uuid();
    this.accountName = accountName;
    this.startDate = startDate;
    this.startValueParameter = startValueParameter;
    this.streams = streams.map(stream => new Stream(this, stream));

    this.evaluatedStartValue = this.evaluateStartValue();
  }

  getStartValueEquation = () =>
    new Equation(this.startValueParameter, this.dataset.parameters);

  evaluateStartValue = () => this.getStartValueEquation().evaluate();
}

// PARAMETRIZED DATASET

interface DatasetParams<T> {
  userId: string;
  parameters: ParameterParamsMapInterface<T>;
  accounts: AccountParams[];
}

export class ParametrizedDataset<T> {
  userId: string;
  parameters: ParameterMap<T>;
  accounts: Account<T>[];

  constructor({
    userId,
    parameters: paramsMap,
    accounts: accountsList,
  }: DatasetParams<T>) {
    this.userId = userId;
    this.parameters = new ParameterMap(userId, paramsMap);
    this.accounts = accountsList.map(account => new Account(this, account));
  }
}
