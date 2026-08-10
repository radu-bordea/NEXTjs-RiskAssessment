import { z } from "zod";

/**
 * observationSchema — validates the full observation form
 *
 * Required fields: vesselProject, date, observerName, observationDescription
 * Everything else optional since not all sections apply to every observation.
 */
export const observationSchema = z.object({
  // ─── Section 1 — Observation Details ─────────────────────────────
  vesselProject: z.string().min(1, "Vessel / Project is required"),
  location: z.string().optional().nullable(),
  weatherSeaState: z.string().optional().nullable(),
  date: z.coerce.date({ message: "Date is required" }),
  time: z.string().optional().nullable(),
  observerName: z.string().min(1, "Observer name is required"),
  createdByField: z.string().min(1, "Created by field is required"),

  // ─── Section 2 — Observation Type ────────────────────────────────
  observationType: z.string().min(1, "Observation type is required"),
  stopWorkUsed: z.boolean().optional().nullable(),

  // ─── Section 3 — Observation Source ──────────────────────────────
  observationSource: z.string().optional().nullable(),
  observationSourceOther: z.string().optional().nullable(),

  // ─── Section 4 — Life Saving Rules ───────────────────────────────
  lifeSavingRules: z.array(z.string()).optional().default([]),
  lifeSavingRulesOther: z.string().optional().nullable(),

  // ─── Section 5 — Risk Priority ───────────────────────────────────
  riskPriority: z.string().optional().nullable(),
  hiPo: z.boolean().optional().nullable(),

  // ─── Section 6 — Observation Category ────────────────────────────
  categoryOperations: z.array(z.string()).optional().default([]),
  categoryOperationsOther: z.string().optional().nullable(),

  categorySurveyEquipment: z.string().optional().nullable(),
  categorySurveyEquipmentOther: z.string().optional().nullable(),

  categoryWorkActivities: z.array(z.string()).optional().default([]),
  categoryWorkActivitiesOther: z.string().optional().nullable(),

  categoryHazards: z.array(z.string()).optional().default([]),
  categoryHazardsOther: z.string().optional().nullable(),

  categoryEnvironment: z.array(z.string()).optional().default([]),
  categoryEnvironmentOther: z.string().optional().nullable(),

  // ─── Section 7 — Observation Description ─────────────────────────
  observationDescription: z
    .string()
    .min(1, "Observation description is required"),

  // ─── Section 8 — Immediate Action Taken ──────────────────────────
  immediateAction: z.string().optional().nullable(),

  // ─── Section 9 — Corrective / Preventive Action ──────────────────
  correctiveAction: z.string().optional().nullable(),
  correctiveActionDate: z.coerce.date().optional().nullable(),
  preventiveAction: z.string().optional().nullable(),
  preventiveActionDate: z.coerce.date().optional().nullable(),
  responsiblePerson: z.string().optional().nullable(),

  // ─── Section 10 — Root Cause ──────────────────────────────────────
  rootCauses: z.array(z.string()).optional().default([]),
  rootCauseOther: z.string().optional().nullable(),

  // ─── Section 11 — Potential Consequence ──────────────────────────
  potentialConsequences: z.array(z.string()).optional().default([]),
  potentialConsequenceOther: z.string().optional().nullable(),

  // ─── Section 12 — Lessons Learned ────────────────────────────────
  lessonsLearned: z.string().optional().nullable(),
  preventRecurrence: z.string().optional().nullable(),

  // ─── Section 13 — Close Out (Admin/Manager only) ─────────────────
  closedBy: z.string().optional().nullable(),
  dateClosed: z.coerce.date().optional().nullable(),
  correctiveActionEffective: z.boolean().optional().nullable(),
  furtherActionRequired: z.boolean().optional().nullable(),
  closeOutName: z.string().optional().nullable(),

  // ─── Document Footer ──────────────────────────────────────────────
  officeResponse: z.string().optional().nullable(),
  effectiveDate: z.coerce.date().optional().nullable(),
});

/**
 * observationDraftSchema — relaxed validation for saving progress
 * Only vesselProject and observerName required — everything else optional
 * since a draft can be incomplete.
 */
export const observationDraftSchema = observationSchema.partial({
  createdByField: true,
  observationType: true,
  observationDescription: true,
  date: true,
})

/** Type inferred from the schema — used for form state and action params */
export type ObservationFormValues = z.infer<typeof observationSchema>;
