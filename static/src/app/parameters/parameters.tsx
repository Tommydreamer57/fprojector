import { getInputContext, getMonthContext } from "@app/data/sample-data";

export const Parameters = () => {
  const monthContext = getMonthContext();
  const sampleData = getInputContext()
    .evaluate()
    .map(result => monthContext.evaluate(result.plainResult));

  console.log({ sampleData });

  return <div></div>;
};
