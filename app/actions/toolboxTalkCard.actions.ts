"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"
import { toolboxTalkCardSchema } from "@/lib/validations/safetyMeeting.schema"

/**
 * getToolboxTalkCards — Fetches all reusable cards for the selection list
 *
 * All roles can view.
 */
export async function getToolboxTalkCards() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const cards = await prisma.toolboxTalkCard.findMany({
    orderBy: { code: "asc" },
  })

  return cards
}

/**
 * createToolboxTalkCard — Creates a new reusable Toolbox Talk Card
 *
 * Admin only — this is a managed library, similar to how only Admin
 * creates Risk Templates.
 *
 * Uploads the image to Vercel Blob first, then saves the card with
 * the resulting public URL.
 *
 * @param formData - FormData containing code, title, tags (comma separated), and the image file
 */
export async function createToolboxTalkCard(formData: FormData) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { success: false, error: "User not found" }

  if (user.role !== "ADMIN") {
    return { success: false, error: "Only Admin can create toolbox talk cards" }
  }

  const code  = formData.get("code") as string
  const title = formData.get("title") as string
  const tagsRaw = formData.get("tags") as string
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : []
  const imageFile = formData.get("image") as File | null

  const validated = toolboxTalkCardSchema.safeParse({ code, title, tags })
  if (!validated.success) {
    console.log("Zod validation errors:", validated.error.flatten())
    return { success: false, error: "Validation failed" }
  }

  try {
    let imageUrl: string | null = null

    // Upload image to Vercel Blob if provided
    if (imageFile && imageFile.size > 0) {
      const blob = await put(`cards/${code}-${Date.now()}-${imageFile.name}`, imageFile, {
        access: "public",
      })
      imageUrl = blob.url
    }

    const card = await prisma.toolboxTalkCard.create({
      data: {
        code:     validated.data.code,
        title:    validated.data.title,
        tags:     validated.data.tags,
        imageUrl,
      },
    })

    revalidatePath("/safetymeetingsdashboard")
    return { success: true, id: card.id }
  } catch (error) {
    console.error("createToolboxTalkCard error:", error)
    return { success: false, error: "Failed to create card" }
  }
}

/**
 * deleteToolboxTalkCard — Permanently deletes a reusable card
 *
 * Admin only. Note: does NOT delete the image from Blob storage
 * (Vercel Blob doesn't auto-cascade) — acceptable for now, can add
 * cleanup later if storage usage becomes a concern.
 */
export async function deleteToolboxTalkCard(id: string) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { success: false, error: "User not found" }

  if (user.role !== "ADMIN") {
    return { success: false, error: "Only Admin can delete toolbox talk cards" }
  }

  try {
    await prisma.toolboxTalkCard.delete({ where: { id } })
    revalidatePath("/safetymeetingsdashboard")
    return { success: true }
  } catch (error) {
    console.error("deleteToolboxTalkCard error:", error)
    return { success: false, error: "Failed to delete card" }
  }
}