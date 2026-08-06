"use client";

/**
 * ObservationForm — Create or edit an observation card
 *
 * Based on MMI-QHSE Observation Card form.
 * Sections:
 *  1. Observation Details        ← fully implemented
 *  2. Observation Type           ← checkboxes (multiple selection)
 *  3. Observation Source         ← radio buttons (single selection) + icons
 *  4. Life Saving Rules (IOGP)   ← coming soon
 *  5. Risk Priority              ← coming soon
 *  6. Observation Category       ← coming soon
 *  7. Observation Description    ← coming soon
 *  8. Immediate Action Taken     ← coming soon
 *  9. Corrective / Preventive    ← coming soon
 *  10. Root Cause                ← coming soon
 *  11. Potential Consequence     ← coming soon
 *  12. Follow-up / Action Track  ← coming soon
 *  13. Lessons Learned           ← coming soon
 *  14. Close Out                 ← Admin + Manager only, coming soon
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

type Props = {
  currentUser: User;
  observation?: any;
};

// ─── Section 2 — Observation Type options ────────────────────────────────────
/**
 * Multiple selection — user can check more than one type.
 * Stored as string[] in state → will be saved as JSON array in DB.
 */
const OBSERVATION_TYPES = [
  {
    value: "POSITIVE_SAFETY",
    icon: "👍",
    label: "Positive Safety Observation / Good Practice",
  },
  { value: "UNSAFE_ACT", icon: "🚶", label: "Unsafe Act / At-Risk Behaviour" },
  { value: "UNSAFE_CONDITION", icon: "⚠️", label: "Unsafe Condition" },
  { value: "NEAR_MISS", icon: "⭐", label: "Near Miss (Potential Incident)" },
  { value: "ENVIRONMENTAL", icon: "🌿", label: "Environmental Observation" },
  {
    value: "QUALITY_SERVICE",
    icon: "💎",
    label: "Quality / Service Observation",
  },
  { value: "IMPROVEMENT", icon: "🔧", label: "Improvement Suggestion" },
  { value: "STOP_WORK", icon: "🛑", label: "Stop Work Intervention" },
];

// ─── Section 3 — Observation Source options ───────────────────────────────────
/**
 * Single selection — only one source can be selected.
 * Stored as string in state → saved as string in DB.
 */
const OBSERVATION_SOURCES = [
  {
    value: "ROUTINE_INSPECTION",
    icon: "🔄",
    label: "Routine Inspection / Rounds",
  },
  { value: "PLANNED_SAFETY_TOUR", icon: "📍", label: "Planned Safety Tour" },
  { value: "TOOLBOX_TALK", icon: "👥", label: "Toolbox Talk / Meeting" },
  { value: "PERSONAL_OBSERVATION", icon: "👁", label: "Personal Observation" },
  {
    value: "CLIENT_THIRD_PARTY",
    icon: "🤝",
    label: "Client / Third Party Observation",
  },
  { value: "AFTER_INCIDENT", icon: "⚡", label: "After Incident / Near Miss" },
];

// ─── Section 4 — Life Saving Rules (IOGP) options ─────────────────────────────
/**
 * Multiple selection — user can check more than one rule.
 * Stored as string[] in state → will be saved as JSON array in DB.
 */
const LIFE_SAVING_RULES = [
  { value: "LINE_OF_FIRE", icon: "🔥", label: "Line of Fire" },
  { value: "ENERGY_ISOLATION", icon: "🔌", label: "Energy Isolation (LOTO)" },
  { value: "WORKING_AT_HEIGHT", icon: "🪜", label: "Working at Height" },
  { value: "CONFINED_SPACE", icon: "🚪", label: "Confined Space" },
  { value: "LIFT_OPERATIONS", icon: "🏗️", label: "Lift Operations" },
  {
    value: "WORKING_OVER_WATER",
    icon: "🌊",
    label: "Working Over / Near Water",
  },
  { value: "ELECTRICAL_SAFETY", icon: "⚡", label: "Electrical Safety" },
  { value: "SIMOPS", icon: "⚙️", label: "SIMOPS" },
];

// ─── Section 5 — Risk Priority options ────────────────────────────────────────
/**
 * Single selection — only one priority level can be selected.
 * Colors match maritime risk severity convention (green→red).
 */
