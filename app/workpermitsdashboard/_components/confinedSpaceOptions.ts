/**
 * confinedSpaceOptions — checklists and limits for the
 * Confined Space Entry Permit (Form 33, Rev 001, 20.05.25)
 *
 * Kept out of the form component, same as hotWorkOptions.ts.
 * Each `id` will become a field name in the DB later.
 */

/** Permit is valid max this many hours (from the paper form) */
export const CONFINED_SPACE_MAX_HOURS = 8

// ─── A. Responsible officer to check ─────────────────────────────────────────
export const OFFICER_CHECKS = [
  { id: "ventilated",            label: "Space has been thoroughly ventilated" },
  { id: "segregated",            label: "Space segregated by blanking off or isolating all connecting pipelines or valves and electrical power / equipment" },
  { id: "cleaned",               label: "Space cleaned where necessary" },
  { id: "testedSafe",            label: "Space tested and found safe for entry" },
  { id: "frequentAtmosphereChecks", label: "Arrangements in place for frequent atmosphere checks while the space is occupied and after work breaks" },
  { id: "continuousVentilation", label: "Arrangements made for the space to be continuously ventilated throughout occupation and during work breaks" },
  { id: "accessIllumination",    label: "Access and illumination are adequate" },
  { id: "rescueEquipment",       label: "Rescue and resuscitation equipment available for immediate use by the entrance" },
  { id: "attendant",             label: "Responsible person designated to be in constant attendance at the entrance" },
  { id: "officerOfWatchAdvised", label: "Officer of the Watch (bridge, E/R, cargo control room) advised of the planned entry" },
  { id: "communicationTested",   label: "System of communication between all parties tested and emergency signals agreed" },
  { id: "emergencyProcedures",   label: "Emergency and evacuation procedures established and understood by all personnel involved" },
  { id: "equipmentInspected",    label: "All equipment used is in good working condition and inspected prior to entry" },
  { id: "personnelEquipped",     label: "Personnel properly clothed and equipped" },
] as const

// ─── B. Person entering space to check ───────────────────────────────────────
/** "reportingInterval" also needs the minutes input — handled in the form */
export const ENTRANT_CHECKS = [
  { id: "permissionReceived",  label: "I have received instructions or permission from the Master or nominated person to enter the enclosed space" },
  { id: "sectionACompleted",   label: "Section A has been satisfactorily completed by the Master or nominated person" },
  { id: "communicationAgreed", label: "I have agreed and I understand the communication procedures" },
  { id: "reportingInterval",   label: "I have agreed upon a reporting interval" },
  { id: "emergencyUnderstood", label: "Emergency and evacuation procedures have been agreed and are understood" },
  { id: "evacuationAware",     label: "I am aware that the space must be evacuated immediately if ventilation fails or atmosphere tests show a change from the agreed safe criteria" },
] as const

// ─── C. SCBA and other equipment check ───────────────────────────────────────
export const EQUIPMENT_CHECKS = [
  { id: "familiarWithBA",      label: "Those entering the space are familiar with the breathing apparatus / EEBD" },
  { id: "baTested",            label: "The breathing apparatus has been tested (all three below)" },
  { id: "commsTested",         label: "The means of communication have been tested and emergency signals agreed" },
  { id: "harnessProvided",     label: "All personnel entering the space have been provided with rescue harness and, where practicable, lifelines" },
] as const

/** Sub-checks under "The breathing apparatus has been tested" */
export const BA_TESTS = [
  { id: "baGauge",      label: "Gauge and capacity of air supply" },
  { id: "baAlarm",      label: "Low pressure audible alarm" },
  { id: "baFaceMask",   label: "Face mask under positive pressure and not leaking" },
] as const

// ─── Emergency equipment at the entrance ─────────────────────────────────────
export const EMERGENCY_EQUIPMENT = [
  { id: "scba",           label: "SCBA(s) / EEBD(s)" },
  { id: "resuscitation",  label: "Resuscitation equipment" },
  { id: "lifelinesTorches", label: "Safety lifeline(s) / safety torch(es)" },
  { id: "gasDetection",   label: "Gas detection equipment for continuous systematic monitoring of the space" },
  { id: "hoisting",       label: "Hoisting equipment for rescue (gantlines, snatch blocks, messengers)" },
] as const

// ─── Atmosphere safe limits ──────────────────────────────────────────────────
/**
 * Used for the pre-entry test AND the regular checks.
 * A reading is SAFE when min <= value <= max.
 */
export type GasKey = "oxygen" | "hydrocarbon" | "co" | "h2s"

export const GAS_LIMITS: Record<GasKey, { label: string; unit: string; min?: number; max: number; limitText: string }> = {
  oxygen:      { label: "Oxygen",      unit: "% vol", min: 20.6, max: 22,  limitText: "20.6 – 22 % vol (21.0 normal)" },
  hydrocarbon: { label: "Hydrocarbon", unit: "% LFL",            max: 1,   limitText: "Max 1 % LFL" },
  co:          { label: "CO",          unit: "ppm",              max: 12.5, limitText: "Max 12.5 ppm" },
  h2s:         { label: "H₂S",         unit: "ppm",              max: 2.5, limitText: "Max 2.5 ppm" },
}

export const GAS_KEYS: GasKey[] = ["oxygen", "hydrocarbon", "co", "h2s"]

/** "" = not entered, "SAFE" / "UNSAFE" otherwise */
export function gasStatus(key: GasKey, value: string): "" | "SAFE" | "UNSAFE" {
  if (value.trim() === "") return ""
  const n = Number(value.replace(",", "."))
  if (Number.isNaN(n)) return "UNSAFE"
  const { min, max } = GAS_LIMITS[key]
  if (min !== undefined && n < min) return "UNSAFE"
  if (n > max) return "UNSAFE"
  return "SAFE"
}