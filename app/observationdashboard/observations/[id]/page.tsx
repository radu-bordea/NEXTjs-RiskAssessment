import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { canAccessRecord } from "@/lib/recordAccess"
import ObservationView from "../../_components/ObservationView"

/**
 * ObservationViewPage — Read-only view of a single observation
 *
 * ADMIN / MANAGER → any observation
 * MEMBER (vessel) → only their own — another vessel's shows "not found"
 */
export default async function ObservationViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) redirect("/sign-in")

  const { id } = await params

  const observation = await prisma.observation.findUnique({
    where: { id },
    include: {
      createdBy:      { select: { name: true, email: true } },
      stateUpdatedBy: { select: { name: true } },
    },
  })

  // Same answer for "doesn't exist" and "not yours"
  if (!observation || !canAccessRecord(user, observation)) notFound()

  return (
    <div className="min-h-screen bg-[#fffffa] dark:bg-slate-950">
      <ObservationView observation={observation} />
    </div>
  )
}