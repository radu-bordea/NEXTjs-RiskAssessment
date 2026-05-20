"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { riskSchema, RiskFormValues } from "@/lib/validations/risk.schema";
import { success } from "zod";

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
