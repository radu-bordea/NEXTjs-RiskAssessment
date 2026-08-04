import ObservationTable from "./_components/ObservationTable"

/**
 * ObservationDashboardPage — Observation Card dashboard
 *
 * Server component — fetches observations from DB.
 * Currently uses fake data — will connect to DB after schema is built.
 */
export default function ObservationDashboardPage() {

  /** Fake data — will be replaced with DB data after Prisma schema */
  const observations = [
    {
      id:            "1",
      title:         "Unsafe Condition on Deck",
      description:   "Loose equipment found near crane operations area. Immediate risk of falling objects.",
      vesselProject: "MV Atlantic Star",
      observerName:  "John Smith",
      date:          new Date("2026-06-10"),
      status:        "DRAFT",
    },
    {
      id:            "2",
      title:         "Near Miss - Working at Height",
      description:   "Crew member nearly fell while performing maintenance without proper harness.",
      vesselProject: "MV Nordvik",
      observerName:  "Anna Jones",
      date:          new Date("2026-06-03"),
      status:        "COMPLETED",
    },
    {
      id:            "3",
      title:         "Environmental Observation",
      description:   "Oil spill detected near engine room bilge outlet during routine inspection.",
      vesselProject: "MV Cargowave",
      observerName:  "Mike Davis",
      date:          new Date("2026-05-28"),
      status:        "DRAFT",
    },
  ]

  return (
    <div className="min-h-screen bg-[#fffffa] dark:bg-slate-950">
      <ObservationTable observations={observations} />
    </div>
  )
}