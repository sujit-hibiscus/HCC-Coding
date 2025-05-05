import { ReactNode } from "react";

export interface DashboardMetrics {
    totalVolume: number
    totalCompleted: number
    averageDailyProductivity: number
    estRemainingDays: number
    qualityScore: number
    totalAnalysts: number
    totalAuditors: number
}

export interface PeriodMetrics {
    totalAssigned: number
    totalCompleted: number
    totalAudited: number
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
    analystTime: number
    auditorTime: number
}

export interface AnalystData {
    [x: string]: ReactNode
    name: string
    dailyTarget: number
    totalCharts: number
    chartsPerDay: number
    timePerDay: number
    productivityPercent: number
    qualityScore: number
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