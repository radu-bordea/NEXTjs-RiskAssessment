"use client";

/**
 * SafetyMeetingForm — Create or edit a Toolbox Talk / Safety Meeting
 *
 * Sections:
 *  1. Task & Project Information (left) + Operational Context / Responsible
 *     Interfaces (right) — 2 column grid layout
 *  2. Select Toolbox Talk Cards — list with code/title/preview, placeholder
 *     for now, image upload comes in a future session
 *
 * No server actions yet — Prisma model + validation + actions come next.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Operational Context rows — icon + label + editable value ────────────────
const OPERATIONAL_CONTEXT_FIELDS = [
  { key: "vesselStatus", icon: "⚓", label: "Vessel status" },
  { key: "weatherSeaState", icon: "🌊", label: "Weather / Sea State" },
  { key: "workAreaStatus", icon: "✅", label: "Work area status" },
  { key: "dayNight", icon: "☀️", label: "Day / Night" },
  { key: "nearbyOperations", icon: "📡", label: "Nearby operations" },
];

// ─── Responsible Interfaces rows — icon + label + editable value ──────────────
const RESPONSIBLE_INTERFACE_FIELDS = [
  { key: "masterOowDpo", icon: "🧭", label: "Master / OOW / DPO" },
  { key: "deckPic", icon: "🧍", label: "Deck PIC" },
  { key: "surveyLead", icon: "🧍", label: "Survey Lead" },
  { key: "equipmentOperator", icon: "🤖", label: "Equipment Operator" },
];

// ─── Placeholder Toolbox Talk Cards — will come from DB/uploads later ────────
/**
 * TEMP fake cards for UI development.
 * image is a placeholder — real cards will have uploaded images
 * once storage (Vercel Blob) is wired up.
 */
const PLACEHOLDER_CARDS = [
  {
    code: "SUR-08",
    title: "LARS and survey winch operations",
    tags: ["LARS", "Winch"],
    image: "/assets/images/card1.jpg",
  },
  {
    code: "OPS-02",
    title: "High-energy AUV/ROV batteries and subsea power packs",
    tags: ["Battery", "Emergency"],
    image: "/assets/images/card2.jpg",
  },
  {
    code: "OPS-03",
    title: "Bridge, deck and survey-room coordination",
    tags: ["Communication", "SIMOPS"],
    image: "/assets/images/card3.jpg",
  },
];

