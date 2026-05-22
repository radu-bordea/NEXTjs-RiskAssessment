"use client";

/**
 * RiskTable — Main dashboard component
 *
 * Displays all risk assessments in a filterable table.
 * Roles:
 *  - ADMIN   → can create, view, edit
 *  - MANAGER → can view and edit
 *  - MEMBER  → view only
 *
 * Data is fetched server-side in dashboard/page.tsx and passed as props.
 * All filtering is done client-side using useMemo for performance.
 */

import { useState, useMemo } from "react";
import { Risk, User } from "@/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

// ─── State badge styles ───────────────────────────────────────────────────────
/** Visual badge colors for each risk state — light and dark mode */
const stateStyle: Record<string, string> = {
  DRAFT:       "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 whitespace-nowrap",
  IN_PROGRESS: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 whitespace-nowrap",
  COMPLETED:   "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 whitespace-nowrap",
  CANCELLED:   "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 whitespace-nowrap",
};

// ─── RA Type human-readable labels ───────────────────────────────────────────
const raTypeLabel: Record<string, string> = {
  ROUTINE:     "Routine",
  NON_ROUTINE: "Non Routine",
};

/**
 * Fixed category list — agreed with client.
 * To add a new category, append it to this array.
 */
const CATEGORIES = [
  "CIBERSECURITY",
  "DECK",
  "ENGINE",
  "HYGENE",
  "MOORING/DOCKING OPS",
  "NAVIGATION",
  "OTHERS",
  "PROCEDURES",
  "SAFETY",
  "SECURITY",
  "SURVEY",
];

// ─── Shared Tailwind classes ──────────────────────────────────────────────────
/** Shared class for all filter dropdowns */
const selectClass =
  "px-3 py-2 rounded-lg border border-[#A8D5B5] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A7A4A] transition-colors";

/** Shared class for all filter text inputs */
const inputClass =
  "px-3 py-2 rounded-lg border border-[#A8D5B5] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1A7A4A] transition-colors";

