import {
  ArgumentsInterface,
  EvaluatedExpressionInterface,
  EvaluatedExpressionMapInterface,
  ExpressionInterface,
  ExpressionMapInterface,
  KeyedMap,
  ParameterInterface,
  ParameterMapInterface,
} from "@app/data/model";
import * as mathjs from "mathjs";

const MAX_CARDINALITY = 100;

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
  args: Partial<KeyedMap<T, number>>,
  dependencies: (keyof T)[]
): void => {
  for (const key of dependencies) {
    if (!(key in args)) {
      throw new Error(
        `Scope object missing key: "${String(key)}": ["${Object.keys(args).join(
          '", "'
        )}"]`
      );
    }
  }
};

class EvaluatedExpression<T> implements EvaluatedExpressionInterface<T> {
  key: keyof T;
  name: string;
  dependencies: (keyof T)[];
  expression: string;
  arguments: ArgumentsInterface<T>;
  value: number;

  constructor(
    expression: Expression<T>,
    args: Partial<KeyedMap<T, EvaluatedExpression<T>>>
  ) {
    this.key = expression.key;
    this.name = expression.name;
    this.expression = expression.expression;
    this.arguments = this._convertArguments(args);

    this.dependencies = getDependenciesFromExpression(
      this.expression
    ) as (keyof T)[];

    validateScopeObject(this.arguments, this.dependencies);

    this.value = mathjs.evaluate(this.expression, this.arguments);
  }

  private _convertArguments = (
    args: Partial<KeyedMap<T, EvaluatedExpression<T>>>
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

  toString = () => `"${String(this.key)}" = ${this.expression}`;
}

class Expression<T> implements ExpressionInterface<T> {
  key: keyof T;
  name: string;
  dependencies: (keyof T)[];
  expression: string;

  constructor(parameter: Parameter<T>, expression: string) {
    this.key = parameter.key;
    this.name = parameter.name;
    this.expression = expression;

    this.dependencies = getDependenciesFromExpression(
      this.expression
    ) as (keyof T)[];
  }

  evaluate = (
    args: Partial<KeyedMap<T, EvaluatedExpression<T>>> = {}
  ): EvaluatedExpression<T> => new EvaluatedExpression(this, args);
}

type ParameterArgumentInterface<T> = Omit<
  ParameterInterface<T>,
  "key" | "dependencies" | "expressions"
> & {
  expressions: string[];
};

class Parameter<T> implements ParameterInterface<T> {
  key: keyof T;
  name: string;
  dependencies: (keyof T)[];
  expressions: Expression<T>[];

  constructor(
    key: keyof T,
    { name, expressions }: ParameterArgumentInterface<T>
  ) {
    this.key = key;
    this.name = name;
    this.expressions = expressions.map(exp => new Expression(this, exp));

    this.dependencies = [];

    this.expressions.forEach(exp =>
      this.dependencies.push(
        ...exp.dependencies.filter(dep => !this.dependencies.includes(dep))
      )
    );
  }
}

class ResultMap<T> implements EvaluatedExpressionMapInterface<T> {
  expressions: KeyedMap<T, EvaluatedExpression<T>>;

  plainResult: KeyedMap<T, number>;

  constructor(expressions: KeyedMap<T, EvaluatedExpression<T>>) {
    this.expressions = expressions;

    this.plainResult = this._getPlainResult();
  }

  private _getPlainResult = (): KeyedMap<T, number> => {
    const result: Partial<KeyedMap<T, number>> = {};
    let key: keyof T;
    for (key in this.expressions) {
      result[key] = this.expressions[key].value;
    }
    return result as KeyedMap<T, number>;
  };
}

class ExpressionMap<T> implements ExpressionMapInterface<T> {
  expressions: KeyedMap<T, Expression<T>>;

  constructor(expressions: KeyedMap<T, Expression<T>>) {
    this.expressions = expressions;
  }

  private _evaluateKey = (
    key: keyof T,
    stackedKeys: (keyof T)[] = [],
    evaluatedKeys: Partial<KeyedMap<T, EvaluatedExpression<T>>> = {}
  ): EvaluatedExpression<T> => {
    // Check for circular dependencies
    if (stackedKeys.includes(key)) {
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
    const copy = { ...evaluatedKeys };
    for (const dependencyKey of expression.dependencies) {
      // Recursion
      const dependencyResult = this._evaluateKey(
        dependencyKey,
        [...stackedKeys, key],
        copy
      );
      copy[dependencyKey] = dependencyResult;
    }
    return expression.evaluate(copy);
  };

  evaluateKey = (key: keyof T): EvaluatedExpression<T> =>
    this._evaluateKey(key);

  private _evaluate = () => {
    const expressionsPartial: Partial<KeyedMap<T, EvaluatedExpression<T>>> = {};
    let key: keyof T;
    for (key in this.expressions) {
      if (this.expressions.hasOwnProperty(key)) {
        expressionsPartial[key] = this.evaluateKey(key);
      }
    }
    return new ResultMap(
      expressionsPartial as KeyedMap<T, EvaluatedExpression<T>>
    );
  };

  evaluate = () => this._evaluate();
}

export class ParameterMap<T> implements ParameterMapInterface<T> {
  parameters: KeyedMap<T, Parameter<T>>;
  parameterList: Parameter<T>[];

  static MAX_CARDINALITY: number = MAX_CARDINALITY;

  constructor(parameters: KeyedMap<T, ParameterArgumentInterface<T>>) {
    const parametersPartial: Partial<KeyedMap<T, Parameter<T>>> = {};
    let key: keyof T;
    for (key in parameters) {
      if (parameters.hasOwnProperty(key)) {
        parametersPartial[key] = new Parameter(key, parameters[key]);
      }
    }
    this.parameters = parametersPartial as KeyedMap<T, Parameter<T>>;

    this.parameterList = Object.values(this.parameters);
  }

  private _generateExpressionMaps = (): ExpressionMap<T>[] => {
    const firstMapExpressions: Partial<KeyedMap<T, Expression<T>>> = {};

    const argumentList: Partial<KeyedMap<T, Expression<T>>>[] = [
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
          if (argumentList.length > ParameterMap.MAX_CARDINALITY) {
            throw new Error(
              `Max cardinality exceeded: ${ParameterMap.MAX_CARDINALITY}`
            );
          }
        }
      }
    }

    return argumentList.map(
      arg => new ExpressionMap(arg as KeyedMap<T, Expression<T>>)
    );
  };

  evaluate = () =>
    this._generateExpressionMaps().map(expressionMap =>
      expressionMap.evaluate()
    );
}
