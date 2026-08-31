"use client";

/**
 * AssessmentRowField — Single assessment row inside the risk form
 *
 * Props:
 *  - isExistingRow: true when row came from DB (editing DRAFT)
 *    → locks all inputs, still allows adding new additional measures
 */

import {
  useFieldArray,
  Control,
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
  useWatch,
} from "react-hook-form";
import { RiskFormValues } from "@/lib/validations/risk.schema";
import { Button } from "@/components/ui/button";

type Props = {
  index: number;
  control: Control<RiskFormValues>;
  register: UseFormRegister<RiskFormValues>;
  errors: FieldErrors<RiskFormValues>;
  sctOptions: { value: string; label: string }[];
  onRemove: () => void;
  canRemove: boolean;
  setValue: UseFormSetValue<RiskFormValues>;
  isExistingRow?: boolean;
  originalMeasureCount?: number;
};

const RF_COLORS = [
  { value: "GREEN", bg: "bg-green-500", border: "border-green-600" },
  { value: "YELLOW", bg: "bg-yellow-400", border: "border-yellow-500" },
  { value: "RED", bg: "bg-red-600", border: "border-red-700" },
];

const getRFDisplayColor = (color: string | null | undefined) => {
  if (color === "GREEN") return "bg-green-500 text-white";
  if (color === "YELLOW") return "bg-yellow-400 text-white";
  if (color === "RED") return "bg-red-600 text-white";
  return "bg-zinc-100 text-zinc-400";
};

