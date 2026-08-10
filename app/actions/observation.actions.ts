"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { observationSchema,  observationDraftSchema,ObservationFormValues } from "@/lib/validations/observation.schema"

/**
 * createObservation — Creates a new observation card
 *
 * Currently always saves as COMPLETED (draft functionality comes later).
 * All roles can create observations.
 * Generates title automatically from observationType + date + counter.
 *
 * @param data - Form values matching observationSchema
 * @returns { success: true, id: string } or { success: false, error: string }
 */
export async function createObservation(data: ObservationFormValues) {
  // 1. Check authentication
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { success: false, error: "User not found" }

  // 2. Validate with Zod
const validated = observationSchema.safeParse(data)
  if (!validated.success) {
    console.log("Zod validation errors:", validated.error.flatten())
    return { success: false, error: "Validation failed" }
  }
  const values = validated.data

  try {
    // 3. Generate title: <observationType> - <date> (counter if duplicate)
    const dateStr = values.date.toLocaleDateString("en-GB") // e.g. "05/06/2026"
    const typeLabel = values.observationType ?? "OBSERVATION"
    const baseTitle = `${typeLabel} - ${dateStr}`

    // Count existing observations with same type + date to detect duplicates
    const existingCount = await prisma.observation.count({
      where: {
        observationType: values.observationType,
        date: values.date,
      },
    })

    const title = existingCount === 0
      ? baseTitle
      : `${baseTitle} (${existingCount + 1})`

    // 4. Create the observation
    const observation = await prisma.observation.create({
      data: {
        title,

        vesselProject:   values.vesselProject,
        location:        values.location ?? null,
        weatherSeaState: values.weatherSeaState ?? null,
        date:            values.date,
        time:            values.time ?? null,
        observerName:    values.observerName,
        createdByField: values.createdByField ?? null,

        observationType: values.observationType ?? null,
        stopWorkUsed:    values.stopWorkUsed ?? null,

        observationSource:      values.observationSource ?? null,
        observationSourceOther: values.observationSourceOther ?? null,

        lifeSavingRules:      values.lifeSavingRules ?? [],
        lifeSavingRulesOther: values.lifeSavingRulesOther ?? null,

        riskPriority: values.riskPriority ?? null,
        hiPo:         values.hiPo ?? null,

        categoryOperations:      values.categoryOperations ?? [],
        categoryOperationsOther: values.categoryOperationsOther ?? null,

        categorySurveyEquipment:      values.categorySurveyEquipment ?? null,
        categorySurveyEquipmentOther: values.categorySurveyEquipmentOther ?? null,

        categoryWorkActivities:      values.categoryWorkActivities ?? [],
        categoryWorkActivitiesOther: values.categoryWorkActivitiesOther ?? null,

        categoryHazards:      values.categoryHazards ?? [],
        categoryHazardsOther: values.categoryHazardsOther ?? null,

        categoryEnvironment:      values.categoryEnvironment ?? [],
        categoryEnvironmentOther: values.categoryEnvironmentOther ?? null,

        observationDescription: values.observationDescription,

        immediateAction: values.immediateAction ?? null,

        correctiveAction:     values.correctiveAction ?? null,
        correctiveActionDate: values.correctiveActionDate ?? null,
        preventiveAction:     values.preventiveAction ?? null,
        preventiveActionDate: values.preventiveActionDate ?? null,
        responsiblePerson:    values.responsiblePerson ?? null,

        rootCauses:     values.rootCauses ?? [],
        rootCauseOther: values.rootCauseOther ?? null,

        potentialConsequences:     values.potentialConsequences ?? [],
        potentialConsequenceOther: values.potentialConsequenceOther ?? null,

        lessonsLearned:    values.lessonsLearned ?? null,
        preventRecurrence: values.preventRecurrence ?? null,

        closedBy:                   values.closedBy ?? null,
        dateClosed:                 values.dateClosed ?? null,
        correctiveActionEffective:  values.correctiveActionEffective ?? null,
        furtherActionRequired:      values.furtherActionRequired ?? null,
        closeOutName:               values.closeOutName ?? null,

        officeResponse: values.officeResponse ?? null,
        effectiveDate:  values.effectiveDate ?? null,

        state: "COMPLETED",

        createdById:      userId,
        stateUpdatedById: userId,
      },
    })

    revalidatePath("/observationdashboard")
    return { success: true, id: observation.id }
  } catch (error) {
    console.error("createObservation error:", error)
    return { success: false, error: "Failed to create observation" }
  }
}

/**
 * saveObservationDraft — Saves an observation as DRAFT
 *
 * Uses relaxed validation — only vesselProject and observerName required.
 * Allows saving incomplete work for later completion.
 * All roles can save a draft.
 *
 * @param data - Partial observation form values
 * @returns { success: true, id: string } or { success: false, error: string }
 */
