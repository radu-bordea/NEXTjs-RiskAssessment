"use client";

import { useState, useMemo } from "react";
import { Risk, User } from "@/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const stateStyle: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-600 whitespace-nowrap",
  IN_PROGRESS: "bg-amber-50 text-amber-700 whitespace-nowrap",
  COMPLETED: "bg-green-50 text-green-700 whitespace-nowrap",
  CANCELLED: "bg-red-50 text-red-700 whitespace-nowrap",
};

const raTypeLabel: Record<string, string> = {
  ROUTINE: "Routine",
  NON_ROUTINE: "Non Routine",
};

const CATEGORIES = [
  "NAVIGATION",
  "MOORING/DOCKING OPS",
  "DECK",
  "ENGINE",
  "SAFETY",
  "SURVEY",
  "HYGENE",
  "SECURITY",
  "CIBERSECURITY",
  "OTHERS",
  "PROCEDURES",
]

const selectClass = "px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
const inputClass  = "px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"

export default function RiskTable({
  risks,
  currentUser,
}: {
  risks: Risk[];
  currentUser: User;
}) {
  const [filters, setFilters] = useState({
    ref:              "",
    workActivity:     "",
    initiator:        "",
    vesselDepartment: "",
    fleet:            "",
    raType:           "",
    libraryCategory:  "",
    libraryIndex:     "",
    isClone:          "",
    defectRelated:    "",
  });

  const router = useRouter();

  const isAdmin   = currentUser?.role === "ADMIN";
  const isManager = currentUser?.role === "MANAGER";
  const canEdit   = isAdmin || isManager;

  // Build category → indexes map from actual data
  const indexesByCategory = useMemo(() => {
    const map: Record<string, string[]> = {}
    risks.forEach((r) => {
      if (!r.libraryCategory || !r.libraryIndex) return
      if (!map[r.libraryCategory]) map[r.libraryCategory] = []
      if (!map[r.libraryCategory].includes(r.libraryIndex)) {
        map[r.libraryCategory].push(r.libraryIndex)
      }
    })
    return map
  }, [risks])

  // If category selected show only its indexes, else show all
  const availableIndexes = useMemo(() => {
    if (filters.libraryCategory) {
      return indexesByCategory[filters.libraryCategory] ?? []
    }
    return [...new Set(risks.map((r) => r.libraryIndex).filter(Boolean))] as string[]
  }, [filters.libraryCategory, indexesByCategory, risks])

  const filtered = useMemo(() => {
    return risks.filter((r) => {
      if (filters.ref && !r.ref.toLowerCase().includes(filters.ref.toLowerCase())) return false;
      if (filters.workActivity && !r.workActivity.toLowerCase().includes(filters.workActivity.toLowerCase())) return false;
      if (filters.initiator && !r.initiator.toLowerCase().includes(filters.initiator.toLowerCase())) return false;
      if (filters.vesselDepartment && r.vesselDepartment !== filters.vesselDepartment) return false;
      if (filters.fleet && r.fleet !== filters.fleet) return false;
      if (filters.raType && r.raType !== filters.raType) return false;
      if (filters.libraryCategory && r.libraryCategory !== filters.libraryCategory) return false;
      if (filters.libraryIndex && r.libraryIndex !== filters.libraryIndex) return false;
      if (filters.isClone === "yes" && !r.cloneOf) return false;
      if (filters.isClone === "no" && r.cloneOf) return false;
      if (filters.defectRelated === "yes" && !r.defectRelated) return false;
      if (filters.defectRelated === "no" && r.defectRelated) return false;
      return true;
    });
  }, [risks, filters]);

  const vessels = [...new Set(risks.map((r) => r.vesselDepartment).filter(Boolean))];
  const fleets  = [...new Set(risks.map((r) => r.fleet).filter(Boolean))];

  const set = (key: string, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const reset = () =>
    setFilters({
      ref:              "",
      workActivity:     "",
      initiator:        "",
      vesselDepartment: "",
      fleet:            "",
      raType:           "",
      libraryCategory:  "",
      libraryIndex:     "",
      isClone:          "",
      defectRelated:    "",
    });

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white px-6 md:px-10 py-10 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#1D9E75] font-medium mb-2">
            Maritime Risk Dashboard
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Fleet Risk Assessments
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Displaying {filtered.length} of {risks.length} assessments
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => router.push("/dashboard/risks/new")}
            className="px-5 py-2.5 bg-[#0F6E56] text-[#E1F5EE] rounded-lg text-sm hover:bg-[#085041] transition-colors"
          >
            + New Assessment
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5 mb-6">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-4">
          Filters
        </p>

        {/* Row 1 — text inputs + category + index */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
          <input
            type="text"
            placeholder="Ref"
            value={filters.ref}
            onChange={(e) => set("ref", e.target.value)}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Work Activity"
            value={filters.workActivity}
            onChange={(e) => set("workActivity", e.target.value)}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Initiator"
            value={filters.initiator}
            onChange={(e) => set("initiator", e.target.value)}
            className={inputClass}
          />

          {/* Category — pick first, filters the index dropdown */}
          <select
            value={filters.libraryCategory}
            onChange={(e) => {
              set("libraryCategory", e.target.value)
              set("libraryIndex", "") // reset index when category changes
            }}
            className={selectClass}
          >
            <option value="">Category Index</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Library Index — filtered by selected category */}
          <select
            value={filters.libraryIndex}
            onChange={(e) => set("libraryIndex", e.target.value)}
            className={selectClass}
            disabled={availableIndexes.length === 0}
          >
            <option value="">
              {filters.libraryCategory
                ? availableIndexes.length === 0
                  ? "No indexes found"
                  : `Index (${filters.libraryCategory})`
                : "Library Index"}
            </option>
            {availableIndexes.map((idx) => (
              <option key={idx} value={idx}>{idx}</option>
            ))}
          </select>
        </div>

        {/* Row 2 — dropdowns */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
          <select
            value={filters.vesselDepartment}
            onChange={(e) => set("vesselDepartment", e.target.value)}
            className={selectClass}
          >
            <option value="">Vessel/Dept</option>
            {vessels.map((v) => (
              <option key={v!} value={v!}>{v}</option>
            ))}
          </select>

          <select
            value={filters.fleet}
            onChange={(e) => set("fleet", e.target.value)}
            className={selectClass}
          >
            <option value="">Fleet</option>
            {fleets.map((f) => (
              <option key={f!} value={f!}>{f}</option>
            ))}
          </select>

          <select
            value={filters.raType}
            onChange={(e) => set("raType", e.target.value)}
            className={selectClass}
          >
            <option value="">RA Type</option>
            <option value="ROUTINE">Routine</option>
            <option value="NON_ROUTINE">Non Routine</option>
          </select>

          <select
            value={filters.isClone}
            onChange={(e) => set("isClone", e.target.value)}
            className={selectClass}
          >
            <option value="">Is Clone</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>

          <select
            value={filters.defectRelated}
            onChange={(e) => set("defectRelated", e.target.value)}
            className={selectClass}
          >
            <option value="">Defect Related</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <button
          onClick={reset}
          className="text-xs px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          Reset filters
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                {[
                  "Ref",
                  "Clone of",
                  "Work Activity",
                  "Initiator",
                  "Initiation Date",
                  "Review Date",
                  "Vessel/Dept",
                  "RA Type",
                  "Category",
                  "Library Index",
                  "State",
                  "State Updated By",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap text-xs uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="px-4 py-10 text-center text-zinc-400 text-sm"
                  >
                    No risks found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                  >
                    <td className="px-4 py-3 font-medium text-[#0F6E56] whitespace-nowrap">
                      {r.ref}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                      {r.cloneOf ?? "—"}
                    </td>
                    <td className="px-4 py-3 max-w-50 truncate">
                      {r.workActivity}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.initiator}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(r.initiationDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.reviewDate
                        ? new Date(r.reviewDate).toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-zinc-500">
                      {r.vesselDepartment ?? "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {raTypeLabel[r.raType]}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-zinc-500">
                      {r.libraryCategory ?? "—"}
                    </td>
                    <td className="px-4 py-3 max-w-45 truncate text-zinc-500">
                      {r.libraryIndex ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${stateStyle[r.state]}`}
                      >
                        {r.state.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                      {r.stateUpdatedBy?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          title="Preview"
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/risks/${r.id}`)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-700"
                        >
                          👁
                        </Button>
                        {canEdit && (
                          <Button
                            title="Edit"
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/risks/${r.id}/edit`)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700"
                          >
                            ✏️
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}