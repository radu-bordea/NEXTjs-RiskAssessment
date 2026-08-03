"use client";

/**
 * RiskForm — Create template or edit/submit draft risk assessment
 *
 * Modes:
 *  - Create mode (no risk prop) → Admin creates a TEMPLATE
 *  - Edit TEMPLATE (risk.state === "TEMPLATE") → Admin only, all fields editable
 *  - Edit DRAFT (risk.state === "DRAFT") → All roles, locked fields + can add new rows
 *  - Edit COMPLETED (risk.state === "COMPLETED") → All roles, only dates editable
 *
 * Buttons:
 *  - Submit → create: TEMPLATE | edit draft: COMPLETED | edit template: update TEMPLATE
 *  - Save Draft → DRAFT edit only
 *  - Cancel → back to dashboard
 *  - Delete → ADMIN only, edit mode only
 */

import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { riskSchema, RiskFormValues } from "@/lib/validations/risk.schema";
import {
  createRisk,
  updateRisk,
  updateTemplate,
  deleteRisk,
  submitDraft,
  updateCompleted,
} from "@/app/actions/risk.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AssessmentRowField from "./AssessmentRowField";
import type { Risk, User } from "@/types";
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

type Props = {
  currentUser: User;
  risk?: Risk;
};

/** SCT dropdown options */
const SCT_OPTIONS = [
  { value: "", label: "— Select —" },
  { value: "NO", label: "No" },
  { value: "YES_SLIPS", label: "Yes, Slips or lapses" },
  { value: "YES_SKILL", label: "Yes, Skill based" },
  { value: "YES_MISTAKE_RULE", label: "Yes, mistake rule based" },
  { value: "YES_MISTAKE_KNOWLEDGE", label: "Yes, mistake knowledge based" },
  { value: "YES_VIOLATION", label: "Yes, violation" },
];

/**
 * Fixed category list — agreed with client.
 * To add a new category, append it to this array.
 */
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
];

