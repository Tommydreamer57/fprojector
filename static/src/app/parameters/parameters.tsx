import { getSampleData } from "@app/data/sample-data";

export const Parameters = () => {
  const parameterGroups = [
    { name: "Visualization parameters", parameters: [] },
    { name: "Funding parameters", parameters: [] },
    { name: "Threshold parameters", parameters: [] },
    { name: "Cost parameters", parameters: [] },
    { name: "Benchmark parameters", parameters: [] },
  ];

  const sampleData = getSampleData();

  console.log({
    sampleData,
    result: sampleData.evaluate(),
  });

  return (
    <div>
      {parameterGroups.map(({ name, parameters }) => (
        <div key={name}>
          <h1>{name}</h1>
          <ul>
            {parameters.map(({}, i) => (
              <li key={i}></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
