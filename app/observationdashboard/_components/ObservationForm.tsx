"use client";

/**
 * ObservationForm — Create or edit an observation card
 *
 * Based on MMI-QHSE Observation Card form.
 * Sections:
 *  1. Observation Details ← fully implemented
 *  2. Observation Type ← implemented (radio/checkbox style)
 *  3. Observation Source ← coming soon
 *  4. Life Saving Rules (IOGP) ← coming soon
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

/** Observation Type options — matches physical form */
const OBSERVATION_TYPES = [
  {
    value: "POSITIVE_SAFETY",
    label: "Positive Safety Observation / Good Practice",
  },
  { value: "UNSAFE_ACT", label: "Unsafe Act / At-Risk Behaviour" },
  { value: "UNSAFE_CONDITION", label: "Unsafe Condition" },
  { value: "NEAR_MISS", label: "Near Miss (Potential Incident)" },
  { value: "ENVIRONMENTAL", label: "Environmental Observation" },
  { value: "QUALITY_SERVICE", label: "Quality / Service Observation" },
  { value: "IMPROVEMENT", label: "Improvement Suggestion" },
  { value: "STOP_WORK", label: "Stop Work Intervention" },
];

export default function ObservationForm({ currentUser, observation }: Props) {
  const router = useRouter();
  const isEditMode = !!observation;

  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);

  /** Selected observation type — single select */
  const [observationType, setObservationType] = useState<string>("");

  /** Stop work authority used — Yes/No */
  const [stopWorkUsed, setStopWorkUsed] = useState<boolean | null>(null);

  /* Observation source states */
  const [observationSource, setObservationSource] = useState<string>("");
  const [observationSourceOther, setObservationSourceOther] =
    useState<string>("");

  // ─── Shared Tailwind classes ──────────────────────────────────────
  const inputClass =
    "px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors";
  const labelClass =
    "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1";
  const sectionClass =
    "rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6 mb-6";
  const sectionHeadingClass =
    "text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-300 -mx-6 -mt-6 mb-5 px-6 py-3 rounded-t-xl";
  const comingSoonClass =
    "rounded-xl border border-amber-200 dark:border-slate-800 bg-amber-50/30 dark:bg-slate-900/50 p-4 flex items-center justify-center min-h-[120px]";

  const onSubmit = async () => {
    setLoading(true);
    try {
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
            <div>
              <label className={labelClass}>Vessel / Project *</label>
              <Input
                placeholder="e.g. MV Atlantic Star"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
            <div>
              <label className={labelClass}>Location (Area / Deck)</label>
              <Input
                placeholder="e.g. Main Deck"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
            <div>
              <label className={labelClass}>Job / Activity Observed *</label>
              <Input
                placeholder="e.g. Crane Operations"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
            <div>
              <label className={labelClass}>Observer Name *</label>
              <Input
                defaultValue={currentUser.name ?? currentUser.email}
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
            <div>
              <label className={labelClass}>Observer Type</label>
              <select className={inputClass}>
                <option value="">— Select —</option>
                <option value="CREW">Crew</option>
                <option value="CONTRACTOR">Contractor</option>
                <option value="VISITOR">Visitor</option>
                <option value="CLIENT">Client</option>
              </select>
            </div>
          </div>

          {/* ── Right column ─────────────────────────────────────────── */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Observation No.</label>
              <Input
                placeholder="e.g. OBS-2026-001"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
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
            <div>
              <label className={labelClass}>Department / Company</label>
              <Input
                placeholder="e.g. Deck Department"
                className="border-amber-200 focus-visible:ring-amber-400"
              />
            </div>
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

      {/* ── Sections 2, 3, 4, 5 — Side by side grid ──────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* ── Section 2 — Observation Type ────────────────────────────── */}
        <div className="md:col-span-1 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-300 -mx-5 -mt-5 mb-4 px-5 py-3 rounded-t-xl">
            2. Observation Type
          </h2>

          {/* Observation type options — single select */}
          <div className="space-y-2">
            {OBSERVATION_TYPES.map((type) => (
              <label
                key={type.value}
                className={`flex items-start gap-2 cursor-pointer p-1.5 rounded-lg transition-colors ${
                  observationType === type.value
                    ? "bg-amber-50 dark:bg-amber-900/20"
                    : "hover:bg-amber-50/50 dark:hover:bg-slate-800"
                }`}
              >
                <input
                  type="radio"
                  name="observationType"
                  value={type.value}
                  checked={observationType === type.value}
                  onChange={() => setObservationType(type.value)}
                  className="mt-0.5 accent-amber-400 shrink-0"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 leading-tight">
                  {type.label}
                </span>
              </label>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-amber-100 dark:border-slate-700 my-3" />

          {/* Was Stop Work Authority Used? */}
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Was Stop Work Authority Used?
            </p>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="stopWork"
                  checked={stopWorkUsed === true}
                  onChange={() => setStopWorkUsed(true)}
                  className="accent-amber-400"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  Yes
                </span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="stopWork"
                  checked={stopWorkUsed === false}
                  onChange={() => setStopWorkUsed(false)}
                  className="accent-amber-400"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  No
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* ── Section 3 — Observation Source ──────────────────────────────── */}
        <div className="md:col-span-1 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-300 -mx-5 -mt-5 mb-4 px-5 py-3 rounded-t-xl">
            3. Observation Source
          </h2>

          {/* Observation source options — single select */}
          <div className="space-y-2">
            {[
              {
                value: "ROUTINE_INSPECTION",
                label: "Routine Inspection / Rounds",
              },
              { value: "PLANNED_SAFETY_TOUR", label: "Planned Safety Tour" },
              { value: "TOOLBOX_TALK", label: "Toolbox Talk / Meeting" },
              { value: "PERSONAL_OBSERVATION", label: "Personal Observation" },
              {
                value: "CLIENT_THIRD_PARTY",
                label: "Client / Third Party Observation",
              },
              { value: "AFTER_INCIDENT", label: "After Incident / Near Miss" },
            ].map((source) => (
              <label
                key={source.value}
                className={`flex items-start gap-2 cursor-pointer p-1.5 rounded-lg transition-colors ${
                  observationSource === source.value
                    ? "bg-amber-50 dark:bg-amber-900/20"
                    : "hover:bg-amber-50/50 dark:hover:bg-slate-800"
                }`}
              >
                <input
                  type="radio"
                  name="observationSource"
                  value={source.value}
                  checked={observationSource === source.value}
                  onChange={() => setObservationSource(source.value)}
                  className="mt-0.5 accent-amber-400 shrink-0"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 leading-tight">
                  {source.label}
                </span>
              </label>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-amber-100 dark:border-slate-700 my-3" />

          {/* Other (Specify) — textarea */}
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Other (Specify):
            </p>
            <textarea
              value={observationSourceOther}
              onChange={(e) => setObservationSourceOther(e.target.value)}
              rows={3}
              placeholder="Specify other source..."
              className="px-3 py-2 rounded-lg border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors resize-none"
            />
          </div>
        </div>

        {/* ── Section 4 — Life Saving Rules (IOGP) ────────────────────── */}
        <div className="md:col-span-1 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-300 -mx-5 -mt-5 mb-4 px-5 py-3 rounded-t-xl">
            4. Life Saving Rules (IOGP)
          </h2>
          <div className="flex items-center justify-center h-24">
            <p className="text-xs text-amber-400 dark:text-amber-500 font-medium uppercase tracking-widest">
              Coming Soon
            </p>
          </div>
        </div>

        {/* ── Section 5 — Risk Priority ────────────────────────────────── */}
        <div className="md:col-span-1 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-300 -mx-5 -mt-5 mb-4 px-5 py-3 rounded-t-xl">
            5. Risk Priority
          </h2>
          <div className="flex items-center justify-center h-24">
            <p className="text-xs text-amber-400 dark:text-amber-300 font-medium uppercase tracking-widest">
              Coming Soon
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 6 — Observation Category ──────────────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-400 dark:text-amber-300 font-semibold uppercase tracking-widest">
          6. Observation Category — Coming Soon
        </p>
      </div>

      {/* ── Section 7 — Observation Description ───────────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-400 dark:text-amber-300 font-semibold uppercase tracking-widest">
          7. Observation Description — Coming Soon
        </p>
      </div>

      {/* ── Section 8 — Immediate Action Taken ────────────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-400 dark:text-amber-300 font-semibold uppercase tracking-widest">
          8. Immediate Action Taken — Coming Soon
        </p>
      </div>

      {/* ── Section 9 — Corrective / Preventive Action ────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-400 dark:text-amber-300 font-semibold uppercase tracking-widest">
          9. Corrective / Preventive Action Required — Coming Soon
        </p>
      </div>

      {/* ── Section 10 — Root Cause ───────────────────────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-400 dark:text-amber-300 font-semibold uppercase tracking-widest">
          10. Root Cause — Coming Soon
        </p>
      </div>

      {/* ── Section 11 — Potential Consequence ────────────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-400 dark:text-amber-300 font-semibold uppercase tracking-widest">
          11. Potential Consequence — Coming Soon
        </p>
      </div>

      {/* ── Section 12 — Follow-up / Action Tracking ──────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-400 dark:text-amber-300 font-semibold uppercase tracking-widest">
          12. Follow-up / Action Tracking — Coming Soon
        </p>
      </div>

      {/* ── Section 13 — Lessons Learned ──────────────────────────────── */}
      <div className={comingSoonClass}>
        <p className="text-xs text-amber-400 dark:text-amber-300 font-semibold uppercase tracking-widest">
          13. Lessons Learned / Good Practice — Coming Soon
        </p>
      </div>

      {/* ── Section 14 — Close Out (Admin + Manager only) ─────────────── */}
      {(currentUser.role === "ADMIN" || currentUser.role === "MANAGER") && (
        <div className={comingSoonClass}>
          <p className="text-xs text-amber-400 dark:text-amber-300 font-semibold uppercase tracking-widest">
            14. Close Out — Coming Soon
          </p>
        </div>
      )}

      {/* ── Submit / Save Draft / Cancel ──────────────────────────────── */}
      <div className="flex items-center gap-4 pb-10 flex-wrap">
        <Button
          type="button"
          disabled={loading || draftLoading}
          onClick={onSubmit}
          className="px-8 py-3 bg-amber-300 hover:bg-amber-400 text-amber-900 border border-amber-200 shadow-sm"
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>

        <Button
          type="button"
          disabled={loading || draftLoading}
          onClick={onSaveDraft}
          className="px-8 py-3 bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 shadow-sm"
        >
          {draftLoading ? "Saving..." : "Save Draft"}
        </Button>

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
