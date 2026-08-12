"use client";

/**
 * HomeDashboard — Signed-in home page for MarineGuard
 *
 * Layout: left sidebar (1/3) with hero + module cards + stats + features,
 * right side (2/3) with all QHSE analytics charts stacked vertically.
 * Matches client-approved reference design.
 *
 * Currently uses fake data from prisma/data/homepage.ts.
 * When Risk, Observation, Safety Meetings and Work Permits models are all
 * built, replace each data import with a server action query — the shape
 * of the data stays the same so charts don't need to change.
 */

import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

import {
  leadingIndicatorsData,
  attentionRequired,
  statCards,
  riskOverview,
  topRiskCategories,
  safetyReportingTrend,
  correctiveActionsStatus,
  correctiveActionsClosedPercent,
  lifeSavingRulesStats,
  recentActivity,
  summaryStats,
} from "@/prisma/data/homepage";

// ─── Module quick-access cards — 2x2 grid, matches client colors ──────────────
const moduleCards = [
  {
    icon: "🔒",
    title: "Access Fleet Risk Assessment Portal",
    href: "/dashboard",
    bg: "bg-[#0F6E56] hover:bg-[#085041]",
    text: "text-white",
  },
  {
    icon: "👁",
    title: "Access Fleet Observation Card Portal",
    href: "/observationdashboard",
    bg: "bg-amber-400 hover:bg-amber-500",
    text: "text-amber-800",
  },
  {
    icon: "📋",
    title: "Access Safety Meetings / Toolbox Talks",
    href: "/safetymeetingsdashboard",
    bg: "bg-red-400 hover:bg-red-500",
    text: "text-red-950",
  },
  {
    icon: "📝",
    title: "Access Work Permits Portal",
    href: "/workpermitsdashboard",
    bg: "bg-blue-400 hover:bg-blue-500",
    text: "text-blue-950",
  },
];