export default function RiskForm({ currentUser, risk }: Props) {
  // ─── Mode flags ──────────────────────────────────────────────────────────
  /** True when editing existing risk */
  const isEditMode = !!risk;

  /** Current risk state */
  const riskState = risk?.state;

  /** Editing a TEMPLATE — Admin only, all fields editable */
  const isTemplate = riskState === "TEMPLATE";

  /** Editing a DRAFT — locked fields, can add new rows */
  const isDraft = riskState === "DRAFT";

  /** Editing a COMPLETED — only dates editable */
  const isCompleted = riskState === "COMPLETED";

  /**
   * fieldsLocked — true when editing DRAFT or COMPLETED
   * These specific fields are disabled:
   * Ref, Initiator, RA Type, Category, Library Index, Vessel Dept, Fleet
   */
  const fieldsLocked = isDraft || isCompleted;

  /**
   * allLocked — true when COMPLETED
   * Everything locked except dates
   */
  const allLocked = isCompleted;

  /** Number of rows that came from DB — used to detect existing vs new rows */
  const originalRowCount = risk?.assessmentRows?.length ?? 0;

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);

  /**
   * useForm — pre-fills all fields when in edit mode
   */
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<RiskFormValues, unknown, RiskFormValues>({
    resolver: zodResolver(riskSchema) as Resolver<RiskFormValues>,
    defaultValues: {
      initiator:
        risk?.initiator ?? currentUser?.name ?? currentUser?.email ?? "",
      initiationDate: risk?.initiationDate ?? new Date(),
      raType: (risk?.raType as "ROUTINE" | "NON_ROUTINE") ?? "NON_ROUTINE",
      defectRelated: risk?.defectRelated ?? false,
      alternativeWays: risk?.alternativeWays ?? false,
      alternativeWaysText: risk?.alternativeWaysText ?? "",
      ref: risk?.ref ?? "",
      workActivity: risk?.workActivity ?? "",
      initiatorComment: risk?.initiatorComment ?? "",
      vesselDepartment: risk?.vesselDepartment ?? "",
      fleet: risk?.fleet ?? "",
      libraryIndex: risk?.libraryIndex ?? "",
      libraryCategory: risk?.libraryCategory ?? "",
      reviewDate: risk?.reviewDate ?? null,
      approvedBy: risk?.approvedBy ?? "",
      emergencyResponse: risk?.emergencyResponse ?? "",

      assessmentRows: risk?.assessmentRows?.map((row) => ({
        id: row.id,
        hazard: row.hazard,
        impact: row.impact,
        existingControls: row.existingControls ?? "",
        sct: row.sct ?? null,
        c: row.c ?? null,
        f: row.f ?? null,
        rf: row.rf ?? null,
        rfColor: (row.rfColor as "GREEN" | "YELLOW" | "RED" | null) ?? null,
        order: row.order,
        additionalMeasures:
          row.additionalMeasures?.map((m) => ({
            id: m.id,
            furtherAction: m.furtherAction ?? "",
            c: m.c ?? null,
            f: m.f ?? null,
            rf: m.rf ?? null,
            rfColor: (m.rfColor as "GREEN" | "YELLOW" | "RED" | null) ?? null,
            order: m.order,
          })) ?? [],
      })) ?? [
        {
          hazard: "",
          impact: "",
          existingControls: "",
          sct: null,
          c: null,
          f: null,
          rf: null,
          rfColor: null,
          order: 0,
          additionalMeasures: [],
        },
      ],

      teamMembers:
        risk?.teamMembers?.map((m) => ({ id: m.id, name: m.name })) ?? [],
      responsiblePersons:
        risk?.responsiblePersons?.map((p) => ({ id: p.id, name: p.name })) ??
        [],
    },
  });

  const {
    fields: assessmentFields,
    append: appendRow,
    remove: removeRow,
  } = useFieldArray({ control, name: "assessmentRows" });

  const {
    fields: teamFields,
    append: appendTeam,
    remove: removeTeam,
  } = useFieldArray({ control, name: "teamMembers" });

  const {
    fields: responsibleFields,
    append: appendResponsible,
    remove: removeResponsible,
  } = useFieldArray({ control, name: "responsiblePersons" });

  const alternativeWays = watch("alternativeWays");

  /**
   * onSubmit — behavior depends on mode:
   * Create → createRisk (TEMPLATE)
   * Edit TEMPLATE → updateTemplate
   * Edit DRAFT → submitDraft (DRAFT → COMPLETED)
   * Edit COMPLETED → updateCompleted (dates only)
   */
  const onSubmit = async (data: RiskFormValues) => {
    setLoading(true);
    try {
      let result;

      if (!isEditMode) {
        // Create new TEMPLATE
        result = await createRisk(data);
      } else if (isTemplate) {
        // Update existing TEMPLATE (Admin only)
        result = await updateTemplate(risk!.id, data);
      } else if (isDraft) {
        // Submit DRAFT → COMPLETED
        result = await submitDraft(risk!.id, data);
      } else if (isCompleted) {
        // Update COMPLETED dates only
        result = await updateCompleted(
          risk!.id,
          data.initiationDate,
          data.reviewDate ?? null,
        );
      }

      if (result?.success) {
        toast.success(
          !isEditMode
            ? "Template created successfully!"
            : isTemplate
              ? "Template updated successfully!"
              : isDraft
                ? "Risk assessment submitted!"
                : "Dates updated successfully!",
        );
        router.push("/dashboard");
      } else {
        toast.error(result?.error ?? "Something went wrong");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /**
   * onSaveDraft — saves DRAFT progress without submitting
   * Only available when editing a DRAFT.
   */
  const onSaveDraft = async () => {
    setDraftLoading(true);
    try {
      const data = getValues();
      const result = await updateRisk(risk!.id, data);
      if (result.success) {
        toast.success("Draft saved!");
        router.push("/dashboard");
      } else {
        toast.error(result.error ?? "Failed to save draft");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDraftLoading(false);
    }
  };

  /**
   * onUpdateDates — updates only dates on a COMPLETED risk
   * Bypasses Zod validation entirely — just reads the two date values
   * directly from the form. Allows past dates.
   */
  const onUpdateDates = async () => {
    setLoading(true);
    try {
      const initiationDate = getValues("initiationDate");
      const reviewDate = getValues("reviewDate");

      const result = await updateCompleted(
        risk!.id,
        initiationDate,
        reviewDate ?? null,
      );
      if (result.success) {
        toast.success("Dates updated successfully!");
        router.push("/dashboard");
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ─── Shared Tailwind classes ────────────────────────────────────────────
  const inputClass =
    "px-3 py-2 rounded-lg border border-[#A8D5B5] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-full text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A7A4A] transition-colors";
  const lockedInputClass =
    "px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm w-full text-slate-400 dark:text-slate-500 cursor-not-allowed";
  const labelClass =
    "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1";
  const errorClass = "text-xs text-red-500 mt-1";
  const sectionClass =
    "rounded-xl border border-[#A8D5B5] dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm shadow-[#A8D5B5]/40 p-6 mb-6";
  const sectionHeadingClass =
    "text-xs font-bold uppercase tracking-widest text-[#1A7A4A] dark:text-emerald-400 mb-5 pb-2 border-b border-[#D4EAD9] dark:border-slate-700";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ── Section 1 — Basic Information ─────────────────────────────────── */}
      <div className={sectionClass}>
        <h2 className={sectionHeadingClass}>Basic Information</h2>

        {/* Show lock notice when editing DRAFT or COMPLETED */}
        {fieldsLocked && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
            🔒 Some fields are locked — they cannot be changed after the
            template was created.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ref — locked for DRAFT and COMPLETED */}
          <div>
            <label className={labelClass}>Ref *</label>
            <Input
              {...register("ref")}
              placeholder="e.g. RA-N-006"
              disabled={fieldsLocked}
              className={
                fieldsLocked
                  ? lockedInputClass
                  : "border-[#A8D5B5] focus-visible:ring-[#1A7A4A]"
              }
            />
            {errors.ref && <p className={errorClass}>{errors.ref.message}</p>}
          </div>

          {/* Initiator — locked for DRAFT and COMPLETED */}
          <div>
            <label className={labelClass}>Initiator *</label>
            <Input
              {...register("initiator")}
              disabled={fieldsLocked}
              className={
                fieldsLocked
                  ? lockedInputClass
                  : "border-[#A8D5B5] focus-visible:ring-[#1A7A4A]"
              }
            />
            {errors.initiator && (
              <p className={errorClass}>{errors.initiator.message}</p>
            )}
          </div>

          {/* Initiation Date — editable for all */}
          <div>
            <label className={labelClass}>Initiation Date *</label>
            <Input
              type="date"
              defaultValue={
                risk?.initiationDate
                  ? new Date(risk.initiationDate).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0]
              }
              onChange={(e) =>
                setValue("initiationDate", new Date(e.target.value))
              }
              className="border-[#A8D5B5] focus-visible:ring-[#1A7A4A]"
            />
            {errors.initiationDate && (
              <p className={errorClass}>{errors.initiationDate.message}</p>
            )}
          </div>

          {/* Review Date — editable for all */}
          <div>
            <label className={labelClass}>Review Date</label>
            <Input
              type="date"
              defaultValue={
                risk?.reviewDate
                  ? new Date(risk.reviewDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setValue(
                  "reviewDate",
                  e.target.value ? new Date(e.target.value) : null,
                )
              }
              className="border-[#A8D5B5] focus-visible:ring-[#1A7A4A]"
            />
          </div>

          {/* RA Type — locked for DRAFT and COMPLETED */}
          <div>
            <label className={labelClass}>RA Type *</label>
            <select
              {...register("raType")}
              disabled={fieldsLocked}
              className={fieldsLocked ? lockedInputClass : inputClass}
            >
              <option value="NON_ROUTINE">Non Routine</option>
              <option value="ROUTINE">Routine</option>
            </select>
          </div>

          {/* Category — locked for DRAFT and COMPLETED */}
          <div>
            <label className={labelClass}>Category</label>
            <select
              {...register("libraryCategory")}
              disabled={fieldsLocked}
              className={fieldsLocked ? lockedInputClass : inputClass}
            >
              <option value="">— Select —</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Library Index — locked for DRAFT and COMPLETED */}
          <div>
            <label className={labelClass}>Library Index</label>
            <Input
              {...register("libraryIndex")}
              placeholder="e.g. Access to deck in adverse weather"
              disabled={fieldsLocked}
              className={
                fieldsLocked
                  ? lockedInputClass
                  : "border-[#A8D5B5] focus-visible:ring-[#1A7A4A]"
              }
            />
          </div>

          {/* Vessel / Department — locked for DRAFT and COMPLETED */}
          <div>
            <label className={labelClass}>Vessel / Department</label>
            <Input
              {...register("vesselDepartment")}
              placeholder="e.g. M/V Mobile Voyager"
              disabled={fieldsLocked}
              className={
                fieldsLocked
                  ? lockedInputClass
                  : "border-[#A8D5B5] focus-visible:ring-[#1A7A4A]"
              }
            />
          </div>

          {/* Fleet — locked for DRAFT and COMPLETED */}
          <div>
            <label className={labelClass}>Fleet</label>
            <Input
              {...register("fleet")}
              placeholder="e.g. MMI Mobile Marine International"
              disabled={fieldsLocked}
              className={
                fieldsLocked
                  ? lockedInputClass
                  : "border-[#A8D5B5] focus-visible:ring-[#1A7A4A]"
              }
            />
          </div>

          {/* Defect Related — locked for DRAFT and COMPLETED */}
          <div>
            <label className={labelClass}>
              Is the case related with a defect?
            </label>
            <select
              className={fieldsLocked ? lockedInputClass : inputClass}
              onChange={(e) =>
                setValue("defectRelated", e.target.value === "true")
              }
              defaultValue={risk?.defectRelated ? "true" : "false"}
              disabled={fieldsLocked}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>

        {/* Work Activity — locked for COMPLETED */}
        <div className="mt-4">
          <label className={labelClass}>Work Activity Being Assessed *</label>
          <Textarea
            {...register("workActivity")}
            rows={3}
            disabled={allLocked}
            className={
              allLocked
                ? lockedInputClass
                : "border-[#A8D5B5] focus-visible:ring-[#1A7A4A]"
            }
          />
          {errors.workActivity && (
            <p className={errorClass}>{errors.workActivity.message}</p>
          )}
        </div>

        {/* Initiator Comments — locked for COMPLETED */}
        <div className="mt-4">
          <label className={labelClass}>Initiator Comments</label>
          <Textarea
            {...register("initiatorComment")}
            rows={3}
            disabled={allLocked}
            className={
              allLocked
                ? lockedInputClass
                : "border-[#A8D5B5] focus-visible:ring-[#1A7A4A]"
            }
          />
        </div>

        {/* Emergency Response — locked for COMPLETED */}
        <div className="mt-4">
          <label className={labelClass}>General Requirements / <span className="font-bold text-red-500">EMERGENCY RESPONSE</span></label>
          <Textarea
            {...register("emergencyResponse")}
            rows={3}
            disabled={allLocked}
            className={
              allLocked
                ? lockedInputClass
                : "border-[#A8D5B5] focus-visible:ring-[#1A7A4A]"
            }
          />
        </div>
      </div>

      {/* ── Section 2 — Assessment of Risk ────────────────────────────────── */}
      {/* Hidden for COMPLETED — dates only editing */}
      {!isCompleted && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>Assessment of Risk</h2>

          {errors.assessmentRows && (
            <p className={errorClass}>{errors.assessmentRows.message}</p>
          )}

          <div className="space-y-6">
            {assessmentFields.map((field, index) => (
              <AssessmentRowField
                key={field.id}
                index={index}
                control={control}
                register={register}
                errors={errors}
                sctOptions={SCT_OPTIONS}
                onRemove={() => removeRow(index)}
                /**
                 * canRemove — only allow removing rows that were just added
                 * (no id = new row). Existing rows from DB cannot be removed
                 * when editing a DRAFT.
                 */
                canRemove={
                  assessmentFields.length > 1 &&
                  (!isDraft || index >= originalRowCount)
                }
                setValue={setValue}
                /**
                 * isExistingRow — true if row came from DB (has an id)
                 * Used to lock existing rows when editing DRAFT
                 */
                isExistingRow={isDraft && index < originalRowCount}
                originalMeasureCount={
                  risk?.assessmentRows?.[index]?.additionalMeasures?.length ?? 0
                }
              />
            ))}
          </div>

          {/* Can always add new rows */}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              appendRow({
                hazard: "",
                impact: "",
                existingControls: "",
                sct: null,
                c: null,
                f: null,
                rf: null,
                rfColor: null,
                order: assessmentFields.length,
                additionalMeasures: [],
              })
            }
            className="mt-4 border-[#1A7A4A] text-[#1A7A4A] hover:bg-[#EEF5F0] hover:text-[#145f39]"
          >
            + Add another assessment row
          </Button>
        </div>
      )}

      {/* ── Section 3 — Alternative Ways — locked for COMPLETED ───────────── */}
      {!isCompleted && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>
            Alternative Ways to Carry Out the Work
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <Button
              type="button"
              variant={alternativeWays ? "default" : "outline"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setValue("alternativeWays", true, {
                  shouldDirty: false,
                  shouldValidate: false,
                });
              }}
              className={
                alternativeWays
                  ? "bg-[#1A7A4A] text-white hover:bg-[#145f39]"
                  : "border-[#A8D5B5] text-slate-600"
              }
            >
              Yes
            </Button>
            <Button
              type="button"
              variant={!alternativeWays ? "default" : "outline"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setValue("alternativeWays", false, {
                  shouldDirty: false,
                  shouldValidate: false,
                });
              }}
              className={
                !alternativeWays
                  ? "bg-[#1A7A4A] text-white hover:bg-[#145f39]"
                  : "border-[#A8D5B5] text-slate-600"
              }
            >
              No
            </Button>
          </div>
          {alternativeWays && (
            <div>
              <label className={labelClass}>Describe alternative ways</label>
              <Textarea
                {...register("alternativeWaysText")}
                rows={3}
                className="border-[#A8D5B5] focus-visible:ring-[#1A7A4A]"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Section 4 — Responsible Persons — locked for COMPLETED ────────── */}
      {!isCompleted && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>Responsible Persons</h2>
          <div className="space-y-3">
            {responsibleFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3">
                <Input
                  {...register(`responsiblePersons.${index}.name`)}
                  placeholder="Person name"
                  className="border-[#A8D5B5] focus-visible:ring-[#1A7A4A]"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeResponsible(index)}
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
            onClick={() => appendResponsible({ name: "" })}
            className="mt-4 border-[#1A7A4A] text-[#1A7A4A] hover:bg-[#EEF5F0] hover:text-[#145f39]"
          >
            + Add responsible person
          </Button>
        </div>
      )}

      {/* ── Section 5 — Risk Assessment Team — locked for COMPLETED ───────── */}
      {!isCompleted && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>Risk Assessment Team</h2>
          <div className="space-y-3">
            {teamFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3">
                <Input
                  {...register(`teamMembers.${index}.name`)}
                  placeholder="Person name"
                  className="border-[#A8D5B5] focus-visible:ring-[#1A7A4A]"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeTeam(index)}
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
            onClick={() => appendTeam({ name: "" })}
            className="mt-4 border-[#1A7A4A] text-[#1A7A4A] hover:bg-[#EEF5F0] hover:text-[#145f39]"
          >
            + Add team representative
          </Button>
        </div>
      )}

      {/* ── Section 6 — Approved By (Admin + Manager only) ────────────────── */}
      {(currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER") && (
        <div className={sectionClass}>
          <h2 className={sectionHeadingClass}>Approval</h2>
          <div>
            <label className={labelClass}>Approved by the office</label>
            {isCompleted ? (
              // Read-only when COMPLETED — just show the value
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {currentUser?.name ?? currentUser?.email}
                </span>
                <span className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-500 w-full">
                  {risk?.approvedBy ?? "—"}
                </span>
              </div>
            ) : (
              // Editable when DRAFT or TEMPLATE
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {currentUser?.name ?? currentUser?.email}
                </span>
                <Input
                  {...register("approvedBy")}
                  placeholder="Approved by the office"
                  className="border-[#A8D5B5] focus-visible:ring-[#1A7A4A]"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Submit / Save Draft / Cancel / Delete ─────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-10">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Submit button — label changes based on mode */}
          <Button
            type={isCompleted ? "button" : "submit"}
            disabled={loading || draftLoading}
            onClick={isCompleted ? onUpdateDates : undefined}
            className="px-8 py-3 bg-[#1A7A4A] text-white hover:bg-[#145f39] shadow-sm shadow-[#1A7A4A]/20"
          >
            {loading
              ? "Submitting..."
              : !isEditMode
                ? "Create Template"
                : isTemplate
                  ? "Update Template"
                  : isDraft
                    ? "Submit"
                    : "Update Dates"}
          </Button>

          {/* Save Draft — only when editing a DRAFT */}
          {isDraft && (
            <Button
              type="button"
              disabled={loading || draftLoading}
              onClick={onSaveDraft}
              className="px-8 py-3 bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
            >
              {draftLoading ? "Saving..." : "Save Draft"}
            </Button>
          )}

          {/* Cancel */}
          <Button
            type="button"
            variant="outline"
            disabled={loading || draftLoading}
            onClick={() => router.push("/dashboard")}
            className="border-[#A8D5B5] text-slate-600 hover:bg-[#EEF5F0]"
          >
            Cancel
          </Button>
        </div>

        {/* Delete — ADMIN only, edit mode only */}
        {isEditMode && currentUser?.role === "ADMIN" && (
          <DeleteRiskButton riskId={risk!.id} />
        )}
      </div>
    </form>
  );
}

/**
 * DeleteRiskButton — Confirmation dialog before deleting a risk
 * Only rendered for ADMIN users in edit mode.
 */
function DeleteRiskButton({ riskId }: { riskId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteRisk(riskId);
      if (result.success) {
        toast.success("Risk assessment deleted.");
        router.push("/dashboard");
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
          Delete Risk
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Risk Assessment?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The risk assessment and all its data
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
