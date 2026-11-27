import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { canAccessRecord } from "@/lib/recordAccess"
import { nextPermitNo, isDuplicatePermitNo } from "@/lib/workPermitNumber"

/**
 * workPermitForm — shared SERVER code for the 3 permit forms
 *
 * Location: lib/workPermitForm.ts
 *
 * Each form keeps its own Zod schema + action and only calls these helpers.
 *  - Shared fields (name, date, vessel, project, location, validity) → normal columns,
 *    so the dashboard filters and Project Analytics can use them.
 *  - Everything else in the form (checklists, people, PPE…) → the `details` JSON.
 *
 * Edit rules (client decision):
 *  - DRAFT                   → the vessel that created it + Admin / Manager
 *  - COMPLETED / CLOSED_OUT  → locked, ADMIN only (corrections)
 */

const DASHBOARD = "/workpermitsdashboard"

export type FormPermitType = "HOT_WORK" | "CONFINED_SPACE" | "WORKING_ALOFT"
export type FormPermitState = "DRAFT" | "COMPLETED" | "CLOSED_OUT"

/** Plain JSON (what can be stored in the `details` column) */
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json }
export type JsonObject = { [key: string]: Json }

/** Logged-in user, as the actions load it */
export type PermitUser = { id: string; role: string; name: string | null; email: string }

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

export type FormPermitData = {
  type: FormPermitType
  /** What the form asks for: DRAFT, COMPLETED, or CLOSED_OUT (close-out section confirmed) */
  state: FormPermitState
  name: string
  issueDate: Date
  projectVoyage: string | null
  location: string | null
  validFrom: Date | null
  validTo: Date | null
  /** The rest of the form (checklists, people, PPE…) — stored as JSON */
  details: JsonObject
  /** Only used when state is CLOSED_OUT */
  closedOutAt?: Date | null
}

// ─── Small helpers ───────────────────────────────────────────────────────────

/** "2026-11-25" or ISO → Date, "" / null / invalid → null */
export function dateOrNull(value: string | null | undefined): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Short permit name for the dashboard: first line of the description, max 120 chars */
export function permitName(description: string, fallback: string) {
  const firstLine = description.trim().split(/\r?\n/)[0]?.trim() ?? ""
  if (!firstLine) return fallback
  return firstLine.length > 120 ? `${firstLine.slice(0, 117)}…` : firstLine
}

/** Keeps only the known question ids — stops random keys from being saved */
export function pickAnswers<T extends string>(
  answers: Record<string, T>,
  items: readonly { id: string }[]
): Record<string, T | ""> {
  return Object.fromEntries(items.map((i) => [i.id, answers[i.id] ?? ""])) as Record<string, T | "">
}

/** Can this user edit this permit? (used by the pages AND the actions) */
export function canEditPermit(
  user: { id: string; role: string },
  permit: { source: string; state: string; createdById: string }
) {
  if (permit.source !== "FORM") return false
  if (permit.state === "DRAFT") return canAccessRecord(user, permit)
  return user.role === "ADMIN"
}

// ─── Create ──────────────────────────────────────────────────────────────────

/**
 * Creates a form permit with the next free number (e.g. "HW-2026-004").
 * Tries again if two permits got the same number at the same moment.
 */
async function createFormWorkPermit(data: FormPermitData, user: PermitUser) {
  const now = new Date()

  for (let attempt = 1; attempt <= 3; attempt++) {
    const permitNo = await nextPermitNo(data.type)
    try {
      return await prisma.workPermit.create({
        data: {
          permitNo,
          type: data.type,
          source: "FORM",
          state: data.state,
          name: data.name,
          issueDate: data.issueDate,
          vessel: user.name ?? user.email,
          projectVoyage: data.projectVoyage,
          location: data.location,
          validFrom: data.validFrom,
          validTo: data.validTo,
          details: data.details,
          completedAt: data.state === "DRAFT" ? null : now,
          closedOutAt: data.state === "CLOSED_OUT" ? (data.closedOutAt ?? now) : null,
          closedOutById: data.state === "CLOSED_OUT" ? user.id : null,
          createdById: user.id,
        },
        select: { id: true, permitNo: true, state: true },
      })
    } catch (error) {
      if (isDuplicatePermitNo(error) && attempt < 3) continue
      throw error
    }
  }
  throw new Error("Could not get a free permit number")
}

