"use client";

/**
 * SafetyMeetingForm — Create or edit a Toolbox Talk / Safety Meeting
 *
 * Sections:
 *  1. Task & Project Information (left) + Operational Context / Responsible
 *     Interfaces (right) — 2 column grid layout
 *  2. Select Toolbox Talk Cards — list with code/title/preview
 *  3. Confirm with the Team — checkboxes + Others textarea
 *  4. Add Team Member — dynamic array, same pattern as Risk's teamMembers
 *
 * No server actions yet — Prisma model + validation + actions come next.
 * Roles/permissions and states (DRAFT/COMPLETED) will match Observation Card.
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
import {
  createToolboxTalkCard,
  getToolboxTalkCards,
  deleteToolboxTalkCard,
} from "@/app/actions/toolboxTalkCard.actions";
import { useEffect } from "react";
import {
  createSafetyMeeting,
  saveSafetyMeetingDraft,
} from "@/app/actions/safetyMeeting.actions";

import {
  updateSafetyMeeting,
  deleteSafetyMeeting,
} from "@/app/actions/safetyMeeting.actions";
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

type CurrentUser = {
  id: string;
  role: string;
} | null;

type Props = {
  meeting?: any;
  currentUser?: CurrentUser;
};

// ─── Operational Context rows — icon + label + editable value ────────────────
const OPERATIONAL_CONTEXT_FIELDS = [
  { key: "vesselStatus", label: "Vessel status" },
  { key: "weatherSeaState", label: "Weather / Sea State" },
  { key: "workAreaStatus", label: "Work area status" },
  { key: "dayNight", label: "Day / Night" },
  { key: "nearbyOperations", label: "Nearby operations" },
];

// ─── Responsible Interfaces rows — icon + label + editable value ──────────────
const RESPONSIBLE_INTERFACE_FIELDS = [
  { key: "masterOowDpo", label: "Master / OOW / DPO" },
  { key: "deckPic", label: "PIC" },
  { key: "surveyLead", label: "Authorized Team Leader / Survey Lead" },
  { key: "equipmentOperator", label: "Equipment Operator" },
];

// ─── Confirm with the Team — checklist options ────────────────────────────────
/**
 * Multiple selection — user can check more than one item.
 * Stored as string[] in state → will be saved as array in DB.
 */
const TEAM_CONFIRMATION_ITEMS = [
  {
    key: "taskSequenceRoles",
    label: "Task sequence and individual roles are understood",
  },
  {
    key: "criticalHazards",
    label: "Critical hazards and controls have been discussed",
  },
  {
    key: "stopMakeSafe",
    label: "Stop / Make Safe / Reassess criteria are understood",
  },
  {
    key: "emergencyActions",
    label: "Emergency actions and communication method are understood",
  },
  { key: "lmraRequired", label: "LMRA Required at work site" },
];

/** A single team member row — name only for now, matches Risk's TeamMember pattern */
type TeamMemberRow = {
  id: string;
  name: string;
};

