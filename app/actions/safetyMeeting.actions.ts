"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import {
  safetyMeetingSchema,
  safetyMeetingDraftSchema,
  SafetyMeetingFormValues,
} from "@/lib/validations/safetyMeeting.schema"

/**
 * createSafetyMeeting — Creates a new Safety Meeting as COMPLETED
 *
 * All roles can create. Uses full validation.
 *
 * @param data - Form values matching safetyMeetingSchema
 */
export async function createSafetyMeeting(data: SafetyMeetingFormValues) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { success: false, error: "User not found" }

  const validated = safetyMeetingSchema.safeParse(data)
  if (!validated.success) {
    console.log("Zod validation errors:", validated.error.flatten())
    return { success: false, error: "Validation failed" }
  }

  const values = validated.data

  try {
    const meeting = await prisma.safetyMeeting.create({
      data: {
        projectSurvey:      values.projectSurvey,
        contractNo:         values.contractNo ?? null,
        vesselInstallation: values.vesselInstallation,
        date:               values.date,
        locationAreaDeck:   values.locationAreaDeck,
        startTime:          values.startTime ?? null,
        expectedFinish:     values.expectedFinish ?? null,
        activityTask:       values.activityTask,
        toolboxTalkLeader:  values.toolboxTalkLeader,
        taskObjective:      values.taskObjective,

        firstTimeNonRoutine: values.firstTimeNonRoutine ?? false,
        simopsInvolved:      values.simopsInvolved ?? false,

        vesselStatus:     values.vesselStatus ?? null,
        weatherSeaState:  values.weatherSeaState ?? null,
        workAreaStatus:   values.workAreaStatus ?? null,
        dayNight:         values.dayNight ?? null,
        nearbyOperations: values.nearbyOperations ?? null,

        masterOowDpo:               values.masterOowDpo ?? null,
        deckPic:                    values.deckPic ?? null,
        surveyLead:                 values.surveyLead ?? null,
        equipmentOperator:          values.equipmentOperator ?? null,
        responsibleInterfacesOther: values.responsibleInterfacesOther ?? null,

        teamConfirmations:      values.teamConfirmations ?? [],
        teamConfirmationsOther: values.teamConfirmationsOther ?? null,

        state: "COMPLETED",

        createdById:      userId,
        stateUpdatedById: userId,

        teamMembers: {
          create: (values.teamMembers ?? []).map((m) => ({ name: m.name })),
        },

        selectedCards: {
          create: (values.selectedCardIds ?? []).map((cardId) => ({ cardId })),
        },
      },
    })

    revalidatePath("/safetymeetingsdashboard")
    return { success: true, id: meeting.id }
  } catch (error) {
    console.error("createSafetyMeeting error:", error)
    return { success: false, error: "Failed to create safety meeting" }
  }
}

/**
 * saveSafetyMeetingDraft — Saves as DRAFT
 *
 * Relaxed validation — only projectSurvey and vesselInstallation required.
 * All roles can save a draft.
 */
export async function saveSafetyMeetingDraft(data: Partial<SafetyMeetingFormValues>) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { success: false, error: "User not found" }

  const validated = safetyMeetingDraftSchema.safeParse(data)
  if (!validated.success) {
    console.log("Zod draft validation errors:", validated.error.flatten())
    return { success: false, error: "Validation failed" }
  }

  const values = validated.data

  try {
    const meeting = await prisma.safetyMeeting.create({
      data: {
        projectSurvey:      values.projectSurvey!,
        contractNo:         values.contractNo ?? null,
        vesselInstallation: values.vesselInstallation!,
        date:               values.date ?? new Date(),
        locationAreaDeck:   values.locationAreaDeck ?? "",
        startTime:          values.startTime ?? null,
        expectedFinish:     values.expectedFinish ?? null,
        activityTask:       values.activityTask ?? "",
        toolboxTalkLeader:  values.toolboxTalkLeader ?? "",
        taskObjective:      values.taskObjective ?? "",

        firstTimeNonRoutine: values.firstTimeNonRoutine ?? false,
        simopsInvolved:      values.simopsInvolved ?? false,

        vesselStatus:     values.vesselStatus ?? null,
        weatherSeaState:  values.weatherSeaState ?? null,
        workAreaStatus:   values.workAreaStatus ?? null,
        dayNight:         values.dayNight ?? null,
        nearbyOperations: values.nearbyOperations ?? null,

        masterOowDpo:               values.masterOowDpo ?? null,
        deckPic:                    values.deckPic ?? null,
        surveyLead:                 values.surveyLead ?? null,
        equipmentOperator:          values.equipmentOperator ?? null,
        responsibleInterfacesOther: values.responsibleInterfacesOther ?? null,

        teamConfirmations:      values.teamConfirmations ?? [],
        teamConfirmationsOther: values.teamConfirmationsOther ?? null,

        state: "DRAFT",

        createdById:      userId,
        stateUpdatedById: userId,

        teamMembers: {
          create: (values.teamMembers ?? []).map((m) => ({ name: m.name })),
        },

        selectedCards: {
          create: (values.selectedCardIds ?? []).map((cardId) => ({ cardId })),
        },
      },
    })

    revalidatePath("/safetymeetingsdashboard")
    return { success: true, id: meeting.id }
  } catch (error) {
    console.error("saveSafetyMeetingDraft error:", error)
    return { success: false, error: "Failed to save draft" }
  }
}

