import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import AnalyticsCharts from "./_components/AnalyticsCharts"

/**
 * ProjectAnalyticsPage — /analytics
 *
 * Server component — fetches real counts and aggregates from all
 * 3 live modules (Risk, Observation, SafetyMeeting).
 * More charts/cards will be added incrementally as the client
 * requests them.
 */
export default async function ProjectAnalyticsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  // ─── Totals ────────────────────────────────────────────────────────
  const riskTotal = await prisma.risk.count()
  const observationTotal = await prisma.observation.count()
  const safetyMeetingTotal = await prisma.safetyMeeting.count()
  const toolboxCardTotal = await prisma.toolboxTalkCard.count()

  // ─── Risk state breakdown — for pie chart ─────────────────────────
  const risks = await prisma.risk.findMany({
    select: { state: true },
  })
  const riskStateCounts: Record<string, number> = {}
  risks.forEach((r) => {
    riskStateCounts[r.state] = (riskStateCounts[r.state] ?? 0) + 1
  })
  const riskStateData = Object.entries(riskStateCounts).map(
    ([name, value]) => ({ name, value })
  )

  // ─── Observation Type breakdown — for pie chart ───────────────────
  const observations = await prisma.observation.findMany({
    select: { observationType: true },
  })
  const observationTypeCounts: Record<string, number> = {}
  observations.forEach((o) => {
    const type = o.observationType ?? "Unspecified"
    observationTypeCounts[type] = (observationTypeCounts[type] ?? 0) + 1
  })
  const observationTypeData = Object.entries(observationTypeCounts).map(
    ([name, value]) => ({ name, value })
  )

  // ─── Monthly trend — last 6 months, all modules ───────────────────
  /**
   * Build the last 6 months as labels (e.g. "Mar", "Apr", ... "Aug")
   * and count how many records of each type were created in each month.
   * Work Permits stays at 0 since that module isn't built yet.
   */
  const now = new Date()
  const monthLabels: { label: string; year: number; month: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthLabels.push({
      label: d.toLocaleDateString("en-GB", { month: "short" }),
      year:  d.getFullYear(),
      month: d.getMonth(),
    })
  }

  // Fetch createdAt for all records in each module
  const [allRisks, allObservations, allSafetyMeetings] = await Promise.all([
    prisma.risk.findMany({ select: { createdAt: true } }),
    prisma.observation.findMany({ select: { createdAt: true } }),
    prisma.safetyMeeting.findMany({ select: { createdAt: true } }),
  ])

  /** Counts how many items in `records` fall in the given year/month */
  const countInMonth = (records: { createdAt: Date }[], year: number, month: number) =>
    records.filter((r) => {
      const d = new Date(r.createdAt)
      return d.getFullYear() === year && d.getMonth() === month
    }).length

  const monthlyTrendData = monthLabels.map(({ label, year, month }) => ({
    month:            label,
    riskAssessments:  countInMonth(allRisks, year, month),
    observationCards: countInMonth(allObservations, year, month),
    toolboxTalks:     countInMonth(allSafetyMeetings, year, month),
    workPermits:      0, // module not built yet
  }))

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 md:px-10 py-10 font-sans">
      <div className="max-w-[1400px] mx-auto">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-medium mb-2">
              Project Analytics
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              Cross-Module Overview
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Real-time data across Risk Assessment, Observation Cards, and Safety Meetings.
            </p>
          </div>
          <Link
            href="/"
            className="text-xs px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors font-medium"
          >
            ← Home
          </Link>
        </div>

        {/* ── Charts + Cards — client component for recharts ──────────── */}
        <AnalyticsCharts
          riskTotal={riskTotal}
          observationTotal={observationTotal}
          safetyMeetingTotal={safetyMeetingTotal}
          toolboxCardTotal={toolboxCardTotal}
          riskStateData={riskStateData}
          observationTypeData={observationTypeData}
          monthlyTrendData={monthlyTrendData}
        />

      </div>
    </div>
  )
}