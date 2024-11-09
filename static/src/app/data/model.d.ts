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

export const variable_key_regex = /^[a-z][a-z0-9_]*[a-z0-9]$/;

export type KeyedMap<T, U> = { [K in keyof T]: U };

export type ArgumentsInterface<T> = Partial<KeyedMap<T, number>>;
export type PretextInterface<U> = KeyedMap<U, number>;

interface BaseExpressionInterface<T, U> {
  // unique key to reference this variable
  // must match variable_key_regex
  key: keyof T;
  // displayed variable name
  name: string;
  // list of variable keys used in this variable's `expression`
  dependencies: (keyof T | keyof U)[];
  // the expression
  expression: string;
}

interface MultiExpressionInterface<T, U>
  extends Omit<BaseExpressionInterface<T, U>, "expression"> {
  expressions: BaseExpressionInterface<T, U>[];
}

// PARAMETER / EXPRESSION INTERFACES

export interface EvaluatedExpressionInterface<T, U, V>
  extends BaseExpressionInterface<T, U, V> {
  arguments: ArgumentsInterface<T>;
  pretext: PretextInterface<U>;
  posttext: PretextInterface<V>;
  value: number;
}

export interface ExpressionInterface<T, U>
  extends BaseExpressionInterface<T, U> {
  expression: string;
}

export interface ParameterInterface<T, U>
  extends MultiExpressionInterface<T, U> {}

// PARAMETER MAP INTERFACES

// a single set of fully evaluated expressions
export interface EvaluatedExpressionMapInterface<T, U, V> {
  expressions: KeyedMap<T, EvaluatedExpressionInterface<T, U>>;
  pretext: PretextInterface<U>;
  posttext: PretextInterface<V>;
}

// a single set of unevaluated expressions
export interface ExpressionMapInterface<T, U> {
  expressions: KeyedMap<T, ExpressionInterface<T, U>>;
}

// a multiplicative set of parameters containing all possible expressions
export interface ContextInterface<T, U> {
  parameters: KeyedMap<T, ParameterInterface<T, U>>;
}

// // INCOME

// export interface IncomeChangeInterface extends MultiExpressionInterface {
//   // yyyy-mm-dd date on which this change will apply
//   dateApplied: string;
//   // frequency at which this change will apply
//   recurrence: FrequencyEnum;
//   // mathjs expression to calculate new income
//   // will receive `old` as a parameter to determine new income from old income
//   expression: string;
// }

// export interface IncomeInterface extends MultiExpressionInterface {
//   // frequency of income
//   frequency: FrequencyEnum;
//   // frequency at which to calculate displayed value
//   displayedFrequency: FrequencyEnum;
//   // value at `frequency`
//   value: number;
//   // value at `displayedFrequency`
//   displayedValue: number;
//   // mathjs expression to calculate amount invested from amount received
//   investmentExpression: string;
//   // projected future changes to this income
//   scheduledChanges: IncomeChangeInterface[];
// }

// export interface UserDefinedVariableInterface extends MultiExpressionInterface {
//   // populate with anything unique to user-defined variables
// }

// export interface HomeCostInterface extends MultiExpressionInterface {}

// export interface DataModelInterface {
//   // list of incomes
//   incomes: IncomeInterface[];
//   // list of user-defined variables
//   userDefinedVariables: UserDefinedVariableInterface[];
//   // home cost
//   homeCost: HomeCostInterface;
// }
