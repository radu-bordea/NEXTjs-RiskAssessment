"use client"

/**
 * permitFormUI — shared UI pieces for all Work Permit forms
 *
 * Used by ConfinedSpacePermitForm (and later Working Aloft).
 * HotWorkPermitForm still has its own copies — we can switch it to
 * import from here later, so the 3 forms always look the same.
 *
 * Sizes: text-base inputs (16px — no zoom on iPhone), text-sm labels.
 */

import type { ReactNode } from "react"

// ─── Styles ──────────────────────────────────────────────────────────────────
export const inputCls =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"

/** Same width as the other forms — change in one place */
export const FORM_WIDTH = "max-w-5xl"

// ─── Date helpers ────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, "0")

/** Date → "YYYY-MM-DDTHH:mm" for <input type="datetime-local"> */
export function toInputValue(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function addHours(value: string, hours: number) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return toInputValue(new Date(d.getTime() + hours * 3_600_000))
}

export function hoursBetween(from: string, to: string) {
  return (new Date(to).getTime() - new Date(from).getTime()) / 3_600_000
}

/** Simple unique id for list rows (works on http too, unlike crypto.randomUUID) */
let rowCounter = 0
export const newRowId = () => `row-${Date.now()}-${rowCounter++}`

// ─── Layout ──────────────────────────────────────────────────────────────────
export function Section({
  number,
  title,
  subtitle,
  right,
  children,
}: {
  number: number | string
  title: string
  subtitle?: string
  right?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <header className="flex items-center gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-blue-50 dark:bg-blue-950/40 rounded-t-xl">
        <span className="w-8 h-8 shrink-0 rounded-full bg-blue-900 text-white text-sm font-bold flex items-center justify-center">
          {number}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-300 uppercase tracking-wide">
            {title}
          </h2>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        {right}
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}

export function Field({
  label,
  required,
  hint,
  className = "",
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  className?: string
  children: ReactNode
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {hint && <span className="block mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
    </label>
  )
}

/** "7/13" counter shown in a section header */
export function Counter({ done, total }: { done: number; total: number }) {
  const complete = done === total
  return (
    <span
      className={`text-sm font-semibold whitespace-nowrap px-2 py-0.5 rounded-full ${
        complete
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
          : "text-blue-900 dark:text-blue-300"
      }`}
    >
      {complete ? "✓ " : ""}
      {done}/{total}
    </span>
  )
}

/** A checklist item the user ticks to confirm (paper form ☐ boxes) */
export function CheckItem({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  children: ReactNode
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
        checked
          ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/20"
          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
      }`}
    >
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 shrink-0 accent-emerald-700"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-base text-slate-700 dark:text-slate-300">{children}</span>
    </label>
  )
}

/** Small "+ Add …" text button */
export function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
    >
      {children}
    </button>
  )
}

/** ✕ remove button for list rows */
export function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="shrink-0 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-red-600 hover:border-red-300 cursor-pointer"
    >
      ✕
    </button>
  )
}