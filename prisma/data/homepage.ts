/**
 * homepage.ts — Fake/mock data for the signed-in home dashboard
 *
 * Structured to match what real Prisma queries will eventually return.
 * When models are ready, replace each export with a server action call
 * that queries the actual database — the shape stays the same.
 */

// ─── QHSE Leading Indicators — line chart data ────────────────────────────────
export const leadingIndicatorsData = [
  { month: "Mar", riskAssessments: 18, observationCards: 12, toolboxTalks: 6,  workPermits: 2 },
  { month: "Apr", riskAssessments: 22, observationCards: 16, toolboxTalks: 8,  workPermits: 3 },
  { month: "May", riskAssessments: 26, observationCards: 20, toolboxTalks: 11, workPermits: 4 },
  { month: "Jun", riskAssessments: 30, observationCards: 24, toolboxTalks: 14, workPermits: 5 },
  { month: "Jul", riskAssessments: 34, observationCards: 28, toolboxTalks: 17, workPermits: 6 },
  { month: "Aug", riskAssessments: 40, observationCards: 33, toolboxTalks: 21, workPermits: 8 },
]

// ─── Attention Required — right sidebar list ──────────────────────────────────
export const attentionRequired = [
  { icon: "🚩", label: "High Risk Assessments",       value: 2, color: "text-red-500"    },
  { icon: "⏰", label: "Overdue Actions",              value: 3, color: "text-orange-500" },
  { icon: "🛡️", label: "Work Permits Expiring",        sub: "Within 7 days", value: 2, color: "text-amber-500" },
  { icon: "👁", label: "Observation Awaiting Review",  value: 1, color: "text-blue-500"   },
  { icon: "✅", label: "Critical Incidents",           value: 0, color: "text-emerald-500" },
]

// ─── Top stat cards ─────────────────────────────────────────────────────────
export const statCards = [
  { icon: "📋", label: "Open Actions",       value: "8",   sub: "3 Overdue",       subColor: "text-red-500",     link: "View all actions",     color: "bg-blue-50 text-blue-600" },
  { icon: "🛡️", label: "High-Risk Items",    value: "2",   sub: "Requires attention", subColor: "text-red-500",  link: "View all high-risk",   color: "bg-red-50 text-red-500" },
  { icon: "✅", label: "Observations Closed", value: "91%", sub: "Last 30 days",    subColor: "text-slate-400",   link: "View observations",    color: "bg-emerald-50 text-emerald-600" },
  { icon: "👥", label: "Toolbox Participation", value: "96%", sub: "Last 30 days",  subColor: "text-slate-400",   link: "View toolbox talks",   color: "bg-purple-50 text-purple-600" },
  { icon: "📄", label: "Active Work Permits", value: "7",   sub: "2 Expiring Soon", subColor: "text-amber-500",   link: "View permits",         color: "bg-indigo-50 text-indigo-600" },
]

// ─── Risk & Critical Controls Overview — donut chart ──────────────────────────
export const riskOverview = [
  { name: "Critical", value: 2,  color: "#ef4444" },
  { name: "High",     value: 5,  color: "#f97316" },
  { name: "Medium",   value: 14, color: "#eab308" },
  { name: "Low",      value: 32, color: "#22c55e" },
]

export const topRiskCategories = [
  { name: "Deck Operations",    value: 12 },
  { name: "Survey Operations",  value: 9  },
  { name: "Lifting Operations", value: 7  },
  { name: "Navigation",         value: 5  },
  { name: "Electrical",         value: 4  },
]

// ─── Safety Reporting Trend — stacked bar chart ───────────────────────────────
export const safetyReportingTrend = [
  { month: "Mar", positiveSafety: 8,  improvement: 4, unsafeCondition: 5, nearMiss: 3, stopWork: 1 },
  { month: "Apr", positiveSafety: 10, improvement: 5, unsafeCondition: 6, nearMiss: 4, stopWork: 1 },
  { month: "May", positiveSafety: 12, improvement: 6, unsafeCondition: 7, nearMiss: 4, stopWork: 2 },
  { month: "Jun", positiveSafety: 14, improvement: 7, unsafeCondition: 8, nearMiss: 5, stopWork: 2 },
  { month: "Jul", positiveSafety: 16, improvement: 8, unsafeCondition: 8, nearMiss: 5, stopWork: 3 },
  { month: "Aug", positiveSafety: 20, improvement: 9, unsafeCondition: 9, nearMiss: 6, stopWork: 3 },
]

// ─── Corrective Actions Status — donut chart ──────────────────────────────────
export const correctiveActionsStatus = [
  { name: "Closed",          value: 31, color: "#22c55e" },
  { name: "In Progress",     value: 6,  color: "#3b82f6" },
  { name: "Overdue",         value: 3,  color: "#f97316" },
  { name: "Critical Overdue", value: 2, color: "#ef4444" },
]

export const correctiveActionsClosedPercent = 74

// ─── IOGP Life-Saving Rules — related observations ────────────────────────────
export const lifeSavingRulesStats = [
  { icon: "🔥", label: "Line of Fire",           value: 8 },
  { icon: "🔌", label: "Energy Isolation",       value: 5 },
  { icon: "⚡", label: "Working at Height",      value: 3 },
  { icon: "🏗️", label: "Lifting Operations",     value: 3 },
  { icon: "🚫", label: "Bypassing Safety Controls", value: 2 },
  { icon: "🚪", label: "Confined Space",         value: 1 },
  { icon: "🍷", label: "Alcohol & Drugs",        value: 0 },
]

// ─── Recent QHSE Activity — table ──────────────────────────────────────────────
export const recentActivity = [
  { date: "10 Aug 2026 09:10", module: "Observation",     activity: "Near Miss submitted",        location: "Main Deck",   status: "Closed",    statusColor: "bg-emerald-50 text-emerald-600" },
  { date: "10 Aug 2026 08:35", module: "Toolbox Talk",     activity: "Side Scan Sonar Deployment", location: "Survey Deck", status: "Completed", statusColor: "bg-emerald-50 text-emerald-600" },
  { date: "09 Aug 2026 16:20", module: "Risk Assessment",  activity: "RA reviewed - USBL Operations", location: "Bridge Office", status: "Completed", statusColor: "bg-emerald-50 text-emerald-600" },
  { date: "09 Aug 2026 10:05", module: "Work Permit",      activity: "PTW issued - Working Aloft", location: "A-Frame Area", status: "Active",    statusColor: "bg-blue-50 text-blue-600" },
  { date: "08 Aug 2026 14:50", module: "Observation",      activity: "Unsafe Condition reported",  location: "Engine Room", status: "Action Open", statusColor: "bg-amber-50 text-amber-600" },
]

// ─── Top-level summary numbers ─────────────────────────────────────────────────
export const summaryStats = {
  fleetRiskVisibility: "360°",
  accessLevels:        "3",
  shipsTracked:         "∞",
}