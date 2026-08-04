import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import ObservationForm from "../../_components/ObservationForm"
import Image from "next/image"
import Link from "next/link"

/**
 * NewObservationPage — Create a new observation card
 *
 * Accessible to all authenticated roles.
 * All roles can create observation cards.
 */
export default async function NewObservationPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) redirect("/sign-in")

  return (
    <div className="min-h-screen bg-[#fffffa] dark:bg-slate-950 px-6 md:px-10 py-10 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* ── Back link ─────────────────────────────────────────────────── */}
        <Link
          href="/observationdashboard"
          className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 dark:text-amber-400 mb-6 transition-colors"
        >
          ← Back to Observations
        </Link>

        {/* ── QHSE Card Header — matches physical form ───────────────────── */}
        <div className="rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm mb-6 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 flex-wrap gap-4">

            {/* Left — Logo + company name */}
            <div className="flex items-center gap-3">
              <Image
                src="/assets/images/logo2.png"
                alt="MMI-QHSE"
                width={50}
                height={50}
                className="object-cover rounded-full w-12 h-12"
              />
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-white tracking-wide">
                  MMI-QHSE
                </p>
                <p className="text-xs text-slate-400">Marine | Offshore | Survey</p>
                <p className="text-xs text-slate-400">
                  Safety · Quality · Health · Environment
                </p>
              </div>
            </div>

            {/* Center — Title */}
            <div className="text-center flex-1">
              <h1 className="text-xl font-extrabold tracking-wide text-slate-700 dark:text-white uppercase">
                QHSE Observation Card
              </h1>
              <p className="text-xs text-slate-400 tracking-widest mt-0.5 uppercase">
                Observe — Care — Act — Prevent
              </p>
            </div>

          </div>
        </div>

        {/* ── Observation Form ───────────────────────────────────────────── */}
        <ObservationForm currentUser={user} />

      </div>
    </div>
  )
}