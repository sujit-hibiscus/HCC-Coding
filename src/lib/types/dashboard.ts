export interface DashboardMetrics {
    totalVolume: number
    totalCompleted: number
    averageDailyProductivity: number
    estRemainingDays: number
}

export interface PeriodMetrics {
    totalAssigned: number
    totalCompleted: number
    averageDailyProductivity: number
    averageDailyTime: number
}

export interface DailyData {
    day: string
    date: Date
    dayNumber: number
    charts: number
    audits: number
    minutes: number
}

export interface AnalystData {
    name: string
    dailyTarget: number
    totalCharts: number
    chartsPerDay: number
    timePerDay: number
}

export interface PeriodTitles {
    yearToDateTitle: string
    currentMonthTitle: string
    selectedDurationTitle: string
}

export interface DashboardData {
    metrics: DashboardMetrics
    periodTitles: PeriodTitles
    yearToDate: PeriodMetrics
    currentMonth: PeriodMetrics
    selectedDuration: PeriodMetrics
    dailyData: DailyData[]
    analysts: AnalystData[]
    auditors: AnalystData[]
}
