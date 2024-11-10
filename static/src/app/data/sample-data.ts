import { Context } from "@app/data/model-classes";
import * as _ from "lodash";

export const getInputContext = () =>
  new Context({
    starting_value: {
      name: "Starting value",
      expressions: ["48000"],
    },
    base_salary: {
      name: "Base salary",
      expressions: ["149000"],
    },
    monthly_salary: {
      name: "Monthly salary",
      expressions: ["base_salary / 12"],
    },
    rent: {
      name: "Monthly rent",
      expressions: ["900"],
    },
    taxes: {
      name: "Estimated taxes",
      expressions: ["base_salary * 0.3"],
    },
    monthly_taxes: {
      name: "Estimated monthly taxes",
      expressions: ["taxes / 12"],
    },
    other_expenses: {
      name: "Other expenses",
      expressions: ["6000"],
    },
    total_expenses: {
      name: "Total expenses",
      expressions: ["rent + monthly_taxes + other_expenses"],
    },
    monthly_investment: {
      name: "Monthly investment",
      expressions: ["monthly_salary - total_expenses"],
    },
    unnaccounted_funds: {
      name: "Funds unaccounted for by expenses",
      expressions: ["monthly_salary - total_expenses - monthly_investment"],
    },
    interest_rate: {
      name: "Expected interest rate on investments",
      expressions: ["0.07"],
    },
    mortgage_interest: {
      name: "Mortgage interest rate",
      expressions: ["0.0689"],
    },
    emergency_fund: {
      name: "Emergency fund",
      expressions: ["50000"],
    },
    home_cost: {
      name: "Home cost",
      expressions: ["500000", "400000"],
      // expressions: _.range(400000, 600000, 50000).map(String),
    },
    mortgage_term: {
      name: "Mortgage term",
      expressions: ["30"],
    },
  });

export const getMonthContext = () => {
  return new Context({
    month: {
      name: "Month",
      expressions: _.range(0, 30).map(String),
    },
    account_value: {
      name: "Current account value",
      expressions: [
        "starting_value * (1 + interest_rate) ^ month + monthly_investment * ((1 + interest_rate) ^ month - 1) / interest_rate",
      ],
    },
    down_payment: {
      name: "Down payment",
      expressions: ["account_value - emergency_fund"],
    },
    percent_down: {
      name: "Percent down",
      expressions: ["down_payment / home_cost"],
    },
    mortgage_value: {
      name: "Mortgage loan value",
      expressions: ["home_cost - down_payment"],
    },
    mortgage_payments: {
      name: "Mortgage payments",
      expressions: [
        "mortgage_value * mortgage_interest / (1 - (1 + mortgage_interest) ^ -mortgage_term)",
      ],
    },
    mortgage_percent_of_income: {
      name: "Percentage of income spent on mortgage",
      expressions: ["mortgage_payments / monthly_salary"],
    },
  });
};
