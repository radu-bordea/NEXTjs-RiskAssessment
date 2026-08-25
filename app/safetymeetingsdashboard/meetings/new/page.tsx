import SafetyMeetingForm from "../../_components/SafetyMeetingForm"
import Link from "next/link"

/**
 * NewSafetyMeetingPage — Create a new Toolbox Talk
 *
 * No auth/role wiring yet — added once Prisma model is ready.
 */
export default function NewSafetyMeetingPage() {
  return (
    <div className="min-h-screen bg-[#fff8f8] dark:bg-slate-950 px-6 md:px-10 py-10 font-sans">
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

        <SafetyMeetingForm />
      </div>
    </div>
  )
}