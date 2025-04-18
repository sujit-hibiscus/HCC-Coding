import { Icons } from "../Icons";

const {
  arrowUp: ArrowUpIcon, arrowDown: ArrowDownIcon
} = Icons;

export const categories = [
  {
    value: "income",
    label: "Income"
  },
  {
    value: "food",
    label: "Food"
  },
  {
    value: "utilities",
    label: "Utilities"
  },
  {
    value: "housing",
    label: "Housing"
  },
  {
    value: "health",
    label: "Health"
  },
  {
    value: "transport",
    label: "Transport"
  },
  {
    value: "work",
    label: "Work"
  },
  {
    value: "entertainment",
    label: "Entertainment"
  },
  {
    value: "education",
    label: "Education"
  },
  {
    value: "gifts",
    label: "Gifts"
  }
];

export const incomeType = [
  {
    label: "Income",
    value: "income",
    icon: ArrowUpIcon
  },
  {
    label: "Expense",
    value: "expense",
    icon: ArrowDownIcon
  }
];