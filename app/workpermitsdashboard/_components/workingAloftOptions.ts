/**
 * workingAloftOptions — questions for the
 * Working Aloft / Overside Permit (Form 31, Rev 001, 20.05.25)
 *
 * Kept out of the form component, same as hotWorkOptions.ts.
 * Each `id` will become a key in the DB later.
 */

/** Permit becomes invalid this many hours after issue (from the paper form) */
export const WORKING_ALOFT_MAX_HOURS = 8

/** Type of work — decides which Section 2 questions are shown */
export type WorkType = "ALOFT" | "OVERSIDE" | "BOTH" | ""

export const WORK_TYPES: { value: Exclude<WorkType, "">; label: string; icon: string }[] = [
  { value: "ALOFT",    label: "Working aloft",    icon: "🪜" },
  { value: "OVERSIDE", label: "Working overside", icon: "🌊" },
  { value: "BOTH",     label: "Both",             icon: "🔁" },
]

// ─── Section 1 — Availability and good condition of equipment (Yes / No) ─────
export const EQUIPMENT_ITEMS = [
  { id: "lifeline",        label: "Lifeline" },
  { id: "harnesses",       label: "Harnesses with shock absorber" },
  { id: "safetyNet",       label: "Safety net" },
  { id: "stages",          label: "Stages" },
  { id: "cradles",         label: "Cradles" },
  { id: "bosunsChair",     label: "Bosun's chair" },
  { id: "lizards",         label: "Lizards" },
  { id: "portableLadders", label: "Portable ladders" },
  { id: "securingPoints",  label: "Securing points" },
  { id: "gantlines",       label: "Gantlines" },
] as const

// ─── Section 1 — Auxiliary equipment condition & warnings / notices (Yes / No)
/** "Other (specify)" is handled separately in the form (text + answer) */
export const AUXILIARY_ITEMS = [
  { id: "auxLifeline",                label: "Lifeline" },
  { id: "lifeBuoys",                  label: "Life buoys" },
  { id: "responsiblePersonInformed",  label: "Responsible person informed" },
  { id: "workingOversidePosted",      label: "Working overside notice posted" },
  { id: "radarOff",                   label: "Radar off" },
  { id: "electricOff",                label: "Electric off" },
  { id: "whistleDisarmed",            label: "Whistle disarmed" },
  { id: "aerialsDown",                label: "Aerials down" },
] as const

// ─── Section 2 — For working aloft (Yes / No / N/A) ──────────────────────────
export const ALOFT_CHECKS = [
  { id: "experiencedPersonNearby", label: "Has an experienced person been placed nearby to attend and assist if urgently needed?" },
  { id: "oowInformed",             label: "Has the OOW been informed for additional attendance on this work?" },
  { id: "equipmentSwitchedOff",    label: "Has all equipment which will affect the safety of the worker aloft been switched off, with a “DO NOT OPERATE” sign posted?" },
  { id: "toolsInBucket",           label: "Are all necessary working tools ready in a separate bucket?" },
  { id: "workerCapable",           label: "Is the worker fully capable to do the job?" },
  { id: "suitableClothingPpe",     label: "Does the worker wear suitable clothing and PPE?" },
  { id: "ropeLadderPlaced",        label: "Has a rope ladder been safely placed in position?" },
  { id: "sufficientIllumination",  label: "Is there sufficient illumination in the surrounding area?" },
  { id: "safetyNetUnderneath",     label: "Has a safety net been placed underneath the worker?" },
] as const

// ─── Section 2 — For working overside (Yes / No / N/A) ───────────────────────
export const OVERSIDE_CHECKS = [
  { id: "shipDeadInWater",   label: "Is the ship dead in the water?" },
  { id: "lifeVestWorn",      label: "Does the worker wear a life vest with whistle / light?" },
  { id: "lifebuoyReady",     label: "Is a lifebuoy ready for immediate use?" },
  { id: "rescueBoatReady",   label: "Is the rescue boat ready for immediate use?" },
] as const