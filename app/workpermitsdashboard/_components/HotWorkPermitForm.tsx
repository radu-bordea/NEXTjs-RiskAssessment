"use client"

/**
 * HotWorkPermitForm — Hot Work Permit (Form 34, Rev 001) — UI only
 *
 * Built from the paper form, reorganised into clear sections:
 *  1. General                 6. Personal protection (item 12)
 *  2. Persons doing the work  7. Special conditions (item 13)
 *  3. Validity (max 8 hrs)    8. Fire prevention (item 14)
 *  4. Related permits         9. Authorization & acknowledgement
 *  5. Check section (1–11)   10. After issue (filled in later)
 *
 * All UI pieces (Section, Field, inputs, buttons, Yes/No/N/A) come from permitFormUI.tsx.
 *
 * Saves to the database (WorkPermit table) with saveHotWorkPermit:
 *  - Save Draft   → DRAFT (can be incomplete)
 *  - Issue Permit → COMPLETED (all required fields), or CLOSED_OUT if the
 *                   close-out in section 10 is already confirmed
 * Validation rules live in lib/validations/hotWorkPermit.schema.ts
 * (the same rules run here in the browser and again on the server).
 */

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { saveHotWorkPermit } from "@/app/actions/hotWorkPermit.actions"
import { hotWorkPermitSchema, zodMessages } from "@/lib/validations/hotWorkPermit.schema"
import {
  FIRE_PREVENTION_MEASURES,
  HOT_WORK_CHECKS,
  HOT_WORK_MAX_HOURS,
  PPE_OPTIONS,
  VENTILATION_TYPES,
  type Answer,
} from "./hotWorkOptions"
import { WORK_PERMITS_BASE, type ExistingPermit } from "./permitTypes"
import { PermitActionBar, PermitStatusBar, permitFormMode } from "./permitFormParts"
import {
  AddButton,
  CheckItem,
  Counter,
  FORM_WIDTH,
  Field,
  RemoveButton,
  Section,
  addHours,
  hoursBetween,
  QuestionRow,
  YesNoNa,
  inputCls,
  ReadOnlyField,
} from "./permitFormUI"

// ─── Types ───────────────────────────────────────────────────────────────────
type FormState = {
  // 1. General
  projectVoyage: string
  date: string
  location: string
  description: string
  responsiblePerson: string
  // 2. Persons
  workers: string[]
  // 3. Validity
  validFrom: string
  validTo: string
  // 4. Related permits
  enclosedSpacePermit: Answer
  otherPermitsRequired: Answer
  otherPermitsSpecify: string
  toolboxMeetingHeld: Answer
  // 5. Checks
  checks: Record<string, Answer>
  ventilationType: string
  fireWatchNominated: Answer
  fireWatchNames: string
  fireWatchBridgeComms: Answer
  // 6–8
  ppe: string[]
  ppeOther: string
  specialConditions: string
  fireMeasures: Record<string, Answer>
  fireMeasuresAdditional: string
  // 9. Authorization
  masterName: string
  supervisorName: string
  authorizationConfirmed: boolean
  workersAcknowledged: boolean
  // 10. After issue (optional when creating)
  workCommencedAt: string
  extensionTo: string
  workCompletedAt: string
  closeOutConfirmed: boolean
  closeOutOfficer: string
  closeOutAt: string
}

// ─── Initial state ───────────────────────────────────────────────────────────
const emptyAnswers = (items: readonly { id: string }[]) =>
  Object.fromEntries(items.map((i) => [i.id, ""])) as Record<string, Answer>

