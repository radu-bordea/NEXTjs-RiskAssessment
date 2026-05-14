"use client";

import Link from "next/link";
import { useState } from "react";

export default function RiskAssessmentDashboard() {
  const data = [
    {
      id: "RA-001",
      vessel: "MV Atlantic Star",
      risk: "High",
      status: "Under Review",
    },
    { id: "RA-002", vessel: "MV Nordvik", risk: "Medium", status: "Pending" },
    { id: "RA-003", vessel: "MV Polar Drift", risk: "Low", status: "Approved" },
    {
      id: "RA-004",
      vessel: "MV Sea Horizon",
      risk: "Critical",
      status: "Escalated",
    },
  ];

  const riskStyle = {
    Low: "bg-green-50 text-green-700",
    Medium: "bg-amber-50 text-amber-700",
    High: "bg-orange-50 text-orange-700",
    Critical: "bg-red-50 text-red-700",
  };

  const [mode, setMode] = useState<"view" | "new" | "edit">("view");
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white px-6 md:px-10 py-10 font-sans">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#1D9E75] font-medium mb-2">
            Maritime Risk Dashboard
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Fleet Risk Assessments
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Operational overview across all vessels and voyage reports.
          </p>
        </div>

        <button
          onClick={() => setMode("new")}
          className="px-5 py-2.5 bg-[#0F6E56] text-[#E1F5EE] rounded-lg"
        >
          + New Assessment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          ["24", "Open Reports"],
          ["6", "Critical Risks"],
          ["91%", "Compliance Score"],
        ].map(([num, label]) => (
          <div
            key={label}
            className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
          >
            <p className="text-3xl font-extrabold">{num}</p>
            <p className="text-xs text-zinc-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex-wrap gap-3">
          <h2 className="font-bold text-sm">Assessment Register</h2>
          <input
            type="text"
            placeholder="Search vessel..."
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="text-left px-6 py-4">Assessment ID</th>
                <th className="text-left px-6 py-4">Vessel</th>
                <th className="text-left px-6 py-4">Risk Level</th>
                <th className="text-left px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                >
                  <td className="px-6 py-4 font-medium">{item.id}</td>
                  <td className="px-6 py-4">{item.vessel}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        riskStyle[item.risk as keyof typeof riskStyle]
                      }`}
                    >
                      {item.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                    {item.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
