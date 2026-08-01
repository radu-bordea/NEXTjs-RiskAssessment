"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const PROTECTED_ADMIN_ID = process.env.PROTECTED_ADMIN_ID

/**
 * updateUserRole — Updates a user's role in the database
 *
 * Only ADMIN can call this action.
 * Admin cannot change their own role — prevents lockout.
 * The protected admin (PROTECTED_ADMIN_ID) can never have their role changed.
 *
 * @param targetUserId - The DB id of the user to update
 * @param newRole - The new role: "ADMIN" | "MANAGER" | "MEMBER"
 * @returns { success: true } or { success: false, error: string }
 */
export async function updateUserRole(
  targetUserId: string,
  newRole: "ADMIN" | "MANAGER" | "MEMBER"
) {
  // 1. Check authentication
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  // 2. Check caller is ADMIN
  const caller = await prisma.user.findUnique({ where: { id: userId } })
  if (!caller || caller.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" }
  }

  // 3. Prevent admin from changing their own role
  if (targetUserId === userId) {
    return { success: false, error: "You cannot change your own role" }
  }

  // 4. Protected admin's role can never be changed, by anyone
  if (targetUserId === PROTECTED_ADMIN_ID) {
    return { success: false, error: "This user's role cannot be changed" }
  }

  try {
    await prisma.user.update({
      where: { id: targetUserId },
      data:  { role: newRole },
    })

    // Revalidate admin users page so changes show immediately
    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("updateUserRole error:", error)
    return { success: false, error: "Failed to update role" }
  }
}