"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { toolboxTalkCardSchema } from "@/lib/validations/safetyMeeting.schema";
import { TOOLBOX_DEPARTMENTS } from "@/lib/toolboxDepartments";

/**
 * getToolboxTalkCards — Fetches all reusable cards for the selection list
 *
 * All roles can view.
 */
export async function getToolboxTalkCards() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const cards = await prisma.toolboxTalkCard.findMany({
    orderBy: { code: "asc" },
  });

  return cards;
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
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: "User not found" };

  if (user.role !== "ADMIN") {
    return {
      success: false,
      error: "Only Admin can create toolbox talk cards",
    };
  }

  const code = formData.get("code") as string;
  const title = formData.get("title") as string;
  const department = formData.get("department") as string;
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  const imageFile = formData.get("image") as File | null;

  // Only the 5 approved departments are accepted
  const validDepartments = TOOLBOX_DEPARTMENTS.map((d) => d.value);
  if (!department || !validDepartments.includes(department)) {
    return { success: false, error: "Please select a valid department" };
  }

  const validated = toolboxTalkCardSchema.safeParse({
    code,
    title,
    department,
    tags,
  });
  if (!validated.success) {
    console.log("Zod validation errors:", validated.error.flatten());
    return { success: false, error: "Validation failed" };
  }

  try {
    let imageUrl: string | null = null;

    // Upload image to Vercel Blob if provided
    if (imageFile && imageFile.size > 0) {
      const blob = await put(
        `cards/${code}-${Date.now()}-${imageFile.name}`,
        imageFile,
        {
          access: "public",
        },
      );
      imageUrl = blob.url;
    }

    const card = await prisma.toolboxTalkCard.create({
      data: {
        code: validated.data.code,
        title: validated.data.title,
        department: validated.data.department ?? null, // ← add
        tags: validated.data.tags,
        imageUrl,
      },
    });

    revalidatePath("/safetymeetingsdashboard");
    return { success: true, id: card.id };
  } catch (error) {
    console.error("createToolboxTalkCard error:", error);
    return { success: false, error: "Failed to create card" };
  }
}

/**
 * deleteToolboxTalkCard — Permanently deletes a reusable card + its picture
 *
 * Admin only.
 *
 * Cards already used in a Safety Meeting (draft or completed) can NOT be
 * deleted — old meetings must keep showing which cards were discussed.
 * The Admin gets a message with how many meetings use it.
 *
 * Order: the card is deleted from the database first, then its picture is
 * removed from Vercel Blob. If removing the picture fails, the card is still
 * deleted (only an unused file stays in Blob) — so the user never sees an error
 * for something that actually worked.
 *
 * @param id - The cuid of the card to delete
 * @returns { success: true } or { success: false, error: string }
 */
export async function deleteToolboxTalkCard(id: string) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: "User not found" };

  if (user.role !== "ADMIN") {
    return {
      success: false,
      error: "Only Admin can delete toolbox talk cards",
    };
  }

  try {
    // Fetch the card + how many safety meetings use it
    const card = await prisma.toolboxTalkCard.findUnique({
      where: { id },
      include: { _count: { select: { safetyMeetings: true } } },
    });
    if (!card) return { success: false, error: "Card not found" };

    // Used in meetings → block (keeps past safety records complete)
    const usedIn = card._count.safetyMeetings;
    if (usedIn > 0) {
      return {
        success: false,
        error: `This card is used in ${usedIn} safety meeting${usedIn === 1 ? "" : "s"} and can't be deleted.`,
      };
    }

    // 1. Delete the card from the database
    await prisma.toolboxTalkCard.delete({ where: { id } });

    // 2. Delete its picture from Vercel Blob (if it has one)
    if (card.imageUrl) {
      try {
        await del(card.imageUrl);
      } catch (blobError) {
        // Card is already gone — only log, don't fail the whole delete
        console.error("deleteToolboxTalkCard blob delete error:", blobError);
      }
    }

    revalidatePath("/safetymeetingsdashboard");
    return { success: true };
  } catch (error) {
    console.error("deleteToolboxTalkCard error:", error);
    return { success: false, error: "Failed to delete card" };
  }
}