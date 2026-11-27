"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import {
  hotWorkDraftSchema as draftSchema,
  hotWorkPermitSchema as permitSchema,
  zodMessages,
  type HotWorkFormValues,
} from "@/lib/validations/hotWorkPermit.schema"
import {
  FIRE_PREVENTION_MEASURES,
  HOT_WORK_CHECKS,
} from "@/app/workpermitsdashboard/_components/hotWorkOptions"
import {
  dateOrNull,
  permitName,
  pickAnswers,
  saveFormWorkPermit,
  type FormPermitState,
  type PermitTimes,
  type SavePermitResult,
} from "@/lib/workPermitForm"

/**
 * saveHotWorkPermit — creates OR updates a Hot Work Permit
 *
 *  - permitId empty → new permit;  permitId set → edit that permit
 *  - submit = false → Save Draft   → DRAFT (incomplete is OK)
 *  - submit = true  → Issue Permit → COMPLETED (full validation)
 *                     … or CLOSED_OUT if section 10 close-out is already confirmed
 *
 * Who can edit: drafts → creator + Admin/Manager; issued permits → Admin only.
 * Vessel = the logged-in user on create (never trusted from the browser).
 */
export async function saveHotWorkPermit(
  form: HotWorkFormValues,
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
  const state: FormPermitState = !submit ? "DRAFT" : f.closeOutConfirmed ? "CLOSED_OUT" : "COMPLETED"

  // 3. Create (no permitId) or update (permitId) — access rules are checked inside
  return saveFormWorkPermit(
    permitId,
    {
      type: "HOT_WORK",
      state,
      name: permitName(f.description, "Hot Work Permit"),
      issueDate: dateOrNull(f.date) ?? new Date(),
      projectVoyage: f.projectVoyage.trim() || null,
      location: f.location.trim() || null,
      validFrom: dateOrNull(times.validFrom),
      validTo: dateOrNull(times.validTo),
      closedOutAt: dateOrNull(times.closeOutAt),
      details: {
        ...f,
        workers: f.workers.map((w) => w.trim()).filter(Boolean),
        checks: pickAnswers(f.checks, HOT_WORK_CHECKS),
        fireMeasures: pickAnswers(f.fireMeasures, FIRE_PREVENTION_MEASURES),
      },
    },
    user,
    submit
  )
}