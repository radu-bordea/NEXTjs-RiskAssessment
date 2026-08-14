"use client"

/**
 * ObservationView — Read-only view of a single observation card
 *
 * Displays all observation data in a structured layout.
 * Used at /observationdashboard/observations/[id]
 * Accessible to all authenticated roles.
 *
 * Follows the same pattern as RiskView — each section only renders
 * if it has data. Empty/unselected sections are hidden entirely.
 */

import {
  OBSERVATION_TYPES,
  OBSERVATION_SOURCES,
  LIFE_SAVING_RULES,
  RISK_PRIORITIES,
  ROOT_CAUSES,
} from "./observationOptions"

type ObservationViewProps = {
  observation: any
}

// ─── Display maps ─────────────────────────────────────────────────────────────

const stateStyle: Record<string, string> = {
  DRAFT:     "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  COMPLETED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
}

/** Looks up a readable label from an options array by value */
const getLabel = (options: { value: string; label: string }[], value: string | null) => {
  if (!value) return null
  return options.find((o) => o.value === value)?.label ?? value
}

/** Looks up the icon for a given value */
const getIcon = (options: { value: string; icon: string; label: string }[], value: string | null) => {
  if (!value) return ""
  return options.find((o) => o.value === value)?.icon ?? ""
}

export default function ObservationView({ observation }: ObservationViewProps) {

  // ─── Shared class strings ───────────────────────────────────────────────
  const sectionClass =
    "rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 md:p-6"

  const sectionHeadingClass =
    "text-xs font-bold uppercase tracking-widest text-amber-900 dark:text-amber-400 mb-4 pb-2 border-b border-amber-100 dark:border-slate-700"

  const labelClass =
    "block text-xs font-medium text-slate-400 dark:text-slate-500 mb-1"

  const valueClass =
    "text-sm text-slate-900 dark:text-white font-medium"

  const fieldClass =
    "rounded-lg border border-amber-200 dark:border-slate-700 bg-amber-50/30 dark:bg-slate-950 px-3 py-2 text-sm min-h-[38px] w-full break-words"

  /** Tag/pill for checkbox array items */
  const tagClass =
    "text-xs px-2.5 py-1 rounded-full border border-amber-200 dark:border-slate-700 bg-amber-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full px-3 md:px-8 py-6 space-y-4 max-w-[1400px] mx-auto min-h-screen">

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-medium mb-1">
            Observation Card
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            {observation.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            {observation.vesselProject}
          </p>
        </div>
        <span className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${stateStyle[observation.state]}`}>
          {observation.state}
        </span>
      </div>

      {/* ── Section 1 — Observation Details ──────────────────────────── */}
      <div className={sectionClass}>
        <h2 className={sectionHeadingClass}>1. Observation Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          {[
            { label: "Vessel / Project", value: observation.vesselProject },
            { label: "Location",         value: observation.location ?? "—" },
            { label: "Weather / Sea State", value: observation.weatherSeaState ?? "—" },
            { label: "Date", value: new Date(observation.date).toLocaleDateString("en-GB") },
            { label: "Time", value: observation.time ?? "—" },
            { label: "Observer Name", value: observation.observerName },
            { label: "Created By", value: observation.createdByField ?? "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <span className={labelClass}>{label}</span>
              <p className={valueClass}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2 — Observation Type ─────────────────────────────── */}
      {observation.observationType && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>2. Observation Type</h2>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getIcon(OBSERVATION_TYPES, observation.observationType)}</span>
            <span className={valueClass}>{getLabel(OBSERVATION_TYPES, observation.observationType)}</span>
          </div>
          {observation.stopWorkUsed !== null && (
            <div className="mt-3">
              <span className={labelClass}>Was Stop Work Authority Used?</span>
              <p className={valueClass}>{observation.stopWorkUsed ? "Yes" : "No"}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Section 3 — Observation Source ───────────────────────────── */}
      {(observation.observationSource || observation.observationSourceOther) && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>3. Observation Source</h2>
          {observation.observationSource && (
            <div className="flex items-center gap-2">
              <span className="text-lg">{getIcon(OBSERVATION_SOURCES, observation.observationSource)}</span>
              <span className={valueClass}>{getLabel(OBSERVATION_SOURCES, observation.observationSource)}</span>
            </div>
          )}
          {observation.observationSourceOther && (
            <div className="mt-3">
              <span className={labelClass}>Other (Specify)</span>
              <div className={fieldClass}>{observation.observationSourceOther}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Section 4 — Life Saving Rules (IOGP) ─────────────────────── */}
      {(observation.lifeSavingRules?.length > 0 || observation.lifeSavingRulesOther) && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>4. Life Saving Rules (IOGP)</h2>
          {observation.lifeSavingRules?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {observation.lifeSavingRules.map((rule: string) => (
                <span key={rule} className={tagClass}>
                  {getIcon(LIFE_SAVING_RULES, rule)} {getLabel(LIFE_SAVING_RULES, rule)}
                </span>
              ))}
            </div>
          )}
          {observation.lifeSavingRulesOther && (
            <div>
              <span className={labelClass}>Other (Specify)</span>
              <div className={fieldClass}>{observation.lifeSavingRulesOther}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Section 5 — Risk Priority ─────────────────────────────────── */}
      {observation.riskPriority && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>5. Risk Priority</h2>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${RISK_PRIORITIES.find(p => p.value === observation.riskPriority)?.dot}`} />
            <span className={valueClass}>{observation.riskPriority}</span>
          </div>
          {observation.hiPo !== null && (
            <div className="mt-3">
              <span className={labelClass}>High Potential Event (HiPo)</span>
              <p className={valueClass}>{observation.hiPo ? "Yes" : "No"}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Section 6 — Observation Category ─────────────────────────── */}
      {(observation.categoryOperations?.length > 0 ||
        observation.categorySurveyEquipment ||
        observation.categoryWorkActivities?.length > 0 ||
        observation.categoryHazards?.length > 0 ||
        observation.categoryEnvironment?.length > 0) && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>6. Observation Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {observation.categoryOperations?.length > 0 && (
              <div>
                <span className={labelClass}>Operations</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {observation.categoryOperations.map((item: string) => (
                    <span key={item} className={tagClass}>{item}</span>
                  ))}
                </div>
              </div>
            )}

            {observation.categorySurveyEquipment && (
              <div>
                <span className={labelClass}>Survey Equipment</span>
                <p className={valueClass}>{observation.categorySurveyEquipment}</p>
              </div>
            )}

            {observation.categoryWorkActivities?.length > 0 && (
              <div>
                <span className={labelClass}>Work Activities</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {observation.categoryWorkActivities.map((item: string) => (
                    <span key={item} className={tagClass}>{item}</span>
                  ))}
                </div>
              </div>
            )}

            {observation.categoryHazards?.length > 0 && (
              <div>
                <span className={labelClass}>Hazards / Conditions</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {observation.categoryHazards.map((item: string) => (
                    <span key={item} className={tagClass}>{item}</span>
                  ))}
                </div>
              </div>
            )}

            {observation.categoryEnvironment?.length > 0 && (
              <div>
                <span className={labelClass}>Environment & Other</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {observation.categoryEnvironment.map((item: string) => (
                    <span key={item} className={tagClass}>{item}</span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Section 7 — Observation Description ──────────────────────── */}
      <div className={sectionClass}>
        <h2 className={sectionHeadingClass}>7. Observation Description</h2>
        <div className={fieldClass}>{observation.observationDescription}</div>
      </div>

      {/* ── Section 8 — Immediate Action Taken ───────────────────────── */}
      {observation.immediateAction && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>8. Immediate Action Taken</h2>
          <div className={fieldClass}>{observation.immediateAction}</div>
        </div>
      )}

      {/* ── Section 9 & 10 — Corrective Action + Root Cause ──────────── */}
      {(observation.correctiveAction || observation.preventiveAction || observation.rootCauses?.length > 0 || observation.rootCauseOther) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {(observation.correctiveAction || observation.preventiveAction) && (
            <div className={sectionClass}>
              <h2 className={sectionHeadingClass}>9. Corrective / Preventive Action</h2>
              <div className="space-y-3">
                {observation.correctiveAction && (
                  <div>
                    <span className={labelClass}>Corrective Action</span>
                    <div className={fieldClass}>{observation.correctiveAction}</div>
                    {observation.correctiveActionDate && (
                      <p className="text-xs text-slate-500 mt-1">
                        Target: {new Date(observation.correctiveActionDate).toLocaleDateString("en-GB")}
                      </p>
                    )}
                  </div>
                )}
                {observation.preventiveAction && (
                  <div>
                    <span className={labelClass}>Preventive Action</span>
                    <div className={fieldClass}>{observation.preventiveAction}</div>
                    {observation.preventiveActionDate && (
                      <p className="text-xs text-slate-500 mt-1">
                        Target: {new Date(observation.preventiveActionDate).toLocaleDateString("en-GB")}
                      </p>
                    )}
                  </div>
                )}
                {observation.responsiblePerson && (
                  <div>
                    <span className={labelClass}>Responsible Person / Team</span>
                    <p className={valueClass}>{observation.responsiblePerson}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {(observation.rootCauses?.length > 0 || observation.rootCauseOther) && (
            <div className={sectionClass}>
              <h2 className={sectionHeadingClass}>10. Root Cause</h2>
              {observation.rootCauses?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {observation.rootCauses.map((cause: string) => (
                    <span key={cause} className={tagClass}>
                      {getIcon(ROOT_CAUSES, cause)} {getLabel(ROOT_CAUSES, cause)}
                    </span>
                  ))}
                </div>
              )}
              {observation.rootCauseOther && (
                <div>
                  <span className={labelClass}>Other (Specify)</span>
                  <div className={fieldClass}>{observation.rootCauseOther}</div>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ── Section 11 & 12 — Potential Consequence + Lessons Learned ── */}
      {(observation.potentialConsequences?.length > 0 || observation.potentialConsequenceOther || observation.lessonsLearned || observation.preventRecurrence) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {(observation.potentialConsequences?.length > 0 || observation.potentialConsequenceOther) && (
            <div className={sectionClass}>
              <h2 className={sectionHeadingClass}>11. Potential Consequence</h2>
              {observation.potentialConsequences?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {observation.potentialConsequences.map((item: string) => (
                    <span key={item} className={tagClass}>{item}</span>
                  ))}
                </div>
              )}
              {observation.potentialConsequenceOther && (
                <div>
                  <span className={labelClass}>Other (Specify)</span>
                  <div className={fieldClass}>{observation.potentialConsequenceOther}</div>
                </div>
              )}
            </div>
          )}

          {(observation.lessonsLearned || observation.preventRecurrence) && (
            <div className={sectionClass}>
              <h2 className={sectionHeadingClass}>12. Lessons Learned / Good Practice</h2>
              <div className="space-y-3">
                {observation.lessonsLearned && (
                  <div>
                    <span className={labelClass}>What can we learn?</span>
                    <div className={fieldClass}>{observation.lessonsLearned}</div>
                  </div>
                )}
                {observation.preventRecurrence && (
                  <div>
                    <span className={labelClass}>How can we prevent recurrence?</span>
                    <div className={fieldClass}>{observation.preventRecurrence}</div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── Section 13 — Close Out ────────────────────────────────────── */}
      {(observation.closedBy || observation.dateClosed || observation.closeOutName) && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>13. Close Out</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
            {observation.closedBy && (
              <div>
                <span className={labelClass}>Closed By</span>
                <p className={valueClass}>{observation.closedBy}</p>
              </div>
            )}
            {observation.dateClosed && (
              <div>
                <span className={labelClass}>Date Closed</span>
                <p className={valueClass}>{new Date(observation.dateClosed).toLocaleDateString("en-GB")}</p>
              </div>
            )}
            {observation.correctiveActionEffective !== null && (
              <div>
                <span className={labelClass}>Corrective Action Effective?</span>
                <p className={valueClass}>{observation.correctiveActionEffective ? "Yes" : "No"}</p>
              </div>
            )}
            {observation.furtherActionRequired !== null && (
              <div>
                <span className={labelClass}>Further Action Required?</span>
                <p className={valueClass}>{observation.furtherActionRequired ? "Yes" : "No"}</p>
              </div>
            )}
            {observation.closeOutName && (
              <div className="col-span-2 md:col-span-4">
                <span className={labelClass}>Name</span>
                <p className={valueClass}>{observation.closeOutName}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Document Footer ──────────────────────────────────────────── */}
      {(observation.officeResponse || observation.effectiveDate) && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>Office Response</h2>
          <div className="grid grid-cols-2 gap-4">
            {observation.officeResponse && (
              <div>
                <span className={labelClass}>Office Response</span>
                <p className={valueClass}>{observation.officeResponse}</p>
              </div>
            )}
            {observation.effectiveDate && (
              <div>
                <span className={labelClass}>Effective Date</span>
                <p className={valueClass}>{new Date(observation.effectiveDate).toLocaleDateString("en-GB")}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Created / Updated info ──────────────────────────────────── */}
      <div className={sectionClass}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className={labelClass}>Created By</span>
            <p className={valueClass}>{observation.createdBy?.name ?? observation.createdBy?.email ?? "—"}</p>
          </div>
          <div>
            <span className={labelClass}>State Updated By</span>
            <p className={valueClass}>{observation.stateUpdatedBy?.name ?? "—"}</p>
          </div>
        </div>
      </div>

    </div>
  )
}