const initialState: FormState = {
  projectVoyage: "",
  date: "",
  location: "",
  description: "",
  responsiblePerson: "",
  workers: [""],
  validFrom: "",
  validTo: "",
  enclosedSpacePermit: "",
  otherPermitsRequired: "",
  otherPermitsSpecify: "",
  toolboxMeetingHeld: "",
  checks: emptyAnswers(HOT_WORK_CHECKS),
  ventilationType: "",
  fireWatchNominated: "",
  fireWatchNames: "",
  fireWatchBridgeComms: "",
  ppe: [],
  ppeOther: "",
  specialConditions: "",
  fireMeasures: emptyAnswers(FIRE_PREVENTION_MEASURES),
  fireMeasuresAdditional: "",
  masterName: "",
  supervisorName: "",
  authorizationConfirmed: false,
  workersAcknowledged: false,
  workCommencedAt: "",
  extensionTo: "",
  workCompletedAt: "",
  closeOutConfirmed: false,
  closeOutOfficer: "",
  closeOutAt: "",
}

/** Saved answers (from the DB) → full form state; new questions get empty answers */
const fromSaved = (saved: Partial<FormState>): FormState => ({
  ...initialState,
  ...saved,
  workers: saved.workers?.length ? saved.workers : [""],
  checks: { ...initialState.checks, ...saved.checks },
  fireMeasures: { ...initialState.fireMeasures, ...saved.fireMeasures },
})

/** "2026-11-25T08:30" (browser local time) → exact ISO time for the database */
function toIso(value: string): string | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

// ─── "All Yes" link for section headers (same look as Working Aloft) ─────────
function AllYesButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline cursor-pointer whitespace-nowrap"
    >
      All Yes
    </button>
  )
}

