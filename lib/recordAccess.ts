/**
 * recordAccess — who can see which records (Observation Cards, Safety Meetings,
 * later Work Permits)
 *
 * Location: lib/recordAccess.ts
 *
 * Rules:
 *  - ADMIN, MANAGER → see everything, all vessels
 *  - MEMBER (a vessel account, shared by its crew) → only records it created
 *
 * Risk Assessments use lib/riskAccess.ts instead, because templates are shared.
 */

type AccessUser = { id: string; role: string }
type OwnedRecord = { createdById: string }

/** True for roles that can see every vessel's records */
export function seesAllRecords(user: AccessUser) {
  return user.role === "ADMIN" || user.role === "MANAGER"
}

/**
 * Prisma `where` filter for lists — spread it into your where:
 *   prisma.observation.findMany({ where: { ...ownRecordsWhere(user), ...otherFilters } })
 */
export function ownRecordsWhere(user: AccessUser) {
  return seesAllRecords(user) ? {} : { createdById: user.id }
}

/** Can this user open this record (view page, PDF)? */
export function canAccessRecord(user: AccessUser, record: OwnedRecord) {
  return seesAllRecords(user) || record.createdById === user.id
}