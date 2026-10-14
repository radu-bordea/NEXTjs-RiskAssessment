"use client"

/**
 * ConfinedSpacePermitForm — Confined Space Entry Permit (Form 33, Rev 001) — UI only
 *
 * Built from the paper form, reorganised into clear sections:
 *  1. General                       7. Emergency equipment at entrance
 *  2. Validity (max 8 hrs)          8. Authorization & rescue team
 *  3. A. Responsible officer checks 9. Personnel entering space
 *  4. B. Person entering checks    10. Entry log (time in / out)
 *  5. C. SCBA & equipment checks   11. Regular atmosphere checks
 *  6. Pre-entry atmosphere test    12. Completion certificate
 *
 * Sections 10–12 are filled in DURING / AFTER the work → optional when creating.
 * Not connected to DB yet — Save Draft / Issue Permit only console.log.
 */

import { useState } from "react"
import Link from "next/link"
import {
  BA_TESTS,
  CONFINED_SPACE_MAX_HOURS,
  EMERGENCY_EQUIPMENT,
  ENTRANT_CHECKS,
  EQUIPMENT_CHECKS,
  GAS_KEYS,
  GAS_LIMITS,
  OFFICER_CHECKS,
  gasStatus,
  type GasKey,
} from "./confinedSpaceOptions"
import { WORK_PERMITS_BASE } from "./permitTypes"
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
  inputCls,
  ReadOnlyField,
  newRowId,
} from "./permitFormUI"

// ─── Types ───────────────────────────────────────────────────────────────────
type Checks = Record<string, boolean>

type Signer = { name: string; at: string }

type EntryLogRow = {
  id: string
  name: string
  date: string
  timeIn: string
  timeOut: string
  remarks: string
}

type AtmosphereRow = {
  id: string
  at: string
  oxygen: string
  hydrocarbon: string
  co: string
  h2s: string
  toxicGases: string
  otherGases: string
  signRank: string
}

type FormState = {
  // 1. General
  projectVoyage: string
  location: string
  reason: string
  // 2. Validity
  validFrom: string
  validTo: string
  permitPosted: boolean
  // 3–5, 7. Checklists
  officerChecks: Checks
  entrantChecks: Checks
  reportingIntervalMin: string
  equipmentChecks: Checks
  emergencyEquipment: Checks
  // 6. Pre-entry atmosphere test
  preEntry: Record<GasKey, string>
  preEntryBy: string
  preEntryAt: string
  // 8. Authorization
  master: Signer
  supervisor: Signer
  officerInCharge: Signer
  rescueLeader: string
  rescueMembers: string[]
  allSatisfied: boolean
  // 9. Personnel
  personnel: string[]
  // 10–11. During work
  entryLog: EntryLogRow[]
  atmosphereChecks: AtmosphereRow[]
  // 12. Completion
  completionConfirmed: boolean
  completionOfficer: string
  completionAt: string
}

// ─── Initial state ───────────────────────────────────────────────────────────
const allFalse = (items: readonly { id: string }[]) =>
  Object.fromEntries(items.map((i) => [i.id, false])) as Checks

/** C. equipment: "baTested" is replaced by its 3 sub-tests */
const EQUIPMENT_ITEMS = [
  ...EQUIPMENT_CHECKS.filter((c) => c.id !== "baTested"),
  ...BA_TESTS,
]

const emptySigner: Signer = { name: "", at: "" }

const newEntryRow = (): EntryLogRow => ({
  id: newRowId(), name: "", date: "", timeIn: "", timeOut: "", remarks: "",
})

const newAtmosphereRow = (): AtmosphereRow => ({
  id: newRowId(), at: "", oxygen: "", hydrocarbon: "", co: "", h2s: "",
  toxicGases: "", otherGases: "", signRank: "",
})

const initialState: FormState = {
  projectVoyage: "",
  location: "",
  reason: "",
  validFrom: "",
  validTo: "",
  permitPosted: false,
  officerChecks: allFalse(OFFICER_CHECKS),
  entrantChecks: allFalse(ENTRANT_CHECKS),
  reportingIntervalMin: "",
  equipmentChecks: allFalse(EQUIPMENT_ITEMS),
  emergencyEquipment: allFalse(EMERGENCY_EQUIPMENT),
  preEntry: { oxygen: "", hydrocarbon: "", co: "", h2s: "" },
  preEntryBy: "",
  preEntryAt: "",
  master: emptySigner,
  supervisor: emptySigner,
  officerInCharge: emptySigner,
  rescueLeader: "",
  rescueMembers: [""],
  allSatisfied: false,
  personnel: [""],
  entryLog: [],
  atmosphereChecks: [],
  completionConfirmed: false,
  completionOfficer: "",
  completionAt: "",
}

