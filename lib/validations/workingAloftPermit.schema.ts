import { z } from "zod"
import {
  ALOFT_CHECKS,
  AUXILIARY_ITEMS,
  EQUIPMENT_ITEMS,
  OVERSIDE_CHECKS,
  WORKING_ALOFT_MAX_HOURS,
} from "@/app/workpermitsdashboard/_components/workingAloftOptions"

/**
 * workingAloftPermit.schema — validation for the Working Aloft / Overside Permit (Form 31)
 *
 * Location: lib/validations/workingAloftPermit.schema.ts
 *
 * Same idea as hotWorkPermit.schema.ts:
 *  - workingAloftDraftSchema  → Save Draft: shape only
 *  - workingAloftPermitSchema → Issue Permit: + every required field
 * Runs in the browser (error list) AND on the server (nobody can skip it).
 */

const answer = z.enum(["YES", "NO", "NA", ""])
const answers = z.record(z.string(), answer)
const text = (max: number) => z.string().max(max, `Text is too long (max ${max} characters)`)
const dateTimeStr = z.string().regex(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?)?$/, "Invalid date/time")

/** Hours between two datetime-local strings */
function hoursBetween(from: string, to: string) {
  return (new Date(to).getTime() - new Date(from).getTime()) / 3_600_000
}

// ─── Draft: shape only ───────────────────────────────────────────────────────
export const workingAloftDraftSchema = z.object({
  // General
  projectVoyage: text(200),
  location: text(300),
  jobDescription: text(4000),
  persons: z.array(text(200)).max(50, "Max 50 persons"),
  // Validity
  validFrom: dateTimeStr,
  validTo: dateTimeStr,
  // Other permits
  otherPermitsRequired: answer,
  otherPermitRefs: z.array(text(50)).max(20, "Max 20 permit references"),
  // Section 1
  equipment: answers,
  auxiliary: answers,
  auxOtherText: text(300),
  auxOtherAnswer: answer,
  // Section 2
  aloftChecks: answers,
  oversideChecks: answers,
  // Authorization
  discussedConfirmed: z.boolean(),
  teamLeaderName: text(200),
  responsibleOfficerName: text(200),
  masterName: text(200),
  // Section 3
  completedAt: dateTimeStr,
  withdrawnConfirmed: z.boolean(),
  completionOfficerName: text(200),
})

// ─── Issue Permit: everything required ───────────────────────────────────────
/** Same messages as the old validate() in the form */
export const workingAloftPermitSchema = workingAloftDraftSchema.superRefine((f, ctx) => {
  const add = (message: string) => ctx.addIssue({ code: "custom", message })

  if (!f.location.trim()) add("Location of work is required")
  if (!f.jobDescription.trim()) add("Job description is required")
  if (f.persons.filter((p) => p.trim()).length === 0) add("Add at least one person involved")

  if (!f.validFrom || !f.validTo) {
    add("Permit validity (from / to) is required")
  } else {
    const hours = hoursBetween(f.validFrom, f.validTo)
    if (!(hours > 0 && hours <= WORKING_ALOFT_MAX_HOURS))
      add(`Permit must end after it starts and last max ${WORKING_ALOFT_MAX_HOURS} hours`)
  }

  if (!f.otherPermitsRequired) add("Answer: Other work permits required for this job?")
  if (f.otherPermitsRequired === "YES" && f.otherPermitRefs.filter((r) => r.trim()).length === 0)
    add("Enter the reference number of the other work permit(s)")

  if (EQUIPMENT_ITEMS.some((i) => !f.equipment[i.id])) add("Section 1: answer all equipment items")
  if (AUXILIARY_ITEMS.some((i) => !f.auxiliary[i.id])) add("Section 1: answer all auxiliary equipment & warnings items")
  if (f.auxOtherText.trim() && !f.auxOtherAnswer) add("Section 1: answer Yes / No for “Other”")

  if (ALOFT_CHECKS.some((c) => !f.aloftChecks[c.id])) add("Section 2: answer all working aloft questions")
  if (OVERSIDE_CHECKS.some((c) => !f.oversideChecks[c.id])) add("Section 2: answer all working overside questions")

  if (!f.discussedConfirmed) add("Confirm the work plan meeting and risk assessment")
  if (!f.teamLeaderName.trim()) add("Authorized team leader is required")
  if (!f.responsibleOfficerName.trim()) add("Responsible officer for work aloft / overside is required")
  if (!f.masterName.trim()) add("Master is required")

  // Section 3 is optional, but must make sense if filled
  if (f.withdrawnConfirmed && (!f.completedAt || !f.completionOfficerName.trim()))
    add("Section 3: completion needs the time and the responsible officer's name")
})

export type WorkingAloftFormValues = z.infer<typeof workingAloftDraftSchema>

/** Error messages as a simple list (for the red box at the top of the form) */
export function zodMessages(error: z.ZodError): string[] {
  return Array.from(new Set(error.issues.map((i) => i.message)))
}