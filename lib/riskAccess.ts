/**
 * riskAccess — who can see / change which Risk Assessments
 *
 * Location: lib/riskAccess.ts
 *
 * Rules:
 *  - ADMIN, MANAGER → see everything
 *  - MEMBER (a vessel) → sees ALL templates (shared library, needed to clone drafts)
 *                        + only the drafts / completed risks THEY created
 *
 * Used by the dashboard, view page, PDF route, edit page, analytics and server actions,
 * so the rule is written in one place only.
 */

type AccessUser = { id: string; role: string }
type AccessRisk = { state: string; createdById: string }

/** True for roles that can see every vessel's risks */
export function seesAllRisks(user: AccessUser) {
  return user.role === "ADMIN" || user.role === "MANAGER"
}

/**
 * Prisma `where` filter for lists — use in prisma.risk.findMany({ where: ... })
 * Combine with other filters using AND: { AND: [riskVisibilityWhere(user), otherFilters] }
 */
export function riskVisibilityWhere(user: AccessUser) {
  if (seesAllRisks(user)) return {}
  return {
    OR: [{ state: "TEMPLATE" as const }, { createdById: user.id }],
  }
}

/** Can this user OPEN this risk (view page, PDF)? */
export function canViewRisk(user: AccessUser, risk: AccessRisk) {
  if (seesAllRisks(user)) return true
  return risk.state === "TEMPLATE" || risk.createdById === user.id
}

/**
 * Can this user CHANGE this draft / completed risk (edit, submit, update dates)?
 * Templates have their own rule (Admin only) — checked separately.
 */
export function canChangeOwnRisk(user: AccessUser, risk: AccessRisk) {
  if (seesAllRisks(user)) return true
  return risk.createdById === user.id
}