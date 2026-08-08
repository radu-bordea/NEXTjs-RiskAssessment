/**
 * observationOptions.ts
 *
 * All hardcoded checkbox/radio option lists for the Observation Card form.
 * Kept separate from ObservationForm.tsx so the component file stays readable.
 *
 * When the DB schema is built, these values become the source of truth
 * for the enum-like string values stored in the Observation model.
 */

// ─── Section 2 — Observation Type options ────────────────────────────────────
/**
 * Multiple selection — user can check more than one type.
 * Stored as string[] in state → will be saved as JSON array in DB.
 */
export const OBSERVATION_TYPES = [
  { value: "POSITIVE_SAFETY",  icon: "👍", label: "Positive Safety Observation / Good Practice" },
  { value: "UNSAFE_ACT",       icon: "🚶", label: "Unsafe Act / At-Risk Behaviour"              },
  { value: "UNSAFE_CONDITION", icon: "⚠️", label: "Unsafe Condition"                            },
  { value: "NEAR_MISS",        icon: "⭐", label: "Near Miss (Potential Incident)"              },
  { value: "ENVIRONMENTAL",    icon: "🌿", label: "Environmental Observation"                   },
  { value: "QUALITY_SERVICE",  icon: "💎", label: "Quality / Service Observation"               },
  { value: "IMPROVEMENT",      icon: "🔧", label: "Improvement Suggestion"                      },
  { value: "STOP_WORK",        icon: "🛑", label: "Stop Work Intervention"                      },
]

// ─── Section 3 — Observation Source options ───────────────────────────────────
/**
 * Single selection — only one source can be selected.
 * Stored as string in state → saved as string in DB.
 */
export const OBSERVATION_SOURCES = [
  { value: "ROUTINE_INSPECTION",   icon: "🔄", label: "Routine Inspection / Rounds"        },
  { value: "PLANNED_SAFETY_TOUR",  icon: "📍", label: "Planned Safety Tour"                },
  { value: "TOOLBOX_TALK",         icon: "👥", label: "Toolbox Talk / Meeting"             },
  { value: "PERSONAL_OBSERVATION", icon: "👁", label: "Personal Observation"               },
  { value: "CLIENT_THIRD_PARTY",   icon: "🤝", label: "Client / Third Party Observation"  },
  { value: "AFTER_INCIDENT",       icon: "⚡", label: "After Incident / Near Miss"        },
]

// ─── Section 4 — Life Saving Rules (IOGP) options ─────────────────────────────
/**
 * Multiple selection — user can check more than one rule.
 * Stored as string[] in state → will be saved as JSON array in DB.
 */
export const LIFE_SAVING_RULES = [
  { value: "LINE_OF_FIRE",       icon: "🔥", label: "Line of Fire"                 },
  { value: "ENERGY_ISOLATION",   icon: "🔌", label: "Energy Isolation (LOTO)"      },
  { value: "WORKING_AT_HEIGHT",  icon: "🪜", label: "Working at Height"            },
  { value: "CONFINED_SPACE",     icon: "🚪", label: "Confined Space"               },
  { value: "LIFT_OPERATIONS",    icon: "🏗️", label: "Lift Operations"              },
  { value: "WORKING_OVER_WATER", icon: "🌊", label: "Working Overboard / Working Near the Ship's Side"    },
  { value: "ELECTRICAL_SAFETY",  icon: "⚡", label: "Electrical Safety"            },
  { value: "SIMOPS",             icon: "⚙️", label: "SIMOPS"                       },
]

// ─── Section 5 — Risk Priority options ────────────────────────────────────────
/**
 * Single selection — only one priority level can be selected.
 * Colors match maritime risk severity convention (green→red).
 */
export const RISK_PRIORITIES = [
  { value: "LOW",      label: "LOW",      desc: "Minor impact / No injury\nMinimal impact",              dot: "bg-green-500",  bg: "bg-green-50 dark:bg-green-900/20",   borderLeft: "border-l-green-500"  },
  { value: "MEDIUM",   label: "MEDIUM",   desc: "Medical treatment /\nRestricted work\nModerate impact",  dot: "bg-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20", borderLeft: "border-l-yellow-400" },
  { value: "HIGH",     label: "HIGH",     desc: "Serious injury / LT / Fatality\nMajor impact",           dot: "bg-red-500",    bg: "bg-red-50 dark:bg-red-900/20",       borderLeft: "border-l-red-500"    },
  { value: "CRITICAL", label: "CRITICAL", desc: "Multiple fatalities /\nCatastrophic impact",             dot: "bg-red-800",    bg: "bg-red-100 dark:bg-red-950/30",      borderLeft: "border-l-red-800"    },
]

// ─── Section 6 — Observation Category options ─────────────────────────────────
/**
 * 5 category groups. Operations, Work Activities, Hazards/Conditions,
 * Environment & Other → checkboxes (multiple selection per group)
 * Survey Equipment → radio buttons (single selection)
 */
export const CATEGORY_OPERATIONS = [
  "Navigation / Bridge Operations", "Deck Operations", "Launch & Recovery Operations",
  "Crane Operations", "Cable / Towfish Handling", "Stern Roller Operations",
  "E/R Operations", "Mooring Operations",
]

export const CATEGORY_SURVEY_EQUIPMENT = [
  "USBL Operations", "Multibeam Operations", "Side Scan Sonar",
  "Magnetometer", "Sub Bottom Profiler", "CTD Operations",
  "Drop Camera / Video", "ROV / AUV Operations", "Other Survey Equipment",
]

export const CATEGORY_WORK_ACTIVITIES = [
  "Lifting Operations", "Working at Height", "Confined Space",
  "Manual Handling", "Hot Work", "Cold Work",
  "Electrical Work", "Pressure Systems Work", "SIMOPS",
]

export const CATEGORY_HAZARDS = [
  "Line of Fire", "Pinch / Crush Point", "Stored Energy",
  "Slips, Trips and Falls", "Dropped Objects", "Struck By / Against",
  "Fire / Explosion", "Chemical Exposure", "Noise / Vibration",
]

export const CATEGORY_ENVIRONMENT = [
  "Environmental / Pollution", "Waste Management", "Weather Conditions",
  "Fatigue / Fitness for Duty", "Housekeeping", "PPE",
  "Procedures / Permits", "Communication",
]

// ─── Section 10 — Root Cause options ──────────────────────────────────────────
/**
 * Multiple selection — checkboxes (client requested more than one option)
 * Icons matched to each category theme.
 */
export const ROOT_CAUSES = [
  { value: "HUMAN_FACTORS", icon: "⚓", label: "Human Factors / Behaviour" },
  { value: "PROCEDURE",     icon: "🔄", label: "Procedure / Process"       },
  { value: "EQUIPMENT",     icon: "🔧", label: "Equipment / Tools"         },
  { value: "COMPETENCE",    icon: "🎓", label: "Competence"                },
  { value: "COMMUNICATION", icon: "💬", label: "Communication"             },
  { value: "ENVIRONMENT",   icon: "🌦️", label: "Environment / Conditions"  },
  { value: "MANAGEMENT",    icon: "📋", label: "Management System"        },
]

// ─── Section 11 — Potential Consequence options ───────────────────────────────
export const POTENTIAL_CONSEQUENCES = [
  "Personal Injury",
  "Damage to Equipment",
  "Operational Delay",
  "Environmental Impact",
  "Reputation / Financial Loss",
]