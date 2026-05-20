"use client"

type RiskViewProps = {
  risk: any
}

const getRFColorClass = (color: string | null | undefined) => {
  if (color === "GREEN")  return "bg-green-500 text-white"
  if (color === "YELLOW") return "bg-yellow-400 text-white"
  if (color === "RED")    return "bg-red-600 text-white"
  return "bg-zinc-100 text-zinc-400"
}

const raTypeLabel: Record<string, string> = {
  ROUTINE:     "Routine",
  NON_ROUTINE: "Non Routine",
}

const stateStyle: Record<string, string> = {
  DRAFT:       "bg-zinc-100 text-zinc-600",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  COMPLETED:   "bg-green-50 text-green-700",
  CANCELLED:   "bg-red-50 text-red-700",
}

export default function RiskView({ risk }: RiskViewProps) {
  const sectionClass = "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6 mb-6"
  const labelClass   = "block text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-1"
  const valueClass   = "text-sm text-zinc-900 dark:text-white"
  const fieldClass   = "rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm min-h-[38px]"

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#1D9E75] font-medium mb-2">
            Risk Assessment
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight">{risk.ref}</h1>
          <p className="text-sm text-zinc-500 mt-1">{risk.workActivity}</p>
        </div>
        <span className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${stateStyle[risk.state]}`}>
          {risk.state.replace("_", " ")}
        </span>
      </div>

      {/* Basic Info */}
      <div className={sectionClass}>
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-5">
          Basic Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          <div>
            <span className={labelClass}>Ref</span>
            <p className={valueClass}>{risk.ref}</p>
          </div>
          <div>
            <span className={labelClass}>Initiator</span>
            <p className={valueClass}>{risk.initiator}</p>
          </div>
          <div>
            <span className={labelClass}>Initiation Date</span>
            <p className={valueClass}>{new Date(risk.initiationDate).toLocaleDateString("en-GB")}</p>
          </div>
          <div>
            <span className={labelClass}>Review Date</span>
            <p className={valueClass}>
              {risk.reviewDate ? new Date(risk.reviewDate).toLocaleDateString("en-GB") : "—"}
            </p>
          </div>
          <div>
            <span className={labelClass}>RA Type</span>
            <p className={valueClass}>{raTypeLabel[risk.raType] ?? risk.raType}</p>
          </div>
          <div>
            <span className={labelClass}>Library Index</span>
            <p className={valueClass}>{risk.libraryIndex ?? "—"}</p>
          </div>
          <div>
            <span className={labelClass}>Vessel / Department</span>
            <p className={valueClass}>{risk.vesselDepartment ?? "—"}</p>
          </div>
          <div>
            <span className={labelClass}>Fleet</span>
            <p className={valueClass}>{risk.fleet ?? "—"}</p>
          </div>
          <div>
            <span className={labelClass}>Defect Related</span>
            <p className={valueClass}>{risk.defectRelated ? "Yes" : "No"}</p>
          </div>
          <div>
            <span className={labelClass}>Clone of</span>
            <p className={valueClass}>{risk.cloneOf ?? "—"}</p>
          </div>
          <div>
            <span className={labelClass}>Created By</span>
            <p className={valueClass}>{risk.createdBy?.name ?? risk.createdBy?.email ?? "—"}</p>
          </div>
          <div>
            <span className={labelClass}>State Updated By</span>
            <p className={valueClass}>{risk.stateUpdatedBy?.name ?? "—"}</p>
          </div>
        </div>

        {risk.workActivity && (
          <div className="mt-5">
            <span className={labelClass}>Work Activity Being Assessed</span>
            <div className={fieldClass}>{risk.workActivity}</div>
          </div>
        )}

        {risk.initiatorComment && (
          <div className="mt-4">
            <span className={labelClass}>Initiator Comments</span>
            <div className={fieldClass}>{risk.initiatorComment}</div>
          </div>
        )}
      </div>

      {/* Assessment Rows */}
      <div className={sectionClass}>
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-5">
          Assessment of Risk
        </h2>

        {risk.assessmentRows?.length === 0 ? (
          <p className="text-sm text-zinc-400">No assessment rows.</p>
        ) : (
          <div className="space-y-6">
            {risk.assessmentRows?.map((row: any, index: number) => (
              <div
                key={row.id}
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-5"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
                  Row {index + 1}
                </p>

                {/* Main columns: Hazard | Impact | Existing Controls | SCT+C+F+RF */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className={labelClass}>Hazard</span>
                    <div className={`${fieldClass} whitespace-pre-wrap`}>{row.hazard}</div>
                  </div>
                  <div>
                    <span className={labelClass}>Impact</span>
                    <div className={`${fieldClass} whitespace-pre-wrap`}>{row.impact}</div>
                  </div>
                  <div>
                    <span className={labelClass}>Existing Control Measures</span>
                    <div className={`${fieldClass} whitespace-pre-wrap`}>{row.existingControls ?? "—"}</div>
                  </div>

                  {/* SCT / C / F / RF column */}
                  <div className="flex flex-col gap-3">
                    <div>
                      <span className={labelClass}>SCT</span>
                      <p className={valueClass}>{row.sct ?? "—"}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className={labelClass}>C</span>
                        <p className={valueClass}>{row.c ?? "—"}</p>
                      </div>
                      <div>
                        <span className={labelClass}>F</span>
                        <p className={valueClass}>{row.f ?? "—"}</p>
                      </div>
                      <div>
                        <span className={labelClass}>RF</span>
                        <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm ${getRFColorClass(row.rfColor)}`}>
                          {row.rf ?? "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Measures */}
                {row.additionalMeasures?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
                      Additional Control Measures
                    </p>
                    <div className="space-y-3">
                      {row.additionalMeasures.map((m: any, mIndex: number) => (
                        <div
                          key={m.id}
                          className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4"
                        >
                          <p className="text-xs text-zinc-400 mb-2">Measure {mIndex + 1}</p>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-3">
                              <span className={labelClass}>Further Action</span>
                              <div className={`${fieldClass} whitespace-pre-wrap`}>
                                {m.furtherAction ?? "—"}
                              </div>
                            </div>
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-4">
                                <div>
                                  <span className={labelClass}>C</span>
                                  <p className={valueClass}>{m.c ?? "—"}</p>
                                </div>
                                <div>
                                  <span className={labelClass}>F</span>
                                  <p className={valueClass}>{m.f ?? "—"}</p>
                                </div>
                                <div>
                                  <span className={labelClass}>RF</span>
                                  <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm ${getRFColorClass(m.rfColor)}`}>
                                    {m.rf ?? "—"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alternative Ways */}
      <div className={sectionClass}>
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-5">
          Alternative Ways to Carry Out the Work
        </h2>
        <p className={valueClass}>{risk.alternativeWays ? "Yes" : "No"}</p>
        {risk.alternativeWays && risk.alternativeWaysText && (
          <div className={`${fieldClass} mt-3 whitespace-pre-wrap`}>
            {risk.alternativeWaysText}
          </div>
        )}
      </div>

      {/* Team */}
      <div className={sectionClass}>
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-5">
          Risk Assessment Team
        </h2>
        {risk.teamMembers?.length === 0 ? (
          <p className="text-sm text-zinc-400">No team members.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {risk.teamMembers?.map((m: any) => (
              <span
                key={m.id}
                className="text-sm px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
              >
                {m.name}
              </span>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}