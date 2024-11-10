import { getInputContext, getMonthContext } from "@app/data/sample-data";
import { Graph } from "@app/parameters/graph";
import { Section } from "@app/parameters/section";
import { ExpressionTable } from "@app/parameters/table";

export const Parameters = () => {
  const monthContext = getMonthContext();
  const inputContext = getInputContext();
  const inputData = inputContext.evaluate();

  console.log({
    monthContext,
    inputData,
  });

  const monthlyData = inputData.map(dataset =>
    monthContext.evaluate(dataset.plainResult).map(result => result.plainResult)
  );

  return (
    <div>
      <Section title="Input Parameters">
        <ExpressionTable
          expressions={inputContext.parameterList.map(
            ({ key, name, expressions }) => ({
              key,
              name,
              expressions: expressions.map(exp => exp.expression),
            })
          )}
        />
      </Section>
      <Section title="Monthly Parameters">
        <ExpressionTable
          expressions={monthContext.parameterList
            .filter(({ key }) => key !== "month")
            .map(({ key, name, expressions }) => ({
              key,
              name,
              expressions: expressions.map(exp => exp.expression),
            }))}
        />
      </Section>
      {[
        ["Account Value over Time", "account_value"],
        ["Percent Down over Time", "percent_down"],
        [
          "Percent of Income Spent on Mortgage over Time",
          "mortgage_percent_of_income",
        ],
      ].map(([title, key]) => (
        <Section title={title} key={title}>
          <Graph
            key={title}
            monthlyData={monthlyData}
            inputData={inputData}
            yAxisKey={key}
            labels={monthContext.parameters.month.expressions.map(
              exp => exp.expression
            )}
          />
        </Section>
      ))}
    </div>
  );
};
