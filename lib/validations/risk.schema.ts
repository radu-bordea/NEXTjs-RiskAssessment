import { z } from "zod";

const rfColorSchema = z.enum(["GREEN", "YELLOW", "RED"]).optional().nullable();

const additionalMeasureSchema = z.object({
  id: z.string().optional(),
  furtherAction: z.string().optional().nullable(),
  c: z.number().int().min(1).max(5).optional().nullable(),
  f: z.number().int().min(1).max(10).optional().nullable(),
  rf: z.number().int().min(1).max(25).optional().nullable(),
  rfColor: rfColorSchema,
  order: z.number().int().default(0),
});

const assessmentRowSchema = z.object({
  id: z.string().optional(),
  hazard: z.string().min(1, "Hazard is required"),
  impact: z.string().min(1, "Impact is required"),
  existingControls: z.string().optional(),
  sct: z.string().optional().nullable(), // the dropdown value
  c: z.number().int().min(1).max(5).optional().nullable(),
  f: z.number().int().min(1).max(10).optional().nullable(),
  rf: z.number().int().min(1).max(25).optional().nullable(),
  rfColor: rfColorSchema,
  order: z.number().int().default(0),
  additionalMeasures: z.array(additionalMeasureSchema).default([]),
});

const teamMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Team member name is required"),
});

const responsiblePersonsSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Responsible person name is required"),
});

// Full validation for Submit
export const riskSchema = z.object({
  ref: z.string().min(1, "Ref is required"),
  workActivity: z.string().min(1, "Work activity is required"),
  initiator: z.string().min(1, "Initiator is required"),
  initiationDate: z.date().refine((date) => date !== undefined, {
    message: "Initiation date is required",
  }),
  reviewDate: z.date().optional().nullable(),
  vesselDepartment: z.string().optional(),
  fleet: z.string().optional(),
  raType: z.enum(["ROUTINE", "NON_ROUTINE"]),
  libraryCategory: z.string().optional(),
  libraryIndex: z.string().optional(),
  defectRelated: z.boolean().default(false),
  initiatorComment: z.string().optional(),
  alternativeWays: z.boolean().default(false),
  alternativeWaysText: z.string().optional(),
  assessmentRows: z
  .array(assessmentRowSchema)
  .min(1, "At least one assessment row is required"),
  approvedBy: z.string().optional().nullable(),
  teamMembers: z.array(teamMemberSchema).default([]),
  responsiblePersons: z.array(responsiblePersonsSchema).default([]),
});

// Relaxed validation for Draft — almost everything optional
export const riskDraftSchema = riskSchema.partial().extend({
  ref: z.string().min(1, "Ref is required"),
  initiator: z.string().min(1, "Initiator is required"),
  initiationDate: z.date().refine((date) => date !== undefined, {
    message: "Initiation date is required",
  }),
  raType: z.enum(["ROUTINE", "NON_ROUTINE"]),
  approvedBy: z.string().optional().nullable(),
});

export type RiskFormValues = z.infer<typeof riskSchema>;
export type RiskDraftFormValues = z.infer<typeof riskDraftSchema>;
