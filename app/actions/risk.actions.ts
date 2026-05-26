"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { riskSchema, RiskFormValues, riskDraftSchema } from "@/lib/validations/risk.schema";

export async function createRisk(data: RiskFormValues) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Chek role - only ADMIN can create risk assessments
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  // Validate with Zod
  const validated = riskSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: "validation failed",
      fields: validated.error.flatten().fieldErrors,
    };
  }

  const values = validated.data;

  try {
    const risk = await prisma.risk.create({
      data: {
        ref: values.ref,
        workActivity: values.workActivity,
        initiator: values.initiator,
        initiationDate: values.initiationDate,
        reviewDate: values.reviewDate ?? null,
        vesselDepartment: values.vesselDepartment ?? null,
        fleet: values.fleet ?? null,
        raType: values.raType,
        libraryIndex: values.libraryIndex ?? null,
        libraryCategory: values.libraryCategory ?? null,
        defectRelated: values.defectRelated,
        initiatorComment: values.initiatorComment ?? null,
        alternativeWays: values.alternativeWays,
        alternativeWaysText: values.alternativeWaysText ?? null,
        state: "IN_PROGRESS",
        createdById: userId, // ⚠️ important fix

        assessmentRows: {
          create: values.assessmentRows.map((row, index) => ({
            hazard: row.hazard,
            impact: row.impact,
            existingControls: row.existingControls ?? "", // ⚠️ schema mismatch fix
            sct: row.sct ? String(row.sct) : null,
            c: row.c ?? null,
            f: row.f ?? null,
            // in assessmentRows.create map:
            rf: row.rf ?? null,
            rfColor: row.rfColor ?? null,
            order: index,

            additionalMeasures: {
              create: row.additionalMeasures.map((m, mIndex) => ({
                furtherAction: m.furtherAction ?? null,
                c: m.c ?? null,
                f: m.f ?? null,
                // in additionalMeasures.create map:
                rf: m.rf ?? null,
                rfColor: m.rfColor ?? null,
                order: mIndex,
              })),
            },
          })),
        },

        teamMembers: {
          create: values.teamMembers.map((member) => ({
            name: member.name,
          })),
        },

        responsiblePersons: {
          create: values.responsiblePersons.map((person) => ({
            name: person.name,
          })),
        },
      },
    });

    return { success: true, id: risk.id };
  } catch (error) {
    console.error("createRisk error:", error);
    return { success: false, error: "failed to create risk assessment" };
  }
}

export async function getRiskById(id: string) {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  if (!id) throw new Error("Risk ID missing");

  return prisma.risk.findUnique({
    where: { id },
    include: {
      assessmentRows: {
        include: {
          additionalMeasures: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
      teamMembers: true,
      responsiblePersons: true,
      createdBy: true,
    },
  });
}

/**
 * saveDraft — Saves a risk assessment as DRAFT state
 *
 * Uses relaxed riskDraftSchema validation — only ref, initiator,
 * initiationDate and raType are required. Everything else is optional.
 * This allows saving incomplete forms for later completion.
 *
 * @param data - Partial risk form values
 * @returns { success: true, id: string } or { success: false, error: string }
 */
export async function saveDraft(data: Partial<RiskFormValues>) {
  // 1. Check authentication
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 2. Check role - only ADMIN can create/draft
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unhorized" };
  }

  // 3. Validate with relaxed schema
  const validated = riskSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: "validation failed",
      fields: validated.error.flatten().fieldErrors,
    };
  }

  const values = validated.data;

  try {
    const risk = await prisma.risk.create({
      data: {
        ref: values.ref!,
        workActivity: values.workActivity ?? "",
        initiator: values.initiator!,
        initiationDate: values.initiationDate!,
        reviewDate: values.reviewDate ?? null,
        vesselDepartment: values.vesselDepartment ?? null,
        fleet: values.fleet ?? null,
        raType: values.raType!,
        libraryIndex: values.libraryIndex ?? null,
        libraryCategory: values.libraryCategory ?? null,
        defectRelated: values.defectRelated ?? false,
        initiatorComment: values.initiatorComment ?? null,
        alternativeWays: values.alternativeWays ?? false,
        alternativeWaysText: values.alternativeWaysText ?? null,
        state: "DRAFT", // ← key difference from createRisk
        createdById: userId,

        // Assessment rows — create if provided, skip if empty
        assessmentRows: {
          create: (values.assessmentRows ?? []).map((row, index) => ({
            hazard: row.hazard ?? "",
            impact: row.impact ?? "",
            existingControls: row.existingControls ?? "",
            sct: row.sct ?? null,
            c: row.c ?? null,
            f: row.f ?? null,
            rf: row.rf ?? null,
            rfColor: row.rfColor ?? null,
            order: index,
            additionalMeasures: {
              create: (row.additionalMeasures ?? []).map((m, mIndex) => ({
                furtherAction: m.furtherAction ?? null,
                c: m.c ?? null,
                f: m.f ?? null,
                rf: m.rf ?? null,
                rfColor: m.rfColor ?? null,
                order: mIndex,
              })),
            },
          })),
        },

        teamMembers: {
          create: (values.teamMembers ?? []).map((member) => ({
            name: member.name,
          })),
        },

        responsiblePersons: {
          create: (values.responsiblePersons ?? []).map((p) => ({
            name: p.name,
          })),
        },
      },
    });

    return { success: true, id: risk.id };
  } catch (error) {
    console.error("saveDraft error:", error);
    return { success: false, error: "Failed to save draft" };
  }
}

