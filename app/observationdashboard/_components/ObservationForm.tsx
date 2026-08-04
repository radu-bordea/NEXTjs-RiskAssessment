"use client";

/**
 * ObservationForm — Create or edit an observation card
 *
 * Based on MMI-QHSE Observation Card form.
 * Sections:
 *  1. Observation Details ← fully implemented
 *  2. Observation Type ← text field
 *  3. Observation Source ← coming soon
 *  4. Life Saving Rules ← coming soon
 *  5. Risk Priority ← coming soon
 *  6. Observation Category ← coming soon
 *  7. Observation Description ← coming soon
 *  8. Immediate Action Taken ← coming soon
 *  9. Corrective / Preventive Action ← coming soon
 *  10. Root Cause ← coming soon
 *  11. Potential Consequence ← coming soon
 *  12. Follow-up / Action Tracking ← coming soon
 *  13. Lessons Learned ← coming soon
 *  14. Close Out ← Admin + Manager only
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

type Props = {
  currentUser: User;
  observation?: any;
};

export default function ObservationForm({ currentUser, observation }: Props) {
  const router = useRouter();
  const isEditMode = !!observation;

  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);

  // ─── Shared Tailwind classes ──────────────────────────────────────
  /** Native input/select styling — amber theme */
  const inputClass =
    "px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors";

  /** Field label */
  const labelClass =
    "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1";

  /** Section card */
  const sectionClass =
    "rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6 mb-6";

  /** Section heading — amber background matching table header */
  const sectionHeadingClass =
    "text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-300  -mx-6 -mt-6 mb-5 px-6 py-3 rounded-t-xl";

  /** Coming soon placeholder sections */
  const comingSoonClass =
    "rounded-xl border border-amber-200 dark:border-slate-800 bg-amber-50/30 dark:bg-slate-900/50 p-6 mb-6 min-h-[80px] flex items-center justify-center";

  const onSubmit = async () => {
    setLoading(true);
    try {
      // TODO: call createObservation or submitObservation action
      toast.success("Observation submitted!");
      router.push("/observationdashboard");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onSaveDraft = async () => {
    setDraftLoading(true);
    try {
      // TODO: call saveObservationDraft action
      toast.success("Draft saved!");
      router.push("/observationdashboard");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDraftLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Section 1 — Observation Details ───────────────────────────── */}
      <div className={sectionClass}>
        <h2 className={sectionHeadingClass}>1. Observation Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ── Left column ─────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Vessel / Project */}
            <div>
              <label className={labelClass}>Vessel / Project *</label>
              <Input
                placeholder="e.g. MV Atlantic Star"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>

            {/* Location */}
            <div>
              <label className={labelClass}>Location (Area / Deck)</label>
              <Input
                placeholder="e.g. Main Deck"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>

            {/* Job / Activity Observed */}
            <div>
              <label className={labelClass}>Job / Activity Observed *</label>
              <Input
                placeholder="e.g. Crane Operations"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>

            {/* Observer Name — auto filled from logged in user */}
            <div>
              <label className={labelClass}>Observer Name *</label>
              <Input
                defaultValue={currentUser.name ?? currentUser.email}
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>

            {/* Observer Type */}
            <div>
              <label className={labelClass}>Created By</label>
             <Input
                placeholder="e.g. Crane Operations"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
          </div>

          {/* ── Right column ─────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Observation No. */}
            <div>
              <label className={labelClass}>Observation No.</label>
              <Input
                placeholder="e.g. OBS-2026-001"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Date *</label>
                <Input
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="border-amber-200 focus-visible:ring-amber-400"
                />
              </div>
              <div>
                <label className={labelClass}>Time</label>
                <Input
                  type="time"
                  className="border-amber-200 focus-visible:ring-amber-400"
                />
              </div>
            </div>

            {/* Department / Company */}
            <div>
              <label className={labelClass}>Department / Company</label>
              <Input
                placeholder="e.g. Deck Department"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>

            {/* Weather / Sea State */}
            <div>
              <label className={labelClass}>Weather / Sea State</label>
              <Input
                placeholder="e.g. Calm, Sunny"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2 — Observation Type ──────────────────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-widest">
          2. Observation Type — Coming Soon
        </p>
      </div>

      {/* ── Section 3 — Observation Source ────────────────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-widest">
          3. Observation Source — Coming Soon
        </p>
      </div>

      {/* ── Section 4 — Life Saving Rules (IOGP) ──────────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-widest">
          4. Life Saving Rules (IOGP) — Coming Soon
        </p>
      </div>

      {/* ── Section 5 — Risk Priority ──────────────────────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-widest">
          5. Risk Priority (Potential Risk Level) — Coming Soon
        </p>
      </div>

      {/* ── Section 6 — Observation Category ──────────────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-widest">
          6. Observation Category — Coming Soon
        </p>
      </div>

      {/* ── Section 7 — Observation Description ───────────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-widest">
          7. Observation Description — Coming Soon
        </p>
      </div>

      {/* ── Section 8 — Immediate Action Taken ────────────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-widest">
          8. Immediate Action Taken — Coming Soon
        </p>
      </div>

      {/* ── Section 9 — Corrective / Preventive Action ────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-widest">
          9. Corrective / Preventive Action Required — Coming Soon
        </p>
      </div>

      {/* ── Section 10 — Root Cause ───────────────────────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-widest">
          10. Root Cause — Coming Soon
        </p>
      </div>

      {/* ── Section 11 — Potential Consequence ────────────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-widest">
          11. Potential Consequence — Coming Soon
        </p>
      </div>

      {/* ── Section 12 — Follow-up / Action Tracking ──────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-widest">
          12. Follow-up / Action Tracking — Coming Soon
        </p>
      </div>

      {/* ── Section 13 — Lessons Learned ──────────────────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-widest">
          13. Lessons Learned / Good Practice — Coming Soon
        </p>
      </div>

      {/* ── Section 14 — Close Out (Admin + Manager only) ─────────────── */}
      {(currentUser.role === "ADMIN" || currentUser.role === "MANAGER") && (
        <div className={comingSoonClass}>
          <p className="text-xs text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-widest">
            14. Close Out — Coming Soon
          </p>
        </div>
      )}

      {/* ── Submit / Save Draft / Cancel ──────────────────────────────── */}
      <div className="flex items-center gap-4 pb-10 flex-wrap">
        {/* Submit → COMPLETED */}
        <Button
          type="button"
          disabled={loading || draftLoading}
          onClick={onSubmit}
          className="px-8 py-3 bg-amber-300 hover:bg-amber-400 text-amber-900 border border-amber-200 shadow-sm"
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>

        {/* Save Draft → DRAFT */}
        <Button
          type="button"
          disabled={loading || draftLoading}
          onClick={onSaveDraft}
          className="px-8 py-3 bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 shadow-sm"
        >
          {draftLoading ? "Saving..." : "Save Draft"}
        </Button>

        {/* Cancel */}
        <Button
          type="button"
          variant="outline"
          disabled={loading || draftLoading}
          onClick={() => router.push("/observationdashboard")}
          className="border-amber-200 text-slate-600 hover:bg-amber-50"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
