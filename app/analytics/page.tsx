import Link from "next/link";

/**
 * ProjectAnalyticsPage — /analytics
 *
 * Placeholder for now — will eventually show deeper cross-module
 * analytics (trends, comparisons, exports) once all 4 models have
 * enough real data. Linked from the "Project Analytics" card on
 * the signed-in home dashboard.
 */
export default function ProjectAnalyticsPage() {
  return (
    <div className="min-h-screen bg-emerald-50 dark:bg-slate-950 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-3xl mx-auto mb-6">
          📊
        </div>
        <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-400 mb-3">
          Project Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Deeper cross-module analytics are coming soon — trends, comparisons
          across vessels, and exportable reports once all modules are fully
          populated with data.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-emerald-300 hover:bg-emerald-400 text-emerald-900 border border-emerald-300 rounded-lg text-sm font-medium transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}