import { FrequencyEnum } from "@/app/data/model";
import { defineDataset } from "@/app/data/model-utils";
import { v4 as uuid } from "uuid";

export const sampleData = defineDataset({
  userId: uuid(),
  parameters: {
    starting_value: {
      parameterName: "Current Account Value",
      value: 48000,
    },
    base_salary: {
      parameterName: "Base Yearly Salary",
      value: 149000,
    },
    expected_raise: {
      parameterName: "Expected Raise Percentage",
      value: 7,
    },
  },
  accountData: ({ starting_value, base_salary, expected_raise }) => ({
    accountName: "Sample account",
    startDate: "2024-11-01",
    startValueParameter: starting_value,
    streams: [
      {
        streamName: "Primary Income",
        segments: [
          {
            segmentName: "Current Income",
            valueParameter: base_salary,
            frequencyInterval: FrequencyEnum.BIWEEKLY,
            expirationDate: "2025-03-01",
          },
          {
            segmentName: "Expected Raise",
            // value: (149000 / 26) * 1.07,
            valueParameter: expected_raise, // need equation support here
            frequencyInterval: FrequencyEnum.BIWEEKLY,
          },
        ],
      },
      {
        streamName: "Bonus",
        segments: [
          {
            valueParameter: base_salary,
            frequencyInterval: FrequencyEnum.ONCE,
            expirationIntervals: 1,
          },
        ],
      },
    ],
  }),
});
