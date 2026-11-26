"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import {
  workingAloftDraftSchema,
  workingAloftPermitSchema,
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
  createFormWorkPermit,
  dateOrNull,
  permitName,
  pickAnswers,
  type FormPermitState,
} from "@/lib/workPermitForm"
import type { PermitTimes, SavePermitResult } from "@/app/actions/hotWorkPermit.actions"

const trimmed = (list: string[]) => list.map((x) => x.trim()).filter(Boolean)

/**
 * saveWorkingAloftPermit — creates a NEW Working Aloft / Overside Permit
 *
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
  const schema = submit ? workingAloftPermitSchema : workingAloftDraftSchema
  const validated = schema.safeParse(form)
  if (!validated.success) {
    return { success: false, errors: zodMessages(validated.error) }
  }
  const f = validated.data

  // 2. State
  const state: FormPermitState = !submit ? "DRAFT" : f.withdrawnConfirmed ? "CLOSED_OUT" : "COMPLETED"

  // 3. Save
  try {
    const validFrom = dateOrNull(times.validFrom)
    const permit = await createFormWorkPermit(
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
      user
    )

    // Day 6: send email to Admin + Manager here when state is COMPLETED / CLOSED_OUT

    revalidatePath("/workpermitsdashboard")
    return { success: true, id: permit.id, permitNo: permit.permitNo, state: permit.state }
  } catch (error) {
    console.error("saveWorkingAloftPermit error:", error)
    return { success: false, errors: ["Failed to save the permit. Please try again."] }
  }
}