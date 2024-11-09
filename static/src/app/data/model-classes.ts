import {
  ArgumentsInterface,
  EvaluatedExpressionInterface,
  EvaluatedExpressionMapInterface,
  ExpressionInterface,
  ExpressionMapInterface,
  KeyedMap,
  ParameterInterface,
  ContextInterface,
} from "@app/data/model";
import * as mathjs from "mathjs";
import { PretextInterface } from "./model";

const MAX_CARDINALITY = 1000;

const getDependenciesFromExpression = (expression: string): string[] => {
  const node = mathjs.parse(expression);
  const variables: string[] = [];

  node.traverse((node: mathjs.MathNode) => {
    if (node instanceof mathjs.SymbolNode) {
      variables.push(node.name);
    }
  });

  return variables;
};

const validateScopeObject = <T>(
  scope: Partial<KeyedMap<T, number>>,
  dependencies: (keyof T)[]
): void => {
  for (const key of dependencies) {
    if (!(key in scope)) {
      throw new Error(
        `Scope object missing key: "${String(key)}": ["${Object.keys(
          scope
        ).join('", "')}"]`
      );
    }
  }
};

type ScopeInterface<T, U, V> = Partial<{
  [K in keyof T | keyof U | keyof V]: number;
}>;

class EvaluatedExpression<T, U, V>
  implements EvaluatedExpressionInterface<T, U, V>
{
  key: keyof T;
  name: string;
  dependencies: (keyof T | keyof U | keyof V)[];
  expression: string;
  cardinality: number;
  constant: boolean;
  arguments: ArgumentsInterface<T>;
  pretext: PretextInterface<U>;
  posttext: PretextInterface<V>;
  scope: ScopeInterface<T, U, V>;
  value: number;

  hash: string;

  constructor(
    expression: Expression<T, U>,
    args: Partial<KeyedMap<T, EvaluatedExpression<T, U, V>>>,
    posttext: PretextInterface<V> = {} as PretextInterface<V>
  ) {
    this.key = expression.key;
    this.name = expression.name;
    this.expression = expression.expression;
    this.cardinality = expression.cardinality;
    this.constant = expression.constant;
    this.pretext = expression.pretext;
    this.posttext = posttext;
    this.arguments = this._convertArguments(args);
    this.scope = this._getScopeObject();

    this.dependencies = getDependenciesFromExpression(this.expression) as (
      | keyof T
      | keyof U
      | keyof V
    )[];

    validateScopeObject<ScopeInterface<T, U, V>>(this.scope, this.dependencies);

    try {
      this.value = mathjs.evaluate(this.expression, this.scope);
    } catch (err) {
      console.error(this);
      throw new Error(
        `Error evaluating expression "${this.expression}" for key "${String(
          this.key
        )}": ${err}`
      );
    }

    this.hash = this._getHash();
  }

  private _getScopeObject = (): ScopeInterface<T, U, V> => ({
    ...this.pretext,
    ...this.arguments,
    ...this.posttext,
  });

  private _convertArguments = (
    args: Partial<KeyedMap<T, EvaluatedExpression<T, U, V>>>
  ): ArgumentsInterface<T> => {
    const result: ArgumentsInterface<T> = {};
    let key: keyof T;
    for (key in args) {
      if (args[key] instanceof EvaluatedExpression) {
        // why the question mark typescript????
        result[key] = args[key]?.value;
      }
    }
    return result;
  };

  private _getHash = (): string => {
    return `${String(this.key)}=${this.expression}`;
  };

  toString = () => `"${String(this.key)}" = ${this.expression}`;
}

class Expression<T, U> implements ExpressionInterface<T, U> {
  key: keyof T;
  name: string;
  dependencies: (keyof T | keyof U)[];
  argumentDependencies: (keyof T)[];
  expression: string;
  cardinality: number;
  constant: boolean;
  pretext: PretextInterface<U>;

  constructor(parameter: Parameter<T, U>, expression: string) {
    this.key = parameter.key;
    this.name = parameter.name;
    this.cardinality = parameter.cardinality;
    this.constant = parameter.constant;
    this.pretext = parameter.pretext;
    this.expression = expression;

    this.dependencies = getDependenciesFromExpression(this.expression) as (
      | keyof T
      | keyof U
    )[];

    this.argumentDependencies = this.dependencies.filter(
      dep => !(dep in this.pretext)
    ) as (keyof T)[];
  }

