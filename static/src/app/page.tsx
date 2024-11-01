import { sampleDataset } from "@app/data/sample-data";

export default function Home() {
  const { parameters, accounts } = sampleDataset;
  return (
    <div>
      {accounts.map(
        ({
          accountName,
          startValueParameter,
          streams,
          evaluatedStartValue,
        }) => (
          <div>
            <h1>Account: "{accountName}"</h1>
            <h2>
              "{startValueParameter}" = {evaluatedStartValue}
            </h2>
            <h3>Streams</h3>
            <ul>
              {streams.map(({ streamName, segments }) => (
                <li>
                  <h4>{streamName}</h4>
                  <ul>
                    {segments.map(
                      ({ segmentName, valueParameter, evaluatedValue }) => (
                        <li>
                          <h5>{segmentName}</h5>
                          <span>
                            "{valueParameter}" = {evaluatedValue}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  );
}
