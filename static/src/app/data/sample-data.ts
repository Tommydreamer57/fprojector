import { Context } from "@app/data/model-classes";
import * as _ from "lodash";

export const getInputContext = () =>
  new Context({
    starting_value: {
      name: "Starting Value",
      expressions: ["48000"],
    },
    base_salary: {
      name: "Base Salary",
      expressions: ["149000"],
    },
    monthly_salary: {
      name: "Monthly Salary",
      expressions: ["base_salary / 12"],
    },
    rent: {
      name: "Monthly Rent",
      expressions: ["900"],
    },
    other_expenses: {
      name: "Other Expenses",
      expressions: ["2500"],
    },
    total_expenses: {
      name: "Total Expenses",
      expressions: ["rent + other_expenses"],
    },
    monthly_investment: {
      name: "Monthly Investment",
      expressions: ["monthly_salary - total_expenses"],
    },
    interest_rate: {
      name: "Expected Interest Rate on Investments",
      expressions: ["0.07"],
    },
    home_cost: {
      name: "Home Cost",
      expressions: ["500000"],
      // expressions: _.range(400000, 600000, 50000).map(String),
    },
  });

export const getMonthContext = () => {
  return new Context({
    month: {
      name: "Month",
      expressions: _.range(1, 30).map(String),
    },
    account_value: {
      name: "Current Account Value",
      expressions: [
        "starting_value * (1 + interest_rate) ^ month + monthly_investment * ((1 + interest_rate) ^ month - 1) / interest_rate",
      ],
    },
  });
};
