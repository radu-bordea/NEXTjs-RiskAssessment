"use client";

type RiskViewProps = {
  risk: any;
};

const getRFColorClass = (color: string | null | undefined) => {
  if (color === "GREEN") return "bg-green-500 text-white";
  if (color === "YELLOW") return "bg-yellow-400 text-white";
  if (color === "RED") return "bg-red-600 text-white";
  return "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500";
};

const getRFBorderClass = (color: string | null | undefined) => {
  if (color === "GREEN") return "border-l-4 border-l-green-500";
  if (color === "YELLOW") return "border-l-4 border-l-yellow-400";
  if (color === "RED") return "border-l-4 border-l-red-600";
  return "border-l-4 border-l-zinc-200 dark:border-l-zinc-700";
};

const raTypeLabel: Record<string, string> = {
  ROUTINE: "Routine",
  NON_ROUTINE: "Non Routine",
};

const stateStyle: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  IN_PROGRESS:
    "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  COMPLETED:
    "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function RiskView({ risk }: RiskViewProps) {
  const sectionClass =
    "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5 md:p-6";
  const labelClass =
    "block text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-1";
  const valueClass = "text-sm text-zinc-900 dark:text-white font-medium";
  const fieldClass =
    "rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm min-h-[38px] w-full";

  return (
    <div className="w-full px-3 md:px-8 py-6 space-y-4 max-w-400 mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#1D9E75] font-medium mb-1">
            Risk Assessment
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {risk.ref}
          </h1>
          <p className="text-sm text-zinc-500 mt-1 max-w-xl">
            {risk.workActivity}
          </p>
        </div>
        <span
          className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${stateStyle[risk.state]}`}
        >
          {risk.state.replace("_", " ")}
        </span>
      </div>

      {/* Basic Info */}
      <div className={sectionClass}>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          {[
            { label: "Ref", value: risk.ref },
            { label: "Initiator", value: risk.initiator },
            {
              label: "Initiation Date",
              value: new Date(risk.initiationDate).toLocaleDateString("en-GB"),
            },
            {
              label: "Review Date",
              value: risk.reviewDate
                ? new Date(risk.reviewDate).toLocaleDateString("en-GB")
                : "—",
            },
            {
              label: "RA Type",
              value: raTypeLabel[risk.raType] ?? risk.raType,
            },
            { label: "Library Category", value: risk.libraryCategory ?? "—" },
            { label: "Library Index", value: risk.libraryIndex ?? "—" },
            { label: "Vessel / Dept", value: risk.vesselDepartment ?? "—" },
            { label: "Fleet", value: risk.fleet ?? "—" },
            {
              label: "Defect Related",
              value: risk.defectRelated ? "Yes" : "No",
            },
            { label: "Clone of", value: risk.cloneOf ?? "—" },
            {
              label: "Created By",
              value: risk.createdBy?.name ?? risk.createdBy?.email ?? "—",
            },
            {
              label: "State Updated By",
              value: risk.stateUpdatedBy?.name ?? "—",
            },
          ].map(({ label, value }) => (
            <div key={label}>
              <span className={labelClass}>{label}</span>
              <p className={valueClass}>{value}</p>
            </div>
          ))}
        </div>

        {risk.workActivity && (
          <div className="mt-4">
            <span className={labelClass}>Work Activity Being Assessed</span>
            <div className={fieldClass}>{risk.workActivity}</div>
          </div>
        )}
        {risk.initiatorComment && (
          <div className="mt-3">
            <span className={labelClass}>Initiator Comments</span>
            <div className={fieldClass}>{risk.initiatorComment}</div>
          </div>
        )}
      </div>

      {/* Assessment of Risk */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Desktop table header — hidden on mobile */}
        <div className="hidden md:flex bg-[#0F6E56] border-b border-[#085041]">
          <div className="w-8 shrink-0 bg-[#085041]" />
          <div className="flex flex-1 min-w-0">
            <div className="flex-1 min-w-25 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-white border-r border-[#085041]">
              Hazard
            </div>
            <div className="flex-1 min-w-25 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-white border-r border-[#085041]">
              Impact
            </div>
            <div className="flex-1 min-w-25 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-white border-r border-[#085041]">
              Existing Controls
            </div>
            <div className="w-32 shrink-0 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-white border-r border-[#085041]">
              SCT
            </div>
            <div className="w-10 shrink-0 px-2 py-2.5 text-xs font-bold uppercase tracking-wide text-white border-r border-[#085041] text-center">
              C
            </div>
            <div className="w-10 shrink-0 px-2 py-2.5 text-xs font-bold uppercase tracking-wide text-white border-r border-[#085041] text-center">
              F
            </div>
            <div className="w-14 shrink-0 px-2 py-2.5 text-xs font-bold uppercase tracking-wide text-white border-r border-[#085041] text-center">
              RF
            </div>
          </div>
          <div className="w-90 shrink-0 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-white bg-[#085041]">
            Additional Control Measures
          </div>
        </div>

        {/* Mobile section header */}
        <div className="md:hidden bg-[#0F6E56] px-4 py-2.5">
          <p className="text-xs font-bold uppercase tracking-wide text-white">
            Assessment of Risk
          </p>
        </div>

        {risk.assessmentRows?.length === 0 ? (
          <div className="px-4 py-8 text-sm text-zinc-400 text-center bg-white dark:bg-zinc-950">
            No assessment rows.
          </div>
        ) : (
          risk.assessmentRows?.map((row: any, index: number) => (
            <div
              key={row.id}
              className={`border-b border-zinc-100 dark:border-zinc-800 last:border-b-0 ${
                index % 2 === 0
                  ? "bg-white dark:bg-zinc-950"
                  : "bg-zinc-50/60 dark:bg-zinc-900/60"
              }`}
            >
              {/* Mobile layout */}
              <div className="md:hidden p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                    Row {index + 1}
                  </span>
                  {row.rf != null && (
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${getRFColorClass(row.rfColor)}`}
                    >
                      {row.rf}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <span className={labelClass}>Hazard</span>
                    <p className="text-sm text-zinc-900 dark:text-white">
                      {row.hazard}
                    </p>
                  </div>
                  <div>
                    <span className={labelClass}>Impact</span>
                    <p className="text-sm text-zinc-900 dark:text-white">
                      {row.impact}
                    </p>
                  </div>
                  {row.existingControls && (
                    <div>
                      <span className={labelClass}>Existing Controls</span>
                      <p className="text-sm text-zinc-500">
                        {row.existingControls}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {row.sct && (
                    <div>
                      <span className={labelClass}>SCT</span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {row.sct}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className={labelClass}>C</span>
                    <p className="text-sm font-medium">{row.c ?? "—"}</p>
                  </div>
                  <div>
                    <span className={labelClass}>F</span>
                    <p className="text-sm font-medium">{row.f ?? "—"}</p>
                  </div>
                  <div>
                    <span className={labelClass}>RF</span>
                    <div
                      className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm ${getRFColorClass(row.rfColor)}`}
                    >
                      {row.rf ?? "—"}
                    </div>
                  </div>
                </div>

                {/* Mobile additional measures */}
                {row.additionalMeasures?.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                      Additional Control Measures
                    </p>
                    {row.additionalMeasures.map((m: any, mIndex: number) => (
                      <div
                        key={m.id}
                        className={`rounded-lg p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 ${getRFBorderClass(m.rfColor)}`}
                      >
                        <p className="text-xs text-zinc-400 mb-1">
                          Measure {mIndex + 1}
                        </p>
                        <p className="text-sm text-zinc-900 dark:text-white mb-2">
                          {m.furtherAction ?? "—"}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs text-zinc-400">
                            C:{" "}
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">
                              {m.c ?? "—"}
                            </span>
                          </span>
                          <span className="text-xs text-zinc-400">
                            F:{" "}
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">
                              {m.f ?? "—"}
                            </span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-zinc-400">RF:</span>
                            <div
                              className={`w-7 h-7 flex items-center justify-center rounded font-bold text-xs ${getRFColorClass(m.rfColor)}`}
                            >
                              {m.rf ?? "—"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop layout */}
              <div className="hidden md:flex">
                {/* Row number */}
                <div className="w-8 shrink-0 flex items-start justify-center pt-3.5 text-xs text-zinc-300 dark:text-zinc-600 font-bold border-r border-zinc-100 dark:border-zinc-800">
                  {index + 1}
                </div>

                {/* Main columns */}
                <div className="flex flex-1 min-w-0 divide-x divide-zinc-100 dark:divide-zinc-800">
                  <div className="flex-1 min-w-25 px-3 py-3 text-sm text-zinc-900 dark:text-white whitespace-pre-wrap">
                    {row.hazard}
                  </div>
                  <div className="flex-1 min-w-25 px-3 py-3 text-sm text-zinc-900 dark:text-white whitespace-pre-wrap">
                    {row.impact}
                  </div>
                  <div className="flex-1 min-w-25 px-3 py-3 text-sm text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap">
                    {row.existingControls ?? "—"}
                  </div>
                  <div className="w-32 shrink-0 px-3 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                    {row.sct ?? "—"}
                  </div>
                  <div className="w-10 shrink-0 px-2 py-3 text-sm text-center text-zinc-700 dark:text-zinc-300 font-medium">
                    {row.c ?? "—"}
                  </div>
                  <div className="w-10 shrink-0 px-2 py-3 text-sm text-center text-zinc-700 dark:text-zinc-300 font-medium">
                    {row.f ?? "—"}
                  </div>
                  <div className="w-14 shrink-0 px-2 py-3 flex items-start justify-center">
                    <div
                      className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm ${getRFColorClass(row.rfColor)}`}
                    >
                      {row.rf ?? "—"}
                    </div>
                  </div>
                </div>

                {/* Additional measures — right panel */}
                <div className="w-90 shrink-0 border-l border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
                  {!row.additionalMeasures?.length ? (
                    <div className="px-3 py-3 text-xs text-zinc-300 dark:text-zinc-600">
                      —
                    </div>
                  ) : (
                    row.additionalMeasures.map((m: any, mIndex: number) => (
                      <div
                        key={m.id}
                        className={`px-3 py-3 ${getRFBorderClass(m.rfColor)}`}
                      >
                        <p className="text-xs text-zinc-400 mb-1 font-medium">
                          Measure {mIndex + 1}
                        </p>
                        <p className="text-sm text-zinc-900 dark:text-white whitespace-pre-wrap mb-2">
                          {m.furtherAction ?? "—"}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs text-zinc-400">
                            C:{" "}
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">
                              {m.c ?? "—"}
                            </span>
                          </span>
                          <span className="text-xs text-zinc-400">
                            F:{" "}
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">
                              {m.f ?? "—"}
                            </span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-zinc-400">RF:</span>
                            <div
                              className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs ${getRFColorClass(m.rfColor)}`}
                            >
                              {m.rf ?? "—"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alternative Ways */}
      <div className={sectionClass}>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
          Alternative Ways to Carry Out the Work
        </h2>
        <p className={`${valueClass} mb-2`}>
          {risk.alternativeWays ? "Yes" : "No"}
        </p>
        {risk.alternativeWays && risk.alternativeWaysText && (
          <div className={`${fieldClass} whitespace-pre-wrap`}>
            {risk.alternativeWaysText}
          </div>
        )}
      </div>

      {/* Team */}
      <div className={sectionClass}>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
          Risk Assessment Team
        </h2>
        {!risk.teamMembers?.length ? (
          <p className="text-sm text-zinc-400">No team members.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {risk.teamMembers?.map((m: any) => (
              <span
                key={m.id}
                className="text-sm px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-950"
              >
                {m.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Responsible Persons */}
      <div className={sectionClass}>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
          Responsible Persons
        </h2>
        {!risk.responsiblePersons?.length ? (
          <p className="text-sm text-zinc-400">No responsible persons.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {risk.responsiblePersons?.map((p: any) => (
              <span
                key={p.id}
                className="text-sm px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-950"
              >
                {p.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
