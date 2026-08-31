"use client";

/**
 * RiskView — Read-only view of a single risk assessment
 *
 * Displays all risk data in a structured layout.
 * Used at /dashboard/risks/[id]
 * Accessible to all authenticated roles (ADMIN, MANAGER, MEMBER).
 *
 * Layout:
 *  - Page header (ref, state badge)
 *  - Basic Information grid
 *  - Assessment of Risk table (desktop) / cards (mobile)
 *  - Alternative Ways
 *  - Responsible Persons
 *  - Risk Assessment Team
 */

type RiskViewProps = {
  risk: any;
};

// ─── RF color helpers ─────────────────────────────────────────────────────────

/** Returns Tailwind bg+text classes for the RF colored badge */
const getRFColorClass = (color: string | null | undefined) => {
  if (color === "GREEN") return "bg-green-500 text-white";
  if (color === "YELLOW") return "bg-yellow-400 text-white";
  if (color === "RED") return "bg-red-600 text-white";
  return "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500";
};

/**
 * Returns a left-border color class for additional measure cards.
 * Provides a quick visual indicator of RF risk level.
 */
const getRFBorderClass = (color: string | null | undefined) => {
  if (color === "GREEN") return "border-l-4 border-l-green-500";
  if (color === "YELLOW") return "border-l-4 border-l-yellow-400";
  if (color === "RED") return "border-l-4 border-l-red-600";
  return "border-l-4 border-l-[#A8D5B5] dark:border-l-slate-700";
};

// ─── Display maps ─────────────────────────────────────────────────────────────

const raTypeLabel: Record<string, string> = {
  ROUTINE: "Routine",
  NON_ROUTINE: "Non Routine",
};

