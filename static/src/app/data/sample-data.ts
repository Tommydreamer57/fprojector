import { ParameterMap } from "@app/data/model-classes";

export const getSampleData = () =>
  new ParameterMap({
    months_to_project: {
      name: "Months to project",
      expressions: [""],
    },
    starting_value: {
      name: "Starting Value",
      expressions: ["48000"],
    },
    base_salary: {
      name: "Base Salary",
      expressions: ["149000", "200000"],
    },
    monthly_salary: {
      name: "Monthly Salary",
      expressions: ["base_salary / 12"],
    },
    rent: {
      name: "Monthly Rent",
      expressions: ["900", "1200"],
    },
    other_expenses: {
      name: "Other Expenses",
      expressions: ["2500"],
    },
    total_expenses: {
      name: "Total Expenses",
      expressions: ["rent"],
    },
    monthly_investment: {
      name: "Monthly Investment",
      expressions: ["monthly_salary - total_expenses"],
    },
    home_cost: {
      name: "Home Cost",
      expressions: [
        "400000",
        "450000",
        "500000",
        "550000",
        "600000",
        "650000",
        "700000",
      ],
    },
  });
