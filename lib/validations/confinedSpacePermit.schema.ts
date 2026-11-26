import { z } from "zod"
import {
  BA_TESTS,
  CONFINED_SPACE_MAX_HOURS,
  EMERGENCY_EQUIPMENT,
  ENTRANT_CHECKS,
  EQUIPMENT_CHECKS,
  GAS_KEYS,
  OFFICER_CHECKS,
  gasStatus,
} from "@/app/workpermitsdashboard/_components/confinedSpaceOptions"

/**
 * confinedSpacePermit.schema — validation for the Confined Space Entry Permit (Form 33)
 *
 * Location: lib/validations/confinedSpacePermit.schema.ts
 *
 * Same idea as hotWorkPermit.schema.ts:
 *  - confinedSpaceDraftSchema  → Save Draft: shape only (types, lengths, formats)
 *  - confinedSpacePermitSchema → Issue Permit: + every required field and safe gas readings
 * Runs in the browser (error list) AND on the server (nobody can skip it).
 */

const text = (max: number) => z.string().max(max, `Text is too long (max ${max} characters)`)
const dateStr = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Invalid date")
const timeStr = z.string().regex(/^(\d{2}:\d{2}(:\d{2})?)?$/, "Invalid time")
const dateTimeStr = z.string().regex(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?)?$/, "Invalid date/time")
const flags = z.record(z.string(), z.boolean())
const gas = text(20)

/** Hours between two datetime-local strings */
function hoursBetween(from: string, to: string) {
  return (new Date(to).getTime() - new Date(from).getTime()) / 3_600_000
}

/** Section C: "baTested" is replaced by its 3 sub-tests (same as the form) */
export const CS_EQUIPMENT_ITEMS = [
  ...EQUIPMENT_CHECKS.filter((c) => c.id !== "baTested"),
  ...BA_TESTS,
]

/** Paper form has 5 rows for personnel entering */
export const CS_MAX_PERSONNEL = 5

const signer = z.object({ name: text(200), at: dateTimeStr })

const entryLogRow = z.object({
  id: text(50),
  name: text(200),
  date: dateStr,
  timeIn: timeStr,
  timeOut: timeStr,
  remarks: text(500),
})

const atmosphereRow = z.object({
  id: text(50),
  at: dateTimeStr,
  oxygen: gas,
  hydrocarbon: gas,
  co: gas,
  h2s: gas,
  toxicGases: text(200),
  otherGases: text(200),
  signRank: text(200),
})

// ─── Draft: shape only ───────────────────────────────────────────────────────
export const confinedSpaceDraftSchema = z.object({
  // 1. General
  projectVoyage: text(200),
  location: text(300),
  reason: text(4000),
  // 2. Validity
  validFrom: dateTimeStr,
  validTo: dateTimeStr,
  permitPosted: z.boolean(),
  // A, B, C, emergency equipment
  officerChecks: flags,
  entrantChecks: flags,
  reportingIntervalMin: text(10),
  equipmentChecks: flags,
  emergencyEquipment: flags,
  // Pre-entry atmosphere
  preEntry: z.object({ oxygen: gas, hydrocarbon: gas, co: gas, h2s: gas }),
  preEntryBy: text(200),
  preEntryAt: dateTimeStr,
  // Authorization
  master: signer,
  supervisor: signer,
  officerInCharge: signer,
  rescueLeader: text(200),
  rescueMembers: z.array(text(200)).max(30, "Max 30 rescue members"),
  allSatisfied: z.boolean(),
  // Personnel
  personnel: z.array(text(200)).max(CS_MAX_PERSONNEL, `Max ${CS_MAX_PERSONNEL} persons entering the space`),
  // During work
  entryLog: z.array(entryLogRow).max(200, "Too many entry log rows"),
  atmosphereChecks: z.array(atmosphereRow).max(200, "Too many atmosphere readings"),
  // Completion
  completionConfirmed: z.boolean(),
  completionOfficer: text(200),
  completionAt: dateTimeStr,
})

// ─── Issue Permit: everything required ───────────────────────────────────────
/** Same messages as the old validate() in the form */
export const confinedSpacePermitSchema = confinedSpaceDraftSchema.superRefine((f, ctx) => {
  const add = (message: string) => ctx.addIssue({ code: "custom", message })

  if (!f.location.trim()) add("Location / name of enclosed space is required")
  if (!f.reason.trim()) add("Reason for entry is required")
  if (!f.validFrom || !f.validTo) {
    add("Permit validity (from / to) is required")
  } else {
    const hours = hoursBetween(f.validFrom, f.validTo)
    if (!(hours > 0 && hours <= CONFINED_SPACE_MAX_HOURS))
      add(`Permit must end after it starts and last max ${CONFINED_SPACE_MAX_HOURS} hours`)
  }
  if (!f.permitPosted) add("Confirm permit posted outside the space with a “SAFE FOR ENTRY” tag")

  if (OFFICER_CHECKS.some((c) => !f.officerChecks[c.id]))
    add(`Section A: confirm all ${OFFICER_CHECKS.length} responsible officer checks`)
  if (ENTRANT_CHECKS.some((c) => !f.entrantChecks[c.id]))
    add(`Section B: confirm all ${ENTRANT_CHECKS.length} person-entering checks`)
  if (!(Number(f.reportingIntervalMin) > 0)) add("Section B: enter the agreed reporting interval (minutes)")
  if (CS_EQUIPMENT_ITEMS.some((c) => !f.equipmentChecks[c.id])) add("Section C: confirm all SCBA and equipment checks")

  const statuses = GAS_KEYS.map((g) => gasStatus(g, f.preEntry[g]))
  if (statuses.some((s) => s === "")) add("Pre-entry atmosphere test: enter all 4 readings")
  else if (statuses.some((s) => s === "UNSAFE"))
    add("⚠ Pre-entry atmosphere is NOT within safe limits — permit cannot be issued")
  if (!f.preEntryBy.trim()) add("Pre-entry atmosphere test: enter who tested")
  if (!f.preEntryAt) add("Pre-entry atmosphere test: enter the test time")

  if (EMERGENCY_EQUIPMENT.some((c) => !f.emergencyEquipment[c.id])) add("Confirm all emergency equipment at the entrance")

  if (!f.master.name.trim() || !f.master.at) add("Master or nominated personnel: name and date/time")
  if (!f.supervisor.name.trim() || !f.supervisor.at) add("Responsible for supervising entry: name and date/time")
  if (!f.officerInCharge.name.trim() || !f.officerInCharge.at) add("Responsible officer in charge: name and date/time")
  if (!f.rescueLeader.trim()) add("Rescue team leader is required")
  if (f.rescueMembers.filter((p) => p.trim()).length === 0) add("Add at least one rescue team member")
  if (!f.allSatisfied) add("Confirm all safety checks and precautions have been taken")
  if (f.personnel.filter((p) => p.trim()).length === 0) add("Add at least one person entering the space")

  // Optional sections — must make sense if filled
  f.entryLog.forEach((r, i) => {
    if (r.timeIn && r.timeOut && r.timeOut <= r.timeIn) add(`Entry log row ${i + 1}: time out must be after time in`)
  })
  if (f.completionConfirmed && (!f.completionOfficer.trim() || !f.completionAt))
    add("Completion certificate needs the officer's name and date/time")
})

export type ConfinedSpaceFormValues = z.infer<typeof confinedSpaceDraftSchema>

/** Error messages as a simple list (for the red box at the top of the form) */
export function zodMessages(error: z.ZodError): string[] {
  return Array.from(new Set(error.issues.map((i) => i.message)))
}