  evaluate = <V>(
    args: Partial<KeyedMap<T, EvaluatedExpression<T, U, V>>> = {},
    posttext: PretextInterface<V> = {} as PretextInterface<V>
  ): EvaluatedExpression<T, U, V> =>
    new EvaluatedExpression(this, args, posttext);
}

type ParameterArgumentInterface<T, U> = Omit<
  ParameterInterface<T, U>,
  "key" | "dependencies" | "expressions"
> & {
  expressions: string[];
};

class Parameter<T, U> implements ParameterInterface<T, U> {
  key: keyof T;
  name: string;
  dependencies: (keyof T | keyof U)[];
  expressions: Expression<T, U>[];
  cardinality: number;
  constant: boolean;
  pretext: PretextInterface<U>;

  constructor(
    key: keyof T,
    { name, expressions }: ParameterArgumentInterface<T, U>,
    pretext: PretextInterface<U>
  ) {
    this.key = key;
    this.name = name;
    this.pretext = pretext;

    this.dependencies = [];
    expressions.forEach(exp =>
      this.dependencies.push(
        ...(getDependenciesFromExpression(exp) as (keyof T)[]).filter(
          dep => !this.dependencies.includes(dep)
        )
      )
    );

    this.cardinality = expressions.length;

    this.constant = !this.dependencies.length && expressions.length === 1;

    this.expressions = expressions.map(exp => new Expression(this, exp));
  }
}

class ResultMap<T, U, V> implements EvaluatedExpressionMapInterface<T, U, V> {
  expressions: KeyedMap<T, EvaluatedExpression<T, U, V>>;

  pretext: PretextInterface<U>;
  posttext: PretextInterface<V>;

  plainResult: ScopeInterface<T, U, V>;

  hash: string;

  constructor(
    expressions: KeyedMap<T, EvaluatedExpression<T, U, V>>,
    pretext: PretextInterface<U>,
    posttext: PretextInterface<V>
  ) {
    this.expressions = expressions;

    this.pretext = pretext;
    this.posttext = posttext;

    this.plainResult = this._getPlainResult();

    this.hash = this._getHash();
  }

  private _getPlainResult = (): ScopeInterface<T, U, V> => {
    const result: Partial<ScopeInterface<T, U, V>> = {};
    let expKey: keyof T, pretextKey: keyof U, posttextKey: keyof V;
    for (pretextKey in this.pretext) {
      result[pretextKey] = this.pretext[pretextKey];
    }
    for (posttextKey in this.posttext) {
      result[posttextKey] = this.posttext[posttextKey];
    }
    for (expKey in this.expressions) {
      result[expKey] = this.expressions[expKey].value;
    }
    return result as ScopeInterface<T, U, V>;
  };

  private _getHash = (): string =>
    Object.values<EvaluatedExpression<T, U, V>>(this.expressions)
      .filter(exp => exp.cardinality > 1)
      .map(exp => exp.hash)
      .join(";");
}

class ExpressionMap<T, U> implements ExpressionMapInterface<T, U> {
  expressions: KeyedMap<T, Expression<T, U>>;
  pretext: PretextInterface<U>;

  constructor(
    expressions: KeyedMap<T, Expression<T, U>>,
    pretext: PretextInterface<U>
  ) {
    this.expressions = expressions;
    this.pretext = pretext;
  }