export default function AssessmentRowField({
  index,
  control,
  register,
  errors,
  sctOptions,
  onRemove,
  canRemove,
  setValue,
  isExistingRow = false,
  originalMeasureCount = 0,
}: Props) {
  // ─── Classes — switch between editable and locked ─────────────────────
  const inputClass = isExistingRow
    ? "px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm w-full text-slate-400 dark:text-slate-500 cursor-not-allowed"
    : "px-3 py-2 rounded-lg border border-[#A8D5B5] dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#1A7A4A] transition-colors";

  const labelClass =
    "block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1";

  const {
    fields: measureFields,
    append: appendMeasure,
    remove: removeMeasure,
  } = useFieldArray({
    control,
    name: `assessmentRows.${index}.additionalMeasures`,
  });

  const rowValues = useWatch({ control, name: `assessmentRows.${index}` });
  const measures = useWatch({
    control,
    name: `assessmentRows.${index}.additionalMeasures`,
  });

  const rfColor = rowValues?.rfColor;

  return (
    <div
      className={`rounded-xl border p-5 ${
        isExistingRow
          ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
          : "border-[#A8D5B5] dark:border-zinc-700 bg-white dark:bg-zinc-950"
      }`}
    >
      {/* ── Row header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#D4EAD9] dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1A7A4A] dark:text-emerald-400">
            Assessment Row {index + 1}
          </span>
          {/* Lock badge for existing rows */}
          {isExistingRow && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
              🔒 locked
            </span>
          )}
        </div>
        {canRemove && (
          <Button
            type="button"
            variant="outline"
            onClick={onRemove}
            className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 text-xs"
          >
            Remove row
          </Button>
        )}
      </div>

{/* ── Responsible Person ────────────────────────────────────────── */}
<div className="mb-4">
  <label className={labelClass}>Responsible Person</label>
  <input
    type="text"
    {...register(`assessmentRows.${index}.responsiblePerson`)}
    disabled={isExistingRow}
    placeholder="Responsible person"
    className={inputClass}
  />
</div>

{/* ── Hazard / Impact / Existing Controls ─────────────────────────── */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
  <div>
    <label className={labelClass}>Hazard *</label>
    <textarea
      {...register(`assessmentRows.${index}.hazard`)}
      rows={3}
      disabled={isExistingRow}
      className={inputClass}
    />
    {errors.assessmentRows?.[index]?.hazard && (
      <p className="text-xs text-red-500 mt-1">
        {errors.assessmentRows[index]?.hazard?.message}
      </p>
    )}
  </div>
  <div>
    <label className={labelClass}>Impact *</label>
    <textarea
      {...register(`assessmentRows.${index}.impact`)}
      rows={3}
      disabled={isExistingRow}
      className={inputClass}
    />
    {errors.assessmentRows?.[index]?.impact && (
      <p className="text-xs text-red-500 mt-1">
        {errors.assessmentRows[index]?.impact?.message}
      </p>
    )}
  </div>
  <div>
    <label className={labelClass}>Existing Control Measures</label>
    <textarea
      {...register(`assessmentRows.${index}.existingControls`)}
      rows={3}
      disabled={isExistingRow}
      className={inputClass}
    />
  </div>
</div>

      {/* ── SCT / C / F / RF / RF Color ─────────────────────────────────── */}
      <div className="flex items-end gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-40">
          <label className={labelClass}>SCT</label>
          <select
            {...register(`assessmentRows.${index}.sct`)}
            disabled={isExistingRow}
            className={inputClass}
          >
            {sctOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-20">
          <label className={labelClass}>C (1-5)</label>
          <input
            type="number"
            min={1}
            max={5}
            {...register(`assessmentRows.${index}.c`, { valueAsNumber: true })}
            disabled={isExistingRow}
            className={inputClass}
          />
        </div>

        <div className="w-20">
          <label className={labelClass}>F (1-10)</label>
          <input
            type="number"
            min={1}
            max={10}
            {...register(`assessmentRows.${index}.f`, { valueAsNumber: true })}
            disabled={isExistingRow}
            className={inputClass}
          />
        </div>

        <div className="w-24">
          <label className={labelClass}>RF (1-25)</label>
          <input
            type="number"
            min={1}
            max={25}
            {...register(`assessmentRows.${index}.rf`, { valueAsNumber: true })}
            disabled={isExistingRow}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>RF Color</label>
          <div className="flex gap-2 h-9 items-center">
            {RF_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                disabled={isExistingRow}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isExistingRow) return;
                  setValue(
                    `assessmentRows.${index}.rfColor`,
                    c.value as "GREEN" | "YELLOW" | "RED",
                    { shouldDirty: false, shouldValidate: false },
                  );
                }}
                className={`w-8 h-8 rounded-lg transition-all ${c.bg} ${
                  isExistingRow
                    ? "opacity-30 cursor-not-allowed"
                    : rfColor === c.value
                      ? `border-2 ${c.border} scale-110`
                      : "border-2 border-transparent opacity-50"
                }`}
              />
            ))}
            {rfColor && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${getRFDisplayColor(rfColor)}`}
              >
                {rfColor}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Additional Measures ──────────────────────────────────────────── */}
      {measureFields.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1A7A4A] dark:text-emerald-400 mb-3">
            Additional Control Measures
          </p>
          <div className="space-y-3">
            {measureFields.map((measure, mIndex) => {
              const mRfColor = measures?.[mIndex]?.rfColor;
              /**
               * isExistingMeasure — true if measure came from DB
               * New measures added during editing are always editable
               */
              const isExistingMeasure =
                isExistingRow && mIndex < originalMeasureCount;

              const measureInputClass = isExistingMeasure
                ? "px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm w-full text-slate-400 cursor-not-allowed"
                : "px-3 py-2 rounded-lg border border-[#A8D5B5] dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#1A7A4A] transition-colors";

              return (
                <div
                  key={measure.id}
                  className={`rounded-lg border p-4 ${
                    isExistingMeasure
                      ? "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
                      : "border-[#D4EAD9] dark:border-zinc-800 bg-[#F5FAF6] dark:bg-zinc-900"
                  }`}
                >
                  {isExistingMeasure && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 mb-2 inline-block">
                      🔒 locked
                    </span>
                  )}

                  <div className="mb-3">
                    <label className={labelClass}>Further Action</label>
                    <textarea
                      {...register(
                        `assessmentRows.${index}.additionalMeasures.${mIndex}.furtherAction`,
                      )}
                      rows={2}
                      disabled={isExistingMeasure}
                      className={measureInputClass}
                    />
                  </div>

                  <div className="flex items-end gap-3 flex-wrap">
                    <div className="w-20">
                      <label className={labelClass}>C (1-5)</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        {...register(
                          `assessmentRows.${index}.additionalMeasures.${mIndex}.c`,
                          { valueAsNumber: true },
                        )}
                        disabled={isExistingMeasure}
                        className={measureInputClass}
                      />
                    </div>

                    <div className="w-20">
                      <label className={labelClass}>F (1-10)</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        {...register(
                          `assessmentRows.${index}.additionalMeasures.${mIndex}.f`,
                          { valueAsNumber: true },
                        )}
                        disabled={isExistingMeasure}
                        className={measureInputClass}
                      />
                    </div>

                    <div className="w-24">
                      <label className={labelClass}>RF (1-25)</label>
                      <input
                        type="number"
                        min={1}
                        max={25}
                        {...register(
                          `assessmentRows.${index}.additionalMeasures.${mIndex}.rf`,
                          { valueAsNumber: true },
                        )}
                        disabled={isExistingMeasure}
                        className={measureInputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>RF Color</label>
                      <div className="flex gap-2 h-9 items-center">
                        {RF_COLORS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            disabled={isExistingMeasure}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (isExistingMeasure) return;
                              setValue(
                                `assessmentRows.${index}.additionalMeasures.${mIndex}.rfColor`,
                                c.value as "GREEN" | "YELLOW" | "RED",
                                { shouldDirty: false, shouldValidate: false },
                              );
                            }}
                            className={`w-8 h-8 rounded-lg transition-all ${c.bg} ${
                              isExistingMeasure
                                ? "opacity-30 cursor-not-allowed"
                                : mRfColor === c.value
                                  ? `border-2 ${c.border} scale-110`
                                  : "border-2 border-transparent opacity-50"
                            }`}
                          />
                        ))}
                        {mRfColor && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${getRFDisplayColor(mRfColor)}`}
                          >
                            {mRfColor}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remove — only for new measures, not existing */}
                    {!isExistingMeasure && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeMeasure(mIndex)}
                        className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 text-xs"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add new measure — always available even on existing rows */}
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          appendMeasure({
            furtherAction: "",
            c: null,
            f: null,
            rf: null,
            rfColor: null,
            order: measureFields.length,
          })
        }
        className="text-xs border-[#A8D5B5] text-[#1A7A4A] hover:bg-[#EEF5F0] hover:text-[#145f39]"
      >
        + Add additional control measure
      </Button>
    </div>
  );
}