export default function HomeDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="max-w-[1700px] mx-auto px-4 md:px-8 py-8">
        {/* ── Main grid — 1/3 sidebar + 2/3 charts ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ══════════════════════════════════════════════════════════
              LEFT COLUMN (1/3) — Hero, module cards, stats, features
              ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-1 space-y-4">
            {/* Hero text */}
            <div>
              <p className="text-xs uppercase tracking-widest text-[#1D9E75] font-medium mb-2">
                Maritime Risk Management
              </p>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-800 dark:text-white">
                Every voyage.
                <br />
                Every risk.
                <br />
                <span className="text-[#1D9E75] font-light italic">
                  Fully assessed.
                </span>
              </h1>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 mt-3">
                MarineGuard gives shipping companies a centralised platform to
                identify, track, and mitigate operational risks across their
                entire fleet.
              </p>
            </div>

            {/* Module cards — 2x2 grid */}
            <div className="grid grid-cols-2 gap-3">
              {moduleCards.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-xs font-medium transition-colors ${m.bg} ${m.text}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{m.icon}</span>
                    <span className="leading-tight">{m.title}</span>
                  </div>
                  <span className="text-base shrink-0">→</span>
                </Link>
              ))}
            </div>

            {/* Project Analytics link — goes to /analytics */}
            <Link
              href="/analytics"
              className="rounded-xl border border-emerald-100 dark:border-slate-800 bg-emerald-50 dark:bg-slate-900 p-4 flex items-center justify-between hover:bg-emerald-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                📊 Project Analytics
              </span>
              <span className="text-emerald-600">→</span>
            </Link>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-center">
                <p className="text-lg font-extrabold text-slate-800 dark:text-white">
                  {summaryStats.fleetRiskVisibility}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Fleet risk visibility
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-center">
                <p className="text-lg font-extrabold text-slate-800 dark:text-white">
                  {summaryStats.accessLevels}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Role-based access levels
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-center">
                <p className="text-lg font-extrabold text-slate-800 dark:text-white">
                  {summaryStats.shipsTracked}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Ships & voyages tracked
                </p>
              </div>
            </div>

            {/* Feature mini cards */}
            <div className="space-y-2">
              {[
                {
                  icon: "🚢",
                  title: "Fleet management",
                  desc: "Track risks across every vessel and real-time status updates.",
                },
                {
                  icon: "🔍",
                  title: "Advanced filtering",
                  desc: "Filter by date, severity, ship, route and more. Find exactly what you need.",
                },
                {
                  icon: "🛡️",
                  title: "Role-based access",
                  desc: "Admins create, managers edit, members view. Every user sees exactly what they need.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex items-start gap-3"
                >
                  <span className="text-lg">{f.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {f.title}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT COLUMN (2/3) — All charts stacked
              ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── Leading Indicators + Attention Required ────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
              {/* Leading Indicators chart */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5">
                <p className="text-sm font-bold text-slate-700 dark:text-white mb-4">
                  QHSE Leading Indicators{" "}
                  <span className="text-slate-400 font-normal text-xs">
                    (Last 6 Months)
                  </span>
                </p>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={leadingIndicatorsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
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

              {/* Attention Required */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-slate-700 dark:text-white">
                    Attention Required
                  </p>
                  <button className="text-xs text-blue-500 hover:underline">
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {attentionRequired.map((a) => (
                    <div
                      key={a.label}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{a.icon}</span>
                        <div>
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            {a.label}
                          </p>
                          {a.sub && (
                            <p className="text-[10px] text-slate-400">
                              {a.sub}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${a.color}`}>
                        {a.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Stat cards row ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
              {statCards.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-3"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs mb-2 ${s.color}`}
                  >
                    {s.icon}
                  </div>
                  <p className="text-[9px] uppercase tracking-wide text-slate-400 font-medium mb-1">
                    {s.label}
                  </p>
                  <p className="text-xl font-extrabold text-slate-800 dark:text-white">
                    {s.value}
                  </p>
                  <p className={`text-[9px] mt-1 ${s.subColor}`}>{s.sub}</p>
                  <button className="text-[9px] text-blue-500 hover:underline mt-1.5">
                    {s.link} →
                  </button>
                </div>
              ))}
            </div>

            {/* ── Risk Overview + Safety Trend + Corrective Actions ────── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Risk & Critical Controls Overview */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5">
                <p className="text-sm font-bold text-slate-700 dark:text-white mb-4">
                  Risk & Critical Controls Overview
                </p>
                <div className="flex items-center gap-4">
                  <div className="relative w-28 h-28 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskOverview}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={34}
                          outerRadius={54}
                          paddingAngle={2}
                        >
                          {riskOverview.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-lg font-extrabold text-slate-800 dark:text-white">
                        {riskOverview.reduce((sum, r) => sum + r.value, 0)}
                      </p>
                      <p className="text-[8px] text-slate-400">Total</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    {riskOverview.map((r) => (
                      <div
                        key={r.name}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: r.color }}
                          />
                          {r.name}
                        </span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          {r.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] uppercase text-slate-400 mb-2 font-medium">
                    Top Risk Categories
                  </p>
                  {topRiskCategories.map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center justify-between text-xs mb-1"
                    >
                      <span className="text-slate-600 dark:text-slate-300">
                        {c.name}
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {c.value}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="text-xs text-blue-500 hover:underline mt-3">
                  View risk register →
                </button>
              </div>

              {/* Safety Reporting Trend */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5">
                <p className="text-sm font-bold text-slate-700 dark:text-white mb-4">
                  Safety Reporting Trend{" "}
                  <span className="text-slate-400 font-normal text-xs">
                    (Last 6 Months)
                  </span>
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={safetyReportingTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar
                      dataKey="positiveSafety"
                      name="Positive Safety"
                      stackId="a"
                      fill="#22c55e"
                    />
                    <Bar
                      dataKey="improvement"
                      name="Improvement"
                      stackId="a"
                      fill="#a855f7"
                    />
                    <Bar
                      dataKey="unsafeCondition"
                      name="Unsafe Condition"
                      stackId="a"
                      fill="#f97316"
                    />
                    <Bar
                      dataKey="nearMiss"
                      name="Near Miss"
                      stackId="a"
                      fill="#eab308"
                    />
                    <Bar
                      dataKey="stopWork"
                      name="Stop Work"
                      stackId="a"
                      fill="#ef4444"
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-3 text-[9px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Positive Safety
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Improvement
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    Unsafe Condition
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    Near Miss
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Stop Work
                  </span>
                </div>
              </div>

              {/* Corrective Actions Status */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5">
                <p className="text-sm font-bold text-slate-700 dark:text-white mb-4">
                  Corrective Actions Status
                </p>
                <div className="flex items-center gap-4">
                  <div className="relative w-28 h-28 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={correctiveActionsStatus}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={34}
                          outerRadius={54}
                          paddingAngle={2}
                        >
                          {correctiveActionsStatus.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-base font-extrabold text-emerald-600">
                        {correctiveActionsClosedPercent}%
                      </p>
                      <p className="text-[8px] text-slate-400">Closed</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    {correctiveActionsStatus.map((c) => {
                      const total = correctiveActionsStatus.reduce(
                        (sum, x) => sum + x.value,
                        0,
                      );
                      const pct = Math.round((c.value / total) * 100);
                      return (
                        <div
                          key={c.name}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ background: c.color }}
                            />
                            {c.name}
                          </span>
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            {c.value} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button className="text-xs text-blue-500 hover:underline mt-4">
                  View all actions →
                </button>
              </div>
            </div>

            {/* ── IOGP Life-Saving Rules + Recent Activity ─────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* IOGP Life-Saving Rules */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5">
                <p className="text-sm font-bold text-slate-700 dark:text-white mb-4">
                  IOGP Life-Saving Rules – Related Observations{" "}
                  <span className="text-slate-400 font-normal text-xs">
                    (Last 30 Days)
                  </span>
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                  {lifeSavingRulesStats.map((rule) => (
                    <div
                      key={rule.label}
                      className="flex flex-col items-center text-center gap-1"
                    >
                      <div className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-base">
                        {rule.icon}
                      </div>
                      <p className="text-[8px] text-slate-500 leading-tight">
                        {rule.label}
                      </p>
                      <p className="text-sm font-bold text-slate-700 dark:text-white">
                        {rule.value}
                      </p>
                    </div>
                  ))}
                </div>
                <button className="text-xs text-blue-500 hover:underline mt-4">
                  View all related observations →
                </button>
              </div>

              {/* Recent QHSE Activity */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-slate-700 dark:text-white">
                    Recent QHSE Activity
                  </p>
                  <button className="text-xs text-blue-500 hover:underline">
                    View all activity
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <th className="py-2 pr-3 font-medium">Date / Time</th>
                        <th className="py-2 pr-3 font-medium">Module</th>
                        <th className="py-2 pr-3 font-medium">Activity</th>
                        <th className="py-2 pr-3 font-medium">Location</th>
                        <th className="py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.map((a, i) => (
                        <tr
                          key={i}
                          className="border-b border-slate-50 dark:border-slate-800/50"
                        >
                          <td className="py-2 pr-3 text-slate-500 whitespace-nowrap">
                            {a.date}
                          </td>
                          <td className="py-2 pr-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {a.module}
                          </td>
                          <td className="py-2 pr-3 text-slate-600 dark:text-slate-300">
                            {a.activity}
                          </td>
                          <td className="py-2 pr-3 text-slate-500 whitespace-nowrap">
                            {a.location}
                          </td>
                          <td className="py-2">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${a.statusColor}`}
                            >
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] text-slate-400 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
          <span>🔄 Data is refreshed every 15 minutes</span>
          <span>All times shown in UTC</span>
          <span>
            © 2026 MMI-QHSE Management System | Version 2.5.0 | ISM Compliant
          </span>
        </div>
      </div>
    </div>
  );
}
