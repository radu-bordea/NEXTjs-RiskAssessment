import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { ownRecordsWhere } from "@/lib/recordAccess"
import WorkPermitTable, { type WorkPermitRow } from "./_components/WorkPermitTable"
import { MANUAL_PERMIT_CARD, PERMIT_TYPES } from "./_components/permitTypes"

/**
 * WorkPermitsDashboardPage — Work Permits dashboard
 *
 * Top: one card per permit form + "Manual Work Permit" (upload a PDF).
 * Bottom: table of all permits from the database — form-created and uploaded.
 *
 * ADMIN / MANAGER → all permits
 * MEMBER (vessel) → only the permits they created
 */
export default async function WorkPermitsDashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) redirect("/sign-in")

  const permits: WorkPermitRow[] = await prisma.workPermit.findMany({
    where: ownRecordsWhere(user),
    orderBy: [{ issueDate: "desc" }, { createdAt: "desc" }],
    select: {
      id:            true,
      permitNo:      true,
      type:          true,
      source:        true,
      state:         true,
      name:          true,
      issueDate:     true,
      vessel:        true,
      projectVoyage: true,
      pdfUrl:        true,
    },
  })

  const cardBase = "block rounded-xl border-2 bg-white dark:bg-slate-900 p-5 transition-all hover:shadow-md hover:-translate-y-0.5"

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
              Create a permit with a form, upload an existing PDF, or manage permits below.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-blue-900 dark:text-blue-400 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>

        {/* ── Permit cards: 3 forms + manual upload ──────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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

            return p.ready ? (
              <Link key={p.type} href={p.href} className={`${cardBase} ${p.cardStyle}`}>
                {content}
              </Link>
            ) : (
              <div
                key={p.type}
                className={`block rounded-xl border-2 bg-white dark:bg-slate-900 p-5 opacity-60 cursor-not-allowed ${p.cardStyle}`}
                aria-disabled="true"
              >
                {content}
              </div>
            )
          })}

          {/* Manual Work Permit — upload an existing PDF */}
          <Link href={MANUAL_PERMIT_CARD.href} className={`${cardBase} ${MANUAL_PERMIT_CARD.cardStyle}`}>
            <div className="flex items-start justify-between gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${MANUAL_PERMIT_CARD.iconStyle}`}>
                {MANUAL_PERMIT_CARD.icon}
              </div>
              <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                ⬆ Upload
              </span>
            </div>
            <h2 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
              {MANUAL_PERMIT_CARD.label}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {MANUAL_PERMIT_CARD.description}
            </p>
          </Link>
        </div>

        {/* ── Table ──────────────────────────────────────────────── */}
        <WorkPermitTable permits={permits} />
      </div>
    </div>
  )
}