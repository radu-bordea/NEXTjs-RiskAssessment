import prisma from "@/lib/prisma"

/**
 * workPermitNumber — permit numbers like "HW-2026-001"
 *
 * Location: lib/workPermitNumber.ts
 *
 * Used by the manual upload today, and by the 3 forms later,
 * so every permit gets a number from the same sequence per type and year.
 */

export const PERMIT_NO_PREFIX = {
  HOT_WORK: "HW",
  CONFINED_SPACE: "CS",
  WORKING_ALOFT: "WA",
  OTHER: "OT",
} as const

export type PermitTypeKey = keyof typeof PERMIT_NO_PREFIX

/** Next free number for this type in the current year, e.g. "CS-2026-004" */
export async function nextPermitNo(type: PermitTypeKey): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `${PERMIT_NO_PREFIX[type]}-${year}-`

  const existing = await prisma.workPermit.findMany({
    where: { permitNo: { startsWith: prefix } },
    select: { permitNo: true },
  })

  // Highest number used so far (works past 999 too)
  const highest = existing.reduce((max, p) => {
    const n = parseInt(p.permitNo.slice(prefix.length), 10)
    return Number.isFinite(n) && n > max ? n : max
  }, 0)

  return `${prefix}${String(highest + 1).padStart(3, "0")}`
}

/**
 * True when Prisma refused because the permit number already exists
 * (two people saved at the same second) — the caller then tries again.
 */
export function isDuplicatePermitNo(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  )
}