"use client";

import Image from "next/image";

/**
 * SafetyMeetingView — Read-only view of a single Safety Meeting / Toolbox Talk
 *
 * Follows the same pattern as RiskView/ObservationView — each section
 * only renders if it has data.
 */

type SafetyMeetingViewProps = {
  meeting: any;
};

const stateStyle: Record<string, string> = {
  DRAFT: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  COMPLETED:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const TEAM_CONFIRMATION_LABELS: Record<string, string> = {
  taskSequenceRoles: "Task sequence and individual roles are understood",
  criticalHazards: "Critical hazards and controls have been discussed",
  stopMakeSafe: "Stop / Make Safe / Reassess criteria are understood",
  emergencyActions: "Emergency actions and communication method are understood",
  lmraRequired: "LMRA Required at work site",
};

export default function SafetyMeetingView({ meeting }: SafetyMeetingViewProps) {
  const sectionClass =
    "rounded-xl border border-red-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 md:p-6";

  const sectionHeadingClass =
    "text-xs font-bold uppercase tracking-widest text-red-900 dark:text-red-400 mb-4 pb-2 border-b border-red-100 dark:border-slate-700";

  const labelClass =
    "block text-xs font-medium text-slate-400 dark:text-slate-500 mb-1";

  const valueClass = "text-sm text-slate-900 dark:text-white font-medium";

  const fieldClass =
    "rounded-lg border border-red-200 dark:border-slate-700 bg-red-50/30 dark:bg-slate-950 px-3 py-2 text-sm min-h-[38px] w-full break-words";

  const tagClass =
    "text-xs px-2.5 py-1 rounded-full border border-red-200 dark:border-slate-700 bg-red-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300";

  return (
    <div className="w-full px-3 md:px-8 py-6 space-y-4 max-w-[1400px] mx-auto min-h-screen">
      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-red-600 dark:text-red-400 font-medium mb-1">
            Safety Meeting / Toolbox Talk
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            {meeting.projectSurvey}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            {meeting.activityTask}
          </p>
        </div>
        <span
          className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${stateStyle[meeting.state]}`}
        >
          {meeting.state}
        </span>
      </div>

      {/* ── Task & Project Information ───────────────────────────────── */}
      <div className={sectionClass}>
        <h2 className={sectionHeadingClass}>Task & Project Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          {[
            { label: "Project / Survey", value: meeting.projectSurvey },
            { label: "Contract No.", value: meeting.contractNo ?? "—" },
            {
              label: "Vessel / Installation",
              value: meeting.vesselInstallation,
            },
            {
              label: "Date",
              value: new Date(meeting.date).toLocaleDateString("en-GB"),
            },
            {
              label: "Location / Area / Deck",
              value: meeting.locationAreaDeck,
            },
            { label: "Start Time", value: meeting.startTime ?? "—" },
            { label: "Expected Finish", value: meeting.expectedFinish ?? "—" },
            { label: "Toolbox Talk Leader", value: meeting.toolboxTalkLeader },
            {
              label: "First time / non-routine task",
              value: meeting.firstTimeNonRoutine ? "Yes" : "No",
            },
            {
              label: "SIMOPS involved",
              value: meeting.simopsInvolved ? "Yes" : "No",
            },
          ].map(({ label, value }) => (
            <div key={label}>
              <span className={labelClass}>{label}</span>
              <p className={valueClass}>{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <span className={labelClass}>Task Objective / Brief Description</span>
          <div className={fieldClass}>{meeting.taskObjective}</div>
        </div>
      </div>

      {/* ── Operational Context ──────────────────────────────────────── */}
      {(meeting.vesselStatus ||
        meeting.weatherSeaState ||
        meeting.workAreaStatus ||
        meeting.dayNight ||
        meeting.nearbyOperations) && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>Operational Context</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            {meeting.vesselStatus && (
              <div>
                <span className={labelClass}>Vessel status</span>
                <p className={valueClass}>{meeting.vesselStatus}</p>
              </div>
            )}
            {meeting.weatherSeaState && (
              <div>
                <span className={labelClass}>Weather / Sea State</span>
                <p className={valueClass}>{meeting.weatherSeaState}</p>
              </div>
            )}
            {meeting.workAreaStatus && (
              <div>
                <span className={labelClass}>Work area status</span>
                <p className={valueClass}>{meeting.workAreaStatus}</p>
              </div>
            )}
            {meeting.dayNight && (
              <div>
                <span className={labelClass}>Day / Night</span>
                <p className={valueClass}>{meeting.dayNight}</p>
              </div>
            )}
            {meeting.nearbyOperations && (
              <div>
                <span className={labelClass}>Nearby operations</span>
                <p className={valueClass}>{meeting.nearbyOperations}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Responsible Interfaces ───────────────────────────────────── */}
      {(meeting.masterOowDpo ||
        meeting.deckPic ||
        meeting.surveyLead ||
        meeting.equipmentOperator ||
        meeting.responsibleInterfacesOther) && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>Responsible Interfaces</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            {meeting.masterOowDpo && (
              <div>
                <span className={labelClass}>Master / OOW / DPO</span>
                <p className={valueClass}>{meeting.masterOowDpo}</p>
              </div>
            )}
            {meeting.deckPic && (
              <div>
                <span className={labelClass}>Deck PIC</span>
                <p className={valueClass}>{meeting.deckPic}</p>
              </div>
            )}
            {meeting.surveyLead && (
              <div>
                <span className={labelClass}>Survey Lead</span>
                <p className={valueClass}>{meeting.surveyLead}</p>
              </div>
            )}
            {meeting.equipmentOperator && (
              <div>
                <span className={labelClass}>Equipment Operator</span>
                <p className={valueClass}>{meeting.equipmentOperator}</p>
              </div>
            )}
          </div>
          {meeting.responsibleInterfacesOther && (
            <div className="mt-4">
              <span className={labelClass}>Others</span>
              <div className={fieldClass}>
                {meeting.responsibleInterfacesOther}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Selected Toolbox Talk Cards ──────────────────────────────── */}
      {meeting.selectedCards?.length > 0 && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>Selected Toolbox Talk Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meeting.selectedCards.map((sc: any) => (
              <div
                key={sc.id}
                className="rounded-lg border border-red-200 dark:border-slate-700 overflow-hidden"
              >
                {sc.card.imageUrl && (
                  <Image
                    src={sc.card.imageUrl}
                    alt={sc.card.title}
                    width={500}
                    height={350}
                    className="w-full h-auto object-cover"
                  />
                )}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-semibold text-red-600 dark:text-red-400">
                      {sc.card.code}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      {sc.card.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {sc.card.tags.map((tag: string) => (
                      <span key={tag} className={tagClass}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Confirm with the Team ────────────────────────────────────── */}
      {(meeting.teamConfirmations?.length > 0 ||
        meeting.teamConfirmationsOther) && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>Confirm with the Team</h2>
          {meeting.teamConfirmations?.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {meeting.teamConfirmations.map((key: string) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-red-500">✓</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {TEAM_CONFIRMATION_LABELS[key] ?? key}
                  </span>
                </div>
              ))}
            </div>
          )}
          {meeting.teamConfirmationsOther && (
            <div>
              <span className={labelClass}>Others</span>
              <div className={fieldClass}>{meeting.teamConfirmationsOther}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Team Members ──────────────────────────────────────────────── */}
      {meeting.teamMembers?.length > 0 && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>Team Members</h2>
          <div className="flex flex-wrap gap-2">
            {meeting.teamMembers.map((m: any) => (
              <span
                key={m.id}
                className="text-sm px-3 py-1.5 rounded-full border border-red-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-950"
              >
                {m.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Created / Updated info ───────────────────────────────────── */}
      <div className={sectionClass}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className={labelClass}>Created By</span>
            <p className={valueClass}>
              {meeting.createdBy?.name ?? meeting.createdBy?.email ?? "—"}
            </p>
          </div>
          <div>
            <span className={labelClass}>State Updated By</span>
            <p className={valueClass}>{meeting.stateUpdatedBy?.name ?? "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
