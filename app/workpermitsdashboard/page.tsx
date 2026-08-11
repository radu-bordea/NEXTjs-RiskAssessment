import Link from "next/link";

/**
 * WorkPermitsDashboardPage — Placeholder for Work Permits module
 *
 * Coming soon — will follow the same pattern as Risk and Observation modules.
 * Blue theme.
 */
export default function WorkPermitsDashboardPage() {
  return (
    <div className="min-h-screen bg-blue-50 dark:bg-slate-950 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-3xl mx-auto mb-6">
          📝
        </div>
        <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400 mb-3">
          Work Permits Portal
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          This module is coming soon. We're working on bringing you a complete
          work permit management system.
        </p>

        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-blue-300 hover:bg-blue-400 text-blue-900 border border-blue-300 rounded-lg text-sm font-medium transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}