const countTrue = (c: Checks) => Object.values(c).filter(Boolean).length

const MAX_PERSONNEL = 5 // paper form has 5 rows — ask client if this is a hard limit

// ─── Small local pieces ──────────────────────────────────────────────────────
function GasBadge({ status }: { status: "" | "SAFE" | "UNSAFE" }) {
  if (!status) return null
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
        status === "SAFE"
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
      }`}
    >
      {status === "SAFE" ? "✓ Safe" : "⚠ Unsafe"}
    </span>
  )
}

/** Input that turns red when the gas reading is outside the safe limit */
function GasInput({
  gas,
  value,
  onChange,
  showLimit,
}: {
  gas: GasKey
  value: string
  onChange: (v: string) => void
  showLimit?: boolean
}) {
  const status = gasStatus(gas, value)
  const { label, unit, limitText } = GAS_LIMITS[gas]
  return (
    <Field label={`${label} (${unit})`} hint={showLimit ? `Safe: ${limitText}` : undefined}>
      <input
        type="number"
        inputMode="decimal"
        step="0.1"
        className={`${inputCls} ${status === "UNSAFE" ? "border-red-500 bg-red-50 dark:bg-red-950/30 focus:ring-red-500" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  )
}

function SignerFields({
  title,
  value,
  onChange,
}: {
  title: string
  value: Signer
  onChange: (v: Signer) => void
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
      <Field label="Name" required>
        <input className={inputCls} value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
      </Field>
      <Field label="Date & time" required>
        <input type="datetime-local" className={inputCls} value={value.at} onChange={(e) => onChange({ ...value, at: e.target.value })} />
      </Field>
    </div>
  )
}

/** Editable list of names (rescue members, personnel entering) */
function NameList({
  values,
  onChange,
  placeholder,
  addLabel,
  max,
}: {
  values: string[]
  onChange: (v: string[]) => void
  placeholder: (i: number) => string
  addLabel: string
  max?: number
}) {
  return (
    <>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={inputCls}
              value={v}
              placeholder={placeholder(i)}
              aria-label={placeholder(i)}
              onChange={(e) => onChange(values.map((x, idx) => (idx === i ? e.target.value : x)))}
            />
            {values.length > 1 && (
              <RemoveButton label={`Remove ${placeholder(i)}`} onClick={() => onChange(values.filter((_, idx) => idx !== i))} />
            )}
          </div>
        ))}
      </div>
      {(max === undefined || values.length < max) && (
        <AddButton onClick={() => onChange([...values, ""])}>{addLabel}</AddButton>
      )}
    </>
  )
}

