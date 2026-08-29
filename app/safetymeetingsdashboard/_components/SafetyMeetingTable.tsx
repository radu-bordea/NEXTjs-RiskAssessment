"use client";

/**
 * SafetyMeetingTable — Safety Meetings / Toolbox Talks dashboard
 *
 * Displays all toolbox talk records in a filterable table.
 * Red theme to distinguish from Risk (green), Observation (amber), Work Permits (blue).
 *
 * States: DRAFT / COMPLETED
 * Roles (matches Observation Card):
 *  - ADMIN/MANAGER → can edit any draft, delete any (draft or completed)
 *  - MEMBER        → can edit/delete only their own drafts
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { deleteSafetyMeeting } from "@/app/actions/safetyMeeting.actions";
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Meeting = {
  id: string;
  projectSurvey: string;
  vesselInstallation: string;
  activityTask: string;
  toolboxTalkLeader: string;
  date: Date;
  state: string;
  createdById: string;
};

type CurrentUser = {
  id: string;
  role: string;
} | null;

// ─── Status badge styles ──────────────────────────────────────────────────────
const stateStyle: Record<string, string> = {
  DRAFT:
    "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 whitespace-nowrap",
  COMPLETED:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 whitespace-nowrap",
};

// ─── Shared Tailwind classes ──────────────────────────────────────────────────
const inputClass =
  "px-3 py-2 rounded-lg border border-red-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors";

const selectClass =
  "px-3 py-2 rounded-lg border border-red-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors";

export default function SafetyMeetingTable({
  meetings,
  currentUser,
}: {
  meetings: Meeting[];
  currentUser: CurrentUser;
}) {
  const router = useRouter();

  /** True when logged in user is ADMIN or MANAGER */
  const isAdminOrManager =
    currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";

  /** Track which meeting is currently being deleted — for loading state */
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /** Filter state — all start empty */
  const [filters, setFilters] = useState({
    projectSurvey: "",
    vesselInstallation: "",
    status: "",
  });

  const [manualOpen, setManualOpen] = useState(false);

  const set = (key: string, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const reset = () =>
    setFilters({ projectSurvey: "", vesselInstallation: "", status: "" });

  /**
   * filtered — applies all active filters and sorts by date descending
   */
  const filtered = useMemo(() => {
    return meetings
      .filter((m) => {
        if (
          filters.projectSurvey &&
          !m.projectSurvey
            .toLowerCase()
            .includes(filters.projectSurvey.toLowerCase())
        )
          return false;
        if (
          filters.vesselInstallation &&
          !m.vesselInstallation
            .toLowerCase()
            .includes(filters.vesselInstallation.toLowerCase())
        )
          return false;
        if (filters.status && m.state !== filters.status) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [meetings, filters]);

  /**
   * handleDelete — deletes a safety meeting
   * Server action enforces the actual permission rules.
   */
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const result = await deleteSafetyMeeting(id);
      if (result.success) {
        toast.success("Safety meeting deleted.");
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
    <div className="min-h-screen bg-[#fff8f8] dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-6 md:px-10 py-10 font-sans">
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

        <Link
          href="/"
          className="text-xs px-3 py-1.5 rounded-lg border border-red-300 hover:bg-red-100 dark:hover:bg-slate-800 transition-colors font-medium"
        >
          ← Home
        </Link>

        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-700 dark:text-white">
            Mobile Marine{" "}
            <span className="text-slate-500">
              Safety Meetings / Toolbox Talks
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Displaying {filtered.length} of {meetings.length} toolbox talks
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Open Manual button — opens PDF viewer modal */}
          <button
            onClick={() => setManualOpen(true)}
            className="px-5 py-2.5 bg-white hover:bg-red-50 text-red-900 border border-red-300 rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-sm"
          >
            📖 Open Manual
          </button>

          {/* New Toolbox Talk button */}
          <button
            onClick={() => router.push("/safetymeetingsdashboard/meetings/new")}
            className="px-5 py-2.5 bg-red-300 hover:bg-red-400 text-red-900 border border-red-300 rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-sm"
          >
            + New Safety Meetings / Toolbox Talks
          </button>
        </div>
      </div>

      {/* ── Filters Panel ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-red-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 mb-6">
        <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-widest mb-4">
          Filters
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <input
            type="text"
            placeholder="Project / Survey"
            value={filters.projectSurvey}
            onChange={(e) => set("projectSurvey", e.target.value)}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Vessel / Installation"
            value={filters.vesselInstallation}
            onChange={(e) => set("vesselInstallation", e.target.value)}
            className={inputClass}
          />
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
          className="text-xs px-4 py-2 rounded-lg border border-red-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
        >
          Reset filters
        </button>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden border border-red-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-red-300 dark:bg-red-700 border-b border-red-400">
              <tr>
                {[
                  "Project / Survey",
                  "Vessel / Installation",
                  "Activity / Task",
                  "Toolbox Talk Leader",
                  "Date",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-semibold text-white text-xs uppercase tracking-wide whitespace-nowrap"
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
                    colSpan={7}
                    className="px-4 py-10 text-center text-slate-400 text-sm"
                  >
                    No toolbox talks found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((m, index) => (
                  <tr
                    key={m.id}
                    className={`border-b border-red-50 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-slate-800/60 transition-colors ${
                      index % 2 === 0
                        ? "bg-white dark:bg-slate-900"
                        : "bg-red-50/30 dark:bg-slate-900/50"
                    }`}
                  >
                    <td
                      className="px-4 py-3 font-medium text-red-600 dark:text-red-400 cursor-pointer hover:underline whitespace-nowrap"
                      onClick={() =>
                        router.push(`/safetymeetingsdashboard/meetings/${m.id}`)
                      }
                    >
                      {m.projectSurvey}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      {m.vesselInstallation}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                      {m.activityTask}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {m.toolboxTalkLeader}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {new Date(m.date).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${stateStyle[m.state] ?? ""}`}
                      >
                        {m.state}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* View — all roles, all states */}
                        <Button
                          title="View"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/safetymeetingsdashboard/meetings/${m.id}`,
                            )
                          }
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          👁
                        </Button>

                        {/* Edit — DRAFT only */}
                        {m.state === "DRAFT" && (
                          <Button
                            title="Edit Draft"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/safetymeetingsdashboard/meetings/${m.id}/edit`,
                              )
                            }
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            ✏️
                          </Button>
                        )}

                        {/* Download PDF — COMPLETED only */}
                        {m.state === "COMPLETED" && (
                          <Button
                            title="Download PDF"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/safetymeetingsdashboard/meetings/${m.id}/pdf`,
                              )
                            }
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            📝
                          </Button>
                        )}

                        {/* Delete — COMPLETED only, ADMIN/MANAGER only */}
                        {m.state === "COMPLETED" && isAdminOrManager && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                title="Delete"
                                variant="ghost"
                                size="sm"
                                disabled={deletingId === m.id}
                                className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 cursor-pointer"
                              >
                                {deletingId === m.id ? "..." : "🗑️"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Safety Meeting?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. The meeting
                                  &quot;{m.projectSurvey}&quot; and all its data
                                  will be permanently deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(m.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                  Yes, delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        {/* Delete — DRAFT, own draft only for MEMBER */}
                        {m.state === "DRAFT" &&
                          (isAdminOrManager ||
                            m.createdById === currentUser?.id) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  title="Delete"
                                  variant="ghost"
                                  size="sm"
                                  disabled={deletingId === m.id}
                                  className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800"
                                >
                                  {deletingId === m.id ? "..." : "🗑️"}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Draft?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. The draft
                                    &quot;{m.projectSurvey}&quot; will be
                                    permanently deleted.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(m.id)}
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

      {/* ── Manual PDF Viewer Modal ──────────────────────────────────────── */}
      {/* TODO: update src to your actual Vercel Blob manual.pdf URL */}
      {/* ── Manual PDF Viewer Modal ──────────────────────────────────────── */}
      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Safety Manual</DialogTitle>
          </DialogHeader>
          <iframe
            src="https://3ndlujwykffozodt.public.blob.vercel-storage.com/manual.pdf"
            className="w-full flex-1 rounded-lg border border-red-200"
            title="Safety Manual"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