/**
 * deleteRisk - Permanently delete a risk assesment by Id
 *
 * Cascade delete handle all related records automaticaly
 * RiskAssesmentRow, AdditionaløMeasure, TeamMember and ResponsiblePerson
 *
 * Only ADMIN can delete
 *
 * @param id - The cuid of the risk to delete
 * @returns {success: true} of {success: false, error: string}
 */
export async function deleteRisk(id: string) {
  // 1. Check authentication
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 2. Check role - only ADMIN can delete
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Cascade handles all related records automaticaly
    await prisma.risk.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("deleteRisk error:", error);
    return { success: false, error: "Failed to delete risk assessment" };
  }
}

/**
 * updateRisk — Updates an existing risk assessment
 *
 * Used for both:
 *  - Submitting a DRAFT risk (state → IN_PROGRESS)
 *  - Editing an existing IN_PROGRESS risk (state stays IN_PROGRESS)
 *  - Saving an edit as draft (state → DRAFT)
 *
 * Deletes existing nested records and recreates them from form data.
 * Cascade handles cleanup automatically.
 *
 * @param id - The cuid of the risk to update
 * @param data - Full form values
 * @param state - Target state: "DRAFT" or "IN_PROGRESS"
 */
export async function updateRisk(
  id: string,
  data: RiskFormValues,
  state: "DRAFT" | "IN_PROGRESS"
) {
  // 1. Check authentication
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  // 2. Check role — ADMIN and MANAGER can edit
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    return { success: false, error: "Unauthorized" }
  }

  // 3. Validate — use full schema for submit, draft schema for draft
  const schema = state === "DRAFT" ? riskDraftSchema : riskSchema
  const validated = schema.safeParse(data)
  if (!validated.success) {
    return {
      success: false,
      error:  "Validation failed",
      fields: validated.error.flatten().fieldErrors,
    }
  }

  const values = validated.data

  try {
    // 4. Delete existing nested records — cascade handles additionalMeasures
    await prisma.riskAssessmentRow.deleteMany({ where: { riskId: id } })
    await prisma.teamMember.deleteMany({ where: { riskId: id } })
    await prisma.responsiblePersons.deleteMany({ where: { riskId: id } })

    // 5. Update the risk with new data and recreate nested records
    const risk = await prisma.risk.update({
      where: { id },
      data: {
        ref:              values.ref!,
        workActivity:     values.workActivity    ?? "",
        initiator:        values.initiator!,
        initiationDate:   values.initiationDate!,
        reviewDate:       values.reviewDate      ?? null,
        vesselDepartment: values.vesselDepartment ?? null,
        fleet:            values.fleet           ?? null,
        raType:           values.raType!,
        libraryIndex:     values.libraryIndex    ?? null,
        libraryCategory:  values.libraryCategory ?? null,
        defectRelated:    values.defectRelated   ?? false,
        initiatorComment: values.initiatorComment ?? null,
        alternativeWays:     values.alternativeWays     ?? false,
        alternativeWaysText: values.alternativeWaysText ?? null,
        state,
        stateUpdatedById: userId,

        assessmentRows: {
          create: (values.assessmentRows ?? []).map((row, index) => ({
            hazard:           row.hazard           ?? "",
            impact:           row.impact           ?? "",
            existingControls: row.existingControls ?? "",
            sct:              row.sct              ?? null,
            c:                row.c                ?? null,
            f:                row.f                ?? null,
            rf:               row.rf               ?? null,
            rfColor:          row.rfColor          ?? null,
            order:            index,
            additionalMeasures: {
              create: (row.additionalMeasures ?? []).map((m, mIndex) => ({
                furtherAction: m.furtherAction ?? null,
                c:             m.c             ?? null,
                f:             m.f             ?? null,
                rf:            m.rf            ?? null,
                rfColor:       m.rfColor       ?? null,
                order:         mIndex,
              })),
            },
          })),
        },

        teamMembers: {
          create: (values.teamMembers ?? []).map((member) => ({
            name: member.name,
          })),
        },

        responsiblePersons: {
          create: (values.responsiblePersons ?? []).map((p) => ({
            name: p.name,
          })),
        },
      },
    })

    return { success: true, id: risk.id }
  } catch (error) {
    console.error("updateRisk error:", error)
    return { success: false, error: "Failed to update risk assessment" }
  }
}