"use client"

/**
 * permitFormUI — shared UI pieces for all Work Permit forms
 *
 * Used by HotWorkPermitForm, ConfinedSpacePermitForm (and later Working Aloft),
 * so all permit forms look the same. Change a style here → all forms change.
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

// ─── Yes / No / N/A answers ──────────────────────────────────────────────────
/** "" = not answered yet */
export type Answer = "YES" | "NO" | "NA" | ""
export type AnswerOption = Exclude<Answer, "">

const ANSWER_LABEL: Record<AnswerOption, string> = { YES: "Yes", NO: "No", NA: "N/A" }
const ANSWER_ACTIVE: Record<AnswerOption, string> = {
  YES: "bg-emerald-600 text-white",
  NO: "bg-red-600 text-white",
  NA: "bg-slate-500 text-white",
}

/** Segmented Yes / No / N/A buttons — click again to clear */
export function YesNoNa({
  value,
  onChange,
  options = ["YES", "NO", "NA"],
  ariaLabel,
}: {
  value: Answer
  onChange: (v: Answer) => void
  options?: AnswerOption[]
  ariaLabel: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex shrink-0 rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden"
    >
      {options.map((opt, i) => {
        const active = value === opt
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active ? "" : opt)}
            className={`min-w-[60px] px-3 py-1.5 text-sm font-semibold transition-colors cursor-pointer ${
              i > 0 ? "border-l border-slate-300 dark:border-slate-700" : ""
            } ${
              active
                ? ANSWER_ACTIVE[opt]
                : "bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {ANSWER_LABEL[opt]}
          </button>
        )
      })}
    </div>
  )
}

/** One question with its answer buttons on the right (below on mobile) */
export function QuestionRow({
  number,
  label,
  children,
}: {
  number?: number | string
  label: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <p className="text-base text-slate-700 dark:text-slate-300">
        {number !== undefined && (
          <span className="inline-block w-6 font-semibold text-blue-900 dark:text-blue-400">{number}.</span>
        )}
        {label}
      </p>
      {children}
    </div>
  )
}

// ─── Read-only value (e.g. vessel from the logged-in user) ───────────────────
export function ReadOnlyField({
  label,
  value,
  hint,
  className = "",
}: {
  label: string
  value: string
  hint?: string
  className?: string
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      <input
        className={`${inputCls} bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-not-allowed`}
        value={value}
        readOnly
        tabIndex={-1}
      />
    </Field>
  )
}