// ─── Update ──────────────────────────────────────────────────────────────────

/**
 * Updates an existing form permit.
 *  - DRAFT: Save Draft keeps it DRAFT; Issue Permit → COMPLETED / CLOSED_OUT
 *  - COMPLETED / CLOSED_OUT (Admin correction): must pass full validation (submit = true).
 *    State never goes back; a COMPLETED permit becomes CLOSED_OUT if close-out is now confirmed.
 * Vessel, permit number and creator never change.
 */
async function updateFormWorkPermit(
  id: string,
  data: FormPermitData,
  user: PermitUser,
  submit: boolean
): Promise<{ ok: true; permit: { id: string; permitNo: string; state: FormPermitState } } | { ok: false; error: string }> {
  const existing = await prisma.workPermit.findUnique({
    where: { id },
    select: {
      type: true,
      source: true,
      state: true,
      createdById: true,
      completedAt: true,
      closedOutAt: true,
      closedOutById: true,
    },
  })

  // Same message for "missing" and "not yours", so nothing leaks
  if (!existing || existing.source !== "FORM" || existing.type !== data.type || !canAccessRecord(user, existing)) {
    return { ok: false, error: "Permit not found" }
  }
  if (!canEditPermit(user, existing)) {
    return {
      ok: false,
      error: existing.state === "DRAFT" ? "You can only edit your own drafts" : "Only an Admin can change an issued permit",
    }
  }
  if (existing.state !== "DRAFT" && !submit) {
    return { ok: false, error: "An issued permit must pass full validation" }
  }

  let state: FormPermitState
  if (existing.state === "DRAFT") state = submit ? data.state : "DRAFT"
  else if (existing.state === "CLOSED_OUT") state = "CLOSED_OUT"
  else state = data.state === "CLOSED_OUT" ? "CLOSED_OUT" : "COMPLETED"

  const now = new Date()
  const permit = await prisma.workPermit.update({
    where: { id },
    data: {
      state,
      name: data.name,
      issueDate: data.issueDate,
      projectVoyage: data.projectVoyage,
      location: data.location,
      validFrom: data.validFrom,
      validTo: data.validTo,
      details: data.details,
      completedAt: state === "DRAFT" ? null : (existing.completedAt ?? now),
      closedOutAt: state === "CLOSED_OUT" ? (data.closedOutAt ?? existing.closedOutAt ?? now) : null,
      closedOutById: state === "CLOSED_OUT" ? (existing.closedOutById ?? user.id) : null,
    },
    select: { id: true, permitNo: true, state: true },
  })
  return { ok: true, permit }
}

// ─── Create OR update (what the actions call) ────────────────────────────────

/**
 * permitId empty → create a new permit; permitId set → update that permit.
 * Never throws: always returns a SavePermitResult the form can show.
 */
export async function saveFormWorkPermit(
  permitId: string | undefined,
  data: FormPermitData,
  user: PermitUser,
  submit: boolean
): Promise<SavePermitResult> {
  try {
    let permit: { id: string; permitNo: string; state: FormPermitState }
    if (permitId) {
      const result = await updateFormWorkPermit(permitId, data, user, submit)
      if (!result.ok) return { success: false, errors: [result.error] }
      permit = result.permit
    } else {
      permit = await createFormWorkPermit(data, user)
    }

    // Day 6: send email to Admin + Manager here when the permit is issued / closed out

    revalidatePath(DASHBOARD)
    revalidatePath(`${DASHBOARD}/${permit.id}`)
    return { success: true, id: permit.id, permitNo: permit.permitNo, state: permit.state }
  } catch (error) {
    console.error(`saveFormWorkPermit (${data.type}) error:`, error)
    return { success: false, errors: ["Failed to save the permit. Please try again."] }
  }
}