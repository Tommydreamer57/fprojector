import { ParametrizedDataset } from "@app/data/model-classes";
import { v4 as uuid } from "uuid";

export const sampleDataset = new ParametrizedDataset({
  userId: uuid(),
  parameters: {
    starting_value: {
      parameterName: "Current Account Value",
      value: 48000,
    },
    base_salary: {
      parameterName: "Base Yearly Salary",
      value: 175000,
    },
    expected_raise: {
      parameterName: "Expected Raise Percentage",
      value: 7,
    },
    bonus_multiplier: {
      parameterName: "Bonus Multiplier",
      value: 12.5,
    },
  },
  accounts: [
    {
      accountName: "Sample account",
      startDate: "2024-11-01",
      startValueParameter: "base_salary",
      streams: [
        {
          streamName: "Primary Income",
          segments: [
            {
              segmentName: "Current Income",
              valueParameter: "base_salary / 12",
              frequencyInterval: "biweekly",
              expirationDate: "2025-03-01",
            },
            {
              segmentName: "Expected Raise",
              // value: (149000 / 26) * 1.07,
              valueParameter: "base_salary * (1 + expected_raise / 100) / 12", // need equation support here
              frequencyInterval: "biweekly",
            },
          ],
        },
        {
          streamName: "Bonus",
          segments: [
            {
              valueParameter: "base_salary * bonus_multiplier",
              frequencyInterval: "once",
              expirationIntervals: 1,
            },
          ],
        },
      ],
    },
  ],
});
