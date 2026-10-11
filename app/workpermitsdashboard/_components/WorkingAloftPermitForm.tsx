"use client"

/**
 * WorkingAloftPermitForm — Working Aloft / Overside Permit (Form 31, Rev 001) — UI only
 *
 * Built from the paper form, reorganised into clear sections:
 *  General (vessel, location, job, TYPE OF WORK)  →  Persons involved  →  Validity
 *  → Other permits  →  Section 1: equipment + auxiliary/warnings
 *  → Section 2: aloft and/or overside checks (shown by type of work)
 *  → Authorization  →  Section 3: completion (filled in later)
 *
 * All UI pieces come from permitFormUI.tsx (same look as the other permits).
 * Not connected to DB yet — Save Draft / Issue Permit only console.log.
 */

import { useState } from "react"
import Link from "next/link"
import {
  ALOFT_CHECKS,
  AUXILIARY_ITEMS,
  EQUIPMENT_ITEMS,
  OVERSIDE_CHECKS,
  WORKING_ALOFT_MAX_HOURS,
  WORK_TYPES,
  type WorkType,
} from "./workingAloftOptions"
import { WORK_PERMITS_BASE } from "./permitTypes"
import {
  AddButton,
  CheckItem,
  Counter,
  FORM_WIDTH,
  Field,
  QuestionRow,
  RemoveButton,
  Section,
  YesNoNa,
  addHours,
  hoursBetween,
  inputCls,
  type Answer,
} from "./permitFormUI"

// ─── Types ───────────────────────────────────────────────────────────────────
type Answers = Record<string, Answer>
type AnswerGroup = "equipment" | "auxiliary" | "aloftChecks" | "oversideChecks"

type FormState = {
  // General
  vessel: string
  location: string
  jobDescription: string
  workType: WorkType
  persons: string[]
  // Validity
  validFrom: string
  validTo: string
  // Other permits
  otherPermitsRequired: Answer
  otherPermitRefs: string[]
  // Section 1
  equipment: Answers
  auxiliary: Answers
  auxOtherText: string
  auxOtherAnswer: Answer
  // Section 2
  aloftChecks: Answers
  oversideChecks: Answers
  // Authorization
  discussedConfirmed: boolean
  teamLeaderName: string
  responsibleOfficerName: string
  masterName: string
  // Section 3 (optional when creating)
  completedAt: string
  withdrawnConfirmed: boolean
  completionOfficerName: string
}

// ─── Initial state ───────────────────────────────────────────────────────────
const emptyAnswers = (items: readonly { id: string }[]) =>
  Object.fromEntries(items.map((i) => [i.id, ""])) as Answers

const initialState: FormState = {
  vessel: "",
  location: "",
  jobDescription: "",
  workType: "",
  persons: [""],
  validFrom: "",
  validTo: "",
  otherPermitsRequired: "",
  otherPermitRefs: [""],
  equipment: emptyAnswers(EQUIPMENT_ITEMS),
  auxiliary: emptyAnswers(AUXILIARY_ITEMS),
  auxOtherText: "",
  auxOtherAnswer: "",
  aloftChecks: emptyAnswers(ALOFT_CHECKS),
  oversideChecks: emptyAnswers(OVERSIDE_CHECKS),
  discussedConfirmed: false,
  teamLeaderName: "",
  responsibleOfficerName: "",
  masterName: "",
  completedAt: "",
  withdrawnConfirmed: false,
  completionOfficerName: "",
}

const countAnswered = (a: Answers) => Object.values(a).filter(Boolean).length

