/**
 * hotWorkOptions — questions and options for the Hot Work Permit (Form 34)
 *
 * Kept out of the form component, same as observationOptions.ts.
 * Each `id` will become a field name in the DB later.
 */

export type Answer = "YES" | "NO" | "NA" | ""

/** Permit becomes invalid this many hours after issue (from the paper form) */
export const HOT_WORK_MAX_HOURS = 8

// ─── Check Section — items 1–9 (Yes / No / N/A) ──────────────────────────────
export const HOT_WORK_CHECKS = [
  { id: "jhaCarriedOut",                 label: "Has a JHA/RA been carried out?" },
  { id: "hydrocarbonVapoursChecked",     label: "Has the work area been checked for hydrocarbon vapours?" },
  { id: "surroundingAreaSafe",           label: "Has the surrounding area been made safe?" },
  { id: "additionalVentilationRequired", label: "Is additional ventilation required?" },
  { id: "gasFreed",                      label: "Has the equipment or pipeline been gas freed? (if applicable)" },
  { id: "equipmentIsolated",             label: "Has equipment been isolated?" },
  { id: "electricalIsolated",            label: "Is electrical equipment isolated?" },
  { id: "safeAccess",                    label: "Is safe access provided? (solid ladders, platforms, hinged access)" },
  { id: "hazardsEliminated",             label: "Have hazards been eliminated?" },
] as const

// ─── Item 10 — Type of ventilation ───────────────────────────────────────────
/** The paper form text is cut off ("Continue…") — confirm options with client */
export const VENTILATION_TYPES = [
  "Natural",
  "Mechanical (forced)",
  "Continuous mechanical",
  "Not required",
]

// ─── Item 12 — Personal protection (multiple selection) ──────────────────────
export const PPE_OPTIONS = [
  "Welding helmet / shield",
  "Safety helmet",
  "Fire resistant clothing",
  "Welding gloves",
  "Safety shoes",
  "Eye protection",
  "Hearing protection",
  "Respiratory protection",
]

// ─── Item 14 — Fire prevention measures (Yes / No / N/A) ─────────────────────
export const FIRE_PREVENTION_MEASURES = [
  { id: "combustiblesRemoved",       label: "Combustible materials removed or protected" },
  { id: "extinguishersPositioned",   label: "Fire extinguishers positioned at work site" },
  { id: "fireHoseReady",             label: "Fire hose connected and ready" },
  { id: "sparkProtection",           label: "Fire blankets / spark protection installed" },
  { id: "lightingProvided",          label: "Is suitable lighting provided?" },
  { id: "areaCleanDry",              label: "Is area clean, dry and free of combustible materials?" },
  { id: "emergencyProceduresDiscussed", label: "Have emergency procedures been discussed?" },
  { id: "adjacentCompartmentsMonitored", label: "Adjacent compartments monitored" },
  { id: "bridgeCommsEstablished",    label: "Communication with bridge / control room established" },
  { id: "scuppersProtected",         label: "Scuppers / drains protected" },
] as const