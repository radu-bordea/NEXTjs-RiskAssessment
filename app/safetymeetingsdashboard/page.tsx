import Link from "next/link";

/**
 * SafetyMeetingsDashboardPage — Placeholder for Safety Meetings / Toolbox Talks module
 *
 * Coming soon — will follow the same pattern as Risk and Observation modules.
 * Red theme.
 */
export default function SafetyMeetingsDashboardPage() {
  return (
    <div className="min-h-screen bg-red-50 dark:bg-slate-950 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-3xl mx-auto mb-6">
          📋
        </div>
        <h1 className="text-2xl font-bold text-red-900 dark:text-red-400 mb-3">
          Safety Meetings / Toolbox Talks
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          This module is coming soon. We're working on bringing you a complete
          toolbox talk and safety meeting management system.
        </p>

        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-red-300 hover:bg-red-400 text-red-900 border border-red-300 rounded-lg text-sm font-medium transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
