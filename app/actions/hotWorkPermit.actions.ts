"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import {
  hotWorkDraftSchema,
  hotWorkPermitSchema,
  zodMessages,
  type HotWorkFormValues,
} from "@/lib/validations/hotWorkPermit.schema"
import {
  FIRE_PREVENTION_MEASURES,
  HOT_WORK_CHECKS,
} from "@/app/workpermitsdashboard/_components/hotWorkOptions"
import {
  createFormWorkPermit,
  dateOrNull,
  permitName,
  pickAnswers,
  type FormPermitState,
} from "@/lib/workPermitForm"

/**
 * Exact moments from the BROWSER (it knows the vessel's time zone).
 * The form sends "2026-11-25T08:30" as typed + the same time as ISO ("2026-11-25T07:30:00.000Z").
 * The ISO values go into the DB columns; the typed strings stay in details for edit/view.
 */
export type PermitTimes = {
  validFrom: string | null
  validTo: string | null
  closeOutAt: string | null
}

export type SavePermitResult =
  | { success: true; id: string; permitNo: string; state: FormPermitState }
  | { success: false; errors: string[] }

/**
 * saveHotWorkPermit — creates a NEW Hot Work Permit
 *
 *  - submit = false → Save Draft   → state DRAFT (incomplete is OK)
 *  - submit = true  → Issue Permit → state COMPLETED (full validation)
 *                     … or CLOSED_OUT if section 10 close-out is already confirmed
 *
 * All roles can create. Vessel = the logged-in user (never trusted from the browser).
 * Editing a draft (updateHotWorkPermit) comes on day 4 with the edit page.
 * Emails on Issue / Close-out come on day 6.
 */
export async function saveHotWorkPermit(
  form: HotWorkFormValues,
  submit: boolean,
  times: PermitTimes
): Promise<SavePermitResult> {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  })
  if (!user) return { success: false, errors: ["User not found"] }

  // 1. Validate — strict for Issue Permit, relaxed for drafts
  const schema = submit ? hotWorkPermitSchema : hotWorkDraftSchema
  const validated = schema.safeParse(form)
  if (!validated.success) {
    return { success: false, errors: zodMessages(validated.error) }
  }
  const f = validated.data

  // 2. State
  const state: FormPermitState = !submit ? "DRAFT" : f.closeOutConfirmed ? "CLOSED_OUT" : "COMPLETED"

  // 3. Save
  try {
    const permit = await createFormWorkPermit(
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
      user
    )

    // Day 6: send email to Admin + Manager here when state is COMPLETED / CLOSED_OUT

    revalidatePath("/workpermitsdashboard")
    return { success: true, id: permit.id, permitNo: permit.permitNo, state: permit.state }
  } catch (error) {
    console.error("saveHotWorkPermit error:", error)
    return { success: false, errors: ["Failed to save the permit. Please try again."] }
  }
}