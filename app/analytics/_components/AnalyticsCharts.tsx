"use client";

/**
 * AnalyticsCharts — client component for the Project Analytics page
 *
 * Recharts requires "use client" — this component receives pre-fetched,
 * pre-filtered real data as props from the server component and
 * renders the visuals plus a combined data table.
 */

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

type ChartDatum = {
  name: string;
  value: number;
};

type MonthlyTrendDatum = {
  month: string;
  riskAssessments: number;
  observationCards: number;
  toolboxTalks: number;
  workPermits: number;
};


type Props = {
  riskTotal: number;
  observationTotal: number;
  safetyMeetingTotal: number;
  toolboxCardTotal: number;
  riskStateData: ChartDatum[];
  observationTypeData: ChartDatum[];
  monthlyTrendData: MonthlyTrendDatum[];
};

/** Colors for risk state pie chart — matches your state badge colors */
const RISK_STATE_COLORS: Record<string, string> = {
  TEMPLATE: "#3b82f6",
  DRAFT: "#f59e0b",
  COMPLETED: "#22c55e",
};

/** Colors for the observation type pie chart — cycles through if more types exist */
const PIE_COLORS = [
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#22c55e",
  "#a855f7",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];


export default function AnalyticsCharts({
  riskTotal,
  observationTotal,
  safetyMeetingTotal,
  toolboxCardTotal,
  riskStateData,
  observationTypeData,
  monthlyTrendData,
}: Props) {
  return (
    <div className="space-y-6">
      {/* ── Total counts row — 4 cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Risk Assessment total + state pie chart */}
        <div className="rounded-xl border border-[#A8D5B5] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 h-full flex flex-col">
          <div className="w-9 h-9 rounded-lg bg-[#EEF5F0] dark:bg-slate-800 flex items-center justify-center text-lg mb-3">
            🔒
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
              Risk Assessments
            </p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {riskTotal}
            </p>
          </div>
          <p className="text-xs text-slate-400 mb-2">by State</p>

          {riskStateData.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              No data yet.
            </p>
          ) : (
            <>
              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskStateData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                    >
                      {riskStateData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={RISK_STATE_COLORS[entry.name] ?? "#94a3b8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1 mt-2">
                {riskStateData.map((entry) => (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          background:
                            RISK_STATE_COLORS[entry.name] ?? "#94a3b8",
                        }}
                      />
                      <span className="truncate">{entry.name}</span>
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-200 shrink-0 ml-2">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Observation Card total + type pie chart */}
        <div className="rounded-xl border border-amber-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 h-full flex flex-col">
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-slate-800 flex items-center justify-center text-lg mb-3">
            👁
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
              Observation Cards
            </p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {observationTotal}
            </p>
          </div>
          <p className="text-xs text-slate-400 mb-2">by Type</p>

          {observationTypeData.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              No data yet.
            </p>
          ) : (
            <>
              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={observationTypeData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                    >
                      {observationTypeData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1 mt-2">
                {observationTypeData.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          background: PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />
                      <span className="truncate">{entry.name}</span>
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-200 shrink-0 ml-2">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Safety Meetings + Toolbox Talk Cards — table style */}
        <div className="rounded-xl border border-red-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 h-full flex flex-col">
          <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-slate-800 flex items-center justify-center text-lg mb-3">
            📋
          </div>
          <p className="text-xs uppercase tracking-wide text-slate-400 font-medium mb-3">
            Safety Meetings Overview
          </p>

          <table className="w-full text-sm border border-red-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-red-400 dark:bg-red-700">
                <th className="py-2 px-3 text-left text-xs font-semibold text-white uppercase tracking-wide">
                  Category
                </th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-white uppercase tracking-wide">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white dark:bg-slate-900">
                <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 border-b border-r border-red-100 dark:border-slate-800">
                  Safety Meetings
                </td>
                <td className="py-2.5 px-3 text-right border-b border-red-100 dark:border-slate-800">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 font-extrabold text-lg text-red-800 dark:text-red-300">
                    {safetyMeetingTotal}
                  </span>
                </td>
              </tr>
              <tr className="bg-red-50/50 dark:bg-slate-900/50">
                <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 border-r border-red-100 dark:border-slate-800">
                  Toolbox Talk Cards
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 font-extrabold text-lg text-red-800 dark:text-red-300">
                    {toolboxCardTotal}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Work Permit Portal — placeholder, module not built yet */}
        <div className="rounded-xl border border-blue-200 dark:border-slate-800 bg-blue-50/30 dark:bg-slate-900/50 shadow-sm p-5 flex flex-col items-center justify-center text-center h-full">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-lg mb-3">
            📝
          </div>
          <p className="text-xs uppercase tracking-wide text-blue-400 dark:text-blue-500 font-semibold">
            Work Permit Portal
          </p>
          <p className="text-xs text-slate-400 mt-2">Coming soon</p>
        </div>
      </div>

      {/* ── Monthly Trend Line Chart ─────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5">
        <p className="text-sm font-bold text-slate-700 dark:text-white mb-4">
          QHSE Activity Trend{" "}
          <span className="text-slate-400 font-normal text-xs">
            (Last 6 Months)
          </span>
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={monthlyTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="riskAssessments"
              name="Risk Assessments"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="observationCards"
              name="Observation Cards"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="toolboxTalks"
              name="Toolbox Talks"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="workPermits"
              name="Work Permits"
              stroke="#a855f7"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Data Summary Table — mirrors the charts above ─────────────────── */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5">
        <p className="text-sm font-bold text-slate-700 dark:text-white mb-4">
          Data Summary
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Totals by Module */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Totals by Module
            </p>
            <table className="w-full text-sm border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <tbody>
                <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                    Risk Assessments
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-white">
                    {riskTotal}
                  </td>
                </tr>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                    Observation Cards
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-white">
                    {observationTotal}
                  </td>
                </tr>
                <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                    Safety Meetings
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-white">
                    {safetyMeetingTotal}
                  </td>
                </tr>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                    Toolbox Talk Cards
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-white">
                    {toolboxCardTotal}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Risk Assessment by State */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Risk Assessments by State
            </p>
            <table className="w-full text-sm border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <tbody>
                {riskStateData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="py-3 px-3 text-center text-slate-400 text-xs"
                    >
                      No data
                    </td>
                  </tr>
                ) : (
                  riskStateData.map((entry, index) => (
                    <tr
                      key={entry.name}
                      className={`${index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50"} ${index !== riskStateData.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}`}
                    >
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            background:
                              RISK_STATE_COLORS[entry.name] ?? "#94a3b8",
                          }}
                        />
                        {entry.name}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-white">
                        {entry.value}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Observation Cards by Type */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Observation Cards by Type
            </p>
            <table className="w-full text-sm border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <tbody>
                {observationTypeData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="py-3 px-3 text-center text-slate-400 text-xs"
                    >
                      No data
                    </td>
                  </tr>
                ) : (
                  observationTypeData.map((entry, index) => (
                    <tr
                      key={entry.name}
                      className={`${index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50"} ${index !== observationTypeData.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}`}
                    >
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: PIE_COLORS[index % PIE_COLORS.length],
                          }}
                        />
                        {entry.name}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-white">
                        {entry.value}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

{/* Safety Meetings Overview */}
<div>
  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
    Safety Meetings Overview
  </p>
  <table className="w-full text-sm border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
    <tbody>
      <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <td className="py-2 px-3 text-slate-600 dark:text-slate-300">Safety Meetings</td>
        <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-white">{safetyMeetingTotal}</td>
      </tr>
      <tr className="bg-slate-50/50 dark:bg-slate-900/50">
        <td className="py-2 px-3 text-slate-600 dark:text-slate-300">Toolbox Talk Cards</td>
        <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-white">{toolboxCardTotal}</td>
      </tr>
    </tbody>
  </table>
</div>

          {/* Monthly Trend — matches line chart exactly */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Monthly Trend (Last 6 Months)
            </p>
            <table className="w-full text-sm border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800">
                  <th className="py-2 px-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Month
                  </th>
                  <th className="py-2 px-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Risk
                  </th>
                  <th className="py-2 px-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Obs.
                  </th>
<th className="py-2 px-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">Safety Mtgs</th>
                  <th className="py-2 px-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Permits
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyTrendData.map((m, index) => (
                  <tr
                    key={m.month}
                    className={`${index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50"} ${index !== monthlyTrendData.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}`}
                  >
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                      {m.month}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-200">
                      {m.riskAssessments}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-200">
                      {m.observationCards}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-200">
                      {m.toolboxTalks}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-200">
                      {m.workPermits}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
