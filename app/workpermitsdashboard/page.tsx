import Link from "next/link"
import WorkPermitTable, { type WorkPermitRow } from "./_components/WorkPermitTable"
import { PERMIT_TYPES } from "./_components/permitTypes"

/**
 * WorkPermitsDashboardPage — Work Permits dashboard
 *
 * Top: one button (card) per permit type, each opens its own form.
 * Bottom: table of all permits.
 * Currently uses fake data — will connect to DB after the Prisma schema.
 * Blue theme.
 */
export default function WorkPermitsDashboardPage() {

  /** Fake data — will be replaced with DB data after Prisma schema */
  const permits: WorkPermitRow[] = [
    {
      id: "1",
      permitNo: "HW-2026-001",
      type: "HOT_WORK",
      vessel: "MV Atlantic Star",
      projectVoyage: "Survey 2026-14",
      location: "Engine Room – Workshop",
      validFrom: new Date("2026-10-07T08:00"),
      validTo: new Date("2026-10-07T16:00"),
      state: "ACTIVE",
    },
    {
      id: "2",
      permitNo: "HW-2026-002",
      type: "HOT_WORK",
      vessel: "MV Nordvik",
      projectVoyage: "Survey 2026-14",
      location: "Main Deck – A-Frame",
      validFrom: new Date("2026-10-06T09:00"),
      validTo: new Date("2026-10-06T15:00"),
      state: "CLOSED",
    },
    {
      id: "3",
      permitNo: "CS-2026-001",
      type: "CONFINED_SPACE",
      vessel: "MV Cargowave",
      projectVoyage: null,
      location: "Ballast Tank 3P",
      validFrom: new Date("2026-10-05T07:30"),
      validTo: new Date("2026-10-05T15:30"),
      state: "EXPIRED",
    },
    {
      id: "4",
      permitNo: "WA-2026-001",
      type: "WORKING_ALOFT",
      vessel: "MV Atlantic Star",
      projectVoyage: "Cable route NO-3",
      location: "Foremast",
      validFrom: new Date("2026-10-08T08:00"),
      validTo: new Date("2026-10-08T12:00"),
      state: "DRAFT",
    },
  ]

  return (
    <div className="min-h-screen bg-[#fffffa] dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
              📝 Work Permits
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Choose a permit type to create a new permit, or manage existing permits below.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-blue-900 dark:text-blue-400 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>

        {/* ── Permit type buttons ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {PERMIT_TYPES.map((p) => {
            const content = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${p.iconStyle}`}>
                    {p.icon}
                  </div>
                  {p.ready ? (
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                      + New
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      Coming soon
                    </span>
                  )}
                </div>
                <h2 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
                  {p.label}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {p.description}
                </p>
              </>
            )

            const base = `block rounded-xl border-2 bg-white dark:bg-slate-900 p-5 transition-all ${p.cardStyle}`

            return p.ready ? (
              <Link key={p.type} href={p.href} className={`${base} hover:shadow-md hover:-translate-y-0.5`}>
                {content}
              </Link>
            ) : (
              <div key={p.type} className={`${base} opacity-60 cursor-not-allowed`} aria-disabled="true">
                {content}
              </div>
            )
          })}
        </div>

        {/* ── Table ──────────────────────────────────────────────── */}
        <WorkPermitTable permits={permits} />
      </div>
    </div>
  )
}