const RISK_PRIORITIES = [
  {
    value: "LOW",
    label: "LOW",
    desc: "Minor impact / No injury\nMinimal impact",
    dot: "bg-green-500",
    bg: "bg-green-50 dark:bg-green-900/20",
    borderLeft: "border-l-green-500",
  },
  {
    value: "MEDIUM",
    label: "MEDIUM",
    desc: "Medical treatment /\nRestricted work\nModerate impact",
    dot: "bg-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    borderLeft: "border-l-yellow-400",
  },
  {
    value: "HIGH",
    label: "HIGH",
    desc: "Serious injury / LT / Fatality\nMajor impact",
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-900/20",
    borderLeft: "border-l-red-500",
  },
  {
    value: "CRITICAL",
    label: "CRITICAL",
    desc: "Multiple fatalities /\nCatastrophic impact",
    dot: "bg-red-800",
    bg: "bg-red-100 dark:bg-red-950/30",
    borderLeft: "border-l-red-800",
  },
];

// ─── Section 6 — Observation Category options ─────────────────────────────────
/**
 * 5 category groups. Operations, Work Activities, Hazards/Conditions,
 * Environment & Other → checkboxes (multiple selection per group)
 * Survey Equipment → radio buttons (single selection)
 */
const CATEGORY_OPERATIONS = [
  "Navigation / Bridge Operations",
  "Deck Operations",
  "Launch & Recovery Operations",
  "Crane Operations",
  "Cable / Towfish Handling",
  "Stern Roller Operations",
  "Winch / Tow Wire Operations",
  "Mooring Operations",
  "A-Frame Operations",
];

const CATEGORY_SURVEY_EQUIPMENT = [
  "USBL Operations",
  "Multibeam Operations",
  "Side Scan Sonar",
  "Magnetometer",
  "Sub Bottom Profiler",
  "CTD Operations",
  "Drop Camera / Video",
  "ROV / AUV Operations",
  "Other Survey Equipment",
];

const CATEGORY_WORK_ACTIVITIES = [
  "Lifting Operations",
  "Working at Height",
  "Confined Space",
  "Manual Handling",
  "Hot Work",
  "Cold Work",
  "Electrical Work",
  "Pressure Systems Work",
  "SIMOPS",
];

const CATEGORY_HAZARDS = [
  "Line of Fire",
  "Pinch / Crush Point",
  "Stored Energy",
  "Slips, Trips and Falls",
  "Dropped Objects",
  "Struck By / Against",
  "Fire / Explosion",
  "Chemical Exposure",
  "Noise / Vibration",
];

const CATEGORY_ENVIRONMENT = [
  "Environmental / Pollution",
  "Waste Management",
  "Weather Conditions",
  "Fatigue / Fitness for Duty",
  "Housekeeping",
  "PPE",
  "Procedures / Permits",
  "Communication",
];

// ─── Section 10 — Root Cause options ──────────────────────────────────────────
/**
 * Single selection — the most relevant root cause.
 * Icons match the physical form categories.
 */
const ROOT_CAUSES = [
  { value: "HUMAN_FACTORS", icon: "⚓", label: "Human Factors / Behaviour" },
  { value: "PROCEDURE", icon: "🔄", label: "Procedure / Process" },
  { value: "EQUIPMENT", icon: "🔧", label: "Equipment / Tools" },
  { value: "COMPETENCE", icon: "☑️", label: "Competence" },
  { value: "COMMUNICATION", icon: "☑️", label: "Communication" },
  { value: "ENVIRONMENT", icon: "☑️", label: "Environment / Conditions" },
  { value: "MANAGEMENT", icon: "☑️", label: "Management System" },
];

