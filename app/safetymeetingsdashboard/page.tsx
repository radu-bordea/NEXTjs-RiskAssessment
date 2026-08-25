import SafetyMeetingTable from "./_components/SafetyMeetingTable"

/**
 * SafetyMeetingsDashboardPage — Toolbox Talk dashboard
 *
 * Server component — will fetch from DB once Prisma model is wired up.
 * Currently uses fake data for UI development.
 */
export default function SafetyMeetingsDashboardPage() {

  /** Fake data — will be replaced with DB data after Prisma schema */
  const meetings = [
    {
      id:              "1",
      projectSurvey:   "North Sea Geophysical Survey",
      vesselInstallation: "OSV Explorer",
      activityTask:    "AUV Launch & Recovery",
      toolboxTalkLeader: "Alexandru Popescu",
      date:            new Date("2026-08-21"),
      state:           "DRAFT",
    },
    {
      id:              "2",
      projectSurvey:   "West Africa Pipeline Inspection",
      vesselInstallation: "MV Cargowave",
      activityTask:    "ROV Deployment",
      toolboxTalkLeader: "Anna Jones",
      date:            new Date("2026-08-18"),
      state:           "COMPLETED",
    },
  ]

  return (
    <div className="min-h-screen bg-[#fff8f8] dark:bg-slate-950">
      <SafetyMeetingTable meetings={meetings} />
    </div>
  )
}