"use client"

/**
 * AnalyticsFilters — date range + project/voyage search for the
 * Project Analytics page.
 *
 * Updates URL search params on change, which triggers the server
 * component (page.tsx) to re-fetch filtered data. No client-side
 * data duplication — the server is always the source of truth.
 */

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useState } from "react"

type Props = {
  dateFrom: string
  dateTo:   string
  project:  string
}

export default function AnalyticsFilters({ dateFrom, dateTo, project }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [localProject, setLocalProject] = useState(project)

  /** Updates a single search param and pushes the new URL */
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const reset = () => {
    setLocalProject("")
    router.push(pathname)
  }

  const inputClass =
    "px-3 py-2 rounded-lg border border-emerald-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"

  return (
    <div className="rounded-xl border border-emerald-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 mb-6">
      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest ">
        Filters
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">

        {/* Project / Voyage search — free text, applies to Risk + Safety Meeting */}
        <div className="md:col-span-2 mt-5">
          <input
            type="text"
            placeholder="Search Project / Voyage..."
            value={localProject}
            onChange={(e) => setLocalProject(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && updateParam("project", localProject)}
            onBlur={() => updateParam("project", localProject)}
            className={`${inputClass} w-full`}
          />
        </div>

        <div>
          <label className="block text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mb-1">
            Date From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => updateParam("dateFrom", e.target.value)}
            className={`${inputClass} w-full`}
          />
        </div>

        <div>
          <label className="block text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mb-1">
            Date To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => updateParam("dateTo", e.target.value)}
            className={`${inputClass} w-full`}
          />
        </div>
      </div>

      <button
        onClick={reset}
        className="text-xs px-4 py-2 rounded-lg border border-emerald-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
      >
        Reset filters
      </button>
    </div>
  )
}