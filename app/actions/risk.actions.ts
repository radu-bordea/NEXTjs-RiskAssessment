"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  riskSchema,
  RiskFormValues,
  riskDraftSchema,
} from "@/lib/validations/risk.schema";

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
        state: "TEMPLATE",
        createdById: userId, // ⚠️ important fix
        approvedBy: values.approvedBy ?? null,
        emergencyResponse: values.emergencyResponse ?? null, // ← add this field

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
      stateUpdatedBy: true, // ← was missing, caused "—" in view
    },
  });
}

/**
 * updateTemplate — Updates a TEMPLATE risk
 * Admin only — templates are master records
 */
export async function updateTemplate(id: string, data: RiskFormValues) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const validated = riskSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: "Validation failed" };
  }

  const values = validated.data;

  try {
    await prisma.riskAssessmentRow.deleteMany({ where: { riskId: id } });
    await prisma.teamMember.deleteMany({ where: { riskId: id } });
    await prisma.responsiblePersons.deleteMany({ where: { riskId: id } });

    const risk = await prisma.risk.update({
      where: { id },
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
        approvedBy: values.approvedBy ?? null, // ← add this
        emergencyResponse: values.emergencyResponse ?? null, // ← add this field
        state: "TEMPLATE", // always stays TEMPLATE
        stateUpdatedById: userId,

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
          create: (values.teamMembers ?? []).map((m) => ({ name: m.name })),
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
    console.error("updateTemplate error:", error);
    return { success: false, error: "Failed to update template" };
  }
}

/**
 * createDraftFromTemplate — Creates a DRAFT copy from a TEMPLATE risk
 *
 * Clones all data from the template into a new risk with state: DRAFT
 * The original template is never modified.
 * cloneOf field stores the template's ref for traceability.
 *
 * All roles can create a draft from a template.
 *
 * @param templateId - The id of the TEMPLATE risk to clone from
 * @returns { success: true, id: string } or { success: false, error: string }
 */

export async function createDraftFromTemplate(templateId: string): Promise<{
  success: boolean;
  error?: string;
  id?: string;
  existingDraftId?: string;
}> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: "User not found" };

  try {
    // Fetch the template with all nested data
    const template = await prisma.risk.findUnique({
      where: { id: templateId },
      include: {
        assessmentRows: {
          orderBy: { order: "asc" },
          include: {
            additionalMeasures: { orderBy: { order: "asc" } },
          },
        },
        teamMembers: true,
        responsiblePersons: true,
      },
    });

    if (!template) return { success: false, error: "Template not found" };
    if (template.state !== "TEMPLATE") {
      return { success: false, error: "Only templates can be cloned" };
    }

    // ── Build ref using the SOURCE's initiationDate, not today ───────────
    //
    // The client wants the ref date to reflect when the original work
    // assessment was initiated, not when the draft was created.
    //
    // Example: template initiated on 15/03/2026
    //   First draft that day  → "RA-N-001 - 15/03/2026"
    //   Second draft same day → "RA-N-001 - 15/03/2026/1"
    //   Third draft same day  → "RA-N-001 - 15/03/2026/2"
    //   Draft on a new date   → "RA-N-001 - 02/06/2026"  (no counter)

    // Count existing drafts/completed from this template to get next number
    const existingCount = await prisma.risk.count({
      where: { cloneOf: template.ref },
    });
    const draftNumber = existingCount + 1;
    const draftRef = `${template.ref} - DRAFT_${draftNumber}`;

    // Create the draft as a clone of the template
    const draft = await prisma.risk.create({
      data: {
        ref: draftRef,
        cloneOf: template.ref,
        workActivity: template.workActivity,
        initiator: user.name ?? user.email,
        initiationDate: new Date(),
        reviewDate: template.reviewDate,
        vesselDepartment: template.vesselDepartment,
        fleet: template.fleet,
        raType: template.raType,
        libraryIndex: template.libraryIndex,
        libraryCategory: template.libraryCategory,
        defectRelated: template.defectRelated,
        initiatorComment: template.initiatorComment,
        alternativeWays: template.alternativeWays,
        alternativeWaysText: template.alternativeWaysText,
        emergencyResponse: template.emergencyResponse ?? null, // ← add
        state: "DRAFT",
        createdById: userId,

        // Clone all assessment rows
        assessmentRows: {
          create: template.assessmentRows.map((row, index) => ({
            hazard: row.hazard,
            impact: row.impact,
            existingControls: row.existingControls,
            sct: row.sct,
            c: row.c,
            f: row.f,
            rf: row.rf,
            rfColor: row.rfColor,
            order: index,
            additionalMeasures: {
              create: row.additionalMeasures.map((m, mIndex) => ({
                furtherAction: m.furtherAction,
                c: m.c,
                f: m.f,
                rf: m.rf,
                rfColor: m.rfColor,
                order: mIndex,
              })),
            },
          })),
        },

        // Clone team members
        teamMembers: {
          create: template.teamMembers.map((m) => ({ name: m.name })),
        },

        // Clone responsible persons
        responsiblePersons: {
          create: template.responsiblePersons.map((p) => ({ name: p.name })),
        },
      },
    });
    // Revalidate dashboard so new draft appears immediately
    revalidatePath("/dashboard");
    return { success: true, id: draft.id };
  } catch (error) {
    console.error("createDraftFromTemplate error:", error);
    return { success: false, error: "Failed to create draft" };
  }
}

/**
 * submitDraft — Changes a DRAFT risk to COMPLETED
 *
 * Updates the draft in place — same row, state changes to COMPLETED.
 * The original template is never touched.
 * All roles can submit a draft.
 *
 * @param id - The id of the DRAFT risk to complete
 * @param data - Updated form values
 * @returns { success: true, id: string } or { success: false, error: string }
 */

