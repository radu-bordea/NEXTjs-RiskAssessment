/**
 * permitTypes — shared config for the Work Permits module
 *
 * One place for permit types, states and their styles.
 * Later, approval rules per type (max hours, who can approve) go here too.
 *
 * Change WORK_PERMITS_BASE if your dashboard folder has a different name.
 */

export const WORK_PERMITS_BASE = "/workpermitsdashboard"

/** OTHER = uploaded permits only (no form, no dashboard card) */
export type PermitType = "HOT_WORK" | "CONFINED_SPACE" | "WORKING_ALOFT" | "OTHER"
export type FormPermitType = Exclude<PermitType, "OTHER">
/** Same values as the Prisma enums WorkPermitState / WorkPermitSource */
export type PermitState = "DRAFT" | "COMPLETED" | "CLOSED_OUT"
export type PermitSource = "FORM" | "MANUAL"

export const PERMIT_TYPES: {
  type: FormPermitType
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
  OTHER:          "📋 Others",
}

/** All types for selects and filters: the 3 form types + Others */
export const ALL_PERMIT_TYPE_OPTIONS: { type: PermitType; label: string }[] = [
  ...PERMIT_TYPES.map((p) => ({ type: p.type as PermitType, label: p.label })),
  { type: "OTHER", label: "Others" },
]

export const STATE_LABEL: Record<PermitState, string> = {
  DRAFT:      "Draft",
  COMPLETED:  "Completed",
  CLOSED_OUT: "Closed-out",
}

export const STATE_STYLE: Record<PermitState, string> = {
  DRAFT:      "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  COMPLETED:  "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CLOSED_OUT: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
}

// ─── Source: created with a form, or an uploaded PDF ─────────────────────────
export const SOURCE_LABEL: Record<PermitSource, string> = {
  FORM:   "📝 Form",
  MANUAL: "📎 Uploaded",
}

export const SOURCE_STYLE: Record<PermitSource, string> = {
  FORM:   "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  MANUAL: "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
}

/** 4th dashboard card — upload an existing paper permit as PDF */
export const MANUAL_PERMIT_CARD = {
  label: "Manual Work Permit",
  icon: "📎",
  description: "Upload an existing permit as a PDF file (max 10 MB).",
  href: `${WORK_PERMITS_BASE}/new/manual`,
  cardStyle: "border-teal-200 hover:border-teal-400 dark:border-teal-900/50 dark:hover:border-teal-700",
  iconStyle: "bg-teal-100 dark:bg-teal-900/30",
}