  private _evaluateKey = <V>(
    key: keyof T,
    posttext: PretextInterface<V> = {} as PretextInterface<V>,
    stackedKeys: (keyof T)[] = [],
    evaluatedKeys: Partial<KeyedMap<T, EvaluatedExpression<T, U, V>>> = {}
  ): EvaluatedExpression<T, U, V> => {
    // Check for circular dependencies
    if (stackedKeys.includes(key)) {
      console.error(this);
      throw new Error(
        `Encountered circular dependency evaluating key "${String(
          key
        )}": ["${stackedKeys.join('", "')}"]`
      );
    }
    // Check for existing value
    if (evaluatedKeys[key] instanceof EvaluatedExpression) {
      return evaluatedKeys[key];
    }
    // Continue recursion
    const expression = this.expressions[key];
    if (!expression) {
      console.error(this);
      throw new Error(`Missing expressions for parameter: "${String(key)}"`);
    }
    const copy = { ...evaluatedKeys };
    for (const dependencyKey of expression.argumentDependencies) {
      if (!(dependencyKey in posttext)) {
        // Recursion
        const dependencyResult = this._evaluateKey(
          dependencyKey,
          posttext,
          [...stackedKeys, key],
          copy
        );
        copy[dependencyKey] = dependencyResult;
      }
    }
    return expression.evaluate(copy, posttext);
  };

  evaluateKey = <V>(
    key: keyof T,
    posttext: PretextInterface<V> = {} as PretextInterface<V>
  ): EvaluatedExpression<T, U, V> => this._evaluateKey(key, posttext);

  private _evaluate = <V>(posttext: PretextInterface<V>) => {
    const expressionsPartial: Partial<
      KeyedMap<T, EvaluatedExpression<T, U, V>>
    > = {};
    let key: keyof T;
    for (key in this.expressions) {
      if (this.expressions.hasOwnProperty(key)) {
        expressionsPartial[key] = this.evaluateKey(key, posttext);
      }
    }
    return new ResultMap(
      expressionsPartial as KeyedMap<T, EvaluatedExpression<T, U, V>>,
      this.pretext,
      posttext
    );
  };

  evaluate = <V>(posttext: PretextInterface<V> = {} as PretextInterface<V>) =>
    this._evaluate(posttext);
}

export class Context<T, U> implements ContextInterface<T, U> {
  parameters: KeyedMap<T, Parameter<T, U>>;
  parameterList: Parameter<T, U>[];
  pretext: KeyedMap<U, number>;

  static MAX_CARDINALITY: number = MAX_CARDINALITY;

  constructor(
    parameters: KeyedMap<T, ParameterArgumentInterface<T, U>>,
    pretext: KeyedMap<U, number> = {} as KeyedMap<U, number>
  ) {
    this.pretext = pretext;
    const parametersPartial: Partial<KeyedMap<T, Parameter<T, U>>> = {};
    let key: keyof T;
    for (key in parameters) {
      if (parameters.hasOwnProperty(key)) {
        parametersPartial[key] = new Parameter(key, parameters[key], pretext);
      }
    }
    this.parameters = parametersPartial as KeyedMap<T, Parameter<T, U>>;

    this.parameterList = Object.values<Parameter<T, U>>(this.parameters);
  }

  private _generateExpressionMaps = (): ExpressionMap<T, U>[] => {
    const firstMapExpressions: Partial<KeyedMap<T, Expression<T, U>>> = {};

    const argumentList: Partial<KeyedMap<T, Expression<T, U>>>[] = [
      firstMapExpressions,
    ];

    for (const parameter of this.parameterList) {
      for (const expression of parameter.expressions) {
        if (!firstMapExpressions.hasOwnProperty(parameter.key)) {
          argumentList.forEach(arg => (arg[parameter.key] = expression));
        } else {
          argumentList.push(
            ...argumentList
              .filter(arg => arg[parameter.key] === parameter.expressions[0])
              .map(arg => ({
                ...arg,
                [parameter.key]: expression,
              }))
          );
          if (argumentList.length > Context.MAX_CARDINALITY) {
            console.error(this);
            throw new Error(
              `Max cardinality exceeded: ${Context.MAX_CARDINALITY}`
            );
          }
        }
      }
    }

    return argumentList.map(
      arg =>
        new ExpressionMap(arg as KeyedMap<T, Expression<T, U>>, this.pretext)
    );
  };

  evaluate = <V>(posttext: PretextInterface<V> = {} as PretextInterface<V>) =>
    this._generateExpressionMaps().map(expressionMap =>
      expressionMap.evaluate(posttext)
    );

  evaluateKey = (key: keyof T) =>
    this._generateExpressionMaps().map(expressionMap =>
      expressionMap.evaluateKey(key)
    );
}
