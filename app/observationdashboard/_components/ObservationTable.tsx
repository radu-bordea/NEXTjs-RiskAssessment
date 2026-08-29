"use client";

/**
 * ObservationTable — Observation Card dashboard
 *
 * Displays all observation cards in a filterable table.
 * Amber/yellow theme to distinguish from Risk Assessment (green).
 *
 * States: DRAFT / COMPLETED
 * Roles:
 *  - ADMIN/MANAGER → can create, edit any draft, delete draft or completed
 *  - MEMBER        → can create, edit own draft, delete own draft only
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

import { deleteObservation } from "@/app/actions/observation.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import type { Observation, User } from "@/types";

// ─── Status badge styles ──────────────────────────────────────────────────────
/** Visual badge colors for each observation state */
const statusStyle: Record<string, string> = {
  DRAFT:
    "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 whitespace-nowrap",
  COMPLETED:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 whitespace-nowrap",
};

// ─── Shared Tailwind classes ──────────────────────────────────────────────────
const inputClass =
  "px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors";

const selectClass =
  "px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors";

export default function ObservationTable({
  observations,
  currentUser,
}: {
  observations: Observation[];
  currentUser: User | null;
}) {
  const router = useRouter();

  /** True when logged in user is ADMIN or MANAGER */
  const isAdminOrManager =
    currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";

  /** Track which observation is currently being deleted — for loading state */
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /** Filter state — all start empty */
  const [filters, setFilters] = useState({
    title: "",
    vesselProject: "",
    status: "",
  });

  /** Helper to update a single filter key */
  const set = (key: string, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  /** Reset all filters to empty */
  const reset = () => setFilters({ title: "", vesselProject: "", status: "" });

  /**
   * filtered — applies all active filters and sorts by date descending
   * Most recent observations appear first
   */
  const filtered = useMemo(() => {
    return observations
      .filter((o) => {
        if (
          filters.title &&
          !o.title.toLowerCase().includes(filters.title.toLowerCase())
        )
          return false;
        if (
          filters.vesselProject &&
          !o.vesselProject
            .toLowerCase()
            .includes(filters.vesselProject.toLowerCase())
        )
          return false;
        if (filters.status && o.state !== filters.status) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [observations, filters]);

  /**
   * handleDelete — deletes an observation
   * Only called after AlertDialog confirmation.
   * Server action enforces the actual permission rules.
   */
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const result = await deleteObservation(id);
      if (result.success) {
        toast.success("Observation deleted.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffffa] dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-6 md:px-10 py-10 font-sans">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <Link href="/">
          <Image
            src="/assets/images/logo2.png"
            alt="MarineGuard"
            width={60}
            height={60}
            className="object-cover object-top rounded-full w-16 h-16"
            priority
          />
        </Link>
        {/** Back to home button */}
        <Link
          href="/"
          className="text-xs px-3 py-1.5 rounded-lg border border-amber-300 hover:bg-amber-100 dark:hover:bg-slate-800 transition-colors font-medium"
        >
          ← Home
        </Link>

        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-700 dark:text-white">
            Mobile Marine{" "}
            <span className="text-slate-500">QHSE Observation Cards</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Displaying {filtered.length} of {observations.length} observations
          </p>
        </div>

        {/* New Observation button — all roles can create */}
        <button
          onClick={() => router.push("/observationdashboard/observations/new")}
          className="px-5 py-2.5 bg-amber-300 hover:bg-amber-400 text-amber-900 border border-amber-200 rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-sm"
        >
          + New Observation
        </button>
      </div>

      {/* ── Filters Panel ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-amber-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 mb-6">
        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-4">
          Filters
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {/* Title text search */}
          <input
            type="text"
            placeholder="Title"
            value={filters.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputClass}
          />

          {/* Vessel / Project text search */}
          <input
            type="text"
            placeholder="Vessel / Project"
            value={filters.vesselProject}
            onChange={(e) => set("vesselProject", e.target.value)}
            className={inputClass}
          />

          {/* Status — DRAFT or COMPLETED only */}
          <select
            value={filters.status}
            onChange={(e) => set("status", e.target.value)}
            className={selectClass}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <button
          onClick={reset}
          className="text-xs px-4 py-2 rounded-lg border border-amber-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
        >
          Reset filters
        </button>
      </div>

      {/* ── Observation Table ──────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden border border-amber-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* Table header — amber background */}
            <thead className="bg-amber-300 border-b border-amber-400">
              <tr>
                {["Title", "Description", "Date", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-semibold text-amber-900 text-xs uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {/* Empty state */}
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-slate-400 text-sm"
                  >
                    No observations found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((o, index) => (
                  <tr
                    key={o.id}
                    className={`border-b border-amber-50 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-slate-800/60 transition-colors ${
                      index % 2 === 0
                        ? "bg-white dark:bg-slate-900"
                        : "bg-amber-50/30 dark:bg-slate-900/50"
                    }`}
                  >
                    {/* Title — clickable, navigates to view page */}
                    <td
                      className="px-4 py-3 font-medium text-amber-600 dark:text-amber-400 cursor-pointer hover:underline whitespace-nowrap"
                      onClick={() =>
                        router.push(
                          `/observationdashboard/observations/${o.id}`,
                        )
                      }
                    >
                      {o.title}
                    </td>

                    {/* Description — truncated */}
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-62.5 truncate">
                      {o.observationDescription}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {new Date(o.date).toLocaleDateString("en-GB")}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyle[o.state] ?? ""}`}
                      >
                        {o.state}
                      </span>
                    </td>

                    {/* ── Action buttons ─────────────────────────────── */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* View — all roles, all states */}
                        <Button
                          title="View"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/observationdashboard/observations/${o.id}`,
                            )
                          }
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          👁
                        </Button>

                        {/* Edit — DRAFT only, all roles */}
                        {o.state === "DRAFT" && (
                          <Button
                            title="Edit Draft"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/observationdashboard/observations/${o.id}/edit`,
                              )
                            }
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            ✏️
                          </Button>
                        )}

                        {/* Download PDF — COMPLETED only, all roles */}
                        {o.state === "COMPLETED" && (
                          <Button
                            title="Download PDF"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/observationdashboard/observations/${o.id}/pdf`,
                              )
                            }
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            📝
                          </Button>
                        )}

                        {/* Delete — COMPLETED only, ADMIN/MANAGER only */}
                        {o.state === "COMPLETED" && isAdminOrManager && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                title="Delete"
                                variant="ghost"
                                size="sm"
                                disabled={deletingId === o.id}
                                className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800"
                              >
                                {deletingId === o.id ? "..." : "🗑️"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Observation Card?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. The
                                  observation "{o.title}" and all its data
                                  will be permanently deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(o.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                  Yes, delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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