"use client"

/**
 * WorkPermitTable — Work Permits dashboard table (all types, form + uploaded)
 *
 * Same pattern as RiskTable / ObservationTable:
 *  - Filters: search, project/voyage, type, source, vessel, state, issue date range
 *    (Project / Voyage = filter only, no column — same as ObservationTable)
 *  - Actions:
 *      Uploaded (MANUAL) → 👁 open the PDF · 📄 download the PDF
 *      Form-created      → 👁 view · ✏️ edit (DRAFT) · 📄 PDF (not DRAFT)
 *        (view / edit / PDF pages for form permits come with the forms backend)
 */

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ALL_PERMIT_TYPE_OPTIONS,
  PERMIT_TYPE_LABEL,
  SOURCE_LABEL,
  SOURCE_STYLE,
  STATE_LABEL,
  STATE_STYLE,
  WORK_PERMITS_BASE,
  type PermitSource,
  type PermitState,
  type PermitType,
} from "./permitTypes"

export type WorkPermitRow = {
  id: string
  permitNo: string
  type: PermitType
  source: PermitSource
  state: PermitState
  name: string
  issueDate: Date
  vessel: string
  projectVoyage: string | null
  pdfUrl: string | null
}

const STATES: PermitState[] = ["DRAFT", "COMPLETED", "CLOSED_OUT"]
const SOURCES: PermitSource[] = ["FORM", "MANUAL"]

/** Fixed time zone so server and browser render the same text (no hydration mismatch) */
function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Oslo",
  })
}

/** "YYYY-MM-DD" in Oslo time, for comparing with <input type="date"> values */
function toDateKey(d: Date) {
  return new Date(d).toLocaleDateString("sv-SE", { timeZone: "Europe/Oslo" })
}

/** Vercel Blob: adding ?download=1 makes the browser download instead of open */
function downloadUrl(url: string) {
  return `${url}${url.includes("?") ? "&" : "?"}download=1`
}

const filterCls =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"

const actionCls =
  "inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"

export default function WorkPermitTable({ permits }: { permits: WorkPermitRow[] }) {
  const [search, setSearch] = useState("")
  const [projectVoyage, setProjectVoyage] = useState("")
  const [type, setType] = useState("")
  const [source, setSource] = useState("")
  const [vessel, setVessel] = useState("")
  const [state, setState] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  /** Vessel options built from the data */
  const vessels = useMemo(
    () => Array.from(new Set(permits.map((p) => p.vessel))).sort(),
    [permits]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const pv = projectVoyage.trim().toLowerCase()
    return permits.filter((p) => {
      if (q && !`${p.permitNo} ${p.name}`.toLowerCase().includes(q)) return false
      if (pv && !(p.projectVoyage ?? "").toLowerCase().includes(pv)) return false
      if (type && p.type !== type) return false
      if (source && p.source !== source) return false
      if (vessel && p.vessel !== vessel) return false
      if (state && p.state !== state) return false
      const day = toDateKey(p.issueDate)
      if (dateFrom && day < dateFrom) return false
      if (dateTo && day > dateTo) return false
      return true
    })
  }, [permits, search, projectVoyage, type, source, vessel, state, dateFrom, dateTo])

  const hasFilters = search || projectVoyage || type || source || vessel || state || dateFrom || dateTo

  function clearFilters() {
    setSearch("")
    setProjectVoyage("")
    setType("")
    setSource("")
    setVessel("")
    setState("")
    setDateFrom("")
    setDateTo("")
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="font-semibold text-blue-900 dark:text-blue-400">All Permits</h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Showing {filtered.length} of {permits.length}
        </span>
      </div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 px-5 py-4 bg-blue-50/60 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <input
          className={`${filterCls} lg:col-span-2`}
          placeholder="Search permit no or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search permits"
        />
        <input
          className={`${filterCls} lg:col-span-2`}
          placeholder="Project / Voyage…"
          value={projectVoyage}
          onChange={(e) => setProjectVoyage(e.target.value)}
          aria-label="Filter by project or voyage"
        />
        <select className={filterCls} value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
          <option value="">All Types</option>
          {ALL_PERMIT_TYPE_OPTIONS.map((t) => (
            <option key={t.type} value={t.type}>{t.label}</option>
          ))}
        </select>
        <select className={filterCls} value={source} onChange={(e) => setSource(e.target.value)} aria-label="Filter by source">
          <option value="">Form + Uploaded</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>{SOURCE_LABEL[s]}</option>
          ))}
        </select>

        <select className={filterCls} value={vessel} onChange={(e) => setVessel(e.target.value)} aria-label="Filter by vessel">
          <option value="">All Vessels</option>
          {vessels.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        <select className={filterCls} value={state} onChange={(e) => setState(e.target.value)} aria-label="Filter by state">
          <option value="">All States</option>
          {STATES.map((s) => (
            <option key={s} value={s}>{STATE_LABEL[s]}</option>
          ))}
        </select>
        <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="whitespace-nowrap">Issued</span>
          <input type="date" className={filterCls} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="Issued from date" />
          <span>to</span>
          <input type="date" className={filterCls} value={dateTo} min={dateFrom || undefined} onChange={(e) => setDateTo(e.target.value)} aria-label="Issued to date" />
        </div>
        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasFilters}
          className="rounded-lg border border-blue-300 dark:border-blue-800 px-3 py-2 text-sm font-medium text-blue-900 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Clear filters
        </button>
      </div>

      {/* ── Table ──────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blue-900">
            <tr>
              {["Permit No", "Name", "Type", "Source", "Vessel", "Issue Date", "State", "Actions"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 font-semibold text-white text-xs uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                  {permits.length === 0
                    ? "No permits yet. Create one with the buttons above, or upload a PDF."
                    : "No permits match these filters."}
                </td>
              </tr>
            )}

            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                  {p.permitNo}
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300 min-w-[12rem]">{p.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                  {PERMIT_TYPE_LABEL[p.type]}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${SOURCE_STYLE[p.source]}`}>
                    {SOURCE_LABEL[p.source]}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">{p.vessel}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400">{formatDate(p.issueDate)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${STATE_STYLE[p.state]}`}>
                    {STATE_LABEL[p.state]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {p.source === "MANUAL" ? (
                      p.pdfUrl && (
                        <>
                          {/* Open the uploaded PDF in a new tab */}
                          <a
                            href={p.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open PDF"
                            aria-label={`Open PDF of ${p.permitNo}`}
                            className={actionCls}
                          >
                            👁️
                          </a>
                          {/* Download the uploaded PDF */}
                          <a
                            href={downloadUrl(p.pdfUrl)}
                            title="Download PDF"
                            aria-label={`Download PDF of ${p.permitNo}`}
                            className={actionCls}
                          >
                            📄
                          </a>
                        </>
                      )
                    ) : (
                      <>
                        {/* View — all states */}
                        <Link href={`${WORK_PERMITS_BASE}/${p.id}`} title="View" aria-label={`View ${p.permitNo}`} className={actionCls}>
                          👁️
                        </Link>

                        {/* Edit — DRAFT only */}
                        {p.state === "DRAFT" && (
                          <Link href={`${WORK_PERMITS_BASE}/${p.id}/edit`} title="Edit" aria-label={`Edit ${p.permitNo}`} className={actionCls}>
                            ✏️
                          </Link>
                        )}

                        {/* PDF — everything except DRAFT */}
                        {p.state !== "DRAFT" && (
                          <a href={`${WORK_PERMITS_BASE}/${p.id}/pdf`} title="Download PDF" aria-label={`Download PDF ${p.permitNo}`} className={actionCls}>
                            📄
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}