export default function ObservationForm({ currentUser, observation }: Props) {
  const router = useRouter();
  const isEditMode = !!observation;

  /** Submit loading state */
  const [loading, setLoading] = useState(false);

  /** Save draft loading state */
  const [draftLoading, setDraftLoading] = useState(false);

  // ─── Section 1 state ─────────────────────────────────────────────────────

  /** Vessel or project name */
  const [vesselProject, setVesselProject] = useState(
    observation?.vesselProject ?? "",
  );

  /** Location on vessel e.g. Main Deck */
  const [location, setLocation] = useState(observation?.location ?? "");

  /** Job or activity being observed */
  const [jobActivity, setJobActivity] = useState(
    observation?.jobActivity ?? "",
  );

  /** Name of the observer — auto filled from logged in user */
  const [observerName, setObserverName] = useState(
    observation?.observerName ?? currentUser.name ?? currentUser.email ?? "",
  );

  /** Observer type — Crew, Contractor, Visitor, Client */
  const [observerType, setObserverType] = useState(
    observation?.observerType ?? "",
  );

  /** Observation reference number e.g. OBS-2026-001 */
  const [observationNo, setObservationNo] = useState(
    observation?.observationNo ?? "",
  );

  /** Date of observation */
  const [date, setDate] = useState(
    observation?.date ?? new Date().toISOString().split("T")[0],
  );

  /** Time of observation */
  const [time, setTime] = useState(observation?.time ?? "");

  /** Department or company */
  const [department, setDepartment] = useState(observation?.department ?? "");

  /** Weather and sea state conditions */
  const [weatherSeaState, setWeatherSeaState] = useState(
    observation?.weatherSeaState ?? "",
  );

  // ─── Section 2 state ─────────────────────────────────────────────────────

  /**
   * observationTypes — array of selected type values
   * Multiple checkboxes — user can select more than one
   * e.g. ["UNSAFE_ACT", "NEAR_MISS"]
   */
  const [observationTypes, setObservationTypes] = useState<string[]>(
    observation?.observationTypes ?? [],
  );

  /**
   * stopWorkUsed — was stop work authority used?
   * null = not answered, true = Yes, false = No
   */
  const [stopWorkUsed, setStopWorkUsed] = useState<boolean | null>(
    observation?.stopWorkUsed ?? null,
  );

  // ─── Section 3 state ─────────────────────────────────────────────────────

  /**
   * observationSource — single selected source value
   * Radio buttons — only one can be selected
   */
  const [observationSource, setObservationSource] = useState<string>(
    observation?.observationSource ?? "",
  );

  /**
   * observationSourceOther — free text for "Other (Specify)"
   * Only relevant when observationSource is empty or "OTHER"
   */
  const [observationSourceOther, setObservationSourceOther] = useState<string>(
    observation?.observationSourceOther ?? "",
  );

  // ─── Section 4 state ─────────────────────────────────────────────────────

  /**
   * lifeSavingRules — array of selected rule values
   * Multiple checkboxes — user can select more than one
   * e.g. ["LINE_OF_FIRE", "CONFINED_SPACE"]
   */
  const [lifeSavingRules, setLifeSavingRules] = useState<string[]>(
    observation?.lifeSavingRules ?? [],
  );

  /** Other (Specify) free text for Life Saving Rules */
  const [lifeSavingRulesOther, setLifeSavingRulesOther] = useState<string>(
    observation?.lifeSavingRulesOther ?? "",
  );

  // ─── Section 5 state ─────────────────────────────────────────────────────

  /**
   * riskPriority — single selected priority level
   * LOW / MEDIUM / HIGH / CRITICAL
   */
  const [riskPriority, setRiskPriority] = useState<string>(
    observation?.riskPriority ?? "",
  );

  /**
   * hiPo — High Potential Event
   * Could this observation have had serious consequences?
   * null = not answered, true = Yes, false = No
   */
  const [hiPo, setHiPo] = useState<boolean | null>(observation?.hiPo ?? null);

  // ─── Section 6 state ─────────────────────────────────────────────────────

  /** Operations — checkboxes, multiple selection */
  const [categoryOperations, setCategoryOperations] = useState<string[]>(
    observation?.categoryOperations ?? [],
  );
  const [categoryOperationsOther, setCategoryOperationsOther] =
    useState<string>(observation?.categoryOperationsOther ?? "");

  /** Survey Equipment — radio buttons, single selection */
  const [categorySurveyEquipment, setCategorySurveyEquipment] =
    useState<string>(observation?.categorySurveyEquipment ?? "");
  const [categorySurveyEquipmentOther, setCategorySurveyEquipmentOther] =
    useState<string>(observation?.categorySurveyEquipmentOther ?? "");

  /** Work Activities — checkboxes, multiple selection */
  const [categoryWorkActivities, setCategoryWorkActivities] = useState<
    string[]
  >(observation?.categoryWorkActivities ?? []);
  const [categoryWorkActivitiesOther, setCategoryWorkActivitiesOther] =
    useState<string>(observation?.categoryWorkActivitiesOther ?? "");

  /** Hazards / Conditions — checkboxes, multiple selection */
  const [categoryHazards, setCategoryHazards] = useState<string[]>(
    observation?.categoryHazards ?? [],
  );
  const [categoryHazardsOther, setCategoryHazardsOther] = useState<string>(
    observation?.categoryHazardsOther ?? "",
  );

  /** Environment & Other — checkboxes, multiple selection */
  const [categoryEnvironment, setCategoryEnvironment] = useState<string[]>(
    observation?.categoryEnvironment ?? [],
  );
  const [categoryEnvironmentOther, setCategoryEnvironmentOther] =
    useState<string>(observation?.categoryEnvironmentOther ?? "");

  // ─── Section 7 state ─────────────────────────────────────────────────────
  /** Full observation description — Who, What, Where, When, How */
  const [observationDescription, setObservationDescription] = useState(
    observation?.observationDescription ?? "",
  );

  // ─── Section 8 state ─────────────────────────────────────────────────────
  /** Immediate action taken at time of observation */
  const [immediateAction, setImmediateAction] = useState(
    observation?.immediateAction ?? "",
  );

  // ─── Section 9 state ─────────────────────────────────────────────────────
  /** Corrective action required + target date */
  const [correctiveAction, setCorrectiveAction] = useState(
    observation?.correctiveAction ?? "",
  );
  const [correctiveActionDate, setCorrectiveActionDate] = useState(
    observation?.correctiveActionDate ?? "",
  );

  /** Preventive action required + target date */
  const [preventiveAction, setPreventiveAction] = useState(
    observation?.preventiveAction ?? "",
  );
  const [preventiveActionDate, setPreventiveActionDate] = useState(
    observation?.preventiveActionDate ?? "",
  );

  /** Responsible person / team for corrective/preventive actions */
  const [responsiblePerson, setResponsiblePerson] = useState(
    observation?.responsiblePerson ?? "",
  );

  // ─── Section 10 state ─────────────────────────────────────────────────────
  /** Root cause — single selection (most relevant) */
  const [rootCause, setRootCause] = useState<string>(
    observation?.rootCause ?? "",
  );
  const [rootCauseOther, setRootCauseOther] = useState<string>(
    observation?.rootCauseOther ?? "",
  );

  // ─── Checkbox toggle helper ───────────────────────────────────────────────
  /**
   * toggleType — adds or removes a type from the observationTypes array
   * Used for section 2 checkboxes
   */
  const toggleType = (value: string) => {
    setObservationTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  /**
   * toggleLifeSavingRule — adds or removes a rule from lifeSavingRules array
   * Used for section 4 checkboxes
   */
  const toggleLifeSavingRule = (value: string) => {
    setLifeSavingRules((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  /**
   * toggleInArray — generic helper to add/remove a value from any string[] state
   * Used for all checkbox groups in section 6
   */
  const toggleInArray = (
    value: string,
    current: string[],
    setter: (v: string[]) => void,
  ) => {
    setter(
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    );
  };

  // ─── Shared Tailwind classes ──────────────────────────────────────────────
  const inputClass =
    "px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors";
  const labelClass =
    "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1";
  const sectionClass =
    "rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6 mb-6";
  const sectionHeadingClass =
    "text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-300 -mx-6 -mt-6 mb-5 px-6 py-3 rounded-t-xl";
  const comingSoonClass =
    "rounded-xl border border-amber-200 dark:border-slate-800 bg-amber-50/30 dark:bg-slate-900/50 p-6 mb-6 min-h-[80px] flex items-center justify-center";

  // ─── Handlers ────────────────────────────────────────────────────────────
  const onSubmit = async () => {
    setLoading(true);
    try {
      // TODO: call createObservation or submitObservation action
      toast.success("Observation submitted!");
      router.push("/observationdashboard");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onSaveDraft = async () => {
    setDraftLoading(true);
    try {
      // TODO: call saveObservationDraft action
      toast.success("Draft saved!");
      router.push("/observationdashboard");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDraftLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Section 1 — Observation Details ───────────────────────────── */}
      <div className={sectionClass}>
        <h2 className={sectionHeadingClass}>1. Observation Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ── Left column ─────────────────────────────────────────── */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Vessel / Project *</label>
              <Input
                value={vesselProject}
                onChange={(e) => setVesselProject(e.target.value)}
                placeholder="e.g. MV Atlantic Star"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
            <div>
              <label className={labelClass}>Location (Area / Deck)</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Main Deck"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
            <div>
              <label className={labelClass}>Job / Activity Observed *</label>
              <Input
                value={jobActivity}
                onChange={(e) => setJobActivity(e.target.value)}
                placeholder="e.g. Crane Operations"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
            <div>
              <label className={labelClass}>Observer Name *</label>
              <Input
                value={observerName}
                onChange={(e) => setObserverName(e.target.value)}
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
            {/* <div>
              <label className={labelClass}>Created By</label>
              <Input
                value={currentUser.name ?? currentUser.email}
                readOnly
                className="border-amber-200 bg-amber-50 cursor-not-allowed text-slate-400"
              />
            </div> */}
            <div>
              <label className={labelClass}>Created By</label>
              <Input
                value={observerType}
                onChange={(e) => setObserverType(e.target.value)}
                placeholder="e.g. Name of creator"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
          </div>

          {/* ── Right column ─────────────────────────────────────────── */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Observation No.</label>
              <Input
                value={observationNo}
                onChange={(e) => setObservationNo(e.target.value)}
                placeholder="e.g. OBS-2026-001"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Date *</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border-amber-200 focus-visible:ring-amber-400"
                />
              </div>
              <div>
                <label className={labelClass}>Time</label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="border-amber-200 focus-visible:ring-amber-400"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Department / Company</label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Deck Department"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
            <div>
              <label className={labelClass}>Weather / Sea State</label>
              <Input
                value={weatherSeaState}
                onChange={(e) => setWeatherSeaState(e.target.value)}
                placeholder="e.g. Calm, Sunny"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Sections 2, 3, 4, 5 — Side by side grid ──────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* ── Section 2 — Observation Type (checkboxes) ───────────────── */}
        <div className="md:col-span-1 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-300 -mx-5 -mt-5 mb-4 px-5 py-3 rounded-t-xl">
            2. Observation Type
          </h2>

          {/* Checkboxes — multiple selection allowed */}
          <div className="space-y-2">
            {OBSERVATION_TYPES.map((type) => (
              <label
                key={type.value}
                className={`flex items-start gap-2 cursor-pointer py-1.5 rounded-lg transition-colors ${
                  observationTypes.includes(type.value)
                    ? "bg-amber-100 dark:bg-amber-700/20"
                    : "hover:bg-amber-100/50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="text-sm shrink-0">{type.icon}</span>
                <input
                  type="checkbox"
                  value={type.value}
                  checked={observationTypes.includes(type.value)}
                  onChange={() => toggleType(type.value)}
                  className="mt-0.5 accent-amber-400 shrink-0"
                />

                <span className="text-xs text-slate-600 dark:text-slate-300 leading-tight">
                  {type.label}
                </span>
              </label>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-amber-100 dark:border-slate-700 my-3" />

          {/* Was Stop Work Authority Used? */}
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Was Stop Work Authority Used?
            </p>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="stopWork"
                  checked={stopWorkUsed === true}
                  onChange={() => setStopWorkUsed(true)}
                  className="accent-amber-400"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  Yes
                </span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="stopWork"
                  checked={stopWorkUsed === false}
                  onChange={() => setStopWorkUsed(false)}
                  className="accent-amber-400"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  No
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* ── Section 3 — Observation Source (radio buttons) ──────────── */}
        <div className="md:col-span-1 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-300 -mx-5 -mt-5 mb-4 px-5 py-3 rounded-t-xl">
            3. Observation Source
          </h2>

          {/* Radio buttons — single selection only */}
          <div className="space-y-2">
            {OBSERVATION_SOURCES.map((source) => (
              <label
                key={source.value}
                className={`flex items-start gap-2 cursor-pointer py-1.5 rounded-lg transition-colors ${
                  observationSource === source.value
                    ? "bg-amber-100 dark:bg-amber-700/20"
                    : "hover:bg-amber-100/50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="text-sm shrink-0">{source.icon}</span>
                <input
                  type="radio"
                  name="observationSource"
                  value={source.value}
                  checked={observationSource === source.value}
                  onChange={() => setObservationSource(source.value)}
                  className="mt-0.5 accent-amber-400 shrink-0"
                />

                <span className="text-xs text-slate-600 dark:text-slate-300 leading-tight">
                  {source.label}
                </span>
              </label>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-amber-100 dark:border-slate-700 my-3" />

          {/* Other (Specify) — textarea */}
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Other (Specify):
            </p>
            <textarea
              value={observationSourceOther}
              onChange={(e) => setObservationSourceOther(e.target.value)}
              rows={2}
              placeholder="Specify other source..."
              className="px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors resize-none"
            />
          </div>
        </div>

        {/* ── Section 4 — Life Saving Rules (IOGP) ────────────────────── */}
        <div className="md:col-span-1 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-300 -mx-5 -mt-5 mb-4 px-5 py-3 rounded-t-xl">
            4. Life Saving Rules (IOGP)
          </h2>

          {/* Checkboxes — multiple selection allowed */}
          <div className="space-y-2">
            {LIFE_SAVING_RULES.map((rule) => (
              <label
                key={rule.value}
                className={`flex items-start gap-2 cursor-pointer py-1.5 rounded-lg transition-colors ${
                  lifeSavingRules.includes(rule.value)
                    ? "bg-amber-100 dark:bg-amber-700/20"
                    : "hover:bg-amber-100/50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="text-sm shrink-0">{rule.icon}</span>
                <input
                  type="checkbox"
                  value={rule.value}
                  checked={lifeSavingRules.includes(rule.value)}
                  onChange={() => toggleLifeSavingRule(rule.value)}
                  className="mt-0.5 accent-amber-400 shrink-0"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 leading-tight">
                  {rule.label}
                </span>
              </label>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-amber-100 dark:border-slate-700 my-3" />

          {/* Other (Specify) — textarea */}
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Other (Specify):
            </p>
            <textarea
              value={lifeSavingRulesOther}
              onChange={(e) => setLifeSavingRulesOther(e.target.value)}
              rows={2}
              placeholder="Specify other rule..."
              className="px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors resize-none"
            />
          </div>
        </div>

        {/* ── Section 5 — Risk Priority ────────────────────────────────────── */}
        <div className="md:col-span-1 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-300 -mx-5 -mt-5 mb-4 px-5 py-3 rounded-t-xl">
            5. Risk Priority
          </h2>

          {/* Radio buttons with colored severity dot — single selection */}
          <div className="space-y-2">
            {RISK_PRIORITIES.map((priority) => (
              <label
                key={priority.value}
                className={`flex items-start gap-2 cursor-pointer py-1.5 px-2 rounded-lg border-l-4 transition-colors ${
                  riskPriority === priority.value
                    ? `${priority.bg} ${priority.borderLeft}`
                    : "border-l-transparent hover:bg-amber-100/50 dark:hover:bg-slate-800"
                }`}
              >
                <input
                  type="radio"
                  name="riskPriority"
                  value={priority.value}
                  checked={riskPriority === priority.value}
                  onChange={() => setRiskPriority(priority.value)}
                  className="mt-1 accent-amber-400 shrink-0"
                />
                {/* Colored severity dot */}
                <span
                  className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${priority.dot}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {priority.label}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight whitespace-pre-line">
                    {priority.desc}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-amber-100 dark:border-slate-700 my-3" />

          {/* High Potential Event (HiPo) */}
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              High Potential Event (HiPo)
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">
              Could this observation have serious consequences?
            </p>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="hiPo"
                  checked={hiPo === true}
                  onChange={() => setHiPo(true)}
                  className="accent-amber-400"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  Yes
                </span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="hiPo"
                  checked={hiPo === false}
                  onChange={() => setHiPo(false)}
                  className="accent-amber-400"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  No
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 6 — Observation Category ──────────────────────────── */}
      <div className="rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6 mb-6 overflow-hidden">
        <h2 className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-300 -mx-6 -mt-6 mb-5 px-6 py-3 rounded-t-xl">
          6. Observation Category (Select all that apply)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* ── Column 1 — Operations (checkboxes) ─────────────────────── */}
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              Operations
            </p>
            <div className="space-y-1">
              {CATEGORY_OPERATIONS.map((item) => (
                <label
                  key={item}
                  className={`flex items-start gap-2 cursor-pointer py-1 rounded-lg transition-colors ${
                    categoryOperations.includes(item)
                      ? "bg-amber-100 dark:bg-amber-700/20"
                      : "hover:bg-amber-100/50 dark:hover:bg-slate-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={categoryOperations.includes(item)}
                    onChange={() =>
                      toggleInArray(
                        item,
                        categoryOperations,
                        setCategoryOperations,
                      )
                    }
                    className="mt-0.5 accent-amber-400 shrink-0"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                    {item}
                  </span>
                </label>
              ))}
            </div>
            <div className="border-t border-amber-100 dark:border-slate-700 my-2" />
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Other (Specify):
            </p>
            <textarea
              value={categoryOperationsOther}
              onChange={(e) => setCategoryOperationsOther(e.target.value)}
              rows={2}
              placeholder="Specify..."
              className="px-2 py-1.5 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors resize-none"
            />
          </div>

          {/* ── Column 2 — Survey Equipment (radio buttons) ─────────────── */}
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              Survey Equipment
            </p>
            <div className="space-y-1">
              {CATEGORY_SURVEY_EQUIPMENT.map((item) => (
                <label
                  key={item}
                  className={`flex items-start gap-2 cursor-pointer py-1 rounded-lg transition-colors ${
                    categorySurveyEquipment === item
                      ? "bg-amber-100 dark:bg-amber-700/20"
                      : "hover:bg-amber-100/50 dark:hover:bg-slate-800"
                  }`}
                >
                  <input
                    type="radio"
                    name="categorySurveyEquipment"
                    checked={categorySurveyEquipment === item}
                    onChange={() => setCategorySurveyEquipment(item)}
                    className="mt-0.5 accent-amber-400 shrink-0"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                    {item}
                  </span>
                </label>
              ))}
            </div>
            <div className="border-t border-amber-100 dark:border-slate-700 my-2" />
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Other (Specify):
            </p>
            <textarea
              value={categorySurveyEquipmentOther}
              onChange={(e) => setCategorySurveyEquipmentOther(e.target.value)}
              rows={2}
              placeholder="Specify..."
              className="px-2 py-1.5 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors resize-none"
            />
          </div>

          {/* ── Column 3 — Work Activities (checkboxes) ─────────────────── */}
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              Work Activities
            </p>
            <div className="space-y-1">
              {CATEGORY_WORK_ACTIVITIES.map((item) => (
                <label
                  key={item}
                  className={`flex items-start gap-2 cursor-pointer py-1 rounded-lg transition-colors ${
                    categoryWorkActivities.includes(item)
                      ? "bg-amber-100 dark:bg-amber-700/20"
                      : "hover:bg-amber-100/50 dark:hover:bg-slate-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={categoryWorkActivities.includes(item)}
                    onChange={() =>
                      toggleInArray(
                        item,
                        categoryWorkActivities,
                        setCategoryWorkActivities,
                      )
                    }
                    className="mt-0.5 accent-amber-400 shrink-0"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                    {item}
                  </span>
                </label>
              ))}
            </div>
            <div className="border-t border-amber-100 dark:border-slate-700 my-2" />
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Other (Specify):
            </p>
            <textarea
              value={categoryWorkActivitiesOther}
              onChange={(e) => setCategoryWorkActivitiesOther(e.target.value)}
              rows={2}
              placeholder="Specify..."
              className="px-2 py-1.5 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors resize-none"
            />
          </div>

          {/* ── Column 4 — Hazards / Conditions (checkboxes) ────────────── */}
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              Hazards / Conditions
            </p>
            <div className="space-y-1">
              {CATEGORY_HAZARDS.map((item) => (
                <label
                  key={item}
                  className={`flex items-start gap-2 cursor-pointer py-1 rounded-lg transition-colors ${
                    categoryHazards.includes(item)
                      ? "bg-amber-100 dark:bg-amber-700/20"
                      : "hover:bg-amber-100/50 dark:hover:bg-slate-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={categoryHazards.includes(item)}
                    onChange={() =>
                      toggleInArray(item, categoryHazards, setCategoryHazards)
                    }
                    className="mt-0.5 accent-amber-400 shrink-0"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                    {item}
                  </span>
                </label>
              ))}
            </div>
            <div className="border-t border-amber-100 dark:border-slate-700 my-2" />
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Other (Specify):
            </p>
            <textarea
              value={categoryHazardsOther}
              onChange={(e) => setCategoryHazardsOther(e.target.value)}
              rows={2}
              placeholder="Specify..."
              className="px-2 py-1.5 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors resize-none"
            />
          </div>

          {/* ── Column 5 — Environment & Other (checkboxes) ─────────────── */}
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              Environment & Other
            </p>
            <div className="space-y-1">
              {CATEGORY_ENVIRONMENT.map((item) => (
                <label
                  key={item}
                  className={`flex items-start gap-2 cursor-pointer py-1 rounded-lg transition-colors ${
                    categoryEnvironment.includes(item)
                      ? "bg-amber-100 dark:bg-amber-700/20"
                      : "hover:bg-amber-100/50 dark:hover:bg-slate-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={categoryEnvironment.includes(item)}
                    onChange={() =>
                      toggleInArray(
                        item,
                        categoryEnvironment,
                        setCategoryEnvironment,
                      )
                    }
                    className="mt-0.5 accent-amber-400 shrink-0"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                    {item}
                  </span>
                </label>
              ))}
            </div>
            <div className="border-t border-amber-100 dark:border-slate-700 my-2" />
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Other (Specify):
            </p>
            <textarea
              value={categoryEnvironmentOther}
              onChange={(e) => setCategoryEnvironmentOther(e.target.value)}
              rows={2}
              placeholder="Specify..."
              className="px-2 py-1.5 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* ── Sections 7 & 8 — Description + Immediate Action ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Section 7 — Observation Description */}
        <div className="rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6 overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-300 -mx-6 -mt-6 mb-4 px-6 py-3 rounded-t-xl">
            7. Observation Description
          </h2>
          <label className={labelClass}>
            Describe what was observed. Be specific (Who, What, Where, When,
            How)
          </label>
          <textarea
            value={observationDescription}
            onChange={(e) => setObservationDescription(e.target.value)}
            rows={5}
            placeholder="Describe what was observed..."
            className="px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors resize-none"
          />
        </div>

        {/* Section 8 — Immediate Action Taken */}
        <div className="rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6 overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-300 -mx-6 -mt-6 mb-4 px-6 py-3 rounded-t-xl">
            8. Immediate Action Taken
          </h2>
          <label className={labelClass}>
            What immediate action was taken at the time of observation?
          </label>
          <textarea
            value={immediateAction}
            onChange={(e) => setImmediateAction(e.target.value)}
            rows={5}
            placeholder="Describe the immediate action taken..."
            className="px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors resize-none"
          />
        </div>
      </div>

      {/* ── Sections 9 & 10 — Corrective Action + Root Cause ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Section 9 — Corrective / Preventive Action */}
        <div className="rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6 overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-300 -mx-6 -mt-6 mb-4 px-6 py-3 rounded-t-xl">
            9. Corrective / Preventive Action Required
          </h2>

          <div className="space-y-4">
            {/* Corrective Action */}
            <div>
              <label className={labelClass}>Corrective Action</label>
              <textarea
                value={correctiveAction}
                onChange={(e) => setCorrectiveAction(e.target.value)}
                rows={3}
                placeholder="What corrective action is required?"
                className="px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors resize-none mb-2"
              />
              <label className={labelClass}>Target Completion Date</label>
              <Input
                type="date"
                value={correctiveActionDate}
                onChange={(e) => setCorrectiveActionDate(e.target.value)}
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>

            {/* Preventive Action */}
            <div>
              <label className={labelClass}>Preventive Action</label>
              <textarea
                value={preventiveAction}
                onChange={(e) => setPreventiveAction(e.target.value)}
                rows={3}
                placeholder="What preventive action is required?"
                className="px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors resize-none mb-2"
              />
              <label className={labelClass}>Target Completion Date</label>
              <Input
                type="date"
                value={preventiveActionDate}
                onChange={(e) => setPreventiveActionDate(e.target.value)}
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>

            {/* Responsible Person / Team */}
            <div>
              <label className={labelClass}>Responsible Person / Team</label>
              <Input
                value={responsiblePerson}
                onChange={(e) => setResponsiblePerson(e.target.value)}
                placeholder="e.g. Chief Officer"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Section 10 — Root Cause */}
        <div className="rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6 overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-300 -mx-6 -mt-6 mb-4 px-6 py-3 rounded-t-xl">
            10. Root Cause (Select the most relevant)
          </h2>

          {/* Radio buttons — single selection only */}
          <div className="space-y-1">
            {ROOT_CAUSES.map((cause) => (
              <label
                key={cause.value}
                className={`flex items-start gap-2 cursor-pointer py-1.5 rounded-lg transition-colors ${
                  rootCause === cause.value
                    ? "bg-amber-100 dark:bg-amber-700/20"
                    : "hover:bg-amber-100/50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="text-sm shrink-0">{cause.icon}</span>
                <input
                  type="radio"
                  name="rootCause"
                  checked={rootCause === cause.value}
                  onChange={() => setRootCause(cause.value)}
                  className="mt-0.5 accent-amber-400 shrink-0"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 leading-tight">
                  {cause.label}
                </span>
              </label>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-amber-100 dark:border-slate-700 my-3" />

          {/* Other (Specify) — textarea */}
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Other (Specify):
            </p>
            <textarea
              value={rootCauseOther}
              onChange={(e) => setRootCauseOther(e.target.value)}
              rows={2}
              placeholder="Specify other root cause..."
              className="px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* ── Section 11 — Potential Consequence ────────────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-500 font-semibold uppercase tracking-widest">
          11. Potential Consequence — Coming Soon
        </p>
      </div>

      {/* ── Section 12 — Follow-up / Action Tracking ──────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-500 font-semibold uppercase tracking-widest">
          12. Follow-up / Action Tracking — Coming Soon
        </p>
      </div>

      {/* ── Section 13 — Lessons Learned ──────────────────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-500 font-semibold uppercase tracking-widest">
          13. Lessons Learned / Good Practice — Coming Soon
        </p>
      </div>

      {/* ── Section 14 — Close Out (Admin + Manager only) ─────────────── */}
      {(currentUser.role === "ADMIN" || currentUser.role === "MANAGER") && (
        <div className={comingSoonClass}>
          <p className="text-xs text-amber-500 font-semibold uppercase tracking-widest">
            14. Close Out — Coming Soon
          </p>
        </div>
      )}

      {/* ── Submit / Save Draft / Cancel ──────────────────────────────── */}
      <div className="flex items-center gap-4 pb-10 flex-wrap">
        <Button
          type="button"
          disabled={loading || draftLoading}
          onClick={onSubmit}
          className="px-8 py-3 bg-amber-300 hover:bg-amber-400 text-amber-900 border border-amber-200 shadow-sm"
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>

        <Button
          type="button"
          disabled={loading || draftLoading}
          onClick={onSaveDraft}
          className="px-8 py-3 bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 shadow-sm"
        >
          {draftLoading ? "Saving..." : "Save Draft"}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={loading || draftLoading}
          onClick={() => router.push("/observationdashboard")}
          className="border-amber-200 text-slate-600 hover:bg-amber-50"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