export default function SafetyMeetingForm({ meeting, currentUser }: Props) {
  const router = useRouter();

  /** True when editing an existing DRAFT */
  const isEditMode = !!meeting;

  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);

  // ─── Section 1 — Task & Project Information ────────────────────────────
  const [projectSurvey, setProjectSurvey] = useState(
    meeting?.projectSurvey ?? "",
  );
  const [contractNo, setContractNo] = useState(meeting?.contractNo ?? "");
  const [vesselInstallation, setVesselInstallation] = useState(
    meeting?.vesselInstallation ?? "",
  );
  const [date, setDate] = useState(
    meeting?.date
      ? new Date(meeting.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  );
  const [locationAreaDeck, setLocationAreaDeck] = useState(
    meeting?.locationAreaDeck ?? "",
  );
  const [startTime, setStartTime] = useState(meeting?.startTime ?? "");
  const [expectedFinish, setExpectedFinish] = useState(
    meeting?.expectedFinish ?? "",
  );
  const [activityTask, setActivityTask] = useState(meeting?.activityTask ?? "");
  const [toolboxTalkLeader, setToolboxTalkLeader] = useState(
    meeting?.toolboxTalkLeader ?? "",
  );
  const [taskObjective, setTaskObjective] = useState(
    meeting?.taskObjective ?? "",
  );

  const [firstTimeNonRoutine, setFirstTimeNonRoutine] = useState(
    meeting?.firstTimeNonRoutine ?? false,
  );
  const [simopsInvolved, setSimopsInvolved] = useState(
    meeting?.simopsInvolved ?? false,
  );

  // ─── Section 2 — Operational Context (dynamic key/value) ───────────────
  const [operationalContext, setOperationalContext] = useState<
    Record<string, string>
  >(
    Object.fromEntries(
      OPERATIONAL_CONTEXT_FIELDS.map((f) => [f.key, meeting?.[f.key] ?? ""]),
    ),
  );

  // ─── Section 3 — Responsible Interfaces (dynamic key/value) ────────────
  const [responsibleInterfaces, setResponsibleInterfaces] = useState<
    Record<string, string>
  >(
    Object.fromEntries(
      RESPONSIBLE_INTERFACE_FIELDS.map((f) => [f.key, meeting?.[f.key] ?? ""]),
    ),
  );
  const [responsibleInterfacesOther, setResponsibleInterfacesOther] = useState(
    meeting?.responsibleInterfacesOther ?? "",
  );

  /** Real cards fetched from DB */
  const [cards, setCards] = useState<
    {
      id: string;
      code: string;
      title: string;
      department: string | null;
      tags: string[];
      imageUrl: string | null;
    }[]
  >([]);

  /** Loads cards from DB on mount */
  useEffect(() => {
    getToolboxTalkCards().then(setCards);
  }, []);

  /** Controls the "Upload New Card" dialog */
  const [createCardOpen, setCreateCardOpen] = useState(false);
  const [newCardCode, setNewCardCode] = useState("");
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDepartment, setNewCardDepartment] = useState("");
  const [newCardTags, setNewCardTags] = useState("");
  const [newCardImage, setNewCardImage] = useState<File | null>(null);
  const [creatingCard, setCreatingCard] = useState(false);

  // ─── Select Toolbox Talk Cards state ────────────────────────────────────
  const [previewCard, setPreviewCard] = useState<{
    code: string;
    title: string;
    department: string | null;
    image: string;
    tags: string[];
  } | null>(null);

  const [selectedCards, setSelectedCards] = useState<string[]>(
    meeting?.selectedCards?.map((sc: any) => sc.cardId) ?? [],
  );

  const toggleCardSelection = (code: string) => {
    setSelectedCards((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  /** Search filter — matches title or tags */
  const [cardSearchQuery, setCardSearchQuery] = useState("");

  /** Selected department filter — "All" shows everything */
  const [cardDepartmentFilter, setCardDepartmentFilter] = useState("All");

  /** Unique departments from current card data, for filter buttons */
  const availableDepartments = [
    "All",
    ...Array.from(
      new Set(cards.map((c) => c.department).filter((d): d is string => !!d)),
    ),
  ];

  /** Filtered cards based on search + department */
  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      !cardSearchQuery ||
      card.title.toLowerCase().includes(cardSearchQuery.toLowerCase()) ||
      card.tags.some((tag) =>
        tag.toLowerCase().includes(cardSearchQuery.toLowerCase()),
      );

    const matchesDepartment =
      cardDepartmentFilter === "All" ||
      card.department === cardDepartmentFilter;

    return matchesSearch && matchesDepartment;
  });

  // ─── Confirm with the Team state ────────────────────────────────────────
  /**
   * teamConfirmations — array of confirmed item keys
   * Multiple checkboxes — user can select more than one
   * e.g. ["taskSequenceRoles", "criticalHazards"]
   */
  // ─── Confirm with the Team state ────────────────────────────────────────
  const [teamConfirmations, setTeamConfirmations] = useState<string[]>(
    meeting?.teamConfirmations ?? [],
  );
  const [teamConfirmationsOther, setTeamConfirmationsOther] = useState(
    meeting?.teamConfirmationsOther ?? "",
  );

  const toggleTeamConfirmation = (key: string) => {
    setTeamConfirmations((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  // ─── Add Team Member state — dynamic array, same pattern as Risk ───────
  // ─── Add Team Member state ──────────────────────────────────────────────
  const [teamMembers, setTeamMembers] = useState<TeamMemberRow[]>(
    meeting?.teamMembers?.map((m: any) => ({ id: m.id, name: m.name })) ?? [],
  );

  const addTeamMember = () => {
    setTeamMembers((prev) => [...prev, { id: crypto.randomUUID(), name: "" }]);
  };

  const updateTeamMember = (id: string, name: string) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name } : m)),
    );
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
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
    if (!projectSurvey) {
      toast.error("Project / Survey is required");
      return;
    }
    if (!vesselInstallation) {
      toast.error("Vessel / Installation is required");
      return;
    }
    if (!date) {
      toast.error("Date is required");
      return;
    }
    if (!locationAreaDeck) {
      toast.error("Location / Area / Deck is required");
      return;
    }
    if (!startTime) {
      toast.error("Start Time is required");
      return;
    }
    if (!activityTask) {
      toast.error("Activity / Task is required");
      return;
    }
    if (!toolboxTalkLeader) {
      toast.error("Toolbox Talk Leader is required");
      return;
    }
    if (!taskObjective) {
      toast.error("Task Objective is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        projectSurvey,
        contractNo,
        vesselInstallation,
        date: new Date(date),
        locationAreaDeck,
        startTime,
        expectedFinish,
        activityTask,
        toolboxTalkLeader,
        taskObjective,
        firstTimeNonRoutine,
        simopsInvolved,
        ...operationalContext,
        ...responsibleInterfaces,
        responsibleInterfacesOther,
        teamConfirmations,
        teamConfirmationsOther,
        selectedCardIds: selectedCards,
        teamMembers: teamMembers
          .filter((m) => m.name.trim() !== "")
          .map((m) => ({ name: m.name })),
      };

      // Edit mode → updateSafetyMeeting (submitAsCompleted = true)
      // Create mode → createSafetyMeeting
      const result = isEditMode
        ? await updateSafetyMeeting(meeting.id, payload, true)
        : await createSafetyMeeting(payload);

      if (result.success) {
        toast.success(
          isEditMode ? "Toolbox Talk submitted!" : "Toolbox Talk created!",
        );
        router.push("/safetymeetingsdashboard");
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

const onSaveDraft = async () => {
  setDraftLoading(true)
  try {
    const emptyToUndefined = (val: string) => (val === "" ? undefined : val)

    const payload = {
      projectSurvey,
      contractNo,
      vesselInstallation,
      date: date ? new Date(date) : undefined,
      locationAreaDeck: emptyToUndefined(locationAreaDeck),
      startTime: emptyToUndefined(startTime),
      expectedFinish,
      activityTask: emptyToUndefined(activityTask),
      toolboxTalkLeader: emptyToUndefined(toolboxTalkLeader),
      taskObjective: emptyToUndefined(taskObjective),
      firstTimeNonRoutine,
      simopsInvolved,
      ...operationalContext,
      ...responsibleInterfaces,
      responsibleInterfacesOther,
      teamConfirmations,
      teamConfirmationsOther,
      selectedCardIds: selectedCards,
      teamMembers: teamMembers.filter((m) => m.name.trim() !== "").map((m) => ({ name: m.name })),
    }

    const result = isEditMode
      ? await updateSafetyMeeting(meeting.id, payload, false)
      : await saveSafetyMeetingDraft(payload)

    if (result.success) {
      toast.success("Draft saved!")
      router.push("/safetymeetingsdashboard")
    } else {
      toast.error(result.error ?? "Failed to save draft")
    }
  } catch {
    toast.error("Something went wrong")
  } finally {
    setDraftLoading(false)
  }
}

  const onUploadClick = () => {
    setCreateCardOpen(true);
  };

  const onCreateCard = async () => {
    if (!newCardCode || !newCardTitle) {
      toast.error("Code and Title are required");
      return;
    }

    setCreatingCard(true);
    try {
      const formData = new FormData();
      formData.append("code", newCardCode);
      formData.append("title", newCardTitle);
      formData.append("department", newCardDepartment);
      formData.append("tags", newCardTags);
      if (newCardImage) formData.append("image", newCardImage);

      const result = await createToolboxTalkCard(formData);

      if (result.success) {
        toast.success("Card created!");
        const updated = await getToolboxTalkCards();
        setCards(updated);
        setCreateCardOpen(false);
        setNewCardCode("");
        setNewCardTitle("");
        setNewCardDepartment(""); // ← add this
        setNewCardTags("");
        setNewCardImage(null);
      } else {
        toast.error(result.error ?? "Failed to create card");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreatingCard(false);
    }
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
                onClick={() => setFirstTimeNonRoutine((v: any) => !v)}
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
                onClick={() => setSimopsInvolved((v: any) => !v)}
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
          <Button
            type="button"
            size="sm"
            onClick={onUploadClick}
            className="bg-white hover:bg-red-50 text-red-900 border border-red-300 text-xs"
          >
            📤 Upload New Card
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-4 space-y-3">
          <input
            type="text"
            value={cardSearchQuery}
            onChange={(e) => setCardSearchQuery(e.target.value)}
            placeholder="Search by title or tag..."
            className="w-full px-3 py-2 rounded-lg border border-red-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <div className="flex flex-wrap gap-2">
            {availableDepartments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setCardDepartmentFilter(dept)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  cardDepartmentFilter === dept
                    ? "bg-red-400 text-white border-red-400"
                    : "bg-white text-red-700 border-red-200 hover:bg-red-50"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-100 overflow-y-auto divide-y divide-red-50 dark:divide-slate-800">
          {filteredCards.map((card) => {
            const isSelected = selectedCards.includes(card.id);
            return (
              <div
                key={card.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <span className="text-xs font-mono font-semibold text-red-600 dark:text-red-400 w-16 shrink-0">
                  {card.code}
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-200 flex-1 min-w-0">
                  {card.title}
                </span>
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
                <button
                  type="button"
                  onClick={() =>
                    setPreviewCard({
                      code: card.code,
                      title: card.title,
                      department: card.department,
                      image: card.imageUrl ?? "/assets/images/logo2.png",
                      tags: card.tags,
                    })
                  }
                  className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 underline shrink-0"
                >
                  Preview
                </button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => toggleCardSelection(card.id)}
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
      </div>

      {/* ── Section — Confirm with the Team ─────────────────────────────── */}
      <div className={sectionClass}>
        <h2 className={sectionHeadingClass}>Confirm with the Team</h2>

        {/* Checkboxes — multiple selection allowed */}
        <div className="space-y-2">
          {TEAM_CONFIRMATION_ITEMS.map((item) => (
            <label
              key={item.key}
              className={`flex items-start gap-2 cursor-pointer py-1.5 px-2 rounded-lg transition-colors ${
                teamConfirmations.includes(item.key)
                  ? "bg-red-100 dark:bg-red-700/20"
                  : "hover:bg-red-100/50 dark:hover:bg-slate-800"
              }`}
            >
              <input
                type="checkbox"
                checked={teamConfirmations.includes(item.key)}
                onChange={() => toggleTeamConfirmation(item.key)}
                className="mt-0.5 accent-red-400 shrink-0"
              />
              <span className="text-sm text-slate-600 dark:text-slate-300 leading-tight">
                {item.label}
              </span>
            </label>
          ))}
        </div>

        {/* Others — free text */}
        <div className="mt-4">
          <label className={labelClass}>Others</label>
          <Textarea
            value={teamConfirmationsOther}
            onChange={(e) => setTeamConfirmationsOther(e.target.value)}
            rows={2}
            placeholder="Others..."
            className={inputStyle}
          />
        </div>
      </div>

      {/* ── Section — Add Team Member ────────────────────────────────────── */}
      <div className={sectionClass}>
        <h2 className={sectionHeadingClass}>Team Members</h2>

        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <Input
                value={member.name}
                onChange={(e) => updateTeamMember(member.id, e.target.value)}
                placeholder="Person name"
                className={inputStyle}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeTeamMember(member.id)}
                className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 whitespace-nowrap"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addTeamMember}
          className="mt-4 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
        >
          + Add team member
        </Button>
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

      {/* ── Create New Card Dialog ────────────────────────────────────── */}
      <Dialog open={createCardOpen} onOpenChange={setCreateCardOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload New Toolbox Talk Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Code *</label>
              <Input
                value={newCardCode}
                onChange={(e) => setNewCardCode(e.target.value)}
                placeholder="e.g. SUR-25"
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass}>Title *</label>
              <Input
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                placeholder="e.g. Winch Operations Safety"
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <Input
                value={newCardDepartment}
                onChange={(e) => setNewCardDepartment(e.target.value)}
                placeholder="e.g. Survey, Deck, Engine"
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass}>Tags (comma separated)</label>
              <Input
                value={newCardTags}
                onChange={(e) => setNewCardTags(e.target.value)}
                placeholder="e.g. Winch, Lifting"
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass}>Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewCardImage(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
            </div>
            <Button
              type="button"
              disabled={creatingCard}
              onClick={onCreateCard}
              className="w-full bg-red-300 hover:bg-red-400 text-red-900 border border-red-300"
            >
              {creatingCard ? "Creating..." : "Create Card"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Submit / Save Draft / Preview PDF / Delete / Cancel ─────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-10">
        <div className="flex items-center gap-4 flex-wrap">
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
            disabled={loading || draftLoading}
            onClick={() => router.push("/safetymeetingsdashboard")}
            className="border-red-200 text-slate-600 hover:bg-red-50"
          >
            Cancel
          </Button>
        </div>

        {/* Delete — ADMIN/MANAGER any, MEMBER only their own draft, edit mode only */}
        {isEditMode &&
          (currentUser?.role === "ADMIN" ||
            currentUser?.role === "MANAGER" ||
            (currentUser?.role === "MEMBER" &&
              meeting?.createdById === currentUser?.id)) && (
            <DeleteSafetyMeetingButton meetingId={meeting.id} />
          )}
      </div>
    </div>
  );
}

/**
 * DeleteSafetyMeetingButton — Confirmation dialog before deleting
 *
 * Visibility rules handled by parent — only rendered when:
 * ADMIN/MANAGER (any state) or MEMBER (own draft only)
 */
function DeleteSafetyMeetingButton({ meetingId }: { meetingId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteSafetyMeeting(meetingId);
      if (result.success) {
        toast.success("Safety meeting deleted.");
        router.push("/safetymeetingsdashboard");
      } else {
        toast.error(result.error ?? "Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          Delete Safety Meeting
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Safety Meeting?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The safety meeting and all its data
            will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {deleting ? "Deleting..." : "Yes, delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