// ─── Main form ───────────────────────────────────────────────────────────────
export default function HotWorkPermitForm({
  vessel,
  permit,
  readOnly = false,
  canEdit = false,
}: {
  vessel: string
  /** Existing permit → edit (or view with readOnly). Empty → new permit */
  permit?: ExistingPermit<FormState>
  /** 👁 View page: everything read-only */
  readOnly?: boolean
  /** View page: show the ✏️ Edit button */
  canEdit?: boolean
}) {
  const [form, setForm] = useState<FormState>(() => (permit ? fromSaved(permit.form) : initialState))
  const mode = permitFormMode(permit, readOnly)
  const [errors, setErrors] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState<"draft" | "issue" | null>(null)
  const router = useRouter()

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const setCheck = (id: string, value: Answer) =>
    setForm((f) => ({ ...f, checks: { ...f.checks, [id]: value } }))

  const setFireMeasure = (id: string, value: Answer) =>
    setForm((f) => ({ ...f, fireMeasures: { ...f.fireMeasures, [id]: value } }))

  /**
   * Section 5 "All Yes" — items 1–9 and item 11 → YES.
   * Item 10 (type of ventilation) is a dropdown, so the user still picks it.
   */
  const setAllChecksYes = () =>
    setForm((f) => ({
      ...f,
      checks: Object.fromEntries(Object.keys(f.checks).map((k) => [k, "YES"])) as Record<string, Answer>,
      fireWatchNominated: "YES",
    }))

  /** Section 8 "All Yes" — every fire prevention measure → YES */
  const setAllFireMeasuresYes = () =>
    setForm((f) => ({
      ...f,
      fireMeasures: Object.fromEntries(Object.keys(f.fireMeasures).map((k) => [k, "YES"])) as Record<string, Answer>,
    }))

  /** Setting "valid from" auto-fills "valid to" = from + 8 hrs (user can shorten) */
  const handleValidFrom = (value: string) =>
    setForm((f) => ({
      ...f,
      validFrom: value,
      validTo: value ? addHours(value, HOT_WORK_MAX_HOURS) : "",
    }))

  // Workers list
  const updateWorker = (i: number, value: string) =>
    setForm((f) => ({ ...f, workers: f.workers.map((w, idx) => (idx === i ? value : w)) }))
  const addWorker = () => setForm((f) => ({ ...f, workers: [...f.workers, ""] }))
  const removeWorker = (i: number) =>
    setForm((f) => ({ ...f, workers: f.workers.filter((_, idx) => idx !== i) }))

  const togglePpe = (item: string) =>
    setForm((f) => ({
      ...f,
      ppe: f.ppe.includes(item) ? f.ppe.filter((p) => p !== item) : [...f.ppe, item],
    }))

  // Derived values
  const duration = form.validFrom && form.validTo ? hoursBetween(form.validFrom, form.validTo) : null
  const durationError = duration !== null && (duration <= 0 || duration > HOT_WORK_MAX_HOURS)

  const checksAnswered = Object.values(form.checks).filter(Boolean).length
  /** Section 5 counter: items 1–9 + item 10 (ventilation) + item 11 (fire-watch) */
  const SECTION5_TOTAL = HOT_WORK_CHECKS.length + 2
  const section5Done =
    checksAnswered + (form.ventilationType ? 1 : 0) + (form.fireWatchNominated ? 1 : 0)
  /** Highlight item 10 when everything else in section 5 is answered */
  const ventilationMissing = !form.ventilationType && section5Done === SECTION5_TOTAL - 1
  const fireAnswered = Object.values(form.fireMeasures).filter(Boolean).length
  const namedWorkers = form.workers.filter((w) => w.trim())

  // ── Validation (only for Issue Permit — drafts can be incomplete) ──
  /** Same Zod rules the server uses — see hotWorkPermit.schema.ts */
  function validate() {
    const result = hotWorkPermitSchema.safeParse(form)
    return result.success ? [] : zodMessages(result.error)
  }

  /** Saves to the DB. submit = false → draft, true → issue permit */
  async function save(submit: boolean) {
    setSaving(submit ? "issue" : "draft")
    setMessage(null)
    try {
      const result = await saveHotWorkPermit(
        form,
        submit,
        {
          validFrom: toIso(form.validFrom),
          validTo: toIso(form.validTo),
          closeOutAt: toIso(form.closeOutAt),
        },
        permit?.id
      )

      if (!result.success) {
        setErrors(result.errors)
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }

      setErrors([])
      toast.success(
        mode === "correct"
          ? `Changes to ${result.permitNo} saved`
          : result.state === "DRAFT"
            ? `Draft ${result.permitNo} saved`
            : result.state === "CLOSED_OUT"
              ? `Permit ${result.permitNo} issued and closed out`
              : `Permit ${result.permitNo} issued`
      )
      // New permit → back to the list; existing permit → its view page
      router.push(permit ? `${WORK_PERMITS_BASE}/${result.id}` : WORK_PERMITS_BASE)
      router.refresh()
    } catch (error) {
      console.error("save hot work permit:", error)
      toast.error("Could not save the permit. Check your connection and try again.")
    } finally {
      setSaving(null)
    }
  }

  function handleSaveDraft() {
    setErrors([])
    void save(false)
  }

  function handleIssue() {
    const e = validate()
    setErrors(e)
    if (e.length > 0) {
      setMessage(null)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    void save(true)
  }

  return (
    <div className={`${FORM_WIDTH} mx-auto px-4 sm:px-6 py-8 pb-32`}>

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <Link
        href={WORK_PERMITS_BASE}
        className="text-sm text-blue-900 dark:text-blue-400 hover:underline"
      >
        ← Back to Work Permits
      </Link>

      <div className="mt-4 mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl">
            🔥
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">Hot Work Permit</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Form 34 · Revision 001 · Last revised 20.05.25
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
        This permit relates to any work involving temperatures likely to cause ignition of
        combustible gases, vapours or liquids in or adjacent to the area involved.
      </p>

      <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
        <span aria-hidden>⏱️</span>
        <span>
          This permit automatically becomes <strong>invalid {HOT_WORK_MAX_HOURS} hours</strong> after
          the time of issue.
        </span>
      </div>

      <PermitStatusBar permit={permit} mode={mode} />

      {/* ── Messages ─────────────────────────────────────────────── */}
      {errors.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-4 py-3">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
            Please fix {errors.length} {errors.length === 1 ? "item" : "items"} before issuing:
          </p>
          <ul className="list-disc pl-5 text-sm text-red-700 dark:text-red-400 space-y-0.5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      {message && (
        <div className="mb-6 rounded-lg border border-emerald-300 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          {message}
        </div>
      )}

      {/* View mode: every input inside is read-only */}
      <fieldset disabled={mode === "view"} className="space-y-6 min-w-0">

        {/* 1 ── General ─────────────────────────────────────────── */}
        <Section number={1} title="General">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReadOnlyField label="Vessel" value={vessel} hint="From your login" />
            <Field label="Project / Voyage">
              <input className={inputCls} value={form.projectVoyage} onChange={(e) => set("projectVoyage", e.target.value)} placeholder="e.g. Survey 2026-14" />
            </Field>
            <Field label="Date" required>
              <input type="date" className={inputCls} value={form.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
            <Field label="Person responsible for safety" required>
              <input className={inputCls} value={form.responsiblePerson} onChange={(e) => set("responsiblePerson", e.target.value)} />
            </Field>
            <Field label="Location of work" required className="sm:col-span-2">
              <input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Engine room workshop" />
            </Field>
            <Field label="Description of work" required className="sm:col-span-2">
              <textarea rows={3} className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What hot work will be done?" />
            </Field>
          </div>
        </Section>

        {/* 2 ── Persons carrying out hot work ───────────────────── */}
        <Section number={2} title="Persons carrying out hot work">
          <div className="space-y-2">
            {form.workers.map((w, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={inputCls}
                  value={w}
                  onChange={(e) => updateWorker(i, e.target.value)}
                  placeholder={`Person ${i + 1} — full name`}
                  aria-label={`Person ${i + 1}`}
                />
                {form.workers.length > 1 && (
                  <RemoveButton label={`Remove person ${i + 1}`} onClick={() => removeWorker(i)} />
                )}
              </div>
            ))}
          </div>
          <AddButton onClick={addWorker}>+ Add person</AddButton>
        </Section>

        {/* 3 ── Validity ────────────────────────────────────────── */}
        <Section
          number={3}
          title="Permit validity"
          subtitle={`"Valid to" fills in automatically (+${HOT_WORK_MAX_HOURS} hrs). You can shorten it.`}
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
                max={form.validFrom ? addHours(form.validFrom, HOT_WORK_MAX_HOURS) : undefined}
                onChange={(e) => set("validTo", e.target.value)}
              />
            </Field>
          </div>
          {duration !== null && (
            <p className={`mt-3 text-sm font-medium ${durationError ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}>
              {durationError
                ? `⚠️ Invalid period: must be more than 0 and max ${HOT_WORK_MAX_HOURS} hours`
                : `✓ Valid for ${Number.isInteger(duration) ? duration : duration.toFixed(1)} hours`}
            </p>
          )}
        </Section>

        {/* 4 ── Related permits & toolbox ───────────────────────── */}
        <Section number={4} title="Related permits & toolbox meeting">
          <QuestionRow label="Has an Enclosed Space Entry Permit been issued, if necessary?">
            <YesNoNa ariaLabel="Enclosed space entry permit" value={form.enclosedSpacePermit} onChange={(v) => set("enclosedSpacePermit", v)} />
          </QuestionRow>
          <QuestionRow label="Are other work permits required for this job?">
            <YesNoNa ariaLabel="Other permits required" options={["YES", "NO"]} value={form.otherPermitsRequired} onChange={(v) => set("otherPermitsRequired", v)} />
          </QuestionRow>
          {form.otherPermitsRequired === "YES" && (
            <div className="pb-3">
              <input className={inputCls} value={form.otherPermitsSpecify} onChange={(e) => set("otherPermitsSpecify", e.target.value)} placeholder="Specify which permits" aria-label="Specify other permits" />
            </div>
          )}
          <QuestionRow label="Toolbox meeting discussed and agreed by persons undertaking the hot work?">
            <YesNoNa ariaLabel="Toolbox meeting held" options={["YES", "NO"]} value={form.toolboxMeetingHeld} onChange={(v) => set("toolboxMeetingHeld", v)} />
          </QuestionRow>
        </Section>

        {/* 5 ── Check section ───────────────────────────────────── */}
        <Section
          number={5}
          title="Check section"
          subtitle="“All Yes” fills items 1–9 and 11 — choose item 10 yourself"
          right={
            <div className="flex items-center gap-3">
              <AllYesButton onClick={setAllChecksYes} />
              <Counter done={section5Done} total={SECTION5_TOTAL} />
            </div>
          }
        >
          {HOT_WORK_CHECKS.map((c, i) => (
            <QuestionRow key={c.id} number={i + 1} label={c.label}>
              <YesNoNa ariaLabel={c.label} value={form.checks[c.id]} onChange={(v) => setCheck(c.id, v)} />
            </QuestionRow>
          ))}

          <QuestionRow number={10} label="Type of ventilation?">
            <select
              className={`${inputCls} sm:w-56 ${ventilationMissing ? "border-amber-400 ring-2 ring-amber-300" : ""}`}
              value={form.ventilationType}
              onChange={(e) => set("ventilationType", e.target.value)}
              aria-label="Type of ventilation"
            >
              <option value="">Select…</option>
              {VENTILATION_TYPES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </QuestionRow>
          {ventilationMissing && (
            <p className="-mt-1 mb-2 text-sm text-amber-700 dark:text-amber-400">
              ↑ Item 10: choose the type of ventilation
            </p>
          )}

          <QuestionRow number={11} label="Are fire-watchmen nominated, instructed and standing by?">
            <YesNoNa ariaLabel="Fire-watchmen nominated" value={form.fireWatchNominated} onChange={(v) => set("fireWatchNominated", v)} />
          </QuestionRow>
          {form.fireWatchNominated === "YES" && (
            <div className="ml-0 sm:ml-6 mb-2 space-y-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4">
              <Field label="Fire-watchmen name(s)" required>
                <input className={inputCls} value={form.fireWatchNames} onChange={(e) => set("fireWatchNames", e.target.value)} placeholder="e.g. John Smith, Anna Jones" />
              </Field>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Is communication between fire-watchmen and bridge established?
                </p>
                <YesNoNa ariaLabel="Fire-watch to bridge communication" options={["YES", "NO"]} value={form.fireWatchBridgeComms} onChange={(v) => set("fireWatchBridgeComms", v)} />
              </div>
            </div>
          )}
        </Section>

        {/* 6 ── PPE ─────────────────────────────────────────────── */}
        <Section number={6} title="Personal protection required" subtitle="Item 12 — select all that apply">
          <div className="flex flex-wrap gap-2">
            {PPE_OPTIONS.map((item) => {
              const active = form.ppe.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={active}
                  onClick={() => togglePpe(item)}
                  className={`px-3 py-1.5 rounded-full border text-sm transition-colors cursor-pointer ${
                    active
                      ? "bg-blue-900 border-blue-900 text-white"
                      : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400"
                  }`}
                >
                  {active ? "✓ " : ""}{item}
                </button>
              )
            })}
          </div>
          <Field label="Others" className="mt-4">
            <input className={inputCls} value={form.ppeOther} onChange={(e) => set("ppeOther", e.target.value)} placeholder="Other protection, if any" />
          </Field>
        </Section>

        {/* 7 ── Special conditions ──────────────────────────────── */}
        <Section number={7} title="Special conditions or precautions" subtitle="Item 13">
          <textarea rows={3} className={inputCls} value={form.specialConditions} onChange={(e) => set("specialConditions", e.target.value)} placeholder="Specify, or leave empty if none" aria-label="Special conditions or precautions" />
        </Section>

        {/* 8 ── Fire prevention ─────────────────────────────────── */}
        <Section
          number={8}
          title="Fire prevention measures"
          subtitle="Item 14"
          right={
            <div className="flex items-center gap-3">
              <AllYesButton onClick={setAllFireMeasuresYes} />
              <Counter done={fireAnswered} total={FIRE_PREVENTION_MEASURES.length} />
            </div>
          }
        >
          {FIRE_PREVENTION_MEASURES.map((m) => (
            <QuestionRow key={m.id} label={m.label}>
              <YesNoNa ariaLabel={m.label} value={form.fireMeasures[m.id]} onChange={(v) => setFireMeasure(m.id, v)} />
            </QuestionRow>
          ))}
          <Field label="Additional measures (specify)" className="mt-3">
            <input className={inputCls} value={form.fireMeasuresAdditional} onChange={(e) => set("fireMeasuresAdditional", e.target.value)} />
          </Field>
        </Section>

        {/* 9 ── Authorization ───────────────────────────────────── */}
        <Section number={9} title="Authorization & acknowledgement">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Master (name)" required>
              <input className={inputCls} value={form.masterName} onChange={(e) => set("masterName", e.target.value)} />
            </Field>
            <Field label="Supervisor (name)" required>
              <input className={inputCls} value={form.supervisorName} onChange={(e) => set("supervisorName", e.target.value)} />
            </Field>
          </div>

          <div className="mt-4 space-y-3">
            <CheckItem checked={form.authorizationConfirmed} onChange={(v) => set("authorizationConfirmed", v)}>
              Master / Supervisor fully satisfied that all safety checks and precautions have been taken
              and will be maintained for the duration of the hot work.
            </CheckItem>
            <CheckItem checked={form.workersAcknowledged} onChange={(v) => set("workersAcknowledged", v)}>
              Persons carrying out hot work
              {namedWorkers.length > 0 && <strong> ({namedWorkers.join(", ")})</strong>} acknowledge
              understanding the safety procedures, precautions taken and the emergency procedures for
              this task.
            </CheckItem>
          </div>
        </Section>

        {/* 10 ── Work progress & close-out ─────────────────────── */}
        <Section
          number={10}
          title="Work progress & close-out"
          subtitle="Optional when creating — fill in as the work starts, is extended and ends"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="▶️ Work commenced (date & time)">
              <input
                type="datetime-local"
                className={inputCls}
                value={form.workCommencedAt}
                min={form.validFrom || undefined}
                onChange={(e) => set("workCommencedAt", e.target.value)}
              />
            </Field>
            <Field label="⏩ Extension granted to (date & time)">
              <input
                type="datetime-local"
                className={inputCls}
                value={form.extensionTo}
                min={form.validTo || undefined}
                onChange={(e) => set("extensionTo", e.target.value)}
              />
            </Field>
            <Field label="🏁 Work completed (date & time)">
              <input
                type="datetime-local"
                className={inputCls}
                value={form.workCompletedAt}
                min={form.workCommencedAt || undefined}
                onChange={(e) => set("workCompletedAt", e.target.value)}
              />
            </Field>
          </div>

          {/* Close-out */}
          <div className="mt-5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-emerald-700"
                checked={form.closeOutConfirmed}
                onChange={(e) => set("closeOutConfirmed", e.target.checked)}
              />
              <span className="text-base text-slate-700 dark:text-slate-300">
                The work has been completed and all persons under my supervision, materials and
                equipment have been withdrawn.
              </span>
            </label>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Authorized officer in charge" required={form.closeOutConfirmed}>
                <input
                  className={inputCls}
                  value={form.closeOutOfficer}
                  onChange={(e) => set("closeOutOfficer", e.target.value)}
                  placeholder="Full name"
                />
              </Field>
              <Field label="Close-out date & time" required={form.closeOutConfirmed}>
                <input
                  type="datetime-local"
                  className={inputCls}
                  value={form.closeOutAt}
                  min={form.workCompletedAt || undefined}
                  onChange={(e) => set("closeOutAt", e.target.value)}
                />
              </Field>
            </div>
          </div>

          <p className="mt-4 text-xs italic text-slate-500 dark:text-slate-400">
            This permit ensures that the work area has been assessed, hazards controlled, and all
            necessary safety precautions implemented before work commences.
          </p>
        </Section>
      </fieldset>

      {/* ── Sticky action bar ─────────────────────────────────────── */}
      <PermitActionBar
        mode={mode}
        permitId={permit?.id}
        canEdit={canEdit}
        saving={saving}
        onSaveDraft={handleSaveDraft}
        onIssue={handleIssue}
      />
    </div>
  )
}