// ─── Component ────────────────────────────────────────────────────────────────
export default function RiskTable({
  risks,
  currentUser,
}: {
  risks: Risk[];
  currentUser: User;
}) {
  /**
   * Filter state — all filters start empty (no filter applied).
   * Each key maps to a column in the risk table.
   */
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

  /** Role checks derived from currentUser */
  const isAdmin   = currentUser?.role === "ADMIN";
  const isManager = currentUser?.role === "MANAGER";
  const canEdit   = isAdmin || isManager;

  /**
   * indexesByCategory
   * Builds a map of { category: [index1, index2, ...] }
   * from actual risk data — index dropdown only shows
   * indexes that exist in the selected category.
   */
  const indexesByCategory = useMemo(() => {
    const map: Record<string, string[]> = {};
    risks.forEach((r) => {
      if (!r.libraryCategory || !r.libraryIndex) return;
      if (!map[r.libraryCategory]) map[r.libraryCategory] = [];
      if (!map[r.libraryCategory].includes(r.libraryIndex)) {
        map[r.libraryCategory].push(r.libraryIndex);
      }
    });
    return map;
  }, [risks]);

  /**
   * availableIndexes
   * If category selected → show only its indexes.
   * If no category → show all indexes.
   * Always sorted alphabetically.
   */
  const availableIndexes = useMemo(() => {
    let indexes: string[];
    if (filters.libraryCategory) {
      indexes = indexesByCategory[filters.libraryCategory] ?? [];
    } else {
      indexes = [
        ...new Set(risks.map((r) => r.libraryIndex).filter(Boolean)),
      ] as string[];
    }
    return indexes.sort((a, b) => a.localeCompare(b));
  }, [filters.libraryCategory, indexesByCategory, risks]);

  /**
   * filtered
   * Applies all active filters to the risks array.
   * Client-side with useMemo — recalculates only when risks or filters change.
   */
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

  /** Unique vessel/department values from data for dropdown */
  const vessels = [...new Set(risks.map((r) => r.vesselDepartment).filter(Boolean))];

  /** Unique fleet values from data for dropdown */
  const fleets = [...new Set(risks.map((r) => r.fleet).filter(Boolean))];

  /** Helper to update a single filter key */
  const set = (key: string, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  /** Resets all filters to empty state */
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

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#EEF5F0] dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-6 md:px-10 py-10 font-sans">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <Link href="/">
          <Image
            src="/assets/images/logo1.jpg"
            alt="MarineGuard"
            width={60}
            height={60}
            className="object-cover object-top rounded-full w-16 h-16"
            priority
          />
        </Link>

        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-700 dark:text-white">
            Mobile Marine{" "}
            <span className="text-slate-500">Fleet Risk Assessments Portal</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Displaying {filtered.length} of {risks.length} assessments
          </p>
        </div>

        {/* New Assessment button — ADMIN only */}
        {isAdmin && (
          <button
            onClick={() => router.push("/dashboard/risks/new")}
            className="px-5 py-2.5 bg-[#1A7A4A] hover:bg-[#145f39] text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-[#1A7A4A]/20"
          >
            + New Assessment
          </button>
        )}
      </div>

      {/* ── Filters Panel ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#A8D5B5] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 mb-6">
        <p className="text-xs font-semibold text-[#1A7A4A] dark:text-emerald-400 uppercase tracking-widest mb-4">
          Filters
        </p>

        {/* Row 1 — text inputs + category + index */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">

          {/* Ref — partial text match */}
          <input
            type="text"
            placeholder="Ref"
            value={filters.ref}
            onChange={(e) => set("ref", e.target.value)}
            className={inputClass}
          />

          {/* Work Activity — partial text match */}
          <input
            type="text"
            placeholder="Work Activity"
            value={filters.workActivity}
            onChange={(e) => set("workActivity", e.target.value)}
            className={inputClass}
          />

          {/* Initiator — partial text match */}
          <input
            type="text"
            placeholder="Initiator"
            value={filters.initiator}
            onChange={(e) => set("initiator", e.target.value)}
            className={inputClass}
          />

          {/* Category — selecting this resets the index filter */}
          <select
            value={filters.libraryCategory}
            onChange={(e) => {
              set("libraryCategory", e.target.value);
              set("libraryIndex", ""); // reset dependent filter
            }}
            className={selectClass}
          >
            <option value="">Category Index</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Library Index — dynamically filtered by selected category */}
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

        {/* Row 2 — dropdown filters */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">

          {/* Vessel/Department — unique values from actual data */}
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

          {/* Fleet — unique values from actual data */}
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

          {/* RA Type */}
          <select
            value={filters.raType}
            onChange={(e) => set("raType", e.target.value)}
            className={selectClass}
          >
            <option value="">RA Type</option>
            <option value="ROUTINE">Routine</option>
            <option value="NON_ROUTINE">Non Routine</option>
          </select>

          {/* Is Clone — filters risks cloned from a template */}
          <select
            value={filters.isClone}
            onChange={(e) => set("isClone", e.target.value)}
            className={selectClass}
          >
            <option value="">Is Clone</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>

          {/* Defect Related */}
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

        {/* Reset all filters button */}
        <button
          onClick={reset}
          className="text-xs px-4 py-2 rounded-lg border border-[#A8D5B5] dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-[#EEF5F0] dark:hover:bg-slate-800 transition-colors"
        >
          Reset filters
        </button>
      </div>

      {/* ── Risk Table ────────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden border border-[#A8D5B5] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            {/* Table header — deep green background */}
            <thead className="bg-[#1A7A4A] dark:bg-[#0d4a2b] border-b border-[#145f39] dark:border-[#0a3520]">
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
                    className="text-left px-4 py-3 font-semibold text-white whitespace-nowrap text-xs uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Empty state */}
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="px-4 py-10 text-center text-slate-400 text-sm"
                  >
                    No risks found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r, index) => (
                  <tr
                    key={r.id}
                    className={`border-b border-[#D4EAD9] dark:border-slate-800 hover:bg-[#EEF5F0] dark:hover:bg-slate-800/60 transition-colors ${
                      index % 2 === 0
                        ? "bg-white dark:bg-slate-900"
                        : "bg-[#F5FAF6] dark:bg-slate-900/50"
                    }`}
                  >
                    {/* Ref — clickable, navigates to view page */}
                    <td
                      className="px-4 py-3 font-medium text-[#1A7A4A] dark:text-emerald-400 whitespace-nowrap cursor-pointer hover:underline"
                      onClick={() => router.push(`/dashboard/risks/${r.id}`)}
                    >
                      {r.ref}
                    </td>

                    <td className="px-4 py-3 text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {r.cloneOf ?? "—"}
                    </td>

                    <td className="px-4 py-3 max-w-50 truncate text-slate-700 dark:text-slate-300">
                      {r.workActivity}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {r.initiator}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {new Date(r.initiationDate).toLocaleDateString("en-GB")}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {r.reviewDate
                        ? new Date(r.reviewDate).toLocaleDateString("en-GB")
                        : "—"}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {r.vesselDepartment ?? "—"}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {raTypeLabel[r.raType]}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {r.libraryCategory ?? "—"}
                    </td>

                    <td className="px-4 py-3 max-w-45 truncate text-slate-500 dark:text-slate-400">
                      {r.libraryIndex ?? "—"}
                    </td>

                    {/* State badge */}
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${stateStyle[r.state]}`}>
                        {r.state.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {r.stateUpdatedBy?.name ?? "—"}
                    </td>

                    {/* Action buttons */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* View — all roles */}
                        <Button
                          title="View"
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/risks/${r.id}`)}
                          className="p-1.5 text-slate-400 hover:text-[#1A7A4A] dark:hover:text-emerald-400 hover:bg-[#EEF5F0] dark:hover:bg-slate-800"
                        >
                          👁
                        </Button>

                        {/* Edit — ADMIN and MANAGER only */}
                        {canEdit && (
                          <Button
                            title="Edit"
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/risks/${r.id}/edit`)}
                            className="p-1.5 text-slate-400 hover:text-[#1A7A4A] dark:hover:text-emerald-400 hover:bg-[#EEF5F0] dark:hover:bg-slate-800"
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