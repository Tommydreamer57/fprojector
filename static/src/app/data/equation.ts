import { Parameter, ParameterMap } from "@app/data/model-classes";
import { evaluate } from "mathjs";

export class Equation<T> {
  equation: string;
  parameters: ParameterMap<T>;
  scope: Readonly<{ [K in keyof T]: number }>;

  static clean = (equation: string) => equation.replace(/\s/g, "");

  constructor(equation: string, parameters: ParameterMap<T>) {
    this.equation = Equation.clean(equation);
    this.parameters = parameters;

    this.scope = this.getScopeObject();
  }

  toString = (): string => this.equation;

  getScopeObject = (): { [K in keyof T]: number } => {
    const scope: Partial<{ [K in keyof T]: number }> = {};
    for (const param of this.parameters.parametersList) {
      Object.assign(scope, param.getScopeObject());
    }
    return Object.freeze(scope as { [K in keyof T]: number });
  };

  evaluate = (): number => evaluate(this.equation, this.getScopeObject());
}
