import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import AnalyticsCharts from "./_components/AnalyticsCharts"
import AnalyticsFilters from "./_components/AnalyticsFilters"

/**
 * ProjectAnalyticsPage — /analytics
 *
 * Server component — fetches real counts and aggregates from all
 * live modules (Risk, Observation, SafetyMeeting). Work Permits
 * module isn't built yet, so it stays at 0 everywhere.
 *
 * Filters (date range + project/voyage name) come from URL search
 * params, set by the client-side AnalyticsFilters component. Since
 * this is a server component, changing filters triggers a fresh
 * server-side fetch — no stale/duplicated client data.
 *
 * Field name note: Risk uses `projectVoyage`, SafetyMeeting currently
 * uses `projectSurvey` (same concept, different name for historical
 * reasons — SafetyMeeting will be renamed to `projectVoyage` later
 * for consistency). Observation doesn't have this field yet.
 */
export default async function ProjectAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string; project?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { dateFrom, dateTo, project } = await searchParams

  // ─── Build shared date range filter ────────────────────────────────
  const dateFilter: { gte?: Date; lte?: Date } = {}
  if (dateFrom) dateFilter.gte = new Date(dateFrom)
  if (dateTo) dateFilter.lte = new Date(dateTo)
  const hasDateFilter = Object.keys(dateFilter).length > 0

  const projectSearch = project?.trim() ?? ""

  // ─── Risk — filtered by initiationDate + projectVoyage ────────────
  const riskWhere: any = {}
  if (hasDateFilter) riskWhere.initiationDate = dateFilter
  if (projectSearch) riskWhere.projectVoyage = { contains: projectSearch, mode: "insensitive" }

  const filteredRisks = await prisma.risk.findMany({
    where: riskWhere,
    select: { id: true, ref: true, projectVoyage: true, state: true, initiationDate: true, createdAt: true },
    orderBy: { initiationDate: "desc" },
  })

  // ─── Observation — filtered by date only (no projectVoyage field yet) ──
  const observationWhere: any = {}
  if (hasDateFilter) observationWhere.date = dateFilter
  // Note: no project field to filter by yet — if a project search is active,
  // Observation results are excluded entirely so filtered totals stay accurate
  // rather than silently including unfiltered rows.
  const filteredObservations = projectSearch
    ? []
    : await prisma.observation.findMany({
        where: observationWhere,
        select: { id: true, title: true, observationType: true, state: true, date: true, createdAt: true },
        orderBy: { date: "desc" },
      })

  // ─── SafetyMeeting — filtered by date + projectSurvey ─────────────
  const safetyMeetingWhere: any = {}
  if (hasDateFilter) safetyMeetingWhere.date = dateFilter
  if (projectSearch) safetyMeetingWhere.projectSurvey = { contains: projectSearch, mode: "insensitive" }

  const filteredSafetyMeetings = await prisma.safetyMeeting.findMany({
    where: safetyMeetingWhere,
    select: { id: true, projectSurvey: true, state: true, date: true, createdAt: true },
    orderBy: { date: "desc" },
  })

  // Toolbox Talk Cards — not date/project filterable (it's a reusable library, not per-event)
  const toolboxCardTotal = await prisma.toolboxTalkCard.count()

  // ─── Totals (post-filter) ───────────────────────────────────────────
  const riskTotal = filteredRisks.length
  const observationTotal = filteredObservations.length
  const safetyMeetingTotal = filteredSafetyMeetings.length

  // ─── Risk state breakdown — for pie chart ─────────────────────────
  const riskStateCounts: Record<string, number> = {}
  filteredRisks.forEach((r) => {
    riskStateCounts[r.state] = (riskStateCounts[r.state] ?? 0) + 1
  })
  const riskStateData = Object.entries(riskStateCounts).map(([name, value]) => ({ name, value }))

  // ─── Observation Type breakdown — for pie chart ───────────────────
  const observationTypeCounts: Record<string, number> = {}
  filteredObservations.forEach((o) => {
    const type = o.observationType ?? "Unspecified"
    observationTypeCounts[type] = (observationTypeCounts[type] ?? 0) + 1
  })
  const observationTypeData = Object.entries(observationTypeCounts).map(([name, value]) => ({ name, value }))

  // ─── Monthly trend — last 6 months, respects filters ──────────────
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

  const countInMonth = (records: { createdAt: Date }[], year: number, month: number) =>
    records.filter((r) => {
      const d = new Date(r.createdAt)
      return d.getFullYear() === year && d.getMonth() === month
    }).length

  const monthlyTrendData = monthLabels.map(({ label, year, month }) => ({
    month:            label,
    riskAssessments:  countInMonth(filteredRisks, year, month),
    observationCards: countInMonth(filteredObservations, year, month),
    toolboxTalks:     countInMonth(filteredSafetyMeetings, year, month),
    workPermits:      0, // module not built yet
  }))


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 md:px-10 py-10 font-sans">
      <div className="max-w-[1400px] mx-auto">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
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

        {/* ── Filters — date range + project/voyage search ─────────────── */}
        <AnalyticsFilters
          dateFrom={dateFrom ?? ""}
          dateTo={dateTo ?? ""}
          project={project ?? ""}
        />

        {/* ── Charts + Cards ─────────────────────────────────────────── */}
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