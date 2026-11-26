import prisma from "@/lib/prisma"
import { nextPermitNo, isDuplicatePermitNo } from "@/lib/workPermitNumber"

/**
 * workPermitForm — shared SERVER code for the 3 permit forms
 *
 * Location: lib/workPermitForm.ts
 *
 * Hot Work uses it today; Confined Space and Working Aloft reuse it tomorrow.
 * Each form keeps its own Zod schema + action and only calls these helpers.
 *
 *  - Shared fields (name, date, vessel, project, location, validity) → normal columns,
 *    so the dashboard filters and Project Analytics can use them.
 *  - Everything else in the form (checklists, people, PPE…) → the `details` JSON.
 */

export type FormPermitType = "HOT_WORK" | "CONFINED_SPACE" | "WORKING_ALOFT"
export type FormPermitState = "DRAFT" | "COMPLETED" | "CLOSED_OUT"

/** Plain JSON (what can be stored in the `details` column) */
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json }
export type JsonObject = { [key: string]: Json }

export type FormPermitData = {
  type: FormPermitType
  state: FormPermitState
  name: string
  issueDate: Date
  projectVoyage: string | null
  location: string | null
  validFrom: Date | null
  validTo: Date | null
  /** The rest of the form (checklists, people, PPE…) — stored as JSON */
  details: JsonObject
  /** Only when state is CLOSED_OUT */
  closedOutAt?: Date | null
}

/** "2026-11-25" → Date, "" → null */
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

/**
 * Creates a form permit with the next free number (e.g. "HW-2026-004").
 * Tries again if two permits got the same number at the same moment.
 */
export async function createFormWorkPermit(
  data: FormPermitData,
  user: { id: string; name: string | null; email: string }
) {
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