// ─── Main form ───────────────────────────────────────────────────────────────
export default function WorkingAloftPermitForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const setAnswer = (group: AnswerGroup, id: string, value: Answer) =>
    setForm((f) => ({ ...f, [group]: { ...f[group], [id]: value } }))

  /** "All Yes" shortcut for a whole group */
  const setAllAnswers = (group: AnswerGroup, value: Answer) =>
    setForm((f) => ({
      ...f,
      [group]: Object.fromEntries(Object.keys(f[group]).map((k) => [k, value])),
    }))

  /** Setting "valid from" auto-fills "valid to" = from + 8 hrs */
  const handleValidFrom = (value: string) =>
    setForm((f) => ({
      ...f,
      validFrom: value,
      validTo: value ? addHours(value, WORKING_ALOFT_MAX_HOURS) : "",
    }))

  // Simple string lists (persons, permit refs)
  const updateList = (key: "persons" | "otherPermitRefs", i: number, value: string) =>
    setForm((f) => ({ ...f, [key]: f[key].map((x, idx) => (idx === i ? value : x)) }))
  const addToList = (key: "persons" | "otherPermitRefs") =>
    setForm((f) => ({ ...f, [key]: [...f[key], ""] }))
  const removeFromList = (key: "persons" | "otherPermitRefs", i: number) =>
    setForm((f) => ({ ...f, [key]: f[key].filter((_, idx) => idx !== i) }))

  // ── Derived values ──
  const duration = form.validFrom && form.validTo ? hoursBetween(form.validFrom, form.validTo) : null
  const durationError = duration !== null && (duration <= 0 || duration > WORKING_ALOFT_MAX_HOURS)

  const showAloft = form.workType === "ALOFT" || form.workType === "BOTH"
  const showOverside = form.workType === "OVERSIDE" || form.workType === "BOTH"

  const equipmentDone = countAnswered(form.equipment)
  const auxiliaryDone = countAnswered(form.auxiliary)
  const aloftDone = countAnswered(form.aloftChecks)
  const oversideDone = countAnswered(form.oversideChecks)

  const namedPersons = form.persons.filter((p) => p.trim())
  const permitRefs = form.otherPermitRefs.filter((r) => r.trim())

  // ── Validation (only for Issue Permit — drafts can be incomplete) ──
  function validate() {
    const e: string[] = []
    if (!form.vessel.trim()) e.push("Vessel is required")
    if (!form.location.trim()) e.push("Location of work is required")
    if (!form.jobDescription.trim()) e.push("Job description is required")
    if (!form.workType) e.push("Choose the type of work: aloft, overside or both")
    if (namedPersons.length === 0) e.push("Add at least one person involved")

    if (!form.validFrom || !form.validTo) e.push("Permit validity (from / to) is required")
    else if (durationError) e.push(`Permit must end after it starts and last max ${WORKING_ALOFT_MAX_HOURS} hours`)

    if (!form.otherPermitsRequired) e.push("Answer: Other work permits required for this job?")
    if (form.otherPermitsRequired === "YES" && permitRefs.length === 0)
      e.push("Enter the reference number of the other work permit(s)")

    if (equipmentDone < EQUIPMENT_ITEMS.length) e.push("Section 1: answer all equipment items")
    if (auxiliaryDone < AUXILIARY_ITEMS.length) e.push("Section 1: answer all auxiliary equipment & warnings items")
    if (form.auxOtherText.trim() && !form.auxOtherAnswer) e.push("Section 1: answer Yes / No for “Other”")

    if (showAloft && aloftDone < ALOFT_CHECKS.length) e.push("Section 2: answer all working aloft questions")
    if (showOverside && oversideDone < OVERSIDE_CHECKS.length) e.push("Section 2: answer all working overside questions")

    if (!form.discussedConfirmed) e.push("Confirm the work plan meeting and risk assessment")
    if (!form.teamLeaderName.trim()) e.push("Authorized team leader is required")
    if (!form.responsibleOfficerName.trim()) e.push("Responsible officer for work aloft / overside is required")
    if (!form.masterName.trim()) e.push("Master is required")

    // Section 3 is optional, but must make sense if filled
    if (form.withdrawnConfirmed && (!form.completedAt || !form.completionOfficerName.trim()))
      e.push("Section 3: completion needs the time and the responsible officer's name")
    return e
  }

  function handleSaveDraft() {
    setErrors([])
    console.log("SAVE DRAFT", form)
    setMessage("Draft saved (UI only — not stored in the database yet).")
  }

  function handleIssue() {
    const e = validate()
    setErrors(e)
    if (e.length > 0) {
      setMessage(null)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    console.log("ISSUE PERMIT", form)
    setMessage("Permit ready to issue (UI only — not stored in the database yet).")
  }

  /** "All Yes" link in a section header */
  const allYes = (group: AnswerGroup) => (
    <button
      type="button"
      onClick={() => setAllAnswers(group, "YES")}
      className="text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline cursor-pointer whitespace-nowrap"
    >
      All Yes
    </button>
  )

  // Section numbers adjust when aloft / overside sections are hidden
  let sectionNo = 0
  const next = () => ++sectionNo

  return (
    <div className={`${FORM_WIDTH} mx-auto px-4 sm:px-6 py-8 pb-32`}>

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <Link href={WORK_PERMITS_BASE} className="text-sm text-blue-900 dark:text-blue-400 hover:underline">
        ← Back to Work Permits
      </Link>

      <div className="mt-4 mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-2xl">
          🪜
        </div>
        <div>
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">Working Aloft / Overside Permit</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Form 31 · Revision 001 · Last revised 20.05.25
          </p>
        </div>
      </div>

      {/* ── Intro ────────────────────────────────────────────────── */}
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
        This permit relates to any work at heights in excess of those defined in MRS 846.
        Each individual job must be the subject of an individual work permit.
      </p>

      <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
        <span aria-hidden>⏱️</span>
        <span>
          This permit automatically becomes <strong>invalid {WORKING_ALOFT_MAX_HOURS} hours</strong> after
          the time of issue.
        </span>
      </div>

      {/* ── Messages ─────────────────────────────────────────────── */}
      {errors.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-4 py-3">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
            Please fix {errors.length} {errors.length === 1 ? "item" : "items"} before issuing:
          </p>
          <ul className="list-disc pl-5 text-sm text-red-700 dark:text-red-400 space-y-0.5">
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>
      )}
      {message && (
        <div className="mb-6 rounded-lg border border-emerald-300 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          {message}
        </div>
      )}

      <div className="space-y-6">

        {/* ── General ────────────────────────────────────────────── */}
        <Section number={next()} title="General">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Vessel" required>
              <input className={inputCls} value={form.vessel} onChange={(e) => set("vessel", e.target.value)} placeholder="e.g. Mobile Viking" />
            </Field>
            <Field label="Permit no." hint="Assigned automatically when the permit is issued">
              <input className={`${inputCls} bg-slate-50 dark:bg-slate-800 text-slate-400`} value="WA-____-___" disabled />
            </Field>
            <Field label="Location of work" required className="sm:col-span-2">
              <input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Foremast / port side hull" />
            </Field>
            <Field label="Job description" required className="sm:col-span-2">
              <textarea rows={3} className={inputCls} value={form.jobDescription} onChange={(e) => set("jobDescription", e.target.value)} placeholder="What work will be done?" />
            </Field>
          </div>

          {/* Type of work — controls which Section 2 questions appear */}
          <div className="mt-5">
            <span className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Type of work <span className="text-red-500">*</span>
            </span>
            <div role="radiogroup" aria-label="Type of work" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {WORK_TYPES.map((t) => {
                const active = form.workType === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => set("workType", t.value)}
                    className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left text-base transition-colors cursor-pointer ${
                      active
                        ? "border-blue-900 bg-blue-50 text-blue-900 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-300"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300"
                    }`}
                  >
                    <span aria-hidden className="text-xl">{t.icon}</span>
                    <span className="font-medium">{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </Section>

        {/* ── Persons involved ───────────────────────────────────── */}
        <Section number={next()} title="Persons involved">
          <div className="space-y-2">
            {form.persons.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={inputCls}
                  value={p}
                  onChange={(e) => updateList("persons", i, e.target.value)}
                  placeholder={`Person ${i + 1} — full name`}
                  aria-label={`Person ${i + 1}`}
                />
                {form.persons.length > 1 && (
                  <RemoveButton label={`Remove person ${i + 1}`} onClick={() => removeFromList("persons", i)} />
                )}
              </div>
            ))}
          </div>
          <AddButton onClick={() => addToList("persons")}>+ Add person</AddButton>
        </Section>

        {/* ── Validity ───────────────────────────────────────────── */}
        <Section
          number={next()}
          title="Permit validity"
          subtitle={`"Valid to" fills in automatically (+${WORKING_ALOFT_MAX_HOURS} hrs). You can shorten it.`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Valid from (date & time)" required>
              <input type="datetime-local" className={inputCls} value={form.validFrom} onChange={(e) => handleValidFrom(e.target.value)} />
            </Field>
            <Field label="Valid to (date & time)" required>
              <input
                type="datetime-local"
                className={inputCls}
                value={form.validTo}
                min={form.validFrom || undefined}
                max={form.validFrom ? addHours(form.validFrom, WORKING_ALOFT_MAX_HOURS) : undefined}
                onChange={(e) => set("validTo", e.target.value)}
              />
            </Field>
          </div>
          {duration !== null && (
            <p className={`mt-3 text-sm font-medium ${durationError ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}>
              {durationError
                ? `⚠️ Invalid period: must be more than 0 and max ${WORKING_ALOFT_MAX_HOURS} hours`
                : `✓ Valid for ${Number.isInteger(duration) ? duration : duration.toFixed(1)} hours`}
            </p>
          )}
        </Section>

        {/* ── Other work permits ─────────────────────────────────── */}
        <Section number={next()} title="Other work permits">
          <QuestionRow label="Are other work permits issued / required for this job?">
            <YesNoNa
              ariaLabel="Other work permits required"
              options={["YES", "NO"]}
              value={form.otherPermitsRequired}
              onChange={(v) => set("otherPermitsRequired", v)}
            />
          </QuestionRow>
          {form.otherPermitsRequired === "YES" && (
            <div className="pt-2">
              <span className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Reference no. <span className="text-red-500">*</span>
              </span>
              <div className="space-y-2">
                {form.otherPermitRefs.map((r, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className={inputCls}
                      value={r}
                      onChange={(e) => updateList("otherPermitRefs", i, e.target.value)}
                      placeholder="e.g. HW-2026-004"
                      aria-label={`Permit reference ${i + 1}`}
                    />
                    {form.otherPermitRefs.length > 1 && (
                      <RemoveButton label={`Remove reference ${i + 1}`} onClick={() => removeFromList("otherPermitRefs", i)} />
                    )}
                  </div>
                ))}
              </div>
              <AddButton onClick={() => addToList("otherPermitRefs")}>+ Add reference</AddButton>
            </div>
          )}
        </Section>

        {/* ── Section 1: Equipment ───────────────────────────────── */}
        <Section
          number={next()}
          title="Section 1 · Equipment"
          subtitle="Availability and good condition of the following equipment"
          right={<div className="flex items-center gap-3">{allYes("equipment")}<Counter done={equipmentDone} total={EQUIPMENT_ITEMS.length} /></div>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8">
            {EQUIPMENT_ITEMS.map((item) => (
              <QuestionRow key={item.id} label={item.label}>
                <YesNoNa ariaLabel={item.label} options={["YES", "NO"]} value={form.equipment[item.id]} onChange={(v) => setAnswer("equipment", item.id, v)} />
              </QuestionRow>
            ))}
          </div>
        </Section>

        {/* ── Section 1: Auxiliary & warnings ────────────────────── */}
        <Section
          number={next()}
          title="Section 1 · Auxiliary equipment & warnings"
          subtitle="Auxiliary equipment condition, warnings and notices"
          right={<div className="flex items-center gap-3">{allYes("auxiliary")}<Counter done={auxiliaryDone} total={AUXILIARY_ITEMS.length} /></div>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8">
            {AUXILIARY_ITEMS.map((item) => (
              <QuestionRow key={item.id} label={item.label}>
                <YesNoNa ariaLabel={item.label} options={["YES", "NO"]} value={form.auxiliary[item.id]} onChange={(v) => setAnswer("auxiliary", item.id, v)} />
              </QuestionRow>
            ))}
          </div>

          {/* Other (specify) */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-end gap-3">
            <Field label="Other (specify)" className="flex-1">
              <input className={inputCls} value={form.auxOtherText} onChange={(e) => set("auxOtherText", e.target.value)} placeholder="Optional" />
            </Field>
            {form.auxOtherText.trim() && (
              <YesNoNa ariaLabel="Other auxiliary item" options={["YES", "NO"]} value={form.auxOtherAnswer} onChange={(v) => set("auxOtherAnswer", v)} />
            )}
          </div>
        </Section>

        {/* ── Section 2: shown by type of work ───────────────────── */}
        {!form.workType && (
          <div className="rounded-xl border border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 px-5 py-4 text-sm text-blue-900 dark:text-blue-300">
            <strong>Section 2</strong> questions appear here after you choose the <strong>type of work</strong> in section 1
            (working aloft, overside, or both).
          </div>
        )}

        {showAloft && (
          <Section
            number={next()}
            title="Section 2 · For working aloft"
            right={<div className="flex items-center gap-3">{allYes("aloftChecks")}<Counter done={aloftDone} total={ALOFT_CHECKS.length} /></div>}
          >
            {ALOFT_CHECKS.map((c, i) => (
              <QuestionRow key={c.id} number={i + 1} label={c.label}>
                <YesNoNa ariaLabel={c.label} value={form.aloftChecks[c.id]} onChange={(v) => setAnswer("aloftChecks", c.id, v)} />
              </QuestionRow>
            ))}
          </Section>
        )}

        {showOverside && (
          <Section
            number={next()}
            title="Section 2 · For working overside"
            right={<div className="flex items-center gap-3">{allYes("oversideChecks")}<Counter done={oversideDone} total={OVERSIDE_CHECKS.length} /></div>}
          >
            {OVERSIDE_CHECKS.map((c, i) => (
              <QuestionRow key={c.id} number={i + 1} label={c.label}>
                <YesNoNa ariaLabel={c.label} value={form.oversideChecks[c.id]} onChange={(v) => setAnswer("oversideChecks", c.id, v)} />
              </QuestionRow>
            ))}
          </Section>
        )}

        {/* ── Authorization ──────────────────────────────────────── */}
        <Section number={next()} title="Authorization">
          <CheckItem checked={form.discussedConfirmed} onChange={(v) => set("discussedConfirmed", v)}>
            All of the above has been discussed during a formal work plan meeting with all persons
            participating in this work aloft or overside. A risk analysis and risk assessment has been
            created and acknowledged by the persons involved. In the circumstances noted, it is
            considered <strong>safe to proceed</strong> with this work aloft or overside.
          </CheckItem>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Authorized team leader carrying out the job" required>
              <input className={inputCls} value={form.teamLeaderName} onChange={(e) => set("teamLeaderName", e.target.value)} placeholder="Full name" />
            </Field>
            <Field label="Responsible officer for work aloft / overside" required>
              <input className={inputCls} value={form.responsibleOfficerName} onChange={(e) => set("responsibleOfficerName", e.target.value)} placeholder="Full name" />
            </Field>
            <Field label="Master" required>
              <input className={inputCls} value={form.masterName} onChange={(e) => set("masterName", e.target.value)} placeholder="Full name" />
            </Field>
          </div>
        </Section>

        {/* ── Section 3: Completion ──────────────────────────────── */}
        <Section
          number={next()}
          title="Section 3 · Completion"
          subtitle="Optional when creating — fill in when the work is finished"
        >
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-emerald-700"
                checked={form.withdrawnConfirmed}
                onChange={(e) => set("withdrawnConfirmed", e.target.checked)}
              />
              <span className="text-base text-slate-700 dark:text-slate-300">
                This work aloft or overside has been completed, and all persons under my supervision,
                materials and equipment have been withdrawn.
              </span>
            </label>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Completed at (date & time)" required={form.withdrawnConfirmed}>
                <input
                  type="datetime-local"
                  className={inputCls}
                  value={form.completedAt}
                  min={form.validFrom || undefined}
                  onChange={(e) => set("completedAt", e.target.value)}
                />
              </Field>
              <Field label="Responsible officer for work aloft / overside" required={form.withdrawnConfirmed}>
                <input className={inputCls} value={form.completionOfficerName} onChange={(e) => set("completionOfficerName", e.target.value)} placeholder="Full name" />
              </Field>
            </div>
          </div>
          <p className="mt-4 text-xs italic text-slate-500 dark:text-slate-400">
            First copy to be displayed at place of work. Second copy to be retained in ship&apos;s file.
          </p>
        </Section>
      </div>

      {/* ── Sticky action bar ─────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur">
        <div className={`${FORM_WIDTH} mx-auto px-4 sm:px-6 py-3 flex items-center justify-end gap-3`}>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2.5 rounded-lg border border-blue-300 dark:border-blue-800 text-sm font-medium text-blue-900 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleIssue}
            className="px-5 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-sm font-semibold text-white cursor-pointer"
          >
            Issue Permit
          </button>
        </div>
      </div>
    </div>
  )
}