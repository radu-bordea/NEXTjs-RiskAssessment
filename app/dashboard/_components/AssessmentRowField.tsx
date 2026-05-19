"use client"

import {
  useFieldArray,
  Control,
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
  useWatch,
} from "react-hook-form"
import { RiskFormValues } from "@/lib/validations/risk.schema"

type Props = {
  index: number
  control: Control<RiskFormValues>
  register: UseFormRegister<RiskFormValues>
  errors: FieldErrors<RiskFormValues>
  sctOptions: { value: string; label: string }[]
  onRemove: () => void
  canRemove: boolean
  setValue: UseFormSetValue<RiskFormValues>
}

const getRFColor = (rf: number | null | undefined) => {
  if (!rf) return "bg-zinc-100 text-zinc-400"
  if (rf <= 4) return "bg-green-500 text-white"
  if (rf <= 8) return "bg-yellow-400 text-white"
  return "bg-red-600 text-white"
}

export default function AssessmentRowField({
  index,
  control,
  register,
  errors,
  sctOptions,
  onRemove,
  canRemove,
}: Props) {
  const inputClass =
    "px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
  const labelClass =
    "block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1"

  const {
    fields: measureFields,
    append: appendMeasure,
    remove: removeMeasure,
  } = useFieldArray({
    control,
    name: `assessmentRows.${index}.additionalMeasures`,
  })

  // ✅ watch only row values
  const rowValues = useWatch({
    control,
    name: `assessmentRows.${index}`,
  })

  const c = rowValues?.c
  const f = rowValues?.f
  const rf = c && f ? c * f : null

  // ✅ watch full measures array once (NO map watch calls)
  const measures = useWatch({
    control,
    name: `assessmentRows.${index}.additionalMeasures`,
  })

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Assessment Row {index + 1}
        </span>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
          >
            Remove row
          </button>
        )}
      </div>

      {/* Hazard / Impact / Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className={labelClass}>Hazard *</label>
          <textarea
            {...register(`assessmentRows.${index}.hazard`)}
            rows={3}
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
            className={inputClass}
          />
        </div>
      </div>

      {/* SCT / C / F / RF */}
      <div className="flex items-end gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-40">
          <label className={labelClass}>SCT</label>
          <select
            {...register(`assessmentRows.${index}.sct`)}
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
          <label className={labelClass}>C (1-6)</label>
          <input
            type="number"
            min={1}
            max={6}
            {...register(`assessmentRows.${index}.c`, {
              valueAsNumber: true,
            })}
            className={inputClass}
          />
        </div>

        <div className="w-20">
          <label className={labelClass}>F (1-6)</label>
          <input
            type="number"
            min={1}
            max={6}
            {...register(`assessmentRows.${index}.f`, {
              valueAsNumber: true,
            })}
            className={inputClass}
          />
        </div>

        <div className="w-20">
          <label className={labelClass}>RF</label>
          <div
            className={`h-9.5 flex items-center justify-center rounded-lg font-bold text-sm ${getRFColor(
              rf
            )}`}
          >
            {rf ?? "—"}
          </div>
        </div>
      </div>

      {/* Additional Measures */}
      {measureFields.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
            Additional Control Measures
          </p>

          <div className="space-y-3">
            {measureFields.map((measure, mIndex) => {
              const mc = measures?.[mIndex]?.c
              const mf = measures?.[mIndex]?.f
              const mrf = mc && mf ? mc * mf : null

              return (
                <div
                  key={measure.id}
                  className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4"
                >
                  <div className="flex gap-3 mb-3">
                    <div className="flex-1">
                      <label className={labelClass}>Further Action</label>
                      <textarea
                        {...register(
                          `assessmentRows.${index}.additionalMeasures.${mIndex}.furtherAction`
                        )}
                        rows={2}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="flex items-end gap-3 flex-wrap">
                    <div className="w-20">
                      <label className={labelClass}>C (1-6)</label>
                      <input
                        type="number"
                        min={1}
                        max={6}
                        {...register(
                          `assessmentRows.${index}.additionalMeasures.${mIndex}.c`,
                          { valueAsNumber: true }
                        )}
                        className={inputClass}
                      />
                    </div>

                    <div className="w-20">
                      <label className={labelClass}>F (1-6)</label>
                      <input
                        type="number"
                        min={1}
                        max={6}
                        {...register(
                          `assessmentRows.${index}.additionalMeasures.${mIndex}.f`,
                          { valueAsNumber: true }
                        )}
                        className={inputClass}
                      />
                    </div>

                    <div className="w-20">
                      <label className={labelClass}>RF</label>
                      <div
                        className={`h-9.5 flex items-center justify-center rounded-lg font-bold text-sm ${getRFColor(
                          mrf
                        )}`}
                      >
                        {mrf ?? "—"}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeMeasure(mIndex)}
                      className="text-xs px-3 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add measure */}
      <button
        type="button"
        onClick={() =>
          appendMeasure({
            furtherAction: "",
            c: null,
            f: null,
            order: measureFields.length,
          })
        }
        className="text-xs px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        + Add additional control measure
      </button>
    </div>
  )
}