export default function SafetyMeetingForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);

  // ─── Section 1 — Task & Project Information ────────────────────────────
  const [projectSurvey, setProjectSurvey] = useState("");
  const [contractNo, setContractNo] = useState("");
  const [vesselInstallation, setVesselInstallation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [locationAreaDeck, setLocationAreaDeck] = useState("");
  const [startTime, setStartTime] = useState("");
  const [expectedFinish, setExpectedFinish] = useState("");
  const [activityTask, setActivityTask] = useState("");
  const [toolboxTalkLeader, setToolboxTalkLeader] = useState("");
  const [taskObjective, setTaskObjective] = useState("");

  const [firstTimeNonRoutine, setFirstTimeNonRoutine] = useState(false);
  const [simopsInvolved, setSimopsInvolved] = useState(false);

  // ─── Section 2 — Operational Context (dynamic key/value) ───────────────
  const [operationalContext, setOperationalContext] = useState<
    Record<string, string>
  >(Object.fromEntries(OPERATIONAL_CONTEXT_FIELDS.map((f) => [f.key, ""])));

  // ─── Section 3 — Responsible Interfaces (dynamic key/value) ────────────
  const [responsibleInterfaces, setResponsibleInterfaces] = useState<
    Record<string, string>
  >(Object.fromEntries(RESPONSIBLE_INTERFACE_FIELDS.map((f) => [f.key, ""])));

  // ─── Select Toolbox Talk Cards state ────────────────────────────────────
  /** Currently previewed card — controls the preview dialog */
  const [previewCard, setPreviewCard] = useState<{
    code: string;
    title: string;
    image: string;
    tags: string[];
  } | null>(null);

  /** Selected card codes — for future wiring to selected cards on submit */
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  // ─── Responsible Interfaces — "Other" free text ─────────────────────────
  const [responsibleInterfacesOther, setResponsibleInterfacesOther] =
    useState("");

  const toggleCardSelection = (code: string) => {
    setSelectedCards((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  // ─── Shared Tailwind classes — red theme ────────────────────────────────
  const labelClass =
    "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1";
  const sectionClass =
    "rounded-xl border border-red-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6 mb-6";
  const sectionHeadingClass =
    "text-xs font-bold uppercase tracking-widest text-red-900 dark:text-white bg-red-300 dark:bg-red-700 -mx-6 -mt-6 mb-5 px-6 py-3 rounded-t-xl";
  const inputStyle = "border-red-200 focus-visible:ring-red-400";

  const onSubmit = async () => {
    setLoading(true);
    try {
      // TODO: call createSafetyMeeting action once Prisma/Zod are wired
      toast.success("Toolbox Talk submitted!");
      router.push("/safetymeetingsdashboard");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onSaveDraft = async () => {
    setDraftLoading(true);
    try {
      // TODO: call saveSafetyMeetingDraft action once Prisma/Zod are wired
      toast.success("Draft saved!");
      router.push("/safetymeetingsdashboard");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDraftLoading(false);
    }
  };

  const onPreviewPDF = () => {
    toast.info("PDF preview will be available once the record is saved.");
  };

  const onUploadClick = () => {
    toast.info(
      "Upload storage (Vercel Blob) will be wired up in a future session.",
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Section 1 — Task & Project Info + Operational Context / Interfaces ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left column — Task & Project Information ─────────────────── */}
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>Task & Project Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Project / Survey *</label>
              <Input
                value={projectSurvey}
                onChange={(e) => setProjectSurvey(e.target.value)}
                placeholder="e.g. North Sea Geophysical Survey"
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelClass}>Contract No.</label>
              <Input
                value={contractNo}
                onChange={(e) => setContractNo(e.target.value)}
                placeholder="e.g. CT-2026-041"
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelClass}>Vessel / Installation *</label>
              <Input
                value={vesselInstallation}
                onChange={(e) => setVesselInstallation(e.target.value)}
                placeholder="e.g. OSV Explorer"
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelClass}>Date *</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputStyle}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Location / Area / Deck *</label>
              <Input
                value={locationAreaDeck}
                onChange={(e) => setLocationAreaDeck(e.target.value)}
                placeholder="e.g. Aft Deck / A-Frame Area"
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelClass}>Start Time *</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass}>Expected Finish</label>
              <Input
                type="time"
                value={expectedFinish}
                onChange={(e) => setExpectedFinish(e.target.value)}
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelClass}>Activity / Task *</label>
              <Input
                value={activityTask}
                onChange={(e) => setActivityTask(e.target.value)}
                placeholder="e.g. AUV Launch & Recovery"
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelClass}>Toolbox Talk Leader *</label>
              <Input
                value={toolboxTalkLeader}
                onChange={(e) => setToolboxTalkLeader(e.target.value)}
                placeholder="e.g. Alexandru Popescu — Chief Officer"
                className={inputStyle}
              />
            </div>
          </div>

          {/* Task Objective — full width textarea */}
          <div className="mt-4">
            <label className={labelClass}>
              Task Objective / Brief Description *
            </label>
            <Textarea
              value={taskObjective}
              onChange={(e) => setTaskObjective(e.target.value)}
              rows={3}
              placeholder="Describe the objective of this task..."
              className={inputStyle}
            />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-8 mt-5 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                First time / non-routine task
              </span>
              <button
                type="button"
                onClick={() => setFirstTimeNonRoutine((v) => !v)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  firstTimeNonRoutine
                    ? "bg-red-400"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    firstTimeNonRoutine ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                SIMOPS involved
              </span>
              <button
                type="button"
                onClick={() => setSimopsInvolved((v) => !v)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  simopsInvolved
                    ? "bg-red-400"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    simopsInvolved ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        {/* ── Right column — Operational Context + Responsible Interfaces ── */}
        <div className="space-y-6">
          <div className={sectionClass}>
            <h2 className={sectionHeadingClass}>Operational Context</h2>
            <div className="space-y-3">
              {OPERATIONAL_CONTEXT_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center gap-3">
                  <span className="text-lg w-8 text-center shrink-0">
                    {field.icon}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-32 shrink-0">
                    {field.label}
                  </span>
                  <Input
                    value={operationalContext[field.key]}
                    onChange={(e) =>
                      setOperationalContext((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className={inputStyle}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={sectionClass}>
            <h2 className={sectionHeadingClass}>Responsible Interfaces</h2>
            <div className="space-y-3">
              {RESPONSIBLE_INTERFACE_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center gap-3">
                  <span className="text-lg w-8 text-center shrink-0">
                    {field.icon}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-32 shrink-0">
                    {field.label}
                  </span>
                  <Input
                    value={responsibleInterfaces[field.key]}
                    onChange={(e) =>
                      setResponsibleInterfaces((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className={inputStyle}
                  />
                </div>
              ))}
            </div>

            {/* Others — free text */}
            <div className="mt-4">
              <label className={labelClass}>Others</label>
              <Textarea
                value={responsibleInterfacesOther}
                onChange={(e) => setResponsibleInterfacesOther(e.target.value)}
                rows={2}
                placeholder="Others..."
                className={inputStyle}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section — Select Toolbox Talk Cards ─────────────────────────── */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between -mx-6 -mt-6 mb-5 px-6 py-3 rounded-t-xl bg-red-300 dark:bg-red-700">
          <h2 className="text-xs font-bold uppercase tracking-widest text-red-900 dark:text-white">
            Select Toolbox Talk Cards
          </h2>
          {/* Upload button — storage wiring comes in a future session */}
          <Button
            type="button"
            size="sm"
            onClick={onUploadClick}
            className="bg-white hover:bg-red-50 text-red-900 border border-red-300 text-xs"
          >
            📤 Upload New Card
          </Button>
        </div>

        <div className="divide-y divide-red-50 dark:divide-slate-800">
          {PLACEHOLDER_CARDS.map((card) => {
            const isSelected = selectedCards.includes(card.code);
            return (
              <div
                key={card.code}
                className="flex items-center justify-between gap-4 py-3"
              >
                {/* Code */}
                <span className="text-xs font-mono font-semibold text-red-600 dark:text-red-400 w-16 shrink-0">
                  {card.code}
                </span>

                {/* Title */}
                <span className="text-sm text-slate-700 dark:text-slate-200 flex-1 min-w-0">
                  {card.title}
                </span>

                {/* Tags */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Preview link */}
                <button
                  type="button"
                  onClick={() => setPreviewCard(card)}
                  className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 underline shrink-0"
                >
                  Preview
                </button>

                {/* Add / Selected button */}
                <Button
                  type="button"
                  size="sm"
                  onClick={() => toggleCardSelection(card.code)}
                  className={`text-xs shrink-0 ${
                    isSelected
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white hover:bg-red-50 text-red-900 border border-red-300"
                  }`}
                >
                  {isSelected ? "✓ Selected" : "+ Add"}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-400 mt-3">
          Note: card upload and storage integration will be added in a future
          update.
        </p>
      </div>

      {/* ── Preview Dialog ────────────────────────────────────────────── */}
      <Dialog
        open={!!previewCard}
        onOpenChange={(open) => !open && setPreviewCard(null)}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {previewCard?.code} — {previewCard?.title}
            </DialogTitle>
          </DialogHeader>
          {previewCard && (
            <div className="rounded-lg overflow-hidden border border-red-200">
              <Image
                src={previewCard.image}
                alt={previewCard.title}
                width={1000}
                height={700}
                className="w-full h-auto object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Submit / Save Draft / Preview PDF / Cancel ─────────────────── */}
      <div className="flex items-center gap-4 pb-10 flex-wrap">
        <Button
          type="button"
          disabled={loading || draftLoading}
          onClick={onSubmit}
          className="px-8 py-3 bg-red-300 hover:bg-red-400 text-red-900 border border-red-300 shadow-sm"
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>

        <Button
          type="button"
          disabled={loading || draftLoading}
          onClick={onSaveDraft}
          className="px-8 py-3 bg-white hover:bg-red-50 text-red-900 border border-red-300 shadow-sm"
        >
          {draftLoading ? "Saving..." : "Save Draft"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onPreviewPDF}
          className="border-red-200 text-slate-600 hover:bg-red-50"
        >
          👁 Preview PDF
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={loading || draftLoading}
          onClick={() => router.push("/safetymeetingsdashboard")}
          className="border-red-200 text-slate-600 hover:bg-red-50"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