export async function saveObservationDraft(data: Partial<ObservationFormValues>) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { success: false, error: "User not found" }

  // Validate with relaxed draft schema
  const validated = observationDraftSchema.safeParse(data)
  if (!validated.success) {
    console.log("Zod draft validation errors:", validated.error.flatten())
    return { success: false, error: "Validation failed" }
  }

  const values = validated.data

  try {
    // Generate title — same logic as createObservation, but handle missing observationType
    const dateStr = values.date
      ? values.date.toLocaleDateString("en-GB")
      : new Date().toLocaleDateString("en-GB")
    const typeLabel = values.observationType ?? "DRAFT"
    const baseTitle = `${typeLabel} - ${dateStr}`

    const existingCount = await prisma.observation.count({
      where: {
        observationType: values.observationType ?? null,
        date: values.date ?? new Date(),
      },
    })

    const title = existingCount === 0
      ? baseTitle
      : `${baseTitle} (${existingCount + 1})`

    const observation = await prisma.observation.create({
      data: {
        title,

        vesselProject:   values.vesselProject!,
        location:        values.location ?? null,
        weatherSeaState: values.weatherSeaState ?? null,
        date:            values.date ?? new Date(),
        time:            values.time ?? null,
        observerName:    values.observerName!,
        createdByField:  values.createdByField ?? null,

        observationType: values.observationType ?? null,
        stopWorkUsed:    values.stopWorkUsed ?? null,

        observationSource:      values.observationSource ?? null,
        observationSourceOther: values.observationSourceOther ?? null,

        lifeSavingRules:      values.lifeSavingRules ?? [],
        lifeSavingRulesOther: values.lifeSavingRulesOther ?? null,

        riskPriority: values.riskPriority ?? null,
        hiPo:         values.hiPo ?? null,

        categoryOperations:      values.categoryOperations ?? [],
        categoryOperationsOther: values.categoryOperationsOther ?? null,

        categorySurveyEquipment:      values.categorySurveyEquipment ?? null,
        categorySurveyEquipmentOther: values.categorySurveyEquipmentOther ?? null,

        categoryWorkActivities:      values.categoryWorkActivities ?? [],
        categoryWorkActivitiesOther: values.categoryWorkActivitiesOther ?? null,

        categoryHazards:      values.categoryHazards ?? [],
        categoryHazardsOther: values.categoryHazardsOther ?? null,

        categoryEnvironment:      values.categoryEnvironment ?? [],
        categoryEnvironmentOther: values.categoryEnvironmentOther ?? null,

        observationDescription: values.observationDescription ?? "",

        immediateAction: values.immediateAction ?? null,

        correctiveAction:     values.correctiveAction ?? null,
        correctiveActionDate: values.correctiveActionDate ?? null,
        preventiveAction:     values.preventiveAction ?? null,
        preventiveActionDate: values.preventiveActionDate ?? null,
        responsiblePerson:    values.responsiblePerson ?? null,

        rootCauses:     values.rootCauses ?? [],
        rootCauseOther: values.rootCauseOther ?? null,

        potentialConsequences:     values.potentialConsequences ?? [],
        potentialConsequenceOther: values.potentialConsequenceOther ?? null,

        lessonsLearned:    values.lessonsLearned ?? null,
        preventRecurrence: values.preventRecurrence ?? null,

        closedBy:                   values.closedBy ?? null,
        dateClosed:                 values.dateClosed ?? null,
        correctiveActionEffective:  values.correctiveActionEffective ?? null,
        furtherActionRequired:      values.furtherActionRequired ?? null,
        closeOutName:               values.closeOutName ?? null,

        officeResponse: values.officeResponse ?? null,
        effectiveDate:  values.effectiveDate ?? null,

        state: "DRAFT",

        createdById:      userId,
        stateUpdatedById: userId,
      },
    })

    revalidatePath("/observationdashboard")
    return { success: true, id: observation.id }
  } catch (error) {
    console.error("saveObservationDraft error:", error)
    return { success: false, error: "Failed to save draft" }
  }
}

/**
 * deleteObservation — Permanently deletes an observation card
 *
 * Permission rules:
 *  - ADMIN/MANAGER → can delete any observation, any state
 *  - MEMBER        → can only delete their OWN drafts
 *
 * @param id - The cuid of the observation to delete
 * @returns { success: true } or { success: false, error: string }
 */
export async function deleteObservation(id: string) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { success: false, error: "User not found" }

  try {
    const existing = await prisma.observation.findUnique({ where: { id } })
    if (!existing) return { success: false, error: "Observation not found" }

    // ADMIN and MANAGER can delete anything
    if (user.role === "ADMIN" || user.role === "MANAGER") {
      await prisma.observation.delete({ where: { id } })
      revalidatePath("/observationdashboard")
      return { success: true }
    }

    // MEMBER can only delete their own drafts
    if (existing.state !== "DRAFT") {
      return { success: false, error: "You can only delete drafts" }
    }

    if (existing.createdById !== userId) {
      return { success: false, error: "You can only delete your own drafts" }
    }

    await prisma.observation.delete({ where: { id } })
    revalidatePath("/observationdashboard")
    return { success: true }

  } catch (error) {
    console.error("deleteObservation error:", error)
    return { success: false, error: "Failed to delete observation" }
  }
}