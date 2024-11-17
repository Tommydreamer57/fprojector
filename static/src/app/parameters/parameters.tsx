import { Section } from "@app/components/section";
import {
  InputContext,
  InputResult,
} from "@app/data/parameters/input-parameters";
import { MonthlyContext } from "@app/data/parameters/monthly-parameters";
import { ExpressionTable } from "@app/parameters/expression-table";
import { groupBy } from "@utils/group";
import { createSort } from "@utils/sort";
import * as _ from "lodash";

interface ParametersProps {
  monthlyContext: MonthlyContext;
  inputContext: InputContext;
  inputData: InputResult[];
}

type ParameterGroup = "comparison" | "constant" | "calculated";

export const Parameters = ({
  monthlyContext,
  inputContext,
  inputData,
}: ParametersProps) => {
  const parameterGroups = groupBy(
    inputContext.parameterList,
    (param): ParameterGroup =>
      param.cardinality > 1
        ? "comparison"
        : param.constant
        ? "constant"
        : "calculated"
  );

  const tables: [string, ParameterGroup][] = [
    ["Comparison Parameters", "comparison"],
    ["Constant Parameters", "constant"],
    ["Calculated Parameters", "calculated"],
  ];

  return (
    <>
      {tables.map(([title, group]) => (
        <Section key={title} title={title}>
          <ExpressionTable
            expressions={parameterGroups[group]
              .slice()
              .sort(
                createSort(
                  param => param.cardinality
                  // param => (param.constant ? 1 : 0),
                  // param => {
                  //   switch (param.type) {
                  //     case "currency":
                  //       return 0;
                  //     case "percentage":
                  //       return -1;
                  //     case "integer":
                  //       return -2;
                  //   }
                  // }
                )
              )
              .map(({ key, name, type, expressions }) => ({
                key,
                name,
                type,
                expressions: expressions.map(exp => exp.expression),
                results: [
                  ...new Set(
                    inputData.map(
                      ({ expressions: { [key]: exp } }) => exp.textValue
                    )
                  ),
                ],
              }))}
          />
        </Section>
      ))}
      <Section title="Monthly Parameters">
        <ExpressionTable
          expressions={monthlyContext.parameterList
            .filter(({ key }) => key !== "month")
            .map(({ key, name, type, expressions }) => ({
              key,
              name,
              type,
              expressions: expressions.map(exp => exp.expression),
              results: [],
            }))}
          excludeColumns={["results"]}
        />
      </Section>
    </>
  );
};
