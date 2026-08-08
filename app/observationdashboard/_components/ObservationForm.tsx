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

import {
  OBSERVATION_TYPES,
  OBSERVATION_SOURCES,
  LIFE_SAVING_RULES,
  RISK_PRIORITIES,
  CATEGORY_OPERATIONS,
  CATEGORY_SURVEY_EQUIPMENT,
  CATEGORY_WORK_ACTIVITIES,
  CATEGORY_HAZARDS,
  CATEGORY_ENVIRONMENT,
  ROOT_CAUSES,
  POTENTIAL_CONSEQUENCES,
} from "./observationOptions";

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
 * observationType — single selected type value
 * Radio buttons — only one can be selected
 */
const [observationType, setObservationType] = useState<string>(
  observation?.observationType ?? "",
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
  /**
   * rootCauses — array of selected root cause values
   * Multiple checkboxes — user can select more than one
   */
  const [rootCauses, setRootCauses] = useState<string[]>(
    observation?.rootCauses ?? [],
  );
  const [rootCauseOther, setRootCauseOther] = useState<string>(
    observation?.rootCauseOther ?? "",
  );

  // ─── Section 11 state ─────────────────────────────────────────────────────
  /**
   * potentialConsequences — array of selected consequence values
   * Multiple checkboxes — user can select more than one
   */
  const [potentialConsequences, setPotentialConsequences] = useState<string[]>(
    observation?.potentialConsequences ?? [],
  );
  const [potentialConsequenceOther, setPotentialConsequenceOther] =
    useState<string>(observation?.potentialConsequenceOther ?? "");

  // ─── Section 12 (Lessons Learned) state ────────────────────────────────────
  /** What can we learn from this observation? */
  const [lessonsLearned, setLessonsLearned] = useState(
    observation?.lessonsLearned ?? "",
  );

  /** How can we prevent recurrence? */
  const [preventRecurrence, setPreventRecurrence] = useState(
    observation?.preventRecurrence ?? "",
  );

  // ─── Section 13 (Close Out) state — Admin + Manager only ─────────────────
  /** Name of QHSE Manager/Officer who closed the observation */
  const [closedBy, setClosedBy] = useState(observation?.closedBy ?? "");

  /** Date the observation was closed */
  const [dateClosed, setDateClosed] = useState(observation?.dateClosed ?? "");

  /** Was the corrective action effective? — Yes/No */
  const [correctiveActionEffective, setCorrectiveActionEffective] = useState<
    boolean | null
  >(observation?.correctiveActionEffective ?? null);

  /** Is further action required? — Yes/No */
  const [furtherActionRequired, setFurtherActionRequired] = useState<
    boolean | null
  >(observation?.furtherActionRequired ?? null);

  /** Name of person closing out (instead of signature) */
  const [closeOutName, setCloseOutName] = useState(
    observation?.closeOutName ?? currentUser.name ?? currentUser.email ?? "",
  );

  // ─── Document footer state ─────────────────────────────────────────────────
  /** Office response note */
  const [officeResponse, setOfficeResponse] = useState(
    observation?.officeResponse ?? "",
  );

  /** Document effective date */
  const [effectiveDate, setEffectiveDate] = useState(
    observation?.effectiveDate ?? "",
  );

  // ─── Checkbox toggle helper ───────────────────────────────────────────────
  /**

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
              <label className={labelClass}>Weather / Sea State</label>
              <Input
                value={weatherSeaState}
                onChange={(e) => setWeatherSeaState(e.target.value)}
                placeholder="e.g. Calm, Sunny"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
          </div>

          {/* ── Right column ─────────────────────────────────────────── */}
          <div className="space-y-4">
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
              <label className={labelClass}>Observer Name *</label>
              <Input
                value={observerName}
                onChange={(e) => setObserverName(e.target.value)}
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
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
        </div>
      </div>

      {/* ── Sections 2, 3, 4, 5 — Side by side grid ──────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
{/* ── Section 2 — Observation Type (radio buttons) ───────────────── */}
<div className="md:col-span-1 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 overflow-hidden">
  <h2 className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-300 -mx-5 -mt-5 mb-4 px-5 py-3 rounded-t-xl">
    2. Observation Type
  </h2>

  {/* Radio buttons — single selection only */}
  <div className="space-y-2">
    {OBSERVATION_TYPES.map((type) => (
      <label
        key={type.value}
        className={`flex items-start gap-2 cursor-pointer py-1.5 rounded-lg transition-colors ${
          observationType === type.value
            ? "bg-amber-100 dark:bg-amber-700/20"
            : "hover:bg-amber-100/50 dark:hover:bg-slate-800"
        }`}
      >
        <span className="text-sm shrink-0">{type.icon}</span>
        <input
          type="radio"
          name="observationType"
          value={type.value}
          checked={observationType === type.value}
          onChange={() => setObservationType(type.value)}
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

  {/* Was Stop Work Authority Used? — stays exactly as it is */}
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
        <span className="text-xs text-slate-600 dark:text-slate-300">Yes</span>
      </label>
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="radio"
          name="stopWork"
          checked={stopWorkUsed === false}
          onChange={() => setStopWorkUsed(false)}
          className="accent-amber-400"
        />
        <span className="text-xs text-slate-600 dark:text-slate-300">No</span>
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
            {/* Corrective Action — textarea + date in 2 columns on desktop */}
            <div>
              <label className={labelClass}>Corrective Action</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <textarea
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  rows={3}
                  placeholder="What corrective action is required?"
                  className="md:col-span-2 px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors resize-none"
                />
                <div className="md:col-span-1">
                  <label className={labelClass}>Target Completion Date</label>
                  <Input
                    type="date"
                    value={correctiveActionDate}
                    onChange={(e) => setCorrectiveActionDate(e.target.value)}
                    className="border-amber-200 focus-visible:ring-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Preventive Action — textarea + date in 2 columns on desktop */}
            <div>
              <label className={labelClass}>Preventive Action</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <textarea
                  value={preventiveAction}
                  onChange={(e) => setPreventiveAction(e.target.value)}
                  rows={3}
                  placeholder="What preventive action is required?"
                  className="md:col-span-2 px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors resize-none"
                />
                <div className="md:col-span-1">
                  <label className={labelClass}>Target Completion Date</label>
                  <Input
                    type="date"
                    value={preventiveActionDate}
                    onChange={(e) => setPreventiveActionDate(e.target.value)}
                    className="border-amber-200 focus-visible:ring-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Responsible Person / Team — stays full width, single row */}
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

          {/* Checkboxes — multiple selection allowed */}
          <div className="space-y-1">
            {ROOT_CAUSES.map((cause) => (
              <label
                key={cause.value}
                className={`flex items-start gap-2 cursor-pointer py-1.5 rounded-lg transition-colors ${
                  rootCauses.includes(cause.value)
                    ? "bg-amber-100 dark:bg-amber-700/20"
                    : "hover:bg-amber-100/50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="text-sm shrink-0">{cause.icon}</span>
                <input
                  type="checkbox"
                  checked={rootCauses.includes(cause.value)}
                  onChange={() =>
                    toggleInArray(cause.value, rootCauses, setRootCauses)
                  }
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

      {/* ── Sections 11 & 12 — Potential Consequence + Lessons Learned ───── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Section 11 — Potential Consequence */}
        <div className="rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6 overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-300 -mx-6 -mt-6 mb-4 px-6 py-3 rounded-t-xl">
            11. Potential Consequence (Select all that apply)
          </h2>

          {/* Checkboxes — multiple selection allowed */}
          <div className="space-y-1">
            {POTENTIAL_CONSEQUENCES.map((item) => (
              <label
                key={item}
                className={`flex items-start gap-2 cursor-pointer py-1.5 rounded-lg transition-colors ${
                  potentialConsequences.includes(item)
                    ? "bg-amber-100 dark:bg-amber-700/20"
                    : "hover:bg-amber-100/50 dark:hover:bg-slate-800"
                }`}
              >
                <input
                  type="checkbox"
                  checked={potentialConsequences.includes(item)}
                  onChange={() =>
                    toggleInArray(
                      item,
                      potentialConsequences,
                      setPotentialConsequences,
                    )
                  }
                  className="mt-0.5 accent-amber-400 shrink-0"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 leading-tight">
                  {item}
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
              value={potentialConsequenceOther}
              onChange={(e) => setPotentialConsequenceOther(e.target.value)}
              rows={2}
              placeholder="Specify other consequence..."
              className="px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Section 12 — Lessons Learned / Good Practice */}
        <div className="rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6 overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-300 -mx-6 -mt-6 mb-4 px-6 py-3 rounded-t-xl">
            12. Lessons Learned / Good Practice
          </h2>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                What can we learn from this observation?
              </label>
              <textarea
                value={lessonsLearned}
                onChange={(e) => setLessonsLearned(e.target.value)}
                rows={3}
                placeholder="Lessons learned..."
                className="px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors resize-none"
              />
            </div>

            <div>
              <label className={labelClass}>
                How can we prevent recurrence?
              </label>
              <textarea
                value={preventRecurrence}
                onChange={(e) => setPreventRecurrence(e.target.value)}
                rows={3}
                placeholder="Prevention measures..."
                className="px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 13 — Close Out (Admin + Manager only) ─────────────── */}
      {(currentUser.role === "ADMIN" || currentUser.role === "MANAGER") && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>13. Close Out</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Closed By */}
            <div>
              <label className={labelClass}>Closed By</label>
              <Input
                value={closedBy}
                onChange={(e) => setClosedBy(e.target.value)}
                placeholder="e.g. QHSE Manager name"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>

            {/* Date Closed */}
            <div>
              <label className={labelClass}>Date Closed</label>
              <Input
                type="date"
                value={dateClosed}
                onChange={(e) => setDateClosed(e.target.value)}
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>

            {/* Was the corrective action effective? */}
            <div>
              <p className={labelClass}>Was the corrective action effective?</p>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="correctiveEffective"
                    checked={correctiveActionEffective === true}
                    onChange={() => setCorrectiveActionEffective(true)}
                    className="accent-amber-400"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    Yes
                  </span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="correctiveEffective"
                    checked={correctiveActionEffective === false}
                    onChange={() => setCorrectiveActionEffective(false)}
                    className="accent-amber-400"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    No
                  </span>
                </label>
              </div>
            </div>

            {/* Further action required? */}
            <div>
              <p className={labelClass}>Further action required?</p>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="furtherAction"
                    checked={furtherActionRequired === true}
                    onChange={() => setFurtherActionRequired(true)}
                    className="accent-amber-400"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    Yes
                  </span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="furtherAction"
                    checked={furtherActionRequired === false}
                    onChange={() => setFurtherActionRequired(false)}
                    className="accent-amber-400"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    No
                  </span>
                </label>
              </div>
            </div>

            {/* Name — instead of signature */}
            <div className="md:col-span-2">
              <label className={labelClass}>Name</label>
              <Input
                value={closeOutName}
                onChange={(e) => setCloseOutName(e.target.value)}
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Important Notes + Confidential Notice ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Important Notes */}
        <div className="rounded-xl border border-blue-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-200/30 shadow-sm p-5 overflow-hidden">
          <h3 className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-blue-200 -mx-5 -mt-5 mb-4 px-5 py-2.5 rounded-t-xl">
            Important Notes
          </h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-sm shrink-0">⚓</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                This card is intended to promote a positive safety culture and
                continuous improvement.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sm shrink-0">⚓</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Use this card for reporting observations, for incidents,
                injuries, pollution, or emergencies, follow the company&apos;s
                immediate reporting procedures.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sm shrink-0">⚓</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                All reports will be reviewed, investigated if necessary, and
                corrective actions tracked to closure.
              </p>
            </div>
          </div>
        </div>

        {/* Confidential & Non-Punitive */}
        <div className="rounded-xl border border-amber-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-600/30 shadow-sm p-5 overflow-hidden">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">🛡️</span>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-900 dark:text-amber-400 mb-2">
                Confidential & Non-Punitive
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                Reports are handled confidentially and in accordance with the
                company&apos;s Just Culture and reporting procedures.
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Deliberate violations, gross negligence or unlawful acts may
                require separate investigation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Document Footer — Office Response + OCAP Icons ───────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Left — Document Owner / Office Response */}
        <div className="rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5">
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Document Owner</label>
              <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                QHSE Department
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className={labelClass}>Office Response</label>
                <Input
                  value={officeResponse}
                  onChange={(e) => setOfficeResponse(e.target.value)}
                  placeholder="e.g. Reviewed by office"
                  className="border-amber-200 focus-visible:ring-amber-400"
                />
              </div>
              <div className="md:col-span-1">
                <label className={labelClass}>Effective Date</label>
                <Input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="border-amber-200 focus-visible:ring-amber-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right — OCAP icons matching Important Notes theme */}
        <div className="rounded-xl border border-blue-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-200/30 shadow-sm p-5">
          <div className="grid grid-cols-4 gap-3 h-full items-center">
            <div className="flex flex-col items-center text-center gap-1">
              <span className="text-xl">👁</span>
              <p className="text-[10px] font-bold text-amber-900 dark:text-amber-400 uppercase tracking-wide">
                Observe
              </p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight">
                Be aware of what is happening
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <span className="text-xl">❤️</span>
              <p className="text-[10px] font-bold text-amber-900 dark:text-amber-400 uppercase tracking-wide">
                Care
              </p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight">
                Care for yourself and others
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <span className="text-xl">⚙️</span>
              <p className="text-[10px] font-bold text-amber-900 dark:text-amber-400 uppercase tracking-wide">
                Act
              </p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight">
                Take action to eliminate risks
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <span className="text-xl">🛡️</span>
              <p className="text-[10px] font-bold text-amber-900 dark:text-amber-400 uppercase tracking-wide">
                Prevent
              </p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight">
                Prevent incidents before they happen
              </p>
            </div>
          </div>
        </div>
      </div>

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
