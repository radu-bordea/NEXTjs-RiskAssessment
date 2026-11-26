import { z } from "zod"
import {
  FIRE_PREVENTION_MEASURES,
  HOT_WORK_CHECKS,
  HOT_WORK_MAX_HOURS,
} from "@/app/workpermitsdashboard/_components/hotWorkOptions"

/**
 * hotWorkPermit.schema — validation for the Hot Work Permit form (Form 34)
 *
 * Location: lib/validations/hotWorkPermit.schema.ts
 *
 * Same idea as observation.schema.ts:
 *  - hotWorkDraftSchema → Save Draft: only checks the shape (types, lengths, formats).
 *                         A draft can be empty or half-filled.
 *  - hotWorkPermitSchema → Issue Permit: the draft rules + every required field.
 *
 * Used in BOTH places:
 *  - the browser (HotWorkPermitForm) → shows the list of errors at the top
 *  - the server (hotWorkPermit.actions) → checks again, so nobody can skip it
 *
 * Dates are kept as the strings the inputs give:
 *  - date      → "2026-11-25"        (<input type="date">)
 *  - date/time → "2026-11-25T08:30"  (<input type="datetime-local">)
 */

const answer = z.enum(["YES", "NO", "NA", ""])

const text = (max: number) => z.string().max(max, `Text is too long (max ${max} characters)`)
const dateStr = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Invalid date")
const dateTimeStr = z.string().regex(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?)?$/, "Invalid date/time")

/** Hours between two datetime-local strings (same time zone, so the difference is right) */
function hoursBetween(from: string, to: string) {
  return (new Date(to).getTime() - new Date(from).getTime()) / 3_600_000
}

// ─── Draft: shape only ───────────────────────────────────────────────────────
export const hotWorkDraftSchema = z.object({
  // 1. General
  projectVoyage: text(200),
  date: dateStr,
  location: text(300),
  description: text(4000),
  responsiblePerson: text(200),
  // 2. Persons
  workers: z.array(text(200)).max(50, "Max 50 persons"),
  // 3. Validity
  validFrom: dateTimeStr,
  validTo: dateTimeStr,
  // 4. Related permits
  enclosedSpacePermit: answer,
  otherPermitsRequired: answer,
  otherPermitsSpecify: text(500),
  toolboxMeetingHeld: answer,
  // 5. Checks
  checks: z.record(z.string(), answer),
  ventilationType: text(100),
  fireWatchNominated: answer,
  fireWatchNames: text(500),
  fireWatchBridgeComms: answer,
  // 6–8
  ppe: z.array(text(100)).max(30),
  ppeOther: text(300),
  specialConditions: text(4000),
  fireMeasures: z.record(z.string(), answer),
  fireMeasuresAdditional: text(1000),
  // 9. Authorization
  masterName: text(200),
  supervisorName: text(200),
  authorizationConfirmed: z.boolean(),
  workersAcknowledged: z.boolean(),
  // 10. After issue
  workCommencedAt: dateTimeStr,
  extensionTo: dateTimeStr,
  workCompletedAt: dateTimeStr,
  closeOutConfirmed: z.boolean(),
  closeOutOfficer: text(200),
  closeOutAt: dateTimeStr,
})

// ─── Issue Permit: everything required ───────────────────────────────────────
/** Same messages as the old validate() in the form, so users see the same text */
export const hotWorkPermitSchema = hotWorkDraftSchema.superRefine((f, ctx) => {
  const add = (message: string) => ctx.addIssue({ code: "custom", message })

  if (!f.date) add("Date is required")
  if (!f.location.trim()) add("Location of work is required")
  if (!f.description.trim()) add("Description of work is required")
  if (!f.responsiblePerson.trim()) add("Person responsible for safety is required")
  if (f.workers.filter((w) => w.trim()).length === 0) add("Add at least one person carrying out the hot work")

  if (!f.validFrom || !f.validTo) {
    add("Permit validity (from / to) is required")
  } else {
    const hours = hoursBetween(f.validFrom, f.validTo)
    if (!(hours > 0 && hours <= HOT_WORK_MAX_HOURS))
      add(`Permit must end after it starts and last max ${HOT_WORK_MAX_HOURS} hours`)
  }

  if (!f.enclosedSpacePermit) add("Answer: Enclosed Space Entry Permit issued?")
  if (!f.otherPermitsRequired) add("Answer: Other work permits required?")
  if (f.otherPermitsRequired === "YES" && !f.otherPermitsSpecify.trim())
    add("Specify which other permits are required")
  if (!f.toolboxMeetingHeld) add("Answer: Toolbox meeting discussed and agreed?")

  if (HOT_WORK_CHECKS.some((c) => !f.checks[c.id])) add("Answer all check items 1–9")
  if (!f.ventilationType) add("Select type of ventilation (item 10)")
  if (!f.fireWatchNominated) add("Answer: Fire-watchmen nominated? (item 11)")
  if (f.fireWatchNominated === "YES" && !f.fireWatchNames.trim()) add("Enter fire-watchmen name(s)")
  if (f.ppe.length === 0 && !f.ppeOther.trim()) add("Select required personal protection (item 12)")
  if (FIRE_PREVENTION_MEASURES.some((m) => !f.fireMeasures[m.id]))
    add("Answer all fire prevention measures (item 14)")

  if (!f.masterName.trim()) add("Master name is required")
  if (!f.supervisorName.trim()) add("Supervisor name is required")
  if (!f.authorizationConfirmed) add("Master / Supervisor must confirm all safety checks")
  if (!f.workersAcknowledged) add("Persons carrying out hot work must acknowledge the procedures")

  // Section 10 is optional, but if filled it must make sense
  if (f.extensionTo && f.validTo && f.extensionTo <= f.validTo)
    add("Extension must end after the original 'Valid to' time")
  if (f.workCommencedAt && f.workCompletedAt && f.workCompletedAt <= f.workCommencedAt)
    add("Work completed must be after work commenced")
  if (f.closeOutConfirmed && (!f.closeOutOfficer.trim() || !f.closeOutAt))
    add("Close-out needs the officer's name and date/time")
})

/** The form state — same fields as FormState in HotWorkPermitForm */
export type HotWorkFormValues = z.infer<typeof hotWorkDraftSchema>

/** Error messages as a simple list (for the red box at the top of the form) */
export function zodMessages(error: z.ZodError): string[] {
  return Array.from(new Set(error.issues.map((i) => i.message)))
}