import { z } from "zod"

/**
 * safetyMeetingSchema — validates the full Safety Meeting / Toolbox Talk form
 *
 * Required fields match the form's asterisk (*) markers:
 * projectSurvey, vesselInstallation, date, locationAreaDeck,
 * startTime, activityTask, toolboxTalkLeader, taskObjective
 *
 * Everything else optional.
 */
export const safetyMeetingSchema = z.object({
  // ─── Task & Project Information ───────────────────────────────────
  projectSurvey:      z.string().min(1, "Project / Survey is required"),
  contractNo:         z.string().optional().nullable(),
  vesselInstallation: z.string().min(1, "Vessel / Installation is required"),
  date:                z.coerce.date(),
  locationAreaDeck:   z.string().min(1, "Location / Area / Deck is required"),
  startTime:          z.string().min(1, "Start Time is required"),
  expectedFinish:     z.string().optional().nullable(),
  activityTask:       z.string().min(1, "Activity / Task is required"),
  toolboxTalkLeader:  z.string().min(1, "Toolbox Talk Leader is required"),
  taskObjective:      z.string().min(1, "Task Objective is required"),

  firstTimeNonRoutine: z.boolean().optional().default(false),
  simopsInvolved:      z.boolean().optional().default(false),

  // ─── Operational Context ──────────────────────────────────────────
  vesselStatus:     z.string().optional().nullable(),
  weatherSeaState:  z.string().optional().nullable(),
  workAreaStatus:   z.string().optional().nullable(),
  dayNight:         z.string().optional().nullable(),
  nearbyOperations: z.string().optional().nullable(),

  // ─── Responsible Interfaces ────────────────────────────────────────
  masterOowDpo:               z.string().optional().nullable(),
  deckPic:                    z.string().optional().nullable(),
  surveyLead:                 z.string().optional().nullable(),
  equipmentOperator:          z.string().optional().nullable(),
  responsibleInterfacesOther: z.string().optional().nullable(),

  // ─── Confirm with the Team ─────────────────────────────────────────
  teamConfirmations:      z.array(z.string()).optional().default([]),
  teamConfirmationsOther: z.string().optional().nullable(),

  // ─── Selected Toolbox Talk Cards ───────────────────────────────────
  selectedCardIds: z.array(z.string()).optional().default([]),

  // ─── Team Members ───────────────────────────────────────────────────
  teamMembers: z.array(
    z.object({
      id:   z.string().optional(),
      name: z.string().min(1, "Team member name is required"),
    })
  ).optional().default([]),
})

/** Type inferred from the schema — used for form state and action params */
export type SafetyMeetingFormValues = z.infer<typeof safetyMeetingSchema>

/**
 * safetyMeetingDraftSchema — relaxed validation for saving progress
 * Only projectSurvey and vesselInstallation required — everything else optional
 * since a draft can be incomplete.
 */
export const safetyMeetingDraftSchema = safetyMeetingSchema.partial({
  date:               true,
  locationAreaDeck:   true,
  startTime:          true,
  activityTask:       true,
  toolboxTalkLeader:  true,
  taskObjective:      true,
})

/**
 * toolboxTalkCardSchema — validates creating a new reusable card
 * Used when Admin uploads a new card to the library
 */
export const toolboxTalkCardSchema = z.object({
  code:     z.string().min(1, "Code is required"),
  title:    z.string().min(1, "Title is required"),
  tags:     z.array(z.string()).optional().default([]),
  imageUrl: z.string().optional().nullable(),
})

export type ToolboxTalkCardFormValues = z.infer<typeof toolboxTalkCardSchema>