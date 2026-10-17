import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import SafetyMeetingForm from "../../_components/SafetyMeetingForm"
import Link from "next/link"

/**
 * NewSafetyMeetingPage — Create a new Toolbox Talk
 *
 * Server component: gets the logged-in user and passes their name to the
 * form as the VESSEL (read-only — each vessel logs in with its own account).
 */
export default async function NewSafetyMeetingPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, name: true, email: true },
  })
  if (!user) redirect("/sign-in")

  return (
    <div className="min-h-screen bg-[#f5f8ff] dark:bg-slate-950 px-6 md:px-10 py-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/safetymeetingsdashboard"
          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 dark:text-red-400 mb-6 transition-colors"
        >
          ← Back to Toolbox Talks
        </Link>

        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-red-600 dark:text-red-400 font-medium mb-2">
            New Toolbox Talk
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Task & Project Information
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Guided briefing for survey, offshore and AUV/USV operations.
          </p>
        </div>

        <SafetyMeetingForm
          currentUser={{ id: user.id, role: user.role }}
          vesselName={user.name ?? user.email}
        />
      </div>
    </div>
  )
}