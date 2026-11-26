"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import {
  CS_EQUIPMENT_ITEMS,
  confinedSpaceDraftSchema,
  confinedSpacePermitSchema,
  zodMessages,
  type ConfinedSpaceFormValues,
} from "@/lib/validations/confinedSpacePermit.schema"
import {
  EMERGENCY_EQUIPMENT,
  ENTRANT_CHECKS,
  OFFICER_CHECKS,
} from "@/app/workpermitsdashboard/_components/confinedSpaceOptions"
import {
  createFormWorkPermit,
  dateOrNull,
  permitName,
  type FormPermitState,
} from "@/lib/workPermitForm"
import type { PermitTimes, SavePermitResult } from "@/app/actions/hotWorkPermit.actions"

/** Keeps only the known checklist ids, as true / false */
function pickFlags(flags: Record<string, boolean>, items: readonly { id: string }[]) {
  return Object.fromEntries(items.map((i) => [i.id, flags[i.id] === true])) as Record<string, boolean>
}

const trimmedNames = (names: string[]) => names.map((n) => n.trim()).filter(Boolean)

/**
 * saveConfinedSpacePermit — creates a NEW Confined Space Entry Permit
 *
 *  - submit = false → Save Draft   → DRAFT (incomplete is OK)
 *  - submit = true  → Issue Permit → COMPLETED (full validation, safe gas readings)
 *                     … or CLOSED_OUT if the completion certificate (section 12) is confirmed
 *
 * The form has no separate date field → issue date = "valid from" (or today for drafts).
 * times.closeOutAt = the completion certificate date & time.
 */
export async function saveConfinedSpacePermit(
  form: ConfinedSpaceFormValues,
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
  const schema = submit ? confinedSpacePermitSchema : confinedSpaceDraftSchema
  const validated = schema.safeParse(form)
  if (!validated.success) {
    return { success: false, errors: zodMessages(validated.error) }
  }
  const f = validated.data

  // 2. State
  const state: FormPermitState = !submit ? "DRAFT" : f.completionConfirmed ? "CLOSED_OUT" : "COMPLETED"

  // 3. Save
  try {
    const validFrom = dateOrNull(times.validFrom)
    const permit = await createFormWorkPermit(
      {
        type: "CONFINED_SPACE",
        state,
        name: permitName(f.reason, f.location.trim() || "Confined Space Entry"),
        issueDate: validFrom ?? new Date(),
        projectVoyage: f.projectVoyage.trim() || null,
        location: f.location.trim() || null,
        validFrom,
        validTo: dateOrNull(times.validTo),
        closedOutAt: dateOrNull(times.closeOutAt),
        details: {
          ...f,
          officerChecks: pickFlags(f.officerChecks, OFFICER_CHECKS),
          entrantChecks: pickFlags(f.entrantChecks, ENTRANT_CHECKS),
          equipmentChecks: pickFlags(f.equipmentChecks, CS_EQUIPMENT_ITEMS),
          emergencyEquipment: pickFlags(f.emergencyEquipment, EMERGENCY_EQUIPMENT),
          rescueMembers: trimmedNames(f.rescueMembers),
          personnel: trimmedNames(f.personnel),
        },
      },
      user
    )

    // Day 6: send email to Admin + Manager here when state is COMPLETED / CLOSED_OUT

    revalidatePath("/workpermitsdashboard")
    return { success: true, id: permit.id, permitNo: permit.permitNo, state: permit.state }
  } catch (error) {
    console.error("saveConfinedSpacePermit error:", error)
    return { success: false, errors: ["Failed to save the permit. Please try again."] }
  }
}