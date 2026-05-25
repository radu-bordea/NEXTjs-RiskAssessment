"use client";

import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  riskSchema,
  riskDraftSchema,
  RiskFormValues,
} from "@/lib/validations/risk.schema";
import { createRisk, saveDraft } from "@/app/actions/risk.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AssessmentRowField from "./AssessmentRowField";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

const SCT_OPTIONS = [
  { value: "", label: "— Select —" },
  { value: "NO", label: "No" },
  { value: "YES_SLIPS", label: "Yes, Slips or lapses" },
  { value: "YES_SKILL", label: "Yes, Skill based" },
  { value: "YES_MISTAKE_RULE", label: "Yes, mistake rule based" },
  { value: "YES_MISTAKE_KNOWLEDGE", label: "Yes, mistake knowledge based" },
  { value: "YES_VIOLATION", label: "Yes, violation" },
];

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

export default function RiskForm({ currentUser }: { currentUser: User }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  /** Separate loading state for draft — prevents submit and draft firing together */
  const [draftLoading, setDraftLoading] = useState(false);

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
      initiator: currentUser?.name ?? currentUser?.email ?? "",
      initiationDate: new Date(),
      raType: "NON_ROUTINE",
      defectRelated: false,
      alternativeWays: false,
      assessmentRows: [
        {
          hazard: "",
          impact: "",
          existingControls: "",
          sct: null,
          c: null,
          f: null,
          order: 0,
          additionalMeasures: [],
        },
      ],
      teamMembers: [],
      responsiblePersons: [],
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

  const onSubmit = async (data: RiskFormValues) => {
    setLoading(true);
    try {
      const result = await createRisk(data);
      if (result.success) {
        toast.success("Risk assessment created successfully!");
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
  /**
   * onSaveDraft — saves current form state as DRAFT
   * Uses getValues() to read form without triggering validation
   * so partially filled forms can be saved.
   */
  const onSaveDraft = async () => {
    setDraftLoading(true);
    try {
      const data = getValues(); // reads form without validation
      const result = await saveDraft(data);
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

  const inputClass =
    "px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#1D9E75]";
  const labelClass =
    "block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1";
  const errorClass = "text-xs text-red-500 mt-1";
  const sectionClass =
    "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6 mb-6";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section 1 — Basic Info */}
      <div className={sectionClass}>
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-5">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Ref *</label>
            <Input {...register("ref")} placeholder="e.g. RA-N-006" />
            {errors.ref && <p className={errorClass}>{errors.ref.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Initiator *</label>
            <Input {...register("initiator")} />
            {errors.initiator && (
              <p className={errorClass}>{errors.initiator.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Initiation Date *</label>
            <Input
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setValue("initiationDate", new Date(e.target.value))
              }
            />
            {errors.initiationDate && (
              <p className={errorClass}>{errors.initiationDate.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Review Date</label>
            <Input
              type="date"
              onChange={(e) =>
                setValue(
                  "reviewDate",
                  e.target.value ? new Date(e.target.value) : null,
                )
              }
            />
          </div>

          <div>
            <label className={labelClass}>RA Type *</label>
            <select {...register("raType")} className={inputClass}>
              <option value="NON_ROUTINE">Non Routine</option>
              <option value="ROUTINE">Routine</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Category</label>
            <select {...register("libraryCategory")} className={inputClass}>
              <option value="">— Select —</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Library Index</label>
            <Input
              {...register("libraryIndex")}
              placeholder="e.g. Access to deck in adverse weather"
            />
          </div>

          <div>
            <label className={labelClass}>Vessel / Department</label>
            <Input
              {...register("vesselDepartment")}
              placeholder="e.g. M/V Mobile Voyager"
            />
          </div>

          <div>
            <label className={labelClass}>Fleet</label>
            <Input
              {...register("fleet")}
              placeholder="e.g. MMI Mobile Marine International"
            />
          </div>

          <div>
            <label className={labelClass}>
              Is the case related with a defect?
            </label>
            <select
              className={inputClass}
              onChange={(e) =>
                setValue("defectRelated", e.target.value === "true")
              }
              defaultValue="false"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass}>Work Activity Being Assessed *</label>
          <Textarea {...register("workActivity")} rows={3} />
          {errors.workActivity && (
            <p className={errorClass}>{errors.workActivity.message}</p>
          )}
        </div>

        <div className="mt-4">
          <label className={labelClass}>Initiator Comments</label>
          <Textarea {...register("initiatorComment")} rows={3} />
        </div>
      </div>

      {/* Section 2 — Assessment of Risk */}
      <div className={sectionClass}>
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-5">
          Assessment of Risk
        </h2>
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
              canRemove={assessmentFields.length > 1}
              setValue={setValue}
            />
          ))}
        </div>

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
              order: assessmentFields.length,
              additionalMeasures: [],
            })
          }
          className="mt-4 border-[#1D9E75] text-[#1D9E75] hover:bg-[#E1F5EE] hover:text-[#0F6E56]"
        >
          + Add another assessment row
        </Button>
      </div>

      {/* Section 3 — Alternative Ways */}
      <div className={sectionClass}>
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-5">
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
                ? "bg-[#0F6E56] text-[#E1F5EE] hover:bg-[#085041]"
                : ""
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
                ? "bg-[#0F6E56] text-[#E1F5EE] hover:bg-[#085041]"
                : ""
            }
          >
            No
          </Button>
        </div>
        {alternativeWays && (
          <div>
            <label className={labelClass}>Describe alternative ways</label>
            <Textarea {...register("alternativeWaysText")} rows={3} />
          </div>
        )}
      </div>

      {/* Section 4 — Responsible Persons */}
      <div className={sectionClass}>
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-5">
          Responsible Persons
        </h2>
        <div className="space-y-3">
          {responsibleFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-3">
              <Input
                {...register(`responsiblePersons.${index}.name`)}
                placeholder="Person name"
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
          className="mt-4 border-[#1D9E75] text-[#1D9E75] hover:bg-[#E1F5EE] hover:text-[#0F6E56]"
        >
          + Add responsible person
        </Button>
      </div>

      {/* Section 5 — Risk Assessment Team */}
      <div className={sectionClass}>
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-5">
          Risk Assessment Team
        </h2>
        <div className="space-y-3">
          {teamFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-3">
              <Input
                {...register(`teamMembers.${index}.name`)}
                placeholder="Person name"
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
          className="mt-4 border-[#1D9E75] text-[#1D9E75] hover:bg-[#E1F5EE] hover:text-[#0F6E56]"
        >
          + Add team representative
        </Button>
      </div>

      {/* ── Submit / Save Draft / Cancel ──────────────────────────────────── */}
      <div className="flex items-center gap-4 pb-10 flex-wrap">
        {/* Submit — full Zod validation, sets state to IN_PROGRESS */}
        <Button
          type="submit"
          disabled={loading || draftLoading}
          className="px-8 py-3 bg-[#1A7A4A] text-white hover:bg-[#145f39] shadow-sm shadow-[#1A7A4A]/20"
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>

        {/* Save Draft — relaxed validation, sets state to DRAFT */}
        <Button
          type="button"
          disabled={loading || draftLoading}
          onClick={onSaveDraft}
          className="px-8 py-3 bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
        >
          {draftLoading ? "Saving..." : "Save Draft"}
        </Button>

        {/* Cancel — returns to dashboard without saving */}
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
    </form>
  );
}