/**
 * updateSafetyMeeting — Updates an existing DRAFT
 *
 * Used for both saving draft progress and submitting to COMPLETED.
 * Permission rules match Observation:
 *  - ADMIN/MANAGER → can edit any draft
 *  - MEMBER → can only edit their own drafts
 *
 * @param submitAsCompleted - true = validates strictly, sets COMPLETED
 */
export async function updateSafetyMeeting(
  id: string,
  data: Partial<SafetyMeetingFormValues>,
  submitAsCompleted: boolean
) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { success: false, error: "User not found" }

  const existing = await prisma.safetyMeeting.findUnique({ where: { id } })
  if (!existing) return { success: false, error: "Safety meeting not found" }

  if (existing.state !== "DRAFT") {
    return { success: false, error: "Only drafts can be edited" }
  }

  if (user.role === "MEMBER" && existing.createdById !== userId) {
    return { success: false, error: "You can only edit your own drafts" }
  }

  const schema = submitAsCompleted ? safetyMeetingSchema : safetyMeetingDraftSchema
  const validated = schema.safeParse(data)
  if (!validated.success) {
    console.log("Zod validation errors:", validated.error.flatten())
    return { success: false, error: "Validation failed" }
  }

  const values = validated.data

  try {
    // Delete existing nested records and recreate from form data
    await prisma.safetyMeetingTeamMember.deleteMany({ where: { safetyMeetingId: id } })
    await prisma.safetyMeetingCard.deleteMany({ where: { safetyMeetingId: id } })

    const meeting = await prisma.safetyMeeting.update({
      where: { id },
      data: {
        projectSurvey:      values.projectSurvey!,
        contractNo:         values.contractNo ?? null,
        vesselInstallation: values.vesselInstallation!,
        date:               values.date ?? existing.date,
        locationAreaDeck:   values.locationAreaDeck ?? "",
        startTime:          values.startTime ?? null,
        expectedFinish:     values.expectedFinish ?? null,
        activityTask:       values.activityTask ?? "",
        toolboxTalkLeader:  values.toolboxTalkLeader ?? "",
        taskObjective:      values.taskObjective ?? "",

        firstTimeNonRoutine: values.firstTimeNonRoutine ?? false,
        simopsInvolved:      values.simopsInvolved ?? false,

        vesselStatus:     values.vesselStatus ?? null,
        weatherSeaState:  values.weatherSeaState ?? null,
        workAreaStatus:   values.workAreaStatus ?? null,
        dayNight:         values.dayNight ?? null,
        nearbyOperations: values.nearbyOperations ?? null,

        masterOowDpo:               values.masterOowDpo ?? null,
        deckPic:                    values.deckPic ?? null,
        surveyLead:                 values.surveyLead ?? null,
        equipmentOperator:          values.equipmentOperator ?? null,
        responsibleInterfacesOther: values.responsibleInterfacesOther ?? null,

        teamConfirmations:      values.teamConfirmations ?? [],
        teamConfirmationsOther: values.teamConfirmationsOther ?? null,

        state: submitAsCompleted ? "COMPLETED" : "DRAFT",
        stateUpdatedById: userId,

        teamMembers: {
          create: (values.teamMembers ?? []).map((m) => ({ name: m.name })),
        },

        selectedCards: {
          create: (values.selectedCardIds ?? []).map((cardId) => ({ cardId })),
        },
      },
    })

    revalidatePath("/safetymeetingsdashboard")
    return { success: true, id: meeting.id }
  } catch (error) {
    console.error("updateSafetyMeeting error:", error)
    return { success: false, error: "Failed to update safety meeting" }
  }
}

/**
 * deleteSafetyMeeting — Permanently deletes a safety meeting
 *
 * Permission rules match Observation:
 *  - ADMIN/MANAGER → can delete any, any state
 *  - MEMBER → can only delete their own drafts
 */
export async function deleteSafetyMeeting(id: string) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { success: false, error: "User not found" }

  try {
    const existing = await prisma.safetyMeeting.findUnique({ where: { id } })
    if (!existing) return { success: false, error: "Safety meeting not found" }

    if (user.role === "ADMIN" || user.role === "MANAGER") {
      await prisma.safetyMeeting.delete({ where: { id } })
      revalidatePath("/safetymeetingsdashboard")
      return { success: true }
    }

    if (existing.state !== "DRAFT") {
      return { success: false, error: "You can only delete drafts" }
    }

    if (existing.createdById !== userId) {
      return { success: false, error: "You can only delete your own drafts" }
    }

    await prisma.safetyMeeting.delete({ where: { id } })
    revalidatePath("/safetymeetingsdashboard")
    return { success: true }

  } catch (error) {
    console.error("deleteSafetyMeeting error:", error)
    return { success: false, error: "Failed to delete safety meeting" }
  }
}