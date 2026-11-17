import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { canAccessRecord } from "@/lib/recordAccess"
import SafetyMeetingView from "../../_components/SafetyMeetingView"

/**
 * SafetyMeetingViewPage — Read-only view of a single toolbox talk
 *
 * ADMIN / MANAGER → any meeting
 * MEMBER (vessel) → only their own — another vessel's shows "not found"
 */
export default async function SafetyMeetingViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) redirect("/sign-in")

  const { id } = await params

  const meeting = await prisma.safetyMeeting.findUnique({
    where: { id },
    include: {
      createdBy:      { select: { name: true, email: true } },
      stateUpdatedBy: { select: { name: true } },
      teamMembers:    true,
      selectedCards: {
        include: {
          card: true,
        },
      },
    },
  })

  // Same answer for "doesn't exist" and "not yours"
  if (!meeting || !canAccessRecord(user, meeting)) notFound()

  return (
    <div className="min-h-screen bg-[#f5f8ff] dark:bg-slate-950">
      <SafetyMeetingView meeting={meeting} />
    </div>
  )
}