export async function submitDraft(id: string, data: RiskFormValues) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: "User not found" };

  // Validate with full schema
  const validated = riskSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: "Validation failed" };
  }

  const values = validated.data;

  try {
    // Check it's actually a draft
    const existing = await prisma.risk.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Risk not found" };
    if (existing.state !== "DRAFT") {
      return { success: false, error: "Only drafts can be submitted" };
    }

    // Replace "DRAFT_N" with "COMPLETED_N", preserving the draft's number
    const cleanRef = existing.ref.replace(/DRAFT_(\d+)$/, "COMPLETED_$1");

    // Delete existing nested records and recreate from form data
    await prisma.riskAssessmentRow.deleteMany({ where: { riskId: id } });
    await prisma.teamMember.deleteMany({ where: { riskId: id } });
    await prisma.responsiblePersons.deleteMany({ where: { riskId: id } });

    // Update draft → COMPLETED
    const risk = await prisma.risk.update({
      where: { id },
      data: {
        ref: cleanRef,
        workActivity: values.workActivity,
        initiationDate: values.initiationDate,
        reviewDate: values.reviewDate ?? null,
        initiatorComment: values.initiatorComment ?? null,
        alternativeWays: values.alternativeWays,
        alternativeWaysText: values.alternativeWaysText ?? null,
        approvedBy: values.approvedBy ?? null,
        state: "COMPLETED",
        stateUpdatedById: userId,

        assessmentRows: {
          create: values.assessmentRows.map((row, index) => ({
            hazard: row.hazard,
            impact: row.impact,
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
          create: (values.teamMembers ?? []).map((m) => ({ name: m.name })),
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
    console.error("submitDraft error:", error);
    return { success: false, error: "Failed to submit draft" };
  }
}

/**
 * deleteRisk — Permanently deletes a risk assessment
 *
 * Permission rules:
 *  - TEMPLATE state → ADMIN only can delete
 *  - DRAFT / COMPLETED state → ADMIN and MANAGER can delete
 *  - MEMBER → cannot delete anything
 *
 * Cascade delete handles all related records automatically:
 * RiskAssessmentRow, AdditionalMeasure, TeamMember, ResponsiblePerson
 *
 * @param id - The cuid of the risk to delete
 * @returns { success: true } or { success: false, error: string }
 */

export async function deleteRisk(id: string) {
  // 1. Check authentication
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 2. Get current user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: "User not found" };

  try {
    // 3. Fetch the risk to check its state
    const existing = await prisma.risk.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Risk not found" };

    // 4. Templates — ADMIN only
    if (existing.state === "TEMPLATE" && user.role !== "ADMIN") {
      return { success: false, error: "Only Admin can delete templates" };
    }

    // 5. Members can only delete their OWN drafts
    if (user.role === "MEMBER") {
      if (existing.state !== "DRAFT") {
        return { success: false, error: "You can only delete drafts" };
      }
      if (existing.createdById !== userId) {
        return { success: false, error: "You can only delete your own drafts" };
      }
    }

    // 6. Cascade handles all related records automatically
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
/**
 * updateRisk — Updates an existing DRAFT risk assessment
 *
 * Always saves as DRAFT state — for saving progress while editing.
 * To submit a draft as COMPLETED use submitDraft instead.
 * All roles can update a draft.
 *
 * @param id - The cuid of the risk to update
 * @param data - Form values
 * @returns { success: true, id: string } or { success: false, error: string }
 */

export async function updateRisk(id: string, data: RiskFormValues) {
  // 1. Check authentication
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 2. Get current user — all roles can update
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: "User not found" };

  // 3. Validate with draft schema — relaxed validation for saving progress
  const validated = riskDraftSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: "Validation failed" };
  }

  const values = validated.data;

  try {
    // 4. Delete existing nested records — cascade handles additionalMeasures
    await prisma.riskAssessmentRow.deleteMany({ where: { riskId: id } });
    await prisma.teamMember.deleteMany({ where: { riskId: id } });
    await prisma.responsiblePersons.deleteMany({ where: { riskId: id } });

    // 5. Update the risk — always keeps DRAFT state
    const risk = await prisma.risk.update({
      where: { id },
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
        approvedBy: values.approvedBy ?? null,
        emergencyResponse: values.emergencyResponse ?? null, // ← add this field
        state: "DRAFT", // always DRAFT when saving progress
        stateUpdatedById: userId,

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
          create: (values.teamMembers ?? []).map((m) => ({ name: m.name })),
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
    console.error("updateRisk error:", error);
    return { success: false, error: "Failed to update risk" };
  }
}

/**
 * updateCompleted — Updates only the dates on a COMPLETED risk
 *
 * COMPLETED risks are mostly locked — only initiationDate and
 * reviewDate can be modified. All roles can do this.
 *
 * @param id - The cuid of the COMPLETED risk
 * @param initiationDate - New initiation date
 * @param reviewDate - New review date (optional)
 * @returns { success: true } or { success: false, error: string }
 */
export async function updateCompleted(
  id: string,
  initiationDate: Date,
  reviewDate: Date | null,
) {
  // 1. Check authentication
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: "User not found" };

  try {
    // 2. Verify risk exists and is COMPLETED
    const existing = await prisma.risk.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Risk not found" };
    if (existing.state !== "COMPLETED") {
      return {
        success: false,
        error: "Only completed risks can be updated this way",
      };
    }

    // 3. Only update the two date fields — everything else stays locked
    await prisma.risk.update({
      where: { id },
      data: {
        initiationDate,
        reviewDate: reviewDate ?? null,
        stateUpdatedById: userId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("updateCompleted error:", error);
    return { success: false, error: "Failed to update completed risk" };
  }
}
