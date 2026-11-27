"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import {
  CS_EQUIPMENT_ITEMS,
  confinedSpaceDraftSchema as draftSchema,
  confinedSpacePermitSchema as permitSchema,
  zodMessages,
  type ConfinedSpaceFormValues,
} from "@/lib/validations/confinedSpacePermit.schema"
import {
  EMERGENCY_EQUIPMENT,
  ENTRANT_CHECKS,
  OFFICER_CHECKS,
} from "@/app/workpermitsdashboard/_components/confinedSpaceOptions"
import {
  dateOrNull,
  permitName,
  saveFormWorkPermit,
  type FormPermitState,
  type PermitTimes,
  type SavePermitResult,
} from "@/lib/workPermitForm"

/** Keeps only the known checklist ids, as true / false */
function pickFlags(flags: Record<string, boolean>, items: readonly { id: string }[]) {
  return Object.fromEntries(items.map((i) => [i.id, flags[i.id] === true])) as Record<string, boolean>
}

const trimmedNames = (names: string[]) => names.map((n) => n.trim()).filter(Boolean)

/**
 * saveConfinedSpacePermit — creates OR updates a Confined Space Entry Permit
 *
 *  - permitId empty → new permit;  permitId set → edit that permit
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
  const state: FormPermitState = !submit ? "DRAFT" : f.completionConfirmed ? "CLOSED_OUT" : "COMPLETED"

  // 3. Create (no permitId) or update (permitId) — access rules are checked inside
  const validFrom = dateOrNull(times.validFrom)
  return saveFormWorkPermit(
    permitId,
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
    user,
    submit
  )
}