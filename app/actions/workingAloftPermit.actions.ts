"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import {
  workingAloftDraftSchema as draftSchema,
  workingAloftPermitSchema as permitSchema,
  zodMessages,
  type WorkingAloftFormValues,
} from "@/lib/validations/workingAloftPermit.schema"
import {
  ALOFT_CHECKS,
  AUXILIARY_ITEMS,
  EQUIPMENT_ITEMS,
  OVERSIDE_CHECKS,
} from "@/app/workpermitsdashboard/_components/workingAloftOptions"
import {
  dateOrNull,
  permitName,
  pickAnswers,
  saveFormWorkPermit,
  type FormPermitState,
  type PermitTimes,
  type SavePermitResult,
} from "@/lib/workPermitForm"

const trimmed = (list: string[]) => list.map((x) => x.trim()).filter(Boolean)

/**
 * saveWorkingAloftPermit — creates OR updates a Working Aloft / Overside Permit
 *
 *  - permitId empty → new permit;  permitId set → edit that permit
 *  - submit = false → Save Draft   → DRAFT (incomplete is OK)
 *  - submit = true  → Issue Permit → COMPLETED (full validation)
 *                     … or CLOSED_OUT if section 3 (completion) is confirmed
 *
 * The form has no separate date field → issue date = "valid from" (or today for drafts).
 * times.closeOutAt = the section 3 "Completed at" date & time.
 */
export async function saveWorkingAloftPermit(
  form: WorkingAloftFormValues,
  submit: boolean,
  times: PermitTimes,
  permitId?: string
): Promise<SavePermitResult> {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, name: true, email: true },
  })
  if (!user) return { success: false, errors: ["User not found"] }

  // 1. Validate — strict for Issue Permit / Admin corrections, relaxed for drafts
  const schema = submit ? permitSchema : draftSchema
  const validated = schema.safeParse(form)
  if (!validated.success) {
    return { success: false, errors: zodMessages(validated.error) }
  }
  const f = validated.data

  // 2. State the form asks for (the helper decides the final state when editing)
  const state: FormPermitState = !submit ? "DRAFT" : f.withdrawnConfirmed ? "CLOSED_OUT" : "COMPLETED"

  // 3. Create (no permitId) or update (permitId) — access rules are checked inside
  const validFrom = dateOrNull(times.validFrom)
  return saveFormWorkPermit(
    permitId,
    {
      type: "WORKING_ALOFT",
      state,
      name: permitName(f.jobDescription, f.location.trim() || "Working Aloft / Overside"),
      issueDate: validFrom ?? new Date(),
      projectVoyage: f.projectVoyage.trim() || null,
      location: f.location.trim() || null,
      validFrom,
      validTo: dateOrNull(times.validTo),
      closedOutAt: dateOrNull(times.closeOutAt),
      details: {
        ...f,
        persons: trimmed(f.persons),
        otherPermitRefs: f.otherPermitsRequired === "YES" ? trimmed(f.otherPermitRefs) : [],
        equipment: pickAnswers(f.equipment, EQUIPMENT_ITEMS),
        auxiliary: pickAnswers(f.auxiliary, AUXILIARY_ITEMS),
        aloftChecks: pickAnswers(f.aloftChecks, ALOFT_CHECKS),
        oversideChecks: pickAnswers(f.oversideChecks, OVERSIDE_CHECKS),
      },
    },
    user,
    submit
  )
}