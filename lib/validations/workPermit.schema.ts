import { z } from "zod"

/**
 * workPermit.schema — validation for Work Permits
 *
 * Location: lib/validations/workPermit.schema.ts
 *
 * Today: the Manual Work Permit (upload an existing PDF).
 * Later: the 3 permit forms add their own schemas here.
 */

/** Same values as the Prisma enum WorkPermitType */
export const WORK_PERMIT_TYPES = ["HOT_WORK", "CONFINED_SPACE", "WORKING_ALOFT", "OTHER"] as const

/** Max size of an uploaded PDF — per file */
export const MAX_PDF_SIZE_MB = 10
export const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024

/**
 * Manual Work Permit — what the browser sends AFTER the PDF is uploaded to Blob.
 * Vessel and permit number are NOT here: the server sets them itself.
 */
export const manualWorkPermitSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name is too long"),
  type: z.enum(WORK_PERMIT_TYPES),
  issueDate: z.coerce.date(),
  projectVoyage: z.string().trim().max(200, "Project / Voyage is too long").optional(),
  pdfUrl: z.string().url(),
  pdfFileName: z.string().trim().min(1).max(255),
})

export type ManualWorkPermitInput = z.input<typeof manualWorkPermitSchema>