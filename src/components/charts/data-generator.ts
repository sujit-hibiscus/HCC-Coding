import { differenceInDays, format, addDays } from "date-fns";

const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const generateChartData = (startDate: Date, endDate: Date) => {
  const daysDiff = differenceInDays(endDate, startDate);

  const dosDates: Date[] = [];
  for (let i = 0; i <= daysDiff; i++) {
    dosDates.push(addDays(startDate, i));
  }

  const dosLabels = dosDates.map((date) => format(date, "MMM dd"));

  const chartsVolume = dosLabels.map((name, index) => ({
    name,
    date: format(dosDates[index], "yyyy-MM-dd"),
    Draft: randomNumber(5, 25),
    Pending: randomNumber(5, 20),
    "Provider Review": randomNumber(10, 30),
    Closed: randomNumber(15, 35),
  }));

  const hccVolume = dosLabels.map((name, index) => ({
    name,
    date: format(dosDates[index], "yyyy-MM-dd"),
    Opportunities: randomNumber(50, 200),
    "Carry Forward": randomNumber(100, 400),
  }));

  const hccVersions = dosLabels.map((name, index) => ({
    name,
    date: format(dosDates[index], "yyyy-MM-dd"),
    V24: {
      Suggested: randomNumber(10, 50),
      CarryForward: randomNumber(10, 30),
    },
    V28: {
      Suggested: randomNumber(10, 40),
      CarryForward: randomNumber(10, 25),
    },
  }));

  const codeCount = 10;

  const floridaNames = [
    "Ava Martinez",
    "Jackson Lee",
    "Isabella Torres",
    "Liam Johnson",
    "Sophia Hernandez",
    "Noah Smith",
    "Mia Gonzalez",
    "Elijah Rivera",
    "Charlotte Perez",
    "Mateo Robinson",
    "Amelia Carter",
    "Sebastian Ramirez",
    "Harper Lewis",
    "Lucas Walker",
    "Evelyn Hall",
    "James Allen",
    "Victoria Scott",
    "Benjamin Young",
    "Aria King",
    "Logan Adams",
  ];

  const shuffledNames = floridaNames.sort(() => 0.5 - Math.random()).slice(0, codeCount);

  const hccRealCodesV24 = [
    "HCC 85 - Congestive Heart Failure",
    "HCC 19 - Diabetes without Complication",
    "HCC 111 - Chronic Obstructive Pulmonary Disease",
    "HCC 12 - Breast, Prostate, and Other Cancers",
    "HCC 18 - Diabetes with Complications",
    "HCC 108 - Vascular Disease",
    "HCC 96 - Specified Heart Arrhythmias",
    "HCC 51 - Dementia with Complications",
    "HCC 22 - Morbid Obesity",
    "HCC 46 - Severe Hematological Disorders",
  ];

  const hccRealCodesV28 = [
    "HCC 222 - Congestive Heart Failure",
    "HCC 134 - Type 2 Diabetes Without Complication",
    "HCC 208 - Chronic Obstructive Pulmonary Disease",
    "HCC 105 - Breast Cancer",
    "HCC 135 - Type 2 Diabetes With Complication",
    "HCC 217 - Peripheral Artery Disease",
    "HCC 226 - Atrial Fibrillation",
    "HCC 131 - Dementia with Behavioral Disturbance",
    "HCC 260 - Severe Obesity",
    "HCC 239 - Hematologic Malignancy",
  ];

  const topCodesV24 = hccRealCodesV24.map((name) => ({
    name,
    value: randomNumber(5, 20),
  }));

  const topCodesV28 = hccRealCodesV28.map((name) => ({
    name,
    value: randomNumber(5, 20),
  }));

  const topProviders = shuffledNames.map((name) => ({
    name,
    date: format(new Date(), "yyyy-MM-dd"), // Current date or customize per use-case
    V24: {
      Suggested: randomNumber(10, 50),
      CarryForward: randomNumber(10, 30),
    },
    V28: {
      Suggested: randomNumber(10, 40),
      CarryForward: randomNumber(10, 25),
    },
  }));

  return {
    chartsVolume,
    hccVolume,
    topProviders,
    hccVersions,
    topCodesV24,
    topCodesV28,
  };
};
