"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { del } from "@vercel/blob"
import prisma from "@/lib/prisma"
import {
  manualWorkPermitSchema,
  type ManualWorkPermitInput,
} from "@/lib/validations/workPermit.schema"
import { nextPermitNo, isDuplicatePermitNo } from "@/lib/workPermitNumber"

/**
 * True only for files in OUR Vercel Blob store, in the workpermits/ folder.
 * Stops someone from saving (or making us delete) any other URL.
 */
function isOurPermitPdf(url: string) {
  try {
    const u = new URL(url)
    return (
      u.protocol === "https:" &&
      u.hostname.endsWith(".public.blob.vercel-storage.com") &&
      u.pathname.startsWith("/workpermits/")
    )
  } catch {
    return false
  }
}

/** Removes an uploaded PDF that will not be used (save failed) — never throws */
async function deleteUnusedPdf(url: string) {
  if (!isOurPermitPdf(url)) return
  try {
    await del(url)
  } catch (error) {
    console.error("deleteUnusedPdf error:", error)
  }
}

/**
 * createManualWorkPermit — saves an existing paper permit uploaded as PDF
 *
 * The PDF is already in Vercel Blob (the browser uploaded it via
 * /api/workpermits/upload). This action only saves the database record.
 *
 *  - All roles can upload (client rule)
 *  - Vessel = the logged-in user (set here, never trusted from the browser)
 *  - Permit number = next free number for the type, e.g. "HW-2026-004"
 *  - Source MANUAL, state CLOSED_OUT (the paper permit is already finished)
 *
 * If saving fails, the uploaded PDF is deleted again so no unused files stay in Blob.
 */
export async function createManualWorkPermit(input: ManualWorkPermitInput) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    await deleteUnusedPdf(input.pdfUrl)
    return { success: false as const, error: "User not found" }
  }

  const validated = manualWorkPermitSchema.safeParse(input)
  if (!validated.success) {
    await deleteUnusedPdf(input.pdfUrl)
    return {
      success: false as const,
      error: validated.error.issues[0]?.message ?? "Validation failed",
    }
  }
  const values = validated.data

  if (!isOurPermitPdf(values.pdfUrl)) {
    return { success: false as const, error: "Invalid PDF file" }
  }

  try {
    // Try a few times in case two permits get the same number at the same moment
    for (let attempt = 1; attempt <= 3; attempt++) {
      const permitNo = await nextPermitNo(values.type)
      try {
        const permit = await prisma.workPermit.create({
          data: {
            permitNo,
            type: values.type,
            source: "MANUAL",
            state: "CLOSED_OUT",
            name: values.name,
            issueDate: values.issueDate,
            vessel: user.name ?? user.email,
            projectVoyage: values.projectVoyage || null,
            pdfUrl: values.pdfUrl,
            pdfFileName: values.pdfFileName,
            createdById: userId,
          },
        })

        revalidatePath("/workpermitsdashboard")
        return { success: true as const, id: permit.id, permitNo: permit.permitNo }
      } catch (error) {
        if (isDuplicatePermitNo(error) && attempt < 3) continue
        throw error
      }
    }
    throw new Error("Could not get a free permit number")
  } catch (error) {
    console.error("createManualWorkPermit error:", error)
    await deleteUnusedPdf(values.pdfUrl)
    return { success: false as const, error: "Failed to save the work permit" }
  }
}