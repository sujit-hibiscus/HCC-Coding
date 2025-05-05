import { addDays, format, differenceInDays } from "date-fns";
import type { DashboardData, DailyData, AnalystData, PeriodMetrics } from "@/lib/types/dashboard";

// Helper function to generate random numbers
const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Generate analyst data
const generateAnalystData = (count: number): AnalystData[] => {
  const names = [
    "John Smith",
    "Sarah Johnson",
    "Michael Brown",
    "Emily Davis",
    "David Wilson",
    "Jessica Martinez",
    "Robert Taylor",
    "Jennifer Anderson",
    "William Thomas",
    "Lisa Jackson",
    "James White",
    "Mary Harris",
    "Joseph Martin",
    "Patricia Thompson",
    "Charles Garcia",
    "Linda Robinson",
  ];

  return Array.from({ length: count }).map((_, index) => {
    const dailyTarget = randomNumber(25, 40);
    const totalCharts = randomNumber(400, 600);
    const chartsPerDay = randomNumber(25, 40);
    const timePerDay = randomNumber(250, 450);
    const productivityPercent = Math.round((chartsPerDay / dailyTarget) * 100);
    const qualityScore = randomNumber(85, 99);

    return {
      name: names[index % names.length],
      dailyTarget,
      totalCharts,
      chartsPerDay,
      timePerDay,
      productivityPercent,
      qualityScore,
    };
  });
};

// Generate daily data
const generateDailyData = (startDate: Date, endDate: Date): DailyData[] => {
  const daysDiff = differenceInDays(endDate, startDate);
  const result: DailyData[] = [];

  for (let i = 0; i <= daysDiff; i++) {
    const currentDate = addDays(startDate, i);
    const dayNumber = daysDiff - i + 1;

    // Charts increase slightly over time
    const baseCharts = 25 + Math.floor(i * 0.5);
    const charts = randomNumber(baseCharts, baseCharts + 15);

    // Audits are slightly higher than charts
    const audits = randomNumber(charts, charts + 36);

    // Minutes spent on charts
    const minutes = randomNumber(250, 500);

    // Analyst and auditor time spent
    const analystTime = randomNumber(200, 400);
    const auditorTime = randomNumber(150, 350);

    result.push({
      day: format(currentDate, "dd MMM"),
      date: currentDate,
      dayNumber,
      charts,
      audits,
      minutes,
      analystTime,
      auditorTime,
    });
  }

  // Sort by day number (descending)
  return result.sort((a, b) => a.dayNumber - b.dayNumber);
};

// Generate period metrics
const generatePeriodMetrics = (multiplier: number): PeriodMetrics => {
  return {
    totalAssigned: randomNumber(400, 600) * multiplier,
    totalCompleted: randomNumber(350, 500) * multiplier,
    totalAudited: randomNumber(300, 450) * multiplier,
    averageDailyProductivity: randomNumber(25, 40),
    averageDailyTime: randomNumber(250, 450),
  };
};

// Main function to generate dashboard data
export const generateDashboardData = (startDate: Date, endDate: Date): DashboardData => {
  const dailyData = generateDailyData(startDate, endDate);
  const analysts = generateAnalystData(8);
  const auditors = generateAnalystData(5);

  // Calculate metrics
  const totalVolume = randomNumber(350000, 450000);
  const totalCompleted = randomNumber(5000, 7000);
  const averageDailyProductivity = randomNumber(250, 350);
  const estRemainingDays = Math.ceil((totalVolume - totalCompleted) / averageDailyProductivity);
  const qualityScore = randomNumber(88, 97);
  const totalAnalysts = analysts.length;
  const totalAuditors = auditors.length;

  // Generate period titles
  const currentYear = new Date().getFullYear();
  const yearToDateTitle = `Year To Date (${currentYear})`;

  const currentMonth = new Date();
  const currentMonthTitle = `Current Month (${format(currentMonth, "MMMM")})`;

  const selectedDurationTitle = `Selected (${format(startDate, "dd MMM")} - ${format(endDate, "dd MMM")})`;

  return {
    metrics: {
      totalVolume,
      totalCompleted,
      averageDailyProductivity,
      estRemainingDays,
      qualityScore,
      totalAnalysts,
      totalAuditors,
    },
    periodTitles: {
      yearToDateTitle,
      currentMonthTitle,
      selectedDurationTitle,
    },
    yearToDate: generatePeriodMetrics(3),
    currentMonth: generatePeriodMetrics(2),
    selectedDuration: generatePeriodMetrics(1),
    dailyData,
    analysts,
    auditors,
  };
};