// ─── Main form ───────────────────────────────────────────────────────────────
export default function ConfinedSpacePermitForm({ vessel }: { vessel: string }) {
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  /** Toggle one item inside a checklist group */
  const toggle = (group: "officerChecks" | "entrantChecks" | "equipmentChecks" | "emergencyEquipment", id: string, value: boolean) =>
    setForm((f) => ({ ...f, [group]: { ...f[group], [id]: value } }))

  /** Tick / untick a whole checklist group */
  const setAll = (group: "officerChecks" | "entrantChecks" | "equipmentChecks" | "emergencyEquipment", value: boolean) =>
    setForm((f) => ({
      ...f,
      [group]: Object.fromEntries(Object.keys(f[group]).map((k) => [k, value])),
    }))

  const setPreEntry = (gas: GasKey, value: string) =>
    setForm((f) => ({ ...f, preEntry: { ...f.preEntry, [gas]: value } }))

  /** Setting "valid from" auto-fills "valid to" = from + 8 hrs */
  const handleValidFrom = (value: string) =>
    setForm((f) => ({
      ...f,
      validFrom: value,
      validTo: value ? addHours(value, CONFINED_SPACE_MAX_HOURS) : "",
    }))

  // Entry log rows
  const updateEntry = (id: string, patch: Partial<EntryLogRow>) =>
    setForm((f) => ({ ...f, entryLog: f.entryLog.map((r) => (r.id === id ? { ...r, ...patch } : r)) }))
  const removeEntry = (id: string) =>
    setForm((f) => ({ ...f, entryLog: f.entryLog.filter((r) => r.id !== id) }))

  // Atmosphere check rows
  const updateAtmo = (id: string, patch: Partial<AtmosphereRow>) =>
    setForm((f) => ({ ...f, atmosphereChecks: f.atmosphereChecks.map((r) => (r.id === id ? { ...r, ...patch } : r)) }))
  const removeAtmo = (id: string) =>
    setForm((f) => ({ ...f, atmosphereChecks: f.atmosphereChecks.filter((r) => r.id !== id) }))

  // ── Derived values ──
  const duration = form.validFrom && form.validTo ? hoursBetween(form.validFrom, form.validTo) : null
  const durationError = duration !== null && (duration <= 0 || duration > CONFINED_SPACE_MAX_HOURS)

  const officerDone = countTrue(form.officerChecks)
  const entrantDone = countTrue(form.entrantChecks)
  const equipmentDone = countTrue(form.equipmentChecks)
  const emergencyDone = countTrue(form.emergencyEquipment)

  const preEntryStatuses = GAS_KEYS.map((g) => gasStatus(g, form.preEntry[g]))
  const preEntryComplete = preEntryStatuses.every((s) => s !== "")
  const preEntryUnsafe = preEntryStatuses.some((s) => s === "UNSAFE")

  const namedPersonnel = form.personnel.filter((p) => p.trim())
  const namedRescue = form.rescueMembers.filter((p) => p.trim())

  const unsafeAtmoRows = form.atmosphereChecks.filter((r) =>
    GAS_KEYS.some((g) => gasStatus(g, r[g]) === "UNSAFE")
  ).length

  // ── Validation (only for Issue Permit — drafts can be incomplete) ──
  function validate() {
    const e: string[] = []
    if (!form.location.trim()) e.push("Location / name of enclosed space is required")
    if (!form.reason.trim()) e.push("Reason for entry is required")
    if (!form.validFrom || !form.validTo) e.push("Permit validity (from / to) is required")
    else if (durationError) e.push(`Permit must end after it starts and last max ${CONFINED_SPACE_MAX_HOURS} hours`)
    if (!form.permitPosted) e.push("Confirm permit posted outside the space with a “SAFE FOR ENTRY” tag")

    if (officerDone < OFFICER_CHECKS.length) e.push(`Section A: confirm all ${OFFICER_CHECKS.length} responsible officer checks`)
    if (entrantDone < ENTRANT_CHECKS.length) e.push(`Section B: confirm all ${ENTRANT_CHECKS.length} person-entering checks`)
    const minutes = Number(form.reportingIntervalMin)
    if (!form.reportingIntervalMin || !(minutes > 0)) e.push("Section B: enter the agreed reporting interval (minutes)")
    if (equipmentDone < EQUIPMENT_ITEMS.length) e.push("Section C: confirm all SCBA and equipment checks")

    if (!preEntryComplete) e.push("Pre-entry atmosphere test: enter all 4 readings")
    else if (preEntryUnsafe) e.push("⚠ Pre-entry atmosphere is NOT within safe limits — permit cannot be issued")
    if (!form.preEntryBy.trim()) e.push("Pre-entry atmosphere test: enter who tested")
    if (!form.preEntryAt) e.push("Pre-entry atmosphere test: enter the test time")

    if (emergencyDone < EMERGENCY_EQUIPMENT.length) e.push("Confirm all emergency equipment at the entrance")

    if (!form.master.name.trim() || !form.master.at) e.push("Master or nominated personnel: name and date/time")
    if (!form.supervisor.name.trim() || !form.supervisor.at) e.push("Responsible for supervising entry: name and date/time")
    if (!form.officerInCharge.name.trim() || !form.officerInCharge.at) e.push("Responsible officer in charge: name and date/time")
    if (!form.rescueLeader.trim()) e.push("Rescue team leader is required")
    if (namedRescue.length === 0) e.push("Add at least one rescue team member")
    if (!form.allSatisfied) e.push("Confirm all safety checks and precautions have been taken")
    if (namedPersonnel.length === 0) e.push("Add at least one person entering the space")

    // Optional sections — must make sense if filled
    form.entryLog.forEach((r, i) => {
      if (r.timeIn && r.timeOut && r.timeOut <= r.timeIn) e.push(`Entry log row ${i + 1}: time out must be after time in`)
    })
    if (form.completionConfirmed && (!form.completionOfficer.trim() || !form.completionAt))
      e.push("Completion certificate needs the officer's name and date/time")
    return e
  }

  function handleSaveDraft() {
    setErrors([])
    console.log("SAVE DRAFT", { vessel, ...form })
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
    console.log("ISSUE PERMIT", { vessel, ...form })
    setMessage("Permit ready to issue (UI only — not stored in the database yet).")
  }

  /** "Tick all" link for long checklists */
  const tickAll = (group: "officerChecks" | "entrantChecks" | "equipmentChecks" | "emergencyEquipment", allDone: boolean) => (
    <button
      type="button"
      onClick={() => setAll(group, !allDone)}
      className="text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline cursor-pointer whitespace-nowrap"
    >
      {allDone ? "Untick all" : "Tick all"}
    </button>
  )

  return (
    <div className={`${FORM_WIDTH} mx-auto px-4 sm:px-6 py-8 pb-32`}>

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <Link href={WORK_PERMITS_BASE} className="text-sm text-blue-900 dark:text-blue-400 hover:underline">
        ← Back to Work Permits
      </Link>

      <div className="mt-4 mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-2xl">
          🚪
        </div>
        <div>
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">Confined Space Entry Permit</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Form 33 · Revision 001 · Last revised 20.05.25
          </p>
        </div>
      </div>

      {/* ── Intro ────────────────────────────────────────────────── */}
      <div className="mb-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
        <p>An <strong>enclosed space</strong> is a space that:</p>
        <ul className="list-disc pl-5 mt-1 space-y-0.5">
          <li>has limited openings for entry and exit;</li>
          <li>has inadequate ventilation;</li>
          <li>is not designed to be continuously occupied by crew members.</li>
        </ul>
        <p className="mt-2">
          This permit ensures that the work area has been assessed, hazards controlled, and all
          necessary safety precautions implemented before work commences.
        </p>
        <p className="mt-2 font-medium text-slate-700 dark:text-slate-300">
          This permit cannot be issued for more than one enclosed space.
        </p>
      </div>

      <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
        <span aria-hidden>⚠️</span>
        <span>
          Valid for <strong>max {CONFINED_SPACE_MAX_HOURS} hours</strong>. The permit becomes{" "}
          <strong>invalid</strong> if ventilation of the space stops, if the personal gas detector
          alarms, or if any condition in the checklist changes.
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

        {/* 1 ── General ─────────────────────────────────────────── */}
        <Section number={1} title="General">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReadOnlyField label="Vessel" value={vessel} hint="From your login" />
            <Field label="Project / Voyage">
              <input className={inputCls} value={form.projectVoyage} onChange={(e) => set("projectVoyage", e.target.value)} placeholder="e.g. Survey 2026-14" />
            </Field>
            <Field label="Location / name of enclosed space" required className="sm:col-span-2">
              <input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Ballast tank 3P" />
            </Field>
            <Field label="Reason for entry" required className="sm:col-span-2">
              <textarea rows={3} className={inputCls} value={form.reason} onChange={(e) => set("reason", e.target.value)} placeholder="Why is entry needed?" />
            </Field>
          </div>
        </Section>

        {/* 2 ── Validity ────────────────────────────────────────── */}
        <Section
          number={2}
          title="Permit validity"
          subtitle={`"Valid to" fills in automatically (+${CONFINED_SPACE_MAX_HOURS} hrs). You can shorten it.`}
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
                max={form.validFrom ? addHours(form.validFrom, CONFINED_SPACE_MAX_HOURS) : undefined}
                onChange={(e) => set("validTo", e.target.value)}
              />
            </Field>
          </div>
          {duration !== null && (
            <p className={`mt-3 text-sm font-medium ${durationError ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}>
              {durationError
                ? `⚠️ Invalid period: must be more than 0 and max ${CONFINED_SPACE_MAX_HOURS} hours`
                : `✓ Valid for ${Number.isInteger(duration) ? duration : duration.toFixed(1)} hours`}
            </p>
          )}
          <div className="mt-4">
            <CheckItem checked={form.permitPosted} onChange={(v) => set("permitPosted", v)}>
              A copy of this permit is posted outside the enclosed space, with a{" "}
              <strong>“SAFE FOR ENTRY”</strong> tag.
            </CheckItem>
          </div>
        </Section>

        {/* 3 ── A. Responsible officer ──────────────────────────── */}
        <Section
          number="A"
          title="Responsible officer to check"
          subtitle="Checks before entering the enclosed space"
          right={<div className="flex items-center gap-3">{tickAll("officerChecks", officerDone === OFFICER_CHECKS.length)}<Counter done={officerDone} total={OFFICER_CHECKS.length} /></div>}
        >
          <div className="space-y-2">
            {OFFICER_CHECKS.map((c) => (
              <CheckItem key={c.id} checked={form.officerChecks[c.id]} onChange={(v) => toggle("officerChecks", c.id, v)}>
                {c.label}
              </CheckItem>
            ))}
          </div>
        </Section>

        {/* 4 ── B. Person entering ──────────────────────────────── */}
        <Section
          number="B"
          title="Person entering space to check"
          right={<div className="flex items-center gap-3">{tickAll("entrantChecks", entrantDone === ENTRANT_CHECKS.length)}<Counter done={entrantDone} total={ENTRANT_CHECKS.length} /></div>}
        >
          <div className="space-y-2">
            {ENTRANT_CHECKS.map((c) => (
              <div key={c.id}>
                <CheckItem checked={form.entrantChecks[c.id]} onChange={(v) => toggle("entrantChecks", c.id, v)}>
                  {c.label}
                </CheckItem>
                {c.id === "reportingInterval" && (
                  <div className="mt-2 ml-7 flex items-center gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      className={`${inputCls} w-28`}
                      value={form.reportingIntervalMin}
                      onChange={(e) => set("reportingIntervalMin", e.target.value)}
                      aria-label="Reporting interval in minutes"
                      placeholder="e.g. 15"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">minutes</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* 5 ── C. SCBA & equipment ─────────────────────────────── */}
        <Section
          number="C"
          title="SCBA and other equipment check"
          right={<div className="flex items-center gap-3">{tickAll("equipmentChecks", equipmentDone === EQUIPMENT_ITEMS.length)}<Counter done={equipmentDone} total={EQUIPMENT_ITEMS.length} /></div>}
        >
          <div className="space-y-2">
            {EQUIPMENT_CHECKS.map((c) =>
              c.id === "baTested" ? (
                <div key={c.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                  <p className="text-base text-slate-700 dark:text-slate-300 mb-2">
                    The breathing apparatus has been tested as follows:
                  </p>
                  <div className="space-y-2 sm:pl-4">
                    {BA_TESTS.map((t) => (
                      <CheckItem key={t.id} checked={form.equipmentChecks[t.id]} onChange={(v) => toggle("equipmentChecks", t.id, v)}>
                        {t.label}
                      </CheckItem>
                    ))}
                  </div>
                </div>
              ) : (
                <CheckItem key={c.id} checked={form.equipmentChecks[c.id]} onChange={(v) => toggle("equipmentChecks", c.id, v)}>
                  {c.label}
                </CheckItem>
              )
            )}
          </div>
        </Section>

        {/* 6 ── Pre-entry atmosphere ────────────────────────────── */}
        <Section
          number={6}
          title="Pre-entry atmosphere test"
          subtitle="Instruments to be checked before measurement"
          right={
            preEntryComplete ? (
              <span className={`text-sm font-bold whitespace-nowrap ${preEntryUnsafe ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}>
                {preEntryUnsafe ? "⚠ NOT SAFE" : "✓ SAFE FOR ENTRY"}
              </span>
            ) : undefined
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GAS_KEYS.map((g) => (
              <div key={g} className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Safe: {GAS_LIMITS[g].limitText}</span>
                  <GasBadge status={gasStatus(g, form.preEntry[g])} />
                </div>
                <GasInput gas={g} value={form.preEntry[g]} onChange={(v) => setPreEntry(g, v)} />
              </div>
            ))}
            <Field label="Tested by" required>
              <input className={inputCls} value={form.preEntryBy} onChange={(e) => set("preEntryBy", e.target.value)} placeholder="Name / rank" />
            </Field>
            <Field label="Time of test" required>
              <input type="datetime-local" className={inputCls} value={form.preEntryAt} onChange={(e) => set("preEntryAt", e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* 7 ── Emergency equipment ─────────────────────────────── */}
        <Section
          number={7}
          title="Emergency equipment at entrance"
          subtitle="Confirm available at the entrance to the space"
          right={<div className="flex items-center gap-3">{tickAll("emergencyEquipment", emergencyDone === EMERGENCY_EQUIPMENT.length)}<Counter done={emergencyDone} total={EMERGENCY_EQUIPMENT.length} /></div>}
        >
          <div className="space-y-2">
            {EMERGENCY_EQUIPMENT.map((c) => (
              <CheckItem key={c.id} checked={form.emergencyEquipment[c.id]} onChange={(v) => toggle("emergencyEquipment", c.id, v)}>
                {c.label}
              </CheckItem>
            ))}
          </div>
        </Section>

        {/* 8 ── Authorization & rescue team ─────────────────────── */}
        <Section number={8} title="Authorization & rescue team" subtitle="Signed by all involved persons after Sections A, B and C are completed">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SignerFields title="Master or nominated personnel" value={form.master} onChange={(v) => set("master", v)} />
            <SignerFields title="Responsible for supervising entry" value={form.supervisor} onChange={(v) => set("supervisor", v)} />
            <SignerFields title="Responsible officer in charge" value={form.officerInCharge} onChange={(v) => set("officerInCharge", v)} />
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Rescue team leader" required>
              <input className={inputCls} value={form.rescueLeader} onChange={(e) => set("rescueLeader", e.target.value)} />
            </Field>
            <div>
              <span className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Rescue team members <span className="text-red-500">*</span>
              </span>
              <NameList
                values={form.rescueMembers}
                onChange={(v) => set("rescueMembers", v)}
                placeholder={(i) => `Rescue member ${i + 1}`}
                addLabel="+ Add rescue member"
              />
            </div>
          </div>

          <div className="mt-5">
            <CheckItem checked={form.allSatisfied} onChange={(v) => set("allSatisfied", v)}>
              The responsible person in attendance, rescue team leader, responsible officer and Master
              (or nominated personnel) are fully satisfied that <strong>ALL</strong> safety checks and
              precautions have been taken and will be maintained for the duration of the work.
            </CheckItem>
          </div>
        </Section>

        {/* 9 ── Personnel entering ──────────────────────────────── */}
        <Section number={9} title="Personnel entering space" subtitle={`Up to ${MAX_PERSONNEL} persons — person 1 is the team leader`}>
          <NameList
            values={form.personnel}
            onChange={(v) => set("personnel", v)}
            placeholder={(i) => (i === 0 ? "Person 1 — team leader" : `Person ${i + 1} — full name`)}
            addLabel="+ Add person"
            max={MAX_PERSONNEL}
          />
        </Section>

        {/* 10 ── Entry log ──────────────────────────────────────── */}
        <Section number={10} title="Entry log" subtitle="Optional when creating — record each entry and exit during the work">
          {form.entryLog.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">No entries recorded yet.</p>
          )}

          {/* Names typed above are suggested here */}
          <datalist id="cs-personnel">
            {namedPersonnel.map((p) => <option key={p} value={p} />)}
          </datalist>

          <div className="space-y-3">
            {form.entryLog.map((r, i) => (
              <div key={r.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">Entry {i + 1}</span>
                  <RemoveButton label={`Remove entry ${i + 1}`} onClick={() => removeEntry(r.id)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Field label="Person" className="sm:col-span-2 lg:col-span-1">
                    <input className={inputCls} list="cs-personnel" value={r.name} onChange={(e) => updateEntry(r.id, { name: e.target.value })} />
                  </Field>
                  <Field label="Date">
                    <input type="date" className={inputCls} value={r.date} onChange={(e) => updateEntry(r.id, { date: e.target.value })} />
                  </Field>
                  <Field label="Time in">
                    <input type="time" className={inputCls} value={r.timeIn} onChange={(e) => updateEntry(r.id, { timeIn: e.target.value })} />
                  </Field>
                  <Field label="Time out">
                    <input type="time" className={inputCls} value={r.timeOut} min={r.timeIn || undefined} onChange={(e) => updateEntry(r.id, { timeOut: e.target.value })} />
                  </Field>
                  <Field label="Remarks" className="sm:col-span-2 lg:col-span-4">
                    <input className={inputCls} value={r.remarks} onChange={(e) => updateEntry(r.id, { remarks: e.target.value })} />
                  </Field>
                </div>
              </div>
            ))}
          </div>
          <AddButton onClick={() => set("entryLog", [...form.entryLog, newEntryRow()])}>+ Add entry</AddButton>
        </Section>

        {/* 11 ── Regular atmosphere checks ──────────────────────── */}
        <Section
          number={11}
          title="Systematic regular check of tank atmosphere"
          subtitle="Optional when creating — add a reading at each check"
          right={
            unsafeAtmoRows > 0 ? (
              <span className="text-sm font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                ⚠ {unsafeAtmoRows} unsafe
              </span>
            ) : undefined
          }
        >
          {form.atmosphereChecks.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">No readings recorded yet.</p>
          )}
          <div className="space-y-3">
            {form.atmosphereChecks.map((r, i) => {
              const unsafe = GAS_KEYS.some((g) => gasStatus(g, r[g]) === "UNSAFE")
              return (
                <div
                  key={r.id}
                  className={`rounded-lg border p-4 ${unsafe ? "border-red-300 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20" : "border-slate-200 dark:border-slate-800"}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                      Reading {i + 1}{" "}
                      {unsafe && <span className="ml-2 text-red-600 dark:text-red-400">⚠ Evacuate — outside safe limits</span>}
                    </span>
                    <RemoveButton label={`Remove reading ${i + 1}`} onClick={() => removeAtmo(r.id)} />
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Field label="Date & time" className="col-span-2">
                      <input type="datetime-local" className={inputCls} value={r.at} onChange={(e) => updateAtmo(r.id, { at: e.target.value })} />
                    </Field>
                    <Field label="Sign / rank" className="col-span-2">
                      <input className={inputCls} value={r.signRank} onChange={(e) => updateAtmo(r.id, { signRank: e.target.value })} placeholder="Name, rank" />
                    </Field>
                    {GAS_KEYS.map((g) => (
                      <GasInput key={g} gas={g} value={r[g]} onChange={(v) => updateAtmo(r.id, { [g]: v } as Partial<AtmosphereRow>)} />
                    ))}
                    <Field label="Toxic gases (ppm)" className="col-span-2">
                      <input className={inputCls} value={r.toxicGases} onChange={(e) => updateAtmo(r.id, { toxicGases: e.target.value })} placeholder="Gas and reading" />
                    </Field>
                    <Field label="Any other gases" className="col-span-2">
                      <input className={inputCls} value={r.otherGases} onChange={(e) => updateAtmo(r.id, { otherGases: e.target.value })} />
                    </Field>
                  </div>
                </div>
              )
            })}
          </div>
          <AddButton onClick={() => set("atmosphereChecks", [...form.atmosphereChecks, newAtmosphereRow()])}>
            + Add reading
          </AddButton>
        </Section>

        {/* 12 ── Completion certificate ─────────────────────────── */}
        <Section number={12} title="Completion certificate" subtitle="Optional when creating — fill in when the job is done">
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-emerald-700"
                checked={form.completionConfirmed}
                onChange={(e) => set("completionConfirmed", e.target.checked)}
              />
              <span className="text-base text-slate-700 dark:text-slate-300">
                Job has been completed and the space has been secured against entry, while the officer
                of the watch has been duly informed. All personnel who worked in the space are safe
                outside the space.
              </span>
            </label>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Responsible officer in charge" required={form.completionConfirmed}>
                <input className={inputCls} value={form.completionOfficer} onChange={(e) => set("completionOfficer", e.target.value)} placeholder="Full name" />
              </Field>
              <Field label="Date & time" required={form.completionConfirmed}>
                <input type="datetime-local" className={inputCls} value={form.completionAt} onChange={(e) => set("completionAt", e.target.value)} />
              </Field>
            </div>
          </div>
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