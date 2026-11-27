import { auth } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { canAccessRecord } from "@/lib/recordAccess"
import { canEditPermit } from "@/lib/workPermitForm"

/**
 * workPermitPage — loads ONE permit for the 👁 view / ✏️ edit pages
 *
 * Location: lib/workPermitPage.ts
 *
 *  - Not logged in              → /sign-in
 *  - Missing, or another vessel's permit (MEMBER) → 404 (same answer, nothing leaks)
 *  - canEdit: DRAFT → creator + Admin/Manager; issued → Admin only
 */
export async function loadWorkPermitForPage(id: string) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, name: true, email: true },
  })
  if (!user) redirect("/sign-in")

  const permit = await prisma.workPermit.findUnique({
    where: { id },
    select: {
      id: true,
      permitNo: true,
      type: true,
      source: true,
      state: true,
      vessel: true,
      details: true,
      pdfUrl: true,
      createdById: true,
      closedOutAt: true,
      createdBy: { select: { name: true, email: true } },
      closedOutBy: { select: { name: true, email: true } },
    },
  })
  if (!permit || !canAccessRecord(user, permit)) notFound()

  return { user, permit, canEdit: canEditPermit(user, permit) }
}

export type LoadedWorkPermit = Awaited<ReturnType<typeof loadWorkPermitForPage>>["permit"]