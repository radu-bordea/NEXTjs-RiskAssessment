"use client";

type RiskViewProps = {
  risk: any;
};

export default function RiskView({ risk }: RiskViewProps) {
  const sectionClass =
    "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6 mb-6";

  const labelClass =
    "text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1";

  const valueClass =
    "rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm";

  return (
    <div className="space-y-6">

      {/* Basic */}
      <div className={sectionClass}>
        <h2 className="text-lg font-semibold mb-4">
          Basic Information
        </h2>

        <div className="grid grid-cols-2 gap-4">

          <div>
            <p className={labelClass}>Reference</p>
            <div className={valueClass}>{risk.ref}</div>
          </div>

          <div>
            <p className={labelClass}>Initiator</p>
            <div className={valueClass}>{risk.initiator}</div>
          </div>

          <div>
            <p className={labelClass}>Initiation Date</p>
            <div className={valueClass}>
              {new Date(risk.initiationDate).toLocaleDateString()}
            </div>
          </div>

          <div>
            <p className={labelClass}>Review Date</p>
            <div className={valueClass}>
              {risk.reviewDate
                ? new Date(risk.reviewDate).toLocaleDateString()
                : "-"}
            </div>
          </div>

          <div>
            <p className={labelClass}>RA Type</p>
            <div className={valueClass}>{risk.raType}</div>
          </div>

          <div>
            <p className={labelClass}>Fleet</p>
            <div className={valueClass}>{risk.fleet || "-"}</div>
          </div>
        </div>

        <div className="mt-4">
          <p className={labelClass}>Work Activity</p>
          <div className={valueClass}>{risk.workActivity}</div>
        </div>

        <div className="mt-4">
          <p className={labelClass}>Initiator Comment</p>
          <div className={valueClass}>
            {risk.initiatorComment || "-"}
          </div>
        </div>
      </div>

      {/* Assessment Rows */}
      <div className={sectionClass}>
        <h2 className="text-lg font-semibold mb-4">
          Risk Assessment Rows
        </h2>

        {risk.assessmentRows.length === 0 ? (
          <p>No assessment rows</p>
        ) : (
          risk.assessmentRows.map((row: any, index: number) => (
            <div
              key={row.id}
              className="border rounded-lg p-4 mb-4"
            >
              <h3 className="font-semibold mb-3">
                Row {index + 1}
              </h3>

              <p><strong>Hazard:</strong> {row.hazard}</p>
              <p><strong>Impact:</strong> {row.impact}</p>
              <p><strong>Existing Controls:</strong> {row.existingControls}</p>
              <p><strong>SCT:</strong> {row.sct || "-"}</p>
              <p><strong>C:</strong> {row.c ?? "-"}</p>
              <p><strong>F:</strong> {row.f ?? "-"}</p>

              {/* Additional Measures */}
              {row.additionalMeasures.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">
                    Additional Measures
                  </h4>

                  {row.additionalMeasures.map((measure: any) => (
                    <div
                      key={measure.id}
                      className="border-l-2 pl-4 mb-2"
                    >
                      <p>
                        <strong>Action:</strong>{" "}
                        {measure.furtherAction || "-"}
                      </p>
                      <p>
                        C: {measure.c ?? "-"} / F: {measure.f ?? "-"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Team */}
      <div className={sectionClass}>
        <h2 className="text-lg font-semibold mb-4">
          Team Members
        </h2>

        {risk.teamMembers.length === 0 ? (
          <p>No team members</p>
        ) : (
          <ul className="space-y-2">
            {risk.teamMembers.map((member: any) => (
              <li
                key={member.id}
                className={valueClass}
              >
                {member.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}