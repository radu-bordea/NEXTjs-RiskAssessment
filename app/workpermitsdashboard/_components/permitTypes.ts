/**
 * permitTypes — shared config for the Work Permits module
 *
 * One place for permit types, states and their styles.
 * Later, approval rules per type (max hours, who can approve) go here too.
 *
 * Change WORK_PERMITS_BASE if your dashboard folder has a different name.
 */

export const WORK_PERMITS_BASE = "/workpermitsdashboard"

export type PermitType = "HOT_WORK" | "CONFINED_SPACE" | "WORKING_ALOFT"
export type PermitState = "DRAFT" | "ACTIVE" | "CLOSED" | "EXPIRED"

export const PERMIT_TYPES: {
  type: PermitType
  label: string
  short: string
  icon: string
  description: string
  href: string
  ready: boolean
  cardStyle: string
  iconStyle: string
}[] = [
  {
    type: "HOT_WORK",
    label: "Hot Work Permit",
    short: "Hot Work",
    icon: "🔥",
    description: "Welding, cutting, grinding and any work that can ignite gases, vapours or liquids.",
    href: `${WORK_PERMITS_BASE}/new/hot-work`,
    ready: true,
    cardStyle: "border-orange-200 hover:border-orange-400 dark:border-orange-900/50 dark:hover:border-orange-700",
    iconStyle: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    type: "CONFINED_SPACE",
    label: "Confined Space Entry",
    short: "Confined Space",
    icon: "🚪",
    description: "Entry into tanks, void spaces, cofferdams and other enclosed spaces.",
    href: `${WORK_PERMITS_BASE}/new/confined-space`,
    ready: true,
    cardStyle: "border-violet-200 hover:border-violet-400 dark:border-violet-900/50 dark:hover:border-violet-700",
    iconStyle: "bg-violet-100 dark:bg-violet-900/30",
  },
  {
    type: "WORKING_ALOFT",
    label: "Working Aloft / Overside",
    short: "Aloft / Overside",
    icon: "🪜",
    description: "Work at height on masts and structures, or over the ship's side.",
    href: `${WORK_PERMITS_BASE}/new/working-aloft`,
    ready: true,
    cardStyle: "border-sky-200 hover:border-sky-400 dark:border-sky-900/50 dark:hover:border-sky-700",
    iconStyle: "bg-sky-100 dark:bg-sky-900/30",
  },
]

export const PERMIT_TYPE_LABEL: Record<PermitType, string> = {
  HOT_WORK: "🔥 Hot Work",
  CONFINED_SPACE: "🚪 Confined Space",
  WORKING_ALOFT: "🪜 Aloft / Overside",
}

export const STATE_STYLE: Record<PermitState, string> = {
  DRAFT:   "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  ACTIVE:  "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CLOSED:  "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  EXPIRED: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}