const stateStyle: Record<string, string> = {
  TEMPLATE: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DRAFT: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  COMPLETED:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function RiskView({ risk }: RiskViewProps) {
  // ─── Shared class strings ───────────────────────────────────────────────
  /** Section card — white bg, green border, subtle shadow */
  const sectionClass =
    "rounded-xl border border-[#A8D5B5] dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm shadow-[#A8D5B5]/40 p-5 md:p-6";

  /** Section heading with green accent and bottom border */
  const sectionHeadingClass =
    "text-xs font-bold uppercase tracking-widest text-[#1A7A4A] dark:text-emerald-400 mb-4 pb-2 border-b border-[#D4EAD9] dark:border-slate-700";

  /** Small label above a value */
  const labelClass =
    "block text-xs font-medium text-slate-400 dark:text-slate-500 mb-1";

  /** Main value text */
  const valueClass = "text-sm text-slate-900 dark:text-white font-medium";

  /** Field box — used for textarea-like display fields */
  const fieldClass =
    "rounded-lg border border-[#A8D5B5] dark:border-slate-700 bg-[#F5FAF6] dark:bg-slate-950 px-3 py-2 text-sm min-h-[38px] w-full";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full px-3 md:px-8 py-6 space-y-4 max-w-400 mx-auto bg-[#EEF5F0] dark:bg-slate-950 min-h-screen">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#1A7A4A] dark:text-emerald-400 font-medium mb-1">
            Risk Assessment
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            {risk.ref}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            {risk.workActivity}
          </p>
        </div>
        {/* State badge */}
        <span
          className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${stateStyle[risk.state]}`}
        >
          {risk.state.replace("_", " ")}
        </span>
      </div>

      {/* ── Basic Information ──────────────────────────────────────────────── */}
      <div className={sectionClass}>
        <h2 className={sectionHeadingClass}>Basic Information</h2>

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
            // { label: "Approved By", value: risk.approvedBy ?? "—" },
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

        {/* Emergency Response */}
        {risk.emergencyResponse && (
          <div className="mt-3">
            <span className={labelClass}>
              General Requirements /{" "}
              <span className="font-bold text-red-500">EMERGENCY RESPONSE</span>
            </span>
            <div className={fieldClass}>{risk.emergencyResponse}</div>
          </div>
        )}
      </div>

      {/* ── Assessment of Risk ────────────────────────────────────────────── */}
      {/*
        overflow-x-auto on the wrapper fixes the overlap on smaller screens.
        The inner table-like layout uses fixed widths that need to scroll
        horizontally rather than compress and overlap.
      */}
      <div className="rounded-xl border border-[#A8D5B5] dark:border-slate-700 overflow-hidden shadow-sm shadow-[#A8D5B5]/40">
        <div className="overflow-x-auto">
          {/* Desktop table header — hidden on mobile */}
          <div className="hidden md:flex bg-[#1A7A4A] dark:bg-[#0d4a2b] border-b border-[#145f39] dark:border-[#0a3520] min-w-300">
            <div className="w-8 shrink-0 bg-[#145f39] dark:bg-[#0a3520]" />
            <div className="flex flex-1 min-w-0">
              <div className="w-28 shrink-0 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-white border-r border-[#145f39]">
                Responsible
              </div>
              <div className="flex-1 min-w-25 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-white border-r border-[#145f39]">
                Hazard
              </div>
              <div className="flex-1 min-w-25 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-white border-r border-[#145f39] wrap-break-word">
                Impact
              </div>
              <div className="flex-1 min-w-25 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-white border-r border-[#145f39]">
                Existing Controls
              </div>

              <div className="w-20 shrink-0 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-white border-r border-[#145f39]">
                SCT
              </div>
              <div className="w-10 shrink-0 px-2 py-2.5 text-xs font-bold uppercase tracking-wide text-white border-r border-[#145f39] text-center">
                C
              </div>
              <div className="w-10 shrink-0 px-2 py-2.5 text-xs font-bold uppercase tracking-wide text-white border-r border-[#145f39] text-center">
                F
              </div>
              <div className="w-14 shrink-0 px-2 py-2.5 text-xs font-bold uppercase tracking-wide text-white border-r border-[#145f39] text-center">
                RF
              </div>
            </div>
            <div className="w-90 shrink-0 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-white bg-[#145f39] dark:bg-[#0a3520]">
              Additional Control Measures
            </div>
          </div>

          {/* Mobile section header */}
          <div className="md:hidden bg-[#1A7A4A] px-4 py-2.5">
            <p className="text-xs font-bold uppercase tracking-wide text-white">
              Assessment of Risk
            </p>
          </div>

          {/* Empty state */}
          {risk.assessmentRows?.length === 0 ? (
            <div className="px-4 py-8 text-sm text-slate-400 text-center bg-white dark:bg-slate-950">
              No assessment rows.
            </div>
          ) : (
            risk.assessmentRows?.map((row: any, index: number) => (
              <div
                key={row.id}
                className={`border-b border-[#D4EAD9] dark:border-slate-800 last:border-b-0 ${
                  index % 2 === 0
                    ? "bg-white dark:bg-slate-950"
                    : "bg-[#F5FAF6] dark:bg-slate-900/60"
                }`}
              >
                {/* ── Mobile layout ──────────────────────────────────────── */}
                <div className="md:hidden p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1A7A4A] dark:text-emerald-400 uppercase tracking-wide">
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
                    {row.responsiblePerson && (
                      <div>
                        <span className={labelClass}>Responsible Person</span>
                        <p className="text-sm text-slate-500">
                          {row.responsiblePerson}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className={labelClass}>Hazard</span>
                      <p className="text-sm text-slate-900 dark:text-white">
                        {row.hazard}
                      </p>
                    </div>
                    <div>
                      <span className={labelClass}>Impact</span>
                      <p className="text-sm text-slate-900 dark:text-white">
                        {row.impact}
                      </p>
                    </div>
                    {row.existingControls && (
                      <div>
                        <span className={labelClass}>Existing Controls</span>
                        <p className="text-sm text-slate-500">
                          {row.existingControls}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    {row.sct && (
                      <div>
                        <span className={labelClass}>SCT</span>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
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
                      <p className="text-xs font-bold uppercase tracking-wide text-[#1A7A4A] dark:text-emerald-400">
                        Additional Control Measures
                      </p>
                      {row.additionalMeasures.map((m: any, mIndex: number) => (
                        <div
                          key={m.id}
                          className={`rounded-lg p-3 bg-[#F5FAF6] dark:bg-slate-900 border border-[#D4EAD9] dark:border-slate-800 ${getRFBorderClass(m.rfColor)}`}
                        >
                          <p className="text-xs text-slate-400 mb-1">
                            Measure {mIndex + 1}
                          </p>
                          <p className="text-sm text-slate-900 dark:text-white mb-2">
                            {m.furtherAction ?? "—"}
                          </p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs text-slate-400">
                              C:{" "}
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {m.c ?? "—"}
                              </span>
                            </span>
                            <span className="text-xs text-slate-400">
                              F:{" "}
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {m.f ?? "—"}
                              </span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-400">
                                RF:
                              </span>
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

                {/* ── Desktop layout ─────────────────────────────────────── */}
                <div className="hidden md:flex min-w-300">
                  {/* Row number */}
                  <div className="w-8 shrink-0 flex items-start justify-center pt-3.5 text-xs text-slate-300 dark:text-slate-600 font-bold border-r border-[#D4EAD9] dark:border-slate-800">
                    {index + 1}
                  </div>

                  {/* Main columns */}
                  <div className="flex flex-1 min-w-0 divide-x divide-[#D4EAD9] dark:divide-slate-800">
                    <div className="w-28 shrink-0 px-3 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words">
                      {row.responsiblePerson ?? "—"}
                    </div>
                    <div className="flex-1 min-w-25 px-3 py-3 text-sm text-slate-900 dark:text-white wrap-break-word whitespace-pre-wrap">
                      {row.hazard}
                    </div>
                    <div className="flex-1 min-w-25 px-3 py-3 text-sm text-slate-900 dark:text-white whitespace-pre-wrap">
                      {row.impact}
                    </div>
                    <div className="flex-1 min-w-25 px-3 py-3 text-sm text-slate-500 dark:text-slate-400 whitespace-pre-wrap">
                      {row.existingControls ?? "—"}
                    </div>

                    <div className="w-20 shrink-0 px-3 py-3 text-xs text-slate-600 dark:text-slate-400 wrap-break-word">
                      {row.sct ?? "—"}
                    </div>
                    <div className="w-10 shrink-0 px-2 py-3 text-sm text-center text-slate-700 dark:text-slate-300 font-medium">
                      {row.c ?? "—"}
                    </div>
                    <div className="w-10 shrink-0 px-2 py-3 text-sm text-center text-slate-700 dark:text-slate-300 font-medium">
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
                  <div className="w-90 shrink-0 border-l border-[#D4EAD9] dark:border-slate-800 divide-y divide-[#D4EAD9] dark:divide-slate-800">
                    {!row.additionalMeasures?.length ? (
                      <div className="px-3 py-3 text-xs text-slate-300 dark:text-slate-600">
                        —
                      </div>
                    ) : (
                      row.additionalMeasures.map((m: any, mIndex: number) => (
                        <div
                          key={m.id}
                          className={`px-3 py-3 ${getRFBorderClass(m.rfColor)}`}
                        >
                          <p className="text-xs text-slate-400 mb-1 font-medium">
                            Measure {mIndex + 1}
                          </p>
                          <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap mb-2">
                            {m.furtherAction ?? "—"}
                          </p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs text-slate-400">
                              C:{" "}
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {m.c ?? "—"}
                              </span>
                            </span>
                            <span className="text-xs text-slate-400">
                              F:{" "}
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {m.f ?? "—"}
                              </span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-400">
                                RF:
                              </span>
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
      </div>

      {/* ── Alternative Ways ──────────────────────────────────────────────── */}
      <div className={sectionClass}>
        <h2 className={sectionHeadingClass}>
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

      {/* ── Responsible Interfaces ────────────────────────────────────────── */}
      {(risk.masterOowDpo ||
        risk.personInCharge ||
        risk.authorizedTeamLeader ||
        risk.equipmentOperator ||
        risk.attendeesWorkTeam) && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>Responsible Interfaces</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {risk.masterOowDpo && (
              <div>
                <span className={labelClass}>Master / OOW / DPO</span>
                <p className={valueClass}>{risk.masterOowDpo}</p>
              </div>
            )}
            {risk.personInCharge && (
              <div>
                <span className={labelClass}>Person in Charge (PIC)</span>
                <p className={valueClass}>{risk.personInCharge}</p>
              </div>
            )}
            {risk.authorizedTeamLeader && (
              <div>
                <span className={labelClass}>
                  Authorized Team Leader / Survey Lead
                </span>
                <p className={valueClass}>{risk.authorizedTeamLeader}</p>
              </div>
            )}
            {risk.equipmentOperator && (
              <div>
                <span className={labelClass}>Equipment Operator</span>
                <p className={valueClass}>{risk.equipmentOperator}</p>
              </div>
            )}
            {risk.attendeesWorkTeam && (
              <div>
                <span className={labelClass}>Attendees / Work Team</span>
                <p className={valueClass}>{risk.attendeesWorkTeam}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Approved By ──────────────────────────────────────────────────── */}
      {risk.approvedBy && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>Approval</h2>
          <div>
            <span className={labelClass}>Approved by the office</span>
            <p className={valueClass}>{risk.approvedBy}</p>
          </div>
        </div>
      )